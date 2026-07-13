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
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true
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
              src: '/Pusmendik.jpg',
              sizes: '192x192',
              type: 'image/jpeg'
            },
            {
              src: '/Pusmendik.jpg',
              sizes: '512x512',
              type: 'image/jpeg'
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
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: ['**/public/games/**', '**/database.json', '**/uploads/**', 'database.json']
      },
    },
  };
});
