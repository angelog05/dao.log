import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://angelog05.github.io',
  base: '/dao.log',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
