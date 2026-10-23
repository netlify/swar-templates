---
name: netlify-identity-tanstack-start
description: Upgrade a stock TanStack Start project to use Netlify Identity for authentication via the @netlify/identity package. Use this skill whenever the user wants to add Netlify Identity auth to a TanStack Start app, integrate login/signup into TanStack Start, protect routes or server functions with Netlify Identity, add role-based access control, or wire up Netlify Identity webhooks. Also use when the user mentions '@netlify/identity', 'nf_jwt', or asks about auth for TanStack Start on Netlify. Covers SSR pages, SPA pages, API routes, server functions, middleware, route guards, role-based access, identity webhooks, and client-side auth state.
---

# Netlify Identity with TanStack Start

Use @netlify/identity, not the deprecated widget or gotrue-js directly. None of these starters includes authentication by default. This integration is optional and must only be added when the requested product needs it. Apply the base Netlify Identity, auth-security, and secure-sessions skills when implementing auth.

## Prerequisites and runtime

Install a compatible @netlify/identity version; the examples below are checked against 2.0.0. Use its shipped README and types as the API reference. When adding actual Identity functionality to a generated site, run the enable script from the base Identity skill and follow the site's configuration requirements. This does not grant permission to deploy or change live configuration.

The library derives its service configuration from Netlify's browser/runtime context; an unused VITE_NETLIFY_SITE_URL variable does not configure it. Server getUser() reads the trusted Netlify request context/cookie. It requires the modern Netlify Functions/Edge runtime, not a standalone Node request handler. Plain vite dev/preview does not supply Identity. The package supports netlify dev with Identity enabled and available; do not claim all localhost development is impossible. Check the actual local runtime/endpoint. Use mock auth for local component checks when that service is unavailable; do not deploy just to complete a local check.

## Server functions and middleware

Expose only the profile fields needed by the client. Protect server operations independently of route guards. user.roles is server-controlled app metadata, not user-editable profile metadata.

```ts file=src/lib/identity.functions.ts
import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { getUser } from '@netlify/identity'

export const getServerUser = createServerFn({ method: 'GET' }).handler(async () => {
  const user = await getUser()
  return user ? { id: user.id, name: user.name, email: user.email, roles: user.roles } : null
})

export const requireIdentity = createMiddleware({ type: 'function' }).server(async ({ next }) => {
  const user = await getUser()
  if (!user) throw new Error('Authentication required')
  return next({ context: { user } })
})

export const getAccount = createServerFn({ method: 'GET' })
  .middleware([requireIdentity])
  .handler(async ({ context }) => ({ id: context.user.id, name: context.user.name }))
```

Use .validator(...) for any operation that accepts public input. Verify row ownership/role inside its server handler before reading or mutating records; don't copy examples with an undefined db or an unvalidated data.userId. Client-provided identity and role values are not authorization.

```tsx file=src/routes/account.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { getServerUser } from '@/lib/identity.functions'

export const Route = createFileRoute('/account')({
  beforeLoad: async () => {
    const user = await getServerUser()
    if (!user) throw redirect({ to: '/login' })
    return { user }
  },
  component: AccountPage,
})

function AccountPage() {
  const { user } = Route.useRouteContext()
  return <main><h1>Account</h1><p>{user.name || user.email}</p></main>
}
```

## Login and route refresh

Browser auth mutations set the session cookie. Refresh route data after login/logout so guards read current server state. Avoid navigating during render or redirecting every signup straight to a protected page.

```tsx file=src/routes/login.tsx
import { useState, type FormEvent } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { login } from '@netlify/identity'

export const Route = createFileRoute('/login')({ component: LoginPage })

function LoginPage() {
  const [state, setState] = useState<'idle' | 'pending' | 'error'>('idle')
  const router = useRouter()
  const navigate = Route.useNavigate()
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state === 'pending') return
    const fields = new FormData(event.currentTarget)
    setState('pending')
    try {
      await login(String(fields.get('email')), String(fields.get('password')))
      await router.invalidate()
      await navigate({ to: '/account' })
      setState('idle')
    } catch { setState('error') }
  }
  return <main><h1>Sign in</h1><form onSubmit={submit}>
    <fieldset disabled={state === 'pending'}>
      <legend>Sign in details</legend>
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
      <button type="submit">{state === 'pending' ? 'Signing in…' : 'Sign in'}</button>
    </fieldset>
    {state === 'error' && <p role="alert">We couldn’t sign you in. Check your details and try again.</p>}
  </form></main>
}
```

