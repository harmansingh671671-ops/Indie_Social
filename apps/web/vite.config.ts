import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server stays on port 4000 to match the rest of the project notes.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
    host: true,
    open: false,
  },
  preview: {
    port: 4000,
  },
});
