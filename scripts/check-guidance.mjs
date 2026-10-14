import assert from 'node:assert/strict'
import { cp, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = fileURLToPath(new URL('..', import.meta.url))
const skillsRoot = join(root, 'frameworks/tanstack-start-react/.claude/skills')
const extras = process.env.GUIDANCE_NODE_MODULES
const skills = await readdir(skillsRoot)
const examples = []
assert.equal(skills.length, 9)

for (const skill of skills) {
  const markdown = await readFile(join(skillsRoot, skill, 'SKILL.md'), 'utf8')
  assert.match(markdown, /^---\nname: [a-z0-9-]+\ndescription:/)
  for (const match of markdown.matchAll(/^```\w+ (file|merge)=(\S+)\n([\s\S]*?)^```/gm)) {
    examples.push({ mode: match[1], path: match[2], source: match[3] })
  }
}

for (const starter of await readdir(join(root, 'starters'))) {
  const folder = join(root, 'starters', starter)
  const markdown = await readFile(join(folder, 'AGENTS.md'), 'utf8')
  const manifest = JSON.parse(await readFile(join(folder, 'package.json'), 'utf8'))
  for (const match of markdown.matchAll(/`((?:src|public|content|frameworks)\/[^`]+)`/g)) {
    if (match[1].includes('*')) continue
    const target = match[1].startsWith('frameworks/') ? join(root, match[1]) : join(folder, match[1])
    await readFile(target).catch(async (error) => {
      if (error.code === 'EISDIR') return
      await readdir(target)
    })
  }
  for (const match of markdown.matchAll(/npm run ([\w:-]+)/g)) {
    if (match[1] === 'smoke') continue
    assert.ok(manifest.scripts[match[1]], `${starter} advertises missing script ${match[1]}`)
  }
}
console.log(`Checked nine skill entrypoints and all starter paths/scripts; found ${examples.length} complete file/merge examples.`)

if (!extras) {
  console.log('Set GUIDANCE_NODE_MODULES to a temporary install containing optional integrations to compile and build the examples (see README).')
  process.exit(0)
}

const require = createRequire(import.meta.url)
const ts = require(join(root, 'starters/basic/node_modules/typescript'))
const workspace = await mkdtemp(join(tmpdir(), 'swar-guidance-'))
console.log(`Example validation workspace: ${workspace}`)

async function linkPackage(source, target) {
  await mkdir(dirname(target), { recursive: true })
  await rm(target, { force: true })
  await symlink(source, target)
}

function run(binary, args, cwd) {
  const result = spawnSync(process.execPath, [binary, ...args], { cwd, encoding: 'utf8', timeout: 120000 })
  if (result.error) throw result.error
  assert.equal(result.status, 0, `${args.join(' ')} failed:\n${result.stdout}\n${result.stderr}`)
}

for (const starter of ['basic', 'ecommerce']) {
  const base = join(root, 'starters', starter)
  const fixture = join(workspace, starter)
  await cp(base, fixture, {
    recursive: true,
    filter: (source) => !source.split('/').some((part) => ['node_modules', 'dist', '.netlify', '.tanstack', '.content-collections'].includes(part)) && !/\.test\.[cm]?[jt]sx?$/.test(source),
  })
  const modules = join(fixture, 'node_modules')
  await mkdir(modules)
  for (const entry of await readdir(join(base, 'node_modules'))) {
    if (entry.startsWith('@')) {
      for (const name of await readdir(join(base, 'node_modules', entry))) {
        await linkPackage(join(base, 'node_modules', entry, name), join(modules, entry, name))
      }
    } else if (!entry.startsWith('.')) {
      await linkPackage(join(base, 'node_modules', entry), join(modules, entry))
    }
  }
  for (const name of ['@netlify/identity', '@netlify/functions', '@content-collections/core', '@content-collections/vite']) {
    const installed = name.startsWith('@content-collections/') && starter === 'ecommerce'
      ? join(root, 'starters/blog/node_modules', name)
      : join(resolve(extras), name)
    await readFile(join(installed, 'package.json'))
    if (name === '@content-collections/vite') {
      const target = join(modules, name)
      await rm(target, { force: true })
      await cp(installed, target, { recursive: true })
      await linkPackage(join(dirname(installed), 'integrations'), join(modules, '@content-collections/integrations'))
    } else {
      await linkPackage(installed, join(modules, name))
    }
  }
  for (const example of examples) {
    const destination = resolve(fixture, example.path)
    assert.ok(destination.startsWith(`${fixture}/`), 'Example path must remain inside the fixture')
    await mkdir(dirname(destination), { recursive: true })
    if (example.mode === 'merge') {
      const config = ts.parseConfigFileTextToJson(destination, await readFile(destination, 'utf8')).config
      const addition = JSON.parse(example.source)
      Object.assign(config.compilerOptions.paths, addition.compilerOptions.paths)
      await writeFile(destination, JSON.stringify(config, null, 2))
    } else {
      await writeFile(destination, example.source)
    }
  }
  const configPath = join(fixture, 'tsconfig.json')
  const config = ts.parseConfigFileTextToJson(configPath, await readFile(configPath, 'utf8')).config
  config.include.push('**/*.mts')
  await writeFile(configPath, JSON.stringify(config, null, 2))
  run(join(base, 'node_modules/vite/bin/vite.js'), ['build', '--config', 'vite.content.config.ts'], fixture)
  run(join(base, 'node_modules/typescript/bin/tsc'), ['--noEmit'], fixture)
  console.log(`${starter}: complete examples build and type-check with its installed package versions.`)
}
