// node:test smoke tests for every starter. For each starter:
//   1. npm install (if node_modules is missing and SKIP_INSTALL not set)
//   2. npm run build (unless SKIP_BUILD is set)
//   3. spawn `vite preview` against the build
//   4. fetch / and assert the expected text is in the body
//
// Run all:        npm run smoke
// Run one:        npm run smoke -- basic
// Run several:    npm run smoke -- basic blog
// Skip rebuild:   SKIP_BUILD=1 npm run smoke -- basic
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { stat } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const PORT = Number(process.env.PORT ?? 8787)

const STARTERS = [
  { id: 'basic', expect: 'Hello World' },
  { id: 'ai-chat', expect: 'Weather Chat' },
  { id: 'blog', expect: 'Your Blog' },
  { id: 'calculator', expect: '+/-' },
  { id: 'dashboard', expect: 'Analytics Dashboard' },
  { id: 'ecommerce', expect: 'Product Company' },
  { id: 'marketing', expect: 'Everyday Objects' },
  { id: 'portfolio', expect: 'Thoughts on web development' },
  { id: 'resume', expect: 'My Resume' },
  { id: 'saas', expect: 'Find your fit with' },
  { id: 'survey', expect: 'favorite season' },
]

// og:image is absent on purpose: netlify/proxy injects it at the edge.
const SOCIAL_META = [
  'name="description"',
  'property="og:title"',
  'property="og:description"',
  'property="og:type"',
  'name="twitter:card"',
]

const requested = process.argv.slice(2).filter((a) => !a.startsWith('-'))
const known = STARTERS.map((s) => s.id)
const unknown = requested.filter((r) => !known.includes(r))
if (unknown.length > 0) {
  console.error(`Unknown starter(s): ${unknown.join(', ')}`)
  console.error(`Available: ${known.join(', ')}`)
  process.exit(2)
}
const selected = requested.length === 0 ? STARTERS : STARTERS.filter((s) => requested.includes(s.id))

function run(cmd, args, opts) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'pipe', ...opts })
    let out = ''
    child.stdout?.on('data', (d) => (out += d))
    child.stderr?.on('data', (d) => (out += d))
    child.once('error', reject)
    child.once('exit', (code) => {
      if (code === 0) resolve(out)
      else reject(new Error(`${cmd} ${args.join(' ')} exited ${code}\n${out.slice(-2000)}`))
    })
  })
}

async function waitForServer(url, attempts = 60, delayMs = 250) {
  for (let i = 0; i < attempts; i++) {
    try {
      const r = await fetch(url)
      if (r.status < 500) return
    } catch {}
    await new Promise((r) => setTimeout(r, delayMs))
  }
  throw new Error(`server at ${url} did not become ready`)
}

async function exists(p) {
  try {
    await stat(p)
    return true
  } catch {
    return false
  }
}

for (const { id, expect } of selected) {
  test(id, { timeout: 10 * 60 * 1000 }, async (t) => {
    const dir = join(ROOT, 'starters', id)

    if (!process.env.SKIP_INSTALL && !(await exists(join(dir, 'node_modules')))) {
      await run('npm', ['install', '--no-package-lock', '--silent'], { cwd: dir })
    }

    if (!process.env.SKIP_BUILD) {
      await run('npm', ['run', 'build', '--silent'], { cwd: dir })
    }

    // Spawn vite directly (not via npx) so SIGTERM hits the actual server
    // process. With npx in the middle, the vite child gets orphaned on Linux
    // and keeps holding the port, causing subsequent tests to fetch against
    // the previous starter's still-running server.
    const viteBin = join(dir, 'node_modules', '.bin', 'vite')
    const server = spawn(
      viteBin,
      ['preview', '--port', String(PORT), '--host', '127.0.0.1', '--strictPort'],
      { cwd: dir, stdio: ['ignore', 'pipe', 'pipe'] },
    )

    let serverLog = ''
    server.stdout.on('data', (d) => (serverLog += d))
    server.stderr.on('data', (d) => (serverLog += d))

    t.after(async () => {
      if (server.exitCode === null && server.signalCode === null) {
        server.kill('SIGTERM')
        await new Promise((r) => server.once('exit', r))
      }
    })

    await waitForServer(`http://127.0.0.1:${PORT}/`)

    const res = await fetch(`http://127.0.0.1:${PORT}/`)
    assert.equal(res.status, 200, `expected 200, got ${res.status}`)
    const body = await res.text()
    assert.ok(
      body.includes(expect),
      `expected '${expect}' in body. First 2KB:\n${body.slice(0, 2000)}\n--- server log ---\n${serverLog.slice(-1000)}`,
    )

    for (const meta of SOCIAL_META) {
      assert.ok(body.includes(meta), `expected ${meta} in rendered head. First 2KB:\n${body.slice(0, 2000)}`)
    }
    assert.ok(!body.includes('og:image'), 'og:image must not be scaffolded; the edge injects it')

    if (id === 'basic') {
      const missing = await fetch(`http://127.0.0.1:${PORT}/missing-smoke-route`)
      assert.equal(missing.status, 404, 'missing routes must return HTTP 404')
      const missingBody = await missing.text()
      assert.ok(missingBody.includes('Page not found'))
      assert.ok(missingBody.includes('Go home'))
    }

    if (id === 'saas') {
      for (const plan of ['starter', 'pro', 'enterprise']) {
        assert.ok(body.includes(`/contact?plan=${plan}`), `missing ${plan} enquiry link`)
        const contact = await fetch(`http://127.0.0.1:${PORT}/contact?plan=${plan}`)
        assert.equal(contact.status, 200)
        const html = await contact.text()
        assert.match(html, new RegExp(`<option[^>]*value="${plan}"[^>]*selected`))
        assert.ok(html.includes('Plan enquiry | My SaaS'))
      }
      const faq = await fetch(`http://127.0.0.1:${PORT}/faq`)
      assert.equal(faq.status, 200)
      const faqHtml = await faq.text()
      assert.ok(faqHtml.includes('<summary'))
      assert.ok(faqHtml.includes('Frequently asked questions | My SaaS'))
      const form = await fetch(`http://127.0.0.1:${PORT}/__forms.html`)
      assert.equal(form.status, 200)
      assert.ok((await form.text()).includes('data-netlify="true"'))
    }
  })
}
