# Castle Combo scorer

Personal side project, unrelated to any work repo. Everything for it lives in this folder.

- Offline PWA (Vite + React + TS) that scores Castle Combo; Czech edition *Hradní devatero* (MINDOK).
- No per-request AI: photo recognition runs on the device (`src/vision/`: manual grid corners → homography →
  find each card's edges in its cell → fingerprint → nearest of the 78 card + 2 back fingerprints in
  `src/vision/references.json`). `test_*.jpg` photos are real games used only for evaluation, never as references.
- After any change to `src/vision/recognize.ts`: rebuild + save the fingerprints and run `refBuilder.evaluate(0|20|40|60, refs)`
  on `/?refs`; every photo must stay fully correct.
- Rebuild fingerprints: dev server → `/?refs` (corners per photo live in `ReferenceBuilder.tsx`; check the
  contact sheet) → `fetch('/__save-references', { method: 'POST', body: JSON.stringify(refBuilder.build()) })`.
- Plan: `docs/design.md`. Card research: `research/` (fan list from listium.com, checked against the rulebook's shield table).
- Card data `src/game/cards.ts` is generated: `node tools/gen-cards.mjs research/cards.json src/game/cards.ts`.
  Scoring rules per card are written by hand in the generator.
- Tests: `npm test` (the rulebook example on page 11 must score 75). Dev server: `.claude/launch.json` (port 5198).
- Leftover coins are put on purses by the engine; tie-break = coins outside purses.
- All 78 cards (Czech names, shields, cost, discount, scroll) were checked against photos of the Czech cards in
  `research/photos/` (git-ignored: publisher artwork). English names come only from the fan list; "Captain" was "Chaplain" there.
- Card rule text in the UI is generated from the structured rule (`src/describe.ts`), so both languages always match the engine.
- Scroll icons: ◄► = this row, ▲▼ = this column, all four arrows = row and column (the card itself counts).
