import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  // Permite publicar el mismo build en la raíz de Vercel y bajo /tuki-speak/ en Pages.
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
});