For server-side auth mutations, use the package's Netlify runtime support and a full browser navigation afterward so the updated cookie reaches a fresh request. The complete example above uses browser login, not a custom credential/session implementation. Don't cache personalized SSR responses publicly.

## Client state and callbacks

onAuthChange receives (event, user), not just user, and returns an unsubscribe function. Start with user=null and ready=false during SSR and the initial browser render, then initialize in an effect. Client state is for UI, not server authorization.

```tsx file=src/components/IdentityProvider.tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getUser, handleAuthCallback, onAuthChange, type CallbackResult, type User } from '@netlify/identity'

type IdentityState = { user: User | null; ready: boolean; error: string | null; callback: CallbackResult | null }
const IdentityContext = createContext<IdentityState | null>(null)

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<IdentityState>({ user: null, ready: false, error: null, callback: null })
  useEffect(() => {
    let active = true
    const unsubscribe = onAuthChange((_event, user) => {
      if (active) setState((previous) => ({ ...previous, user }))
    })
    async function initialize() {
      try {
        const parameters = new URLSearchParams(window.location.hash.slice(1))
        const hasCallback = ['confirmation_token', 'recovery_token', 'invite_token', 'email_change_token', 'access_token'].some((name) => parameters.has(name))
        const callback = hasCallback ? await handleAuthCallback() : null
        const user = await getUser()
        if (active) setState({ user, ready: true, error: null, callback })
      } catch {
        if (active) setState({ user: null, ready: true, error: 'Authentication could not be initialized.', callback: null })
      }
    }
    void initialize()
    return () => { active = false; unsubscribe() }
  }, [])
  return <IdentityContext.Provider value={state}>{children}</IdentityContext.Provider>
}

export function useIdentity() {
  const state = useContext(IdentityContext)
  if (!state) throw new Error('IdentityProvider is required')
  return state
}
```

Wrap routed children in this provider inside the existing root shell when client state is needed. Handle its error/ready states. Do not remove HeadContent, Scripts, existing providers, or the root document while integrating it.

signup returns a user whose emailVerified state distinguishes autoconfirm from email confirmation. With confirmation required, show a check-email state rather than claiming login succeeded. handleAuthCallback returns a result: recovery requires a new-password UI and updateUser({ password }); invite returns a token and no user until a password form calls acceptInvite(token, password). It does not display a password prompt automatically. Keep callback tokens in memory, not logs or query strings. Email-change verification requires an active browser session. Use updateUser, not user.update; the normalized User object has no update method. Consult the base skill for complete signup, OAuth, recovery, invite, email-change, and logout flows.

## Protected HTTP and lifecycle handlers

```ts file=src/routes/api.account.ts
import { createFileRoute } from '@tanstack/react-router'
import { getUser } from '@netlify/identity'

export const Route = createFileRoute('/api/account')({
  server: { handlers: { GET: async () => {
    const user = await getUser()
    const headers = { 'Cache-Control': 'private, no-store' }
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers })
    return Response.json({ id: user.id, name: user.name }, { headers })
  } } },
})
```

For lifecycle hooks, use a Netlify Function, not a TanStack server function. Install a compatible @netlify/functions package before using the typed handler below. Its roles come from server code, not submitted user metadata.

```ts file=netlify/functions/identity.mts
import type { UserSignupEvent } from '@netlify/functions'

export default {
  userSignup(event: UserSignupEvent) {
    return { user: { ...event.user, appMetadata: { ...event.user.appMetadata, roles: ['member'] } } }
  },
}
```

Current typed events include userValidate, userSignup, userLogin, userModified, and userDeleted. Use event.deny() for rejection where the event permits it. Do not describe the legacy identity-validate filename as a handler for every token validation. Consult the installed Functions types for supported event contracts. Do not add catch-all edge exclusions or change dev scripts unless the project actually needs them; preserve npm run dev as Vite in these starters.
