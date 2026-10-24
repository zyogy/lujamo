// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

// Values come from the shell, or from .env.production for builds (see .env.example).
// The dev server ignores .env.production and always runs at the site root.
const mode = process.argv.includes('dev') ? 'development' : 'production';
const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };

// SITE_URL: the public origin, e.g. https://lujamo.neocities.org or https://lujamo.fi
// BASE_PATH: only needed when the site is served from a subfolder, e.g. /lujamo
const site = env.SITE_URL || 'https://zyogy.github.io';
const base = env.BASE_PATH || '/';
const publicPath = (path) => `${base.replace(/\/+$/, '')}${path}`;

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  redirects: {
    '/projects/turva/': publicPath('/projects/valmiusturva/'),
    '/en/projects/turva/': publicPath('/en/projects/valmiusturva/'),
    '/sv/projects/turva/': publicPath('/sv/projects/valmiusturva/'),
  },
  build: {
    format: 'directory',
    // Neocities-safe asset folder name (no leading underscore)
    assets: 'assets',
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          // The [...path] route would otherwise produce names like "_..abc.css";
          // keep asset names plain for strict static hosts.
          assetFileNames: (info) => {
            const name = (info.names?.[0] ?? 'asset').replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-]+/g, '') || 'page';
            return `assets/${name}.[hash][extname]`;
          },
        },
      },
    },
  },
  integrations: [
    sitemap({
      // the thank-you page is noindex
      filter: (page) => !page.includes('/contact/thanks/'),
      i18n: {
        defaultLocale: 'fi',
        locales: { fi: 'fi-FI', en: 'en', sv: 'sv-FI' },
      },
    }),
  ],
});
