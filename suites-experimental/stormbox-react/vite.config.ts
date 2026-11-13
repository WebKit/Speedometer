import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// Relative base: Speedometer loads the build from a subdirectory.
export default defineConfig({
  base: './',
  plugins: [react(), svgr()],
  build: {
    modulePreload: { polyfill: false },
    sourcemap: true,
  },
});
