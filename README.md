# Bollywood website developer handover

This is the latest recovered website working copy as of September 30, 2026, with the H7 shared header/navigation, latest branch/menu assets and food photography. The Agent Booking page uses the restored original embedded Google Form. The abandoned custom booking prototype is not included.

## Run locally

Install Node.js 24 or a compatible current LTS. No dependency installation or compilation is required.

```sh
npm start
```

Open http://127.0.0.1:8080 . The included development server listens only on localhost. Do not use it as a production backend or expose its directory publicly.

## Edit and review

This is plain HTML, CSS and JavaScript, with local images, videos, PDFs and menu data under `assets/`. Edit the files directly; there is no hidden build step or original framework project to reconstruct. The historical styling files are retained where they may be used by existing pages.

- `index.html`: homepage; `header-h7.*` and `header-eye-h7.js`: current shared navigation.
- `agents.html`, `agents-a1.*`, `agents-a2.*`: original Google Form wrapper and appearance controls.
- `menu.html`, branch `*-menu.html`, `menu-m2.*`, `restaurant-menus.js`, `restaurant-menu-reader.js`, `assets/restaurant-menus/`: menus.
- `site-config.js`, `content-config.js`, translation files: public website content/settings.
- `photo-credits.html`, `THIRD-PARTY-NOTICES.md`: attribution and media constraints.
- `website-source-manifest.json`: SHA-256 inventory of copied source files.

Check homepage navigation, branch pages, menus/PDF downloads, booking iframe, desktop/mobile layout, theme/language controls and external contact links after changes. Do not submit test bookings without owner approval: the embedded Google Form is live.

## Booking behavior

The Google Form owns branching, validation, submissions, linked-Sheet storage and enabled Google notifications/response copies. No booking API, response spreadsheet, customer records or credentials are bundled. Keep the original iframe destination and native behavior unless the owner separately approves changing them. No new backend or Apps Script was installed.

## Deployment

Serve this folder as static website files. `index.html` is the entry point. Existing `vercel.json` is retained for a compatible Vercel deployment, including redirects and security headers. Other static hosts must implement equivalent redirects if needed. Production host/domain ownership and deployment permissions are not included in this handover.

The recovered source currently has preview settings: `site-config.js` sets `preview: true`, HTML/robots metadata and `vercel.json` contain no-index directives. Review indexing, canonical/sitemap URLs and owner-approved publication settings before launch. This handover does not change those settings or deploy production.

## GitHub handover

Use a private repository owned by the website owner, then invite the confirmed developer with the appropriate repository role. Verify the intended owner, repository and developer username before uploading or inviting anyone. Do not replace the public historical source repository or rewrite its history.

Large source PDFs are included unchanged; the largest is about 42 MB. Consider Git LFS for long-term binary updates if the team chooses it. No Git LFS conversion was made here.

## Provenance and limits

The recovered working copy has no `.git` directory. Its historical import originated from `VikkramPonSaamuel/bollywood-final` at `f6aa7a3b80f3905dbe404334bfb247729c3b6bc9`; the later working changes are represented by this file inventory, not a recoverable continuous Git history. The historical repository is not an assumed upload destination.

Source files and assets were copied byte-for-byte. Review boards, temporary servers, session tokens, logs, private planning/audit files, backups and abandoned custom integration drafts were excluded. Original laptop source files were not changed during packaging.

There are 39 distinct food-library image references across homepage/gallery/menu/experience in the recovered source. An earlier conversation described 40; that extra slot was not independently verified. Media rights should be confirmed before reuse beyond this website.
