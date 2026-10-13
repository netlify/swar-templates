import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import netlify from '@netlify/vite-plugin-tanstack-start'
import contentCollections from '@content-collections/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    contentCollections(),
    tailwindcss(),
    netlify(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
