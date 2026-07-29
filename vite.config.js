import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Имя репозитория на GitHub. Сайт публикуется по адресу
 * https://<username>.github.io/<repository>/ , поэтому все статические ресурсы
 * должны запрашиваться из подпапки — за это отвечает опция `base`.
 *
 * Значение можно переопределить переменной окружения, не трогая код:
 *   VITE_BASE=/другое-имя/ npm run build
 * Для публикации на корневом домене (user.github.io) укажите VITE_BASE=/
 */
const BASE = process.env.VITE_BASE ?? '/fs1/';

export default defineConfig({
  plugins: [react()],

  // publicPath: все ссылки на JS/CSS/шрифты/иконки будут вида /<repository>/assets/...
  base: BASE,

  build: {
    // Папка сборки называется `build` (как в CRA) — её же публикует gh-pages.
    outDir: 'build',
    emptyOutDir: true,
    sourcemap: false,
  },

  server: {
    port: 3000,
    open: true,
  },
});
