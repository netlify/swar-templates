---
name: netlify-identity-tanstack-start
description: Upgrade a stock TanStack Start project to use Netlify Identity for authentication via the @netlify/identity package. Use this skill whenever the user wants to add Netlify Identity auth to a TanStack Start app, integrate login/signup into TanStack Start, protect routes or server functions with Netlify Identity, add role-based access control, or wire up Netlify Identity webhooks. Also use when the user mentions '@netlify/identity', 'nf_jwt', or asks about auth for TanStack Start on Netlify. Covers SSR pages, SPA pages, API routes, server functions, middleware, route guards, role-based access, identity webhooks, and client-side auth state.
---

# Netlify Identity + TanStack Start Integration

This skill walks through upgrading a stock TanStack Start project to use Netlify Identity for authentication across every integration surface: SSR pages, SPA pages, API routes, server functions, middleware, route guards, role-based access control, identity event webhooks, and client-side auth state management.

## Important context

Netlify Identity was deprecated on February 28, 2025. It still works and receives critical security patches, but no new features or bug fixes. Before proceeding, inform the user of this and suggest they consider Auth0 (via the Netlify Auth0 extension) or Supabase Auth for new projects. If they want to proceed with Netlify Identity anyway (e.g., existing project, prototyping, or migrating later), continue with the integration.

> ⚠️ **This integration does NOT work on localhost.** Netlify Identity requires the `nf_jwt` cookie to be set by a real Netlify deployment. Running `netlify dev` does NOT provide a working Identity service locally — it only proxies your site, not the GoTrue identity backend. Authentication only functions when the app is deployed to a Netlify staging or production environment. For testing, deploy a branch preview or a staging site.

## Architecture overview

This integration uses a single package: **`@netlify/identity`** (v0.4.1). It works on both client and server and abstracts all JWT extraction, cookie handling, and GoTrue API validation behind simple `getUser()` / `login()` / `logout()` calls.

The `nf_jwt` cookie is the bridge between client and server. During SSR or server function calls, the browser sends this cookie automatically on same-origin requests. `@netlify/identity`'s `getUser()` reads and validates this cookie automatically — no manual token extraction or external API calls required.

## Prerequisites

Before starting, ensure:

1. The TanStack Start project deploys to Netlify (using `@netlify/vite-plugin-tanstack-start`)
2. Netlify Identity is enabled in the Netlify dashboard (Site configuration > Identity)
3. The app is deployed to a Netlify staging or production environment (authentication cannot be tested on localhost)

## Step-by-step integration

### Step 1: Install dependencies

```bash
npm install @netlify/identity
```

That's the only package needed. It replaces `netlify-identity-widget`, `gotrue-js`, and `jose`.

### Step 2: Environment variables

Create or update `.env`:

```env
# Required: Your Netlify site URL
VITE_NETLIFY_SITE_URL=https://your-site.netlify.app
```

No JWT secret needed — `@netlify/identity` handles validation internally.

### Step 3: Create the auth utility module

Create `src/lib/auth.ts`:

```typescript
// src/lib/auth.ts
import { createServerFn } from '@tanstack/react-start'
import { getUser, type User } from '@netlify/identity'

export type { User as IdentityUser }

export const getServerUser = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getUser()
    return (user ?? null) as any
  }
)
```

`@netlify/identity`'s `getUser()` handles cookie extraction and JWT validation automatically on the server. No manual token parsing, no GoTrue fetch, no `jose`.

### Step 4: Create the auth middleware

TanStack Start middleware provides a composable way to inject auth context into server functions. Create `src/middleware/identity.ts`:

```typescript
// src/middleware/identity.ts
import { createMiddleware } from '@tanstack/react-start'
import { getUser, type User } from '@netlify/identity'

/**
 * Middleware that extracts the Netlify Identity user from the request.
 * Provides { user } in context. Does NOT throw on unauthenticated requests.
 */
export const identityMiddleware = createMiddleware().server(async ({ next }) => {
  const user: User | null = (await getUser()) ?? null
  return next({ context: { user } })
})

/**
 * Middleware that requires authentication. Throws if no valid user.
 */
export const requireAuthMiddleware = createMiddleware().server(async ({ next }) => {
  const user = await getUser()
  if (!user) throw new Error('Authentication required')
  return next({ context: { user } })
})

/**
 * Middleware that requires a specific role.
 */
export function requireRoleMiddleware(role: string) {
  return createMiddleware().server(async ({ next }) => {
    const user = await getUser()
    if (!user) throw new Error('Authentication required')
    if (!user.roles?.includes(role)) throw new Error(`Role '${role}' required`)
    return next({ context: { user } })
  })
}
```

