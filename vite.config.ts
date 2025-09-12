import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'src/content.tsx',
      output: {
        entryFileNames: 'content.js',
        assetFileNames: (a) =>
          a.name?.endsWith('.css') ? 'content.css' : a.name || 'asset',
      },
    },
  },
  publicDir: 'public',
});
