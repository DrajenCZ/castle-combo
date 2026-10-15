import { writeFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

function saveReferences(): Plugin {
  return {
    name: 'save-references',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__save-references', (req, res) => {
        let body = ''
        req.on('data', chunk => (body += chunk))
        req.on('end', () => {
          const refs = JSON.parse(body) as Record<string, number[]>
          const lines = Object.entries(refs).map(([id, f]) => `  ${JSON.stringify(id)}: ${JSON.stringify(f)}`)
          writeFileSync('src/vision/references.json', `{\n${lines.join(',\n')}\n}\n`)
          res.end(`saved ${lines.length}`)
        })
      })
    },
  }
}

export default defineConfig({
  server: { host: true },
  plugins: [
    react(),
    saveReferences(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Castle Combo – počítání bodů',
        short_name: 'Castle Combo',
        lang: 'cs',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#1f2433',
        theme_color: '#1f2433',
      },
    }),
  ],
})
