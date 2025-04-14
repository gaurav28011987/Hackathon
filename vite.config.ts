import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Expose environment variables to the client
  define: {
    'process.env.VITE_OPENAI_API_KEY': JSON.stringify(process.env.VITE_OPENAI_API_KEY),
  },
  server: {
    port: 3000,
    host: true, // This allows access from other devices on the network
    open: true, // This will open the browser automatically
  },
})
