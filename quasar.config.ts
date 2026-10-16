// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { defineConfig } from '#q-app';

export default defineConfig(() => {
  return {
    boot: ['theme', 'sync'],

    css: ['app.css'],

    extras: ['material-icons'],

    build: {
      target: {},

      typescript: {
        strict: true,
        vueShim: true,
      },

      // hash 模式：GitHub Pages 沒有伺服器端路由，重新整理也不會 404
      vueRouterMode: 'hash',

      // 部署到 GitHub Pages 的子路徑時由 workflow 設定 PUBLIC_PATH=/learning-korean/
      publicPath: process.env.PUBLIC_PATH || '/',
    },

    devServer: {
      open: false,
    },

    framework: {
      config: {
        dark: 'auto',
        notify: { position: 'bottom', timeout: 2400 },
      },
      lang: 'zh-TW',
      plugins: ['Notify', 'Dialog'],
    },

    animations: [],

    pwa: {
      workboxMode: 'GenerateSW',
      extendPWAGenerateSWOptions(cfg) {
        // Google Fonts 第一次載入後快取起來，離線也能顯示韓文字型
        // 課本音檔不預先下載（之後課數變多會很大），聽過的才存起來，離線也能再聽
        // 日文網站也在 xiouyu.github.io，Cache Storage 是共用的，快取名稱要加 korean- 避免互相清掉
        cfg.globIgnores = [...(cfg.globIgnores ?? []), '**/audio/**'];
        cfg.runtimeCaching = [
          {
            urlPattern: /\/audio\/.+\.mp3$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'korean-lesson-audio',
              rangeRequests: true,
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 600 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'korean-google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'korean-google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ];
      },
    },
  };
});
