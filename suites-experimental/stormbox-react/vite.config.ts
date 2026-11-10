import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base: Speedometer loads the build from a subdirectory.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    modulePreload: { polyfill: false },
    sourcemap: true,
  },
});
