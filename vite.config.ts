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
          navigateFallbackDenylist: [/^\/api/, /^\/games/], // Prevent SW returning index.html for API or Games
        },
        manifest: {
          name: 'Pusmendik',
          short_name: 'Pusmendik',
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
      // HMR is disabled via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: {
        ignored: ['**/public/games/**', '**/database.json', '**/uploads/**', 'database.json']
      },
    },
  };
});
