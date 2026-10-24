# Lujamo website

A static, multilingual website for Lujamo, built with [Astro](https://astro.build). The output is plain HTML/CSS with a little JavaScript, and it runs on any static host.

- Repository: https://github.com/zyogy/lujamo
- Website: https://zyogy.github.io/lujamo/
- Publishing: every push to `main` builds and deploys through GitHub Actions.

The front page presents Lujamo as a company. App development (Luja Digital) is its main service. Lujamo's own projects (ValmiusTurva, Luja Fight) appear there only as short references and each has its own page under Projects.

- Languages: Finnish (default, at `/`), English (`/en/`), Swedish (`/sv/`)
- No cookies, no analytics, no third-party requests except the contact form endpoint

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies (Node 20+; built with Node 24) |
| `npm run dev` | Dev server at http://localhost:4321 |
| `npm run build` | Build to `dist/` (also writes `dist/not_found.html` for Neocities) |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run check:i18n` | List missing translations (UI strings, content files and fields) |
| `npm run check:neocities` | Check that every file in `dist/` has a type Neocities allows |
| `npm run assets` | Regenerate favicons and Open Graph images in `public/` |
| `node scripts/make-hero-art.mjs` | Redraw the hero illustration (`public/images/lujamo-hero.svg`) |

Build-time settings. Put them in `.env.production` (copy `.env.example`) or set them in the shell. **They must match where you upload `dist/`**, or the CSS and links will 404. `npm run dev` ignores `.env.production` and always runs at the root. For the GitHub Pages site:

```
SITE_URL=https://zyogy.github.io
BASE_PATH=/lujamo
```

- `SITE_URL`: the public origin, used for canonical URLs, hreflang, the sitemap and the form redirect. Default is `https://zyogy.github.io`.
- `BASE_PATH`: only needed if the site is served from a subfolder, e.g. `/lujamo`. In Git Bash on Windows, prefix the command with `MSYS_NO_PATHCONV=1`, or Bash will rewrite the path.

## Before launch: placeholders to replace

Search the project for `TODO` and `PLACEHOLDER`. The main ones:

1. **Company address/locality**: still to be supplied. The proprietor's name, business ID, email and phone are set in `src/config/site.ts`.
2. **Optional contact form**: get an access key from [Web3Forms](https://web3forms.com) for the owner's email address and set `form.accessKey` in `src/config/site.ts`. Until then the contact page shows a working email link and phone number instead of a form that cannot send. Review the privacy policy before enabling a new processor.
3. **Luja Fight description**: `src/content/units/*/fight.yaml`.
4. **Values**: confirm the value descriptions. The company introduction, story and service descriptions have been updated from the supplied company copy.
5. **ValmiusTurva**: the site uses the app's real Finnish start-screen capture and current icon. The public URL is `/projects/valmiusturva/`; the old `/projects/turva/` paths redirect in all languages. Internal content IDs remain stable for contact topics and existing social-image filenames.
6. **Hero image**: a generated editorial illustration about collaborative app development appears on the home and About pages. Asset provenance and the generation prompt are in `docs/visual-assets.md`.
7. **Privacy policy**: `src/content/pages/*/privacy.md` is a draft for legal review. The Finnish version is authoritative.

## Editing content

All text lives in two places. No text is hard-coded in components.

- **UI strings** (nav, footer, form labels and errors): `src/i18n/fi.json`, `en.json`, `sv.json`
- **Page content**: `src/content/`
  - `units/<lang>/<id>.yaml`: services (Luja Digital) and projects (ValmiusTurva, Luja Fight)
  - `pages/<lang>/<page>.yaml|md`: front page, about ("Ajatus"), projects, contact, thank-you and privacy

The front page's values row reads from the about page (`values:`), so the values are written once.

Finnish is the reference language. If an English or Swedish file or key is missing, the page shows the Finnish text with a short notice instead of breaking. Run `npm run check:i18n` to list gaps. It exits with an error when something is missing, so it can gate CI if you want.

Service and project pages are built from blocks, in any order:

```yaml
blocks:
  - type: text      # heading + body (paragraphs separated by a blank line)
  - type: list      # heading + items: [{ title, text }]
  - type: steps     # a real sequence, shown numbered: heading + items
  - type: projects  # heading + intro: lists Lujamo's projects as short references
  - type: cta       # heading + text + topic (preselects the contact form topic)
```

## Adding a project or a service

**A project** (Lujamo's own product or venture):

1. Add a colour token in `src/styles/tokens.css`, e.g. `--sport: #7a5a1e;`. Check that it has at least 4.5:1 contrast on `--kallio` (#f6f4ec).
2. Add one file per language: `src/content/units/fi/sport.yaml`, `en/sport.yaml`, `sv/sport.yaml`. Copy `fight.yaml` as a starting point and set `kind: project`, `accent: sport`, `slug: projects/sport` and `order`.
3. Run `npm run assets` to create its Open Graph image.

It then appears on the Projects page, as a reference on the front page and the service page, in the footer, in the contact form topics and in the sitemap. It also gets its own page at `/projects/sport/` (plus `/en/…` and `/sv/…`).

**A service** (something Lujamo sells) works the same way with `kind: service` and a `navLabel`: it appears in the main navigation. The front page's green band shows the first service.

A unit can show an illustration next to its intro with `visual: app` (generic app mockup) or `visual: valmiusturva` (actual app screenshot), and an optional `logo` image path.

## URLs and languages

Fixed page slugs are in `src/i18n/config.ts` (`pageSlugs`). Unit slugs are in each unit file. All languages currently share English slugs. To localise one, change it for that language. The language switcher, hreflang tags and sitemap follow automatically.

The site never redirects by browser language. If a visitor's saved choice (or their browser's first language) differs from the page, a small dismissible bar offers the other version.

## Deploying

### GitHub Pages

The `.github/workflows/deploy-pages.yml` workflow validates translations, builds the site with Node 24, and deploys `dist/` to GitHub Pages on every push to `main`. It also supports manual runs from the Actions tab.

In the repository's **Settings → Pages**, the publishing source is **GitHub Actions**. The workflow obtains the origin and repository base path from `actions/configure-pages`, so asset links, canonical URLs, language links and the contact-form redirect match the deployment. No separate deployment token is required.

Local `.env.production` is ignored by Git and is not uploaded. Email and phone contact work directly; the optional form remains disabled until its access key is configured.

### Optional: Neocities

**Manually:** `npm run build`, `npm run check:neocities`, then upload the *contents* of `dist/` in the Neocities dashboard. You can also use the [Neocities CLI](https://neocities.org/cli): `npm run deploy:neocities`.

**Manually (GitHub Actions):** `.github/workflows/deploy-neocities.yml` is available from the Actions tab and does not run on pushes. Add your Neocities API key as the repository secret `NEOCITIES_API_TOKEN`, and set repository variables `SITE_URL` and `BASE_PATH` for that host.

Neocities serves `not_found.html` for missing pages. The build creates it from `404.html`. Neocities only uses the copy at the site root, so while the site sits in a subfolder, missing pages show the root site's 404 instead.

### Phase B: Cloudflare Pages (later)

1. Connect the repository in Cloudflare Pages. Build command: `npm run build`. Output: `dist`. Set the `SITE_URL` environment variable to the real domain.
2. Add `public/_headers` for security headers and caching, for example:

   ```
   /*
     X-Content-Type-Options: nosniff
     Referrer-Policy: strict-origin-when-cross-origin
     Permissions-Policy: geolocation=(), camera=(), microphone=()
   /assets/*
     Cache-Control: public, max-age=31536000, immutable
   /fonts/*
     Cache-Control: public, max-age=31536000, immutable
   ```

3. Add `public/_redirects` if slugs change. Neocities doesn't read these files, so only add them when you move.
4. Optional: move the contact form to a Pages Function and remove the Web3Forms dependency. Update the privacy policy to match.

## Project structure

```
astro.config.mjs          site/base, trailing slashes, sitemap (i18n)
public/                   fonts (Hanken Grotesk, OFL), favicons, og/ images
scripts/                  check-i18n, check-neocities, make-assets, postbuild
src/
  config/site.ts          company details + form settings  ← placeholders
  content.config.ts       content schemas (units, pages)
  content/                all page text, per language
  i18n/                   languages, slugs, UI strings, helpers
  lib/content.ts          loads content with Finnish fallback, builds URLs
  components/             Header, Hero, ServiceBand, ValuesRow, ProjectList, CtaBand, mockups, …
  layouts/BaseLayout.astro
  views/                  one component per page type
  pages/[...path].astro   generates every page in every language
  pages/404.astro
  scripts/                site.ts (menu, header, language hint), contact-form.ts
  styles/                 tokens.css (colours, type, spacing), base.css
```

## Design notes

- **Direction:** the owner's reference layout. Warm paper background, deep forest green, moss-yellow pill buttons, a nature image in the hero, one full-width green band for the main service, and a row of three values. The L-with-a-leaf monogram and the tracked "LUJAMO" wordmark follow the reference logo.
- **Separation by colour, not lines.** Sections change background (paper, white, sand, forest) instead of using hairline rules.
- **Texture:** the green bands carry faint topographic contour lines, a nod to bedrock maps (`ContourLines.astro`).
- **Motion** is limited to hover states and a CSS-only 180 ms cross-fade between pages. Both are off with `prefers-reduced-motion`.
- **Without JavaScript** everything works except the language hint: the nav is always visible, and the form uses the browser's built-in validation and redirects to the thank-you page.
