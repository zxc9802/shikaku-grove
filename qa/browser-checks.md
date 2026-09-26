# Browser verification

Local build: 2026-09-26. Browser evidence is kept locally in `.private/evidence/`.

Verified through the actual game interface:

- Incorrect 1×1 selection on clue 8 produces an area error and places nothing.
- Arrow keys and Enter place the 4×2 rectangle; all cells have row/column labels.
- Undo removes that move; the explanation identifies its dimensions and reason.
- Applying the explained move and refreshing preserves 1/5 rectangles and elapsed time.
- Completing all five rectangles produces a completion state, time and hint count.
- Copy result confirms success; the result excludes the solution.
- Restart opens a confirmation; cancel preserves the board; confirm resets progress and timer.
- A real pointer drag places a rectangle; Erase removes it.
- Desktop viewport 1471×827 has no horizontal document overflow.

Production checks (2026-09-26): the canonical Pages URL served build 527887ac5b4f4c0f during the game checks. In a 469×772 CSS-pixel viewport, no document overflow was found. Pointer dragging and two-corner selection were exercised; an invalid short rectangle was rejected. A full puzzle was completed through the visible controls, with 5/5 rectangles, 4:49 and 0 hints. Play another navigated to practice. A separate 390-pixel iframe layout was visually reviewed; this is not a physical touchscreen test.

Google Search Console confirmed HTML-tag ownership. Its live smartphone test successfully fetched the homepage, found crawling/indexing allowed and the correct canonical. Manual indexing request was rejected for daily quota; it was not accepted. Sitemap submission succeeded, but the initial report said could not fetch; follow-up still required.

Further production checks: switching to 7×7 and 9×9 generates playable grids; explained moves can be applied. The 9×9 larger-grid option scrolls within the board without overflowing the document. Cloudflare Web Analytics received its first test page view; this is not an acquired user. Build 25f6042d4233e9c2 and the injected beacon were verified on the canonical production homepage. A nonexistent URL returned HTTP 404.

Google's live smartphone test also fetched `sitemap.xml` successfully at 23:46:52 on 2026-09-26. The valid XML contains 20 URLs. It was resubmitted once after that test; the sitemap report still displayed could not fetch. Do not confuse the live fetch success with completed sitemap processing or indexing.

The portable HTML5 package was played in the browser: five explained moves completed the daily puzzle, Play another started a practice puzzle without leaving the embedded entry point, copying the puzzle link reported success, and the document had no horizontal overflow. The package contains only relative local assets and no advertising/analytics scripts. It has not yet been uploaded to itch.io or tested inside itch.io's actual sandbox.

The printable page and answer diagrams were reviewed on screen. The print button was activated, but this browser surface did not expose a PDF/print preview, so printed pagination remains unverified. No physical touchscreen or field Core Web Vitals claim is made.

These observations verify functionality, not search rankings or commercial viability.

Final live build: `184b5d923feabacf` (code commit `b57b6b7`). The feature numerals failed the first Lighthouse contrast check; their color was darkened to a measured 4.65:1 ratio. A fresh [PageSpeed report](https://pagespeed.web.dev/analysis/https-shikaku-grove-pages-dev/lvvmcsrota?form_factor=mobile) at 2026-09-27 01:41 GMT+8 measured mobile 99 performance, 100 accessibility, 100 best practices and 100 SEO (LCP 1.9s, TBT 0, CLS 0). Desktop scored 100 in all four categories (LCP 0.4s). These are lab measurements, not field data. The individual document-request-latency diagnostic errored; it is not recorded as passing.
