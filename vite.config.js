import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/pms-app/',
  resolve: {
    alias: {
      '@':           path.resolve(__dirname, './src'),
      '@constants':  path.resolve(__dirname, './src/constants'),
      '@utils':      path.resolve(__dirname, './src/utils'),
      '@components': path.resolve(__dirname, './src/components'),
      '@parts':      path.resolve(__dirname, './src/parts'),
      '@data':       path.resolve(__dirname, './src/data'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})