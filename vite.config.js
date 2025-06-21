import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Add build configuration for better error reporting
  build: {
    // Generate source maps for better debugging
    sourcemap: process.env.NODE_ENV === 'development',
    // Build target and minification
    target: 'esnext',
    minify: 'terser',
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable detailed build reporting
    reportCompressedSize: true,
    // Custom rollup options for error handling and chunking
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress circular dependency warnings for groq-sdk
        if (warning.code === 'CIRCULAR_DEPENDENCY' && warning.message.includes('groq-sdk')) {
          return;
        }
        // Log other warnings with context
        console.warn(`⚠️  Build Warning: ${warning.message}`);
        if (warning.loc) {
          console.warn(`   Location: ${warning.loc.file}:${warning.loc.line}:${warning.loc.column}`);
        }
        warn(warning);
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('groq-sdk') || id.includes('ai')) {
              return 'ai-vendor';
            }
            if (id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('jszip')) {
              return 'utils-vendor';
            }
            if (id.includes('react-markdown') || id.includes('remark-gfm') || id.includes('react-syntax-highlighter')) {
              return 'markdown-vendor';
            }
            if (id.includes('react-hot-toast')) {
              return 'toast-vendor';
            }
            return 'vendor';
          }
        }
      }
    }
  },
  
  // Enhanced logging during development
  logLevel: process.env.NODE_ENV === 'development' ? 'info' : 'warn',
  
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Armo GPT',
        short_name: 'Armo GPT',
        description: 'Revolutionary AI-powered Armenian chatbot with lightning-fast responses',
        theme_color: '#667eea',
        background_color: '#e0e5ec',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.groq\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'groq-api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],

  server: {
    port: 3000,
    host: true
  },
  preview: {
    port: 4173,
    host: true
  }
})
