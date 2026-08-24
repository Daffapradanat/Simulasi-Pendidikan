import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        devOptions: {
          enabled: false
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
          navigateFallbackDenylist: [/^\/api/, /^\/games/], 
          runtimeCaching: [
            {
              urlPattern: /^\/games\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'games-cache',
                expiration: {
                  maxEntries: 1000,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        },
        manifest: {
          name: 'Literasi Sains',
          short_name: 'Literasi Sains',
          theme_color: '#1a56db',
          icons: [
            {
              src: '/tutwurihandayani_Icon.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/tutwurihandayani_Icon.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      watch: {
        ignored: [
          '**/public/games/**',
          '**/database.json',
          '**/database.sqlite*',
          '**/*.sqlite*',
          '**/uploads/**',
          'database.json',
          'database.sqlite*',
          '*.sqlite*'
        ]
      },
    },
  };
});
