import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: { host: true },
  plugins: [
    react(),
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
