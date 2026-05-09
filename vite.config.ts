import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';
import { sentryVitePlugin } from '@sentry/vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png', 'icon-maskable.png'],

      // Web app manifest — tells the browser how to install this as an app
      manifest: {
        name: 'Mealio — Dark Gourmet Food Delivery',
        short_name: 'Mealio',
        description: 'Order premium food with real-time delivery tracking',
        theme_color: '#FF6B35',
        background_color: '#0F0A06',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable', // safe-zone padded icon for Android adaptive icons
          },
        ],
      },

      // Workbox service worker configuration
      workbox: {
        // Pre-cache all build output (JS/CSS/HTML)
        globPatterns: ['**/*.{js,css,html,woff2}'],

        // Runtime caching strategies
        runtimeCaching: [
          {
            // Cache Supabase menu_items for 1 hour
            // stale-while-revalidate: serve cached, refresh in background
            urlPattern: ({ url }) =>
              url.origin.includes('supabase.co') && url.pathname.includes('menu_items'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'mealio-menu-cache',
              expiration: {
                maxAgeSeconds: 60 * 60,      // 1 hour
                maxEntries: 50,
              },
            },
          },
          {
            // Cache food images from any CDN with network-first (freshest image wins)
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'mealio-image-cache',
              expiration: {
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
                maxEntries: 100,
              },
            },
          },
          {
            // Auth and order endpoints — always network (never cache sensitive data)
            urlPattern: ({ url }) =>
              url.origin.includes('supabase.co') &&
              (url.pathname.includes('orders') || url.pathname.includes('auth')),
            handler: 'NetworkOnly',
          },
        ],
      },
    }),

    // Sentry source-map upload — only active when SENTRY_AUTH_TOKEN is set
    // (i.e. in CI/CD). Completely skipped in local dev.
    ...(process.env.SENTRY_AUTH_TOKEN
      ? [
          sentryVitePlugin({
            org: 'your-sentry-org',  // Sentry → Settings → Organization slug
            project: 'mealio',
            authToken: process.env.SENTRY_AUTH_TOKEN,
            sourcemaps: {
              assets: './dist/**',
              ignore: ['node_modules'],
            },
            release: {
              name: process.env.VITE_APP_VERSION ?? 'local',
            },
          }),
        ]
      : []),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  optimizeDeps: {
    exclude: ['lucide-react'],
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/test/', 'backend/', '*.config.*'],
    },
  },
});
