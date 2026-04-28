#!/usr/bin/env node
import { createServer } from 'node:http'
import { Readable } from 'node:stream'
import { createReadStream, statSync } from 'node:fs'
import { join, normalize, resolve, extname } from 'node:path'
import { pathToFileURL } from 'node:url'

const starterDir = resolve(process.cwd(), process.argv[2] ?? '.')
const port = Number(process.argv[3] ?? 8787)

const serverEntry = join(starterDir, '.netlify/v1/functions/server.mjs')
const staticRoot = join(starterDir, 'dist/client')

const mod = await import(pathToFileURL(serverEntry).href).catch((err) => {
  console.error(`Failed to import ${serverEntry}:`, err)
  process.exit(1)
})
const handler = mod.default
if (typeof handler !== 'function') {
  console.error(`Expected default export to be a fetch handler in ${serverEntry}`)
  process.exit(1)
}

const MIME = {
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
}

function tryStaticFile(urlPath) {
  if (urlPath === '/' || urlPath === '') return null
  const decoded = decodeURIComponent(urlPath.split('?')[0])
  const candidate = normalize(join(staticRoot, decoded))
  if (!candidate.startsWith(staticRoot)) return null
  try {
    const s = statSync(candidate)
    if (!s.isFile()) return null
    return { path: candidate, size: s.size }
  } catch {
    return null
  }
}

const server = createServer(async (req, res) => {
  try {
    const method = req.method ?? 'GET'

    if (method === 'GET' || method === 'HEAD') {
      const file = tryStaticFile(req.url ?? '/')
      if (file) {
        const type = MIME[extname(file.path).toLowerCase()] ?? 'application/octet-stream'
        res.writeHead(200, { 'content-type': type, 'content-length': file.size })
        if (method === 'HEAD') return res.end()
        return createReadStream(file.path).pipe(res)
      }
    }

    const url = new URL(req.url ?? '/', `http://localhost:${port}`)
    const headers = new Headers()
    for (const [k, v] of Object.entries(req.headers)) {
      if (Array.isArray(v)) v.forEach((vv) => headers.append(k, vv))
      else if (v != null) headers.set(k, String(v))
    }

    const init = { method, headers }
    if (method !== 'GET' && method !== 'HEAD') {
      init.body = Readable.toWeb(req)
      init.duplex = 'half'
    }
    const request = new Request(url, init)
    const response = await handler(request)

    const resHeaders = {}
    response.headers.forEach((value, key) => {
      resHeaders[key] = value
    })
    res.writeHead(response.status, resHeaders)
    if (response.body) {
      Readable.fromWeb(response.body).pipe(res)
    } else {
      res.end()
    }
  } catch (err) {
    console.error('request error:', err)
    if (!res.headersSent) res.writeHead(500, { 'content-type': 'text/plain' })
    res.end('Internal Server Error')
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(`listening http://127.0.0.1:${port} (starter: ${starterDir})`)
})
