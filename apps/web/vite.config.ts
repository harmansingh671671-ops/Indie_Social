import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server stays on port 4000 to match the rest of the project notes.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
    host: true,
    open: false,
    // Windows file watching can miss edits made by external tools, leaving the
    // dev server serving stale transformed modules until it is restarted.
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
  preview: {
    port: 4000,
  },
});
