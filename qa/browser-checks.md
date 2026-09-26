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

Still to verify: narrow-screen interaction, all sizes, printed answers, live deployment behavior, production URL/version, Search Console and analytics account states.

These observations verify functionality, not search rankings or commercial viability.