### Step 5: Create the client-side auth context

Create `src/lib/identity-context.tsx`. This React context wraps `@netlify/identity` and provides auth state to the entire app:

```tsx
// src/lib/identity-context.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { getUser, logout as nlLogout, onAuthChange, type User } from '@netlify/identity'

interface IdentityContextValue {
  user: User | null
  ready: boolean
  logout: () => Promise<void>
}

const IdentityContext = createContext<IdentityContextValue | null>(null)

export function IdentityProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Initialize from current session
    getUser().then((u) => {
      setUser(u ?? null)
      setReady(true)
    })

    // Subscribe to auth changes
    const unsubscribe = onAuthChange((u) => {
      setUser(u ?? null)
    })

    return unsubscribe
  }, [])

  return (
    <IdentityContext.Provider value={{ user, ready, logout: nlLogout }}>
      {children}
    </IdentityContext.Provider>
  )
}

export function useIdentity() {
  const ctx = useContext(IdentityContext)
  if (!ctx) throw new Error('useIdentity must be used within an IdentityProvider')
  return ctx
}
```

### Step 6: Create the CallbackHandler component

OAuth providers (GitHub, Google, etc.) redirect back to your site with auth tokens in the URL hash. Create `src/components/CallbackHandler.tsx` to handle this:

```tsx
// src/components/CallbackHandler.tsx
import { useEffect } from 'react'
import { handleAuthCallback } from '@netlify/identity'

const AUTH_HASH_PATTERN =
  /^#(confirmation_token|recovery_token|invite_token|email_change_token|access_token)=/

export function CallbackHandler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (AUTH_HASH_PATTERN.test(window.location.hash)) {
      handleAuthCallback()
    }
  }, [])

  return <>{children}</>
}
```

### Step 7: Wire into the app root

In `src/routes/__root.tsx`, wrap the app with both `IdentityProvider` and `CallbackHandler`:

```tsx
// In src/routes/__root.tsx
import { IdentityProvider } from '../lib/identity-context'
import { CallbackHandler } from '../components/CallbackHandler'

export const Route = createRootRoute({
  component: () => (
    <IdentityProvider>
      <CallbackHandler>
        {/* existing layout, <Outlet />, etc. */}
      </CallbackHandler>
    </IdentityProvider>
  ),
})
```

**Hydration note**: `IdentityProvider` renders `children` immediately without blocking. The `ready` flag from `useIdentity()` tells components when auth state is known. During SSR, `ready` is `false` and `user` is `null`. This avoids hydration mismatches because the server and initial client render both show the "not yet loaded" state.

### Step 8: SSR pages

For SSR pages that need auth state during server rendering, use `beforeLoad` with the `getServerUser` server function:

```tsx
// src/routes/dashboard.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { getServerUser } from '../lib/auth'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: async () => {
    const user = await getServerUser()
    if (!user) {
      throw redirect({ to: '/login' })
    }
    return { user }
  },
  component: DashboardPage,
})

function DashboardPage() {
  const { user } = Route.useRouteContext()
  return <div>Welcome, {user.name || user.email}</div>
}
```

**How this works during SSR**: `beforeLoad` runs on the server. `getServerUser` calls `getUser()` from `@netlify/identity`, which reads the `nf_jwt` cookie from the incoming request and validates it. If missing or invalid, it redirects to `/login`.

### Step 9: SPA pages

For pages where auth is only needed client-side:

```tsx
// src/routes/profile.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useIdentity } from '../lib/identity-context'

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const { user, ready } = useIdentity()
  const navigate = useNavigate()

  if (!ready) return <div>Loading...</div>
  if (!user) {
    navigate({ to: '/login' })
    return null
  }

  return <div>Hello, {user.name || user.email}</div>
}
```

### Step 10: Login page

Use `login()`, `signup()`, and `oauthLogin()` directly from `@netlify/identity` for a headless login UI:

```tsx
// src/routes/login.tsx
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { login, signup, oauthLogin } from '@netlify/identity'
import { useIdentity } from '../lib/identity-context'
import { useState } from 'react'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { user, ready } = useIdentity()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  if (!ready) return <div>Loading...</div>
  if (user) {
    navigate({ to: '/dashboard' })
    return null
  }

  const handleLogin = async () => {
    await login(email, password)
    navigate({ to: '/dashboard' })
  }

  const handleSignup = async () => {
    await signup(email, password, { full_name: name })
    navigate({ to: '/dashboard' })
  }

  return (
    <div>
      <h1>Sign in</h1>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (signup only)" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button onClick={handleLogin}>Log in</button>
      <button onClick={handleSignup}>Sign up</button>
      <button onClick={() => oauthLogin('github')}>Continue with GitHub</button>
    </div>
  )
}
```

