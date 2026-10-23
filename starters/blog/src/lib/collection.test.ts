import { afterEach, expect, it } from 'vitest'
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { createBuilder } from '@content-collections/core'

const workspaces: string[] = []
afterEach(async () => {
  await Promise.all(
    workspaces
      .splice(0)
      .map((path) => rm(path, { recursive: true, force: true })),
  )
})

async function fixture(files: Record<string, string>) {
  const folder = await mkdtemp(join(tmpdir(), 'blog-content-test-'))
  workspaces.push(folder)
  await mkdir(join(folder, 'src/lib'), { recursive: true })
  await mkdir(join(folder, 'content/posts'), { recursive: true })
  await cp(
    resolve('content-collections.ts'),
    join(folder, 'content-collections.ts'),
  )
  await cp(
    resolve('src/lib/post-content.ts'),
    join(folder, 'src/lib/post-content.ts'),
  )
  await writeFile(join(folder, 'package.json'), '{"type":"module"}')
  await symlink(resolve('node_modules'), join(folder, 'node_modules'))
  for (const [name, content] of Object.entries(files))
    await writeFile(join(folder, 'content/posts', name), content)
  const builder = await createBuilder(join(folder, 'content-collections.ts'), {
    configName: 'content-collections',
    outputDir: join(folder, '.content-collections/generated'),
  })
  return { builder, folder }
}

const article = (slug = '') =>
  `---\ntitle: Example post\nsummary: Example summary\ndate: "2025-03-01"\n${slug ? `slug: ${slug}\n` : ''}---\n\n## Markdown heading\n`

it('generates explicit and filename slugs, sanitized HTML, and optional fields from the real collection config', async () => {
  const { builder, folder } = await fixture({
    'one.md': article('custom-url'),
    'another-file.md': article(),
  })
  await builder.build()
  const generated = await readFile(
    join(folder, '.content-collections/generated/allPosts.js'),
    'utf8',
  )
  expect(generated).toContain('"slug": "custom-url"')
  expect(generated).toContain('"slug": "another-file"')
  expect(generated).toContain('<h2>Markdown heading</h2>')
})

it('fails collection generation for duplicate URLs', async () => {
  const { builder } = await fixture({
    'one.md': article('same'),
    'same.md': article(),
  })
  await expect(builder.build()).rejects.toThrow('Duplicate post slug "same"')
})
