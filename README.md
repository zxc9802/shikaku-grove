# Shikaku Grove

A free browser game about dividing a numbered grid into rectangles. Every rectangle contains one clue equal to its area. Cover the board without overlaps.

**[Play Shikaku Grove](https://shikaku-grove.pages.dev/)** · [Daily puzzle](https://shikaku-grove.pages.dev/daily/) · [Learn the rules](https://shikaku-grove.pages.dev/how-to-play/)

Built for a calm first play: 5×5, 7×7 and 9×9 puzzles, explanations for forced steps, keyboard and pointer controls, undo, local progress, daily grids, shareable practice links, and printable sheets. Puzzle generation and solving are original implementations; no third-party puzzle collection is bundled.

## Run locally

Node.js 22 or later. The game and build have no production package dependencies.

```sh
npm run build
npm run dev
```

Open `http://127.0.0.1:4173/`. Tests and static checks:

```sh
npm run check
```

## Project layout

- `src/engine.js`: deterministic generator, constraint solver, move validation and explanatory hints.
- `src/game.js`: browser interaction, timer, local saves and sharing.
- `src/render.js`: accessible grids and game markup.
- `scripts/build.mjs`: original guides and static pages, metadata, sitemap and robots.
- `site.config.json`: public URL, contact address and optional verification/analytics identifiers.
- `tests/engine.test.mjs`: uniqueness, coverage, deterministic generation, hints and invalid moves.

The `dist/` folder is the deployment artifact. Private course research, account evidence, credentials and local browser records are not part of the public site.

## Controls

Drag across two opposite corners or tap them in sequence. Arrow keys move between cells; Enter or Space selects corners. Escape cancels and Delete removes a rectangle. A legal rectangle can still block another clue, so use Undo to revisit uncertain choices.

## Deployment and domain changes

The intended host is Cloudflare Pages. Build, then deploy `dist/` with Wrangler. Before switching domains, update `site.config.json`, regenerate all canonical URLs and the sitemap, configure the new host, verify HTTPS and the live version, and redirect the previous host only after the new one works. Re-verify Search Console and any advertising site ownership for the new domain.

Cloudflare Web Analytics is enabled through the Pages dashboard; its beacon is injected on deployment. Other analytics and advertising are not enabled by placeholder identifiers. Optional Google Analytics requires a real configured property and the visitor's consent. No ad scripts or `ads.txt` are emitted by default.

## HTML5 distribution package

Run `npm run build:itch` to produce `.private/publishing/shikaku-grove-html5.zip` (requires the system `zip` utility). It includes the complete game and relative assets for HTML5 hosts. Share links point to the configured main website; Play another creates a practice grid inside the embedded page. This package does not include analytics, account verification tags or course research. Uploading it is a separate publishing step.

## Feedback

Use the game's “Copy puzzle link” option when reporting a problem. Contact: asd785755358@gmail.com.

Shikaku is a classic puzzle format; this project is independent and not affiliated with Nikoli or other publishers.