### Step 11: API routes

Use `createFileRoute` with `server.handlers` for API routes:

```typescript
// src/routes/api/whoami.ts
import { createFileRoute } from '@tanstack/react-router'
import { getUser } from '@netlify/identity'

export const Route = createFileRoute('/api/whoami')({
  server: {
    handlers: {
      GET: async () => {
        const user = await getUser()
        if (!user) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          })
        }
        return new Response(
          JSON.stringify({ id: user.id, email: user.email, name: user.name }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      },
    },
  },
})
```

### Step 12: Server functions with middleware

Apply middleware to server functions that require authentication:

```typescript
// src/lib/todos.ts
import { createServerFn } from '@tanstack/react-start'
import { requireAuthMiddleware } from '../middleware/identity'

export const getTodos = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    // context.user is a valid User from @netlify/identity
    const { user } = context
    return await db.todos.findMany({ where: { userId: user.id } })
  })

export const createTodo = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context, data }) => {
    const { user } = context
    return await db.todos.create({
      data: { ...data, userId: user.id },
    })
  })
```

### Step 13: Role-based access control

Roles are stored in `user.roles` as a `string[]`. Use them in route guards:

```tsx
// src/routes/admin.tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { getServerUser } from '../lib/auth'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const user = await getServerUser()
    if (!user) throw redirect({ to: '/login' })
    if (!user.roles?.includes('admin')) throw redirect({ to: '/unauthorized' })
    return { user }
  },
  component: AdminPage,
})
```

For server functions with role requirements:

```typescript
import { createServerFn } from '@tanstack/react-start'
import { requireAuthMiddleware, requireRoleMiddleware } from '../middleware/identity'

export const deleteUser = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware, requireRoleMiddleware('admin')])
  .handler(async ({ context, data }) => {
    // Only admins reach this point
    return await db.users.delete({ where: { id: data.userId } })
  })
```

### Step 14: Netlify Identity webhook handlers

Netlify Identity fires server-side webhook events on user lifecycle actions. Create Netlify Functions (not TanStack Start server functions) to handle them:

```typescript
// netlify/functions/identity-signup.ts
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions'

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const user = JSON.parse(event.body || '{}')

  // Return modified metadata to customize the user record on signup
  return {
    statusCode: 200,
    body: JSON.stringify({
      app_metadata: {
        roles: ['user'],
      },
      user_metadata: {
        ...user.user_metadata,
        signed_up_at: new Date().toISOString(),
      },
    }),
  }
}

export { handler }
```

Available webhook events:
- `identity-signup` — Fires when a new user signs up. Return modified metadata to customize the user record.
- `identity-login` — Fires on each login. Cannot modify the user.
- `identity-validate` — Fires on token validation. Return non-200 to reject the token.

Configure these in Netlify dashboard > Site configuration > Identity > Notifications.

### Step 15: Signup and email confirmation flow

Netlify Identity's email/password signup requires email confirmation before the user can log in. The full flow:

1. User calls `signup(email, password, { full_name: name })` — Netlify sends a confirmation email
2. User clicks the link in the email — browser is redirected to your site with `#confirmation_token=...` in the URL hash
3. `CallbackHandler` detects the hash and calls `handleAuthCallback()`, which confirms the account and logs the user in
4. `onAuthChange` fires, updating `user` in the `IdentityProvider`

This means **the user is not logged in immediately after calling `signup()`**. Show a "check your email" message instead of redirecting to a protected page:

```tsx
function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [state, setState] = useState<'idle' | 'pending' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSignup = async () => {
    setState('pending')
    try {
      await signup(email, password, { full_name: name })
      // signup() resolves after sending the confirmation email.
      // The user is NOT yet authenticated — show a confirmation prompt.
      setState('idle') // or a dedicated 'confirm-email' state
      alert(`Confirmation email sent to ${email}. Click the link to finish signing up.`)
    } catch (err: any) {
      setErrorMsg(err.message || 'Signup failed')
      setState('error')
    }
  }

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      {state === 'error' && <p>{errorMsg}</p>}
      <button onClick={handleSignup} disabled={state === 'pending'}>
        {state === 'pending' ? 'Sending…' : 'Sign up'}
      </button>
    </div>
  )
}
```

**Other token types handled by `CallbackHandler`:**
- `confirmation_token` — email signup confirmation (described above)
- `recovery_token` — password reset link
- `invite_token` — admin-invited user accepting their invite
- `email_change_token` — user confirming a new email address
- `access_token` — OAuth provider redirect (GitHub, Google, etc.)

All of these are handled automatically by the existing `CallbackHandler` — no extra code needed per flow. The `handleAuthCallback()` call covers all cases.

**Password recovery flow:**

```tsx
import { requestPasswordRecovery } from '@netlify/identity'

async function handleForgotPassword(email: string) {
  await requestPasswordRecovery(email)
  alert(`Password reset email sent to ${email}`)
}
```

After the user clicks the reset link, `CallbackHandler` handles the `#recovery_token=...` hash, logs them in, and they can update their password via `user.update({ password: newPassword })`.

**Invite flow:**

Users invited via the Netlify dashboard or `POST /.netlify/identity/invite` receive an invite email. When they click the link, `CallbackHandler` handles the `#invite_token=...` hash. Netlify Identity will prompt them to set a password automatically — no custom code required beyond `CallbackHandler` being mounted.

### Step 16: Logout

Use `logout()` from `@netlify/identity` directly or via the identity context:

```tsx
function LogoutButton() {
  const { logout } = useIdentity()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/' })
  }

  return <button onClick={handleLogout}>Log out</button>
}
```

`logout()` clears the session and the `nf_jwt` cookie automatically.

## netlify.toml configuration

```toml
[build]
  command = "vite build"
  publish = "dist/client"

[dev]
  command = "npm run dev:vite"
  targetPort = 3000
  port = 8888
```

In `package.json`, configure two dev scripts:
- `npm run dev` — runs `netlify dev` (proxies through Netlify but does NOT provide working Identity locally)
- `npm run dev:vite` — runs Vite directly (no identity, fastest iteration)

## Gotchas and edge cases

### ⚠️ Localhost does not work
**Authentication does not function on localhost.** The `@netlify/identity` package requires the `nf_jwt` cookie to be set by a real Netlify deployment. Running `netlify dev` only proxies your site — it does not run the GoTrue identity backend. To test authentication, deploy a branch preview or staging environment on Netlify.

### Hydration mismatches
The identity context is browser-only. `IdentityProvider` renders children immediately with `ready: false` and `user: null` during SSR. This matches the initial client render, avoiding hydration mismatches. Components should gate on the `ready` flag before displaying auth-dependent content.

### Token expiry during long sessions
Netlify Identity JWTs expire after 1 hour. `@netlify/identity` handles token refresh automatically via `onAuthChange`. For long-lived SPA sessions, ensure `onAuthChange` is subscribed (handled in the `IdentityProvider` above) so the user state stays current.

### Edge function interference
If TanStack Start's Netlify deployment creates catch-all edge function patterns, these can intercept `/.netlify/identity` endpoints. Verify identity endpoints remain accessible after deployment. If blocked, add an exclusion in `netlify.toml`:

```toml
[[edge_functions]]
  path = "/*"
  function = "server"
  excludedPath = "/.netlify/*"
```

## User type shape

The `User` type from `@netlify/identity` has these fields:

```typescript
interface User {
  id: string                          // UUID
  email: string
  name: string                        // display name (from user_metadata.full_name)
  metadata: Record<string, unknown>   // full user_metadata
  appMetadata: Record<string, unknown>
  roles: string[]                     // from app_metadata.roles
  pictureUrl?: string
}
```

Note: Use `user.name`, `user.metadata`, `user.roles` — NOT `user.user_metadata`, `user.app_metadata.authorization.roles`.

## File structure after integration

```
src/
├── components/
│   └── CallbackHandler.tsx        # OAuth redirect handler
├── lib/
│   ├── auth.ts                    # getServerUser server function
│   └── identity-context.tsx       # Client-side React context
├── middleware/
│   └── identity.ts                # TanStack Start middleware
├── routes/
│   ├── __root.tsx                 # IdentityProvider + CallbackHandler wrap app
│   ├── login.tsx                  # Login/signup page (headless API)
│   ├── dashboard.tsx              # Protected SSR page (beforeLoad redirect)
│   ├── admin.tsx                  # Role-gated route
│   └── api/
│       └── whoami.ts              # Protected API route (server.handlers)
netlify/
└── functions/
    ├── identity-signup.ts         # Webhook: new user signup
    └── identity-validate.ts       # Webhook: token validation
.env                               # VITE_NETLIFY_SITE_URL
netlify.toml                       # Build + dev configuration
```
