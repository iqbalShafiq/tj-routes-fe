import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite(),
    react(),
  ],
  server: {
    host: true, // Allow access from other devices on the network
    port: 5173, // Default Vite port (you can change this if needed)
  },
})
