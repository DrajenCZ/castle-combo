# Castle Combo scorer

Personal side project, unrelated to any work repo. Everything for it lives in this folder.

- Offline PWA (Vite + React + TS) that scores Castle Combo; Czech edition *Hradní devatero* (MINDOK).
- No per-request AI: photo recognition (v2) must run on the device (Tesseract.js OCR + fuzzy match, ORB fallback).
- Plan: `docs/design.md`. Card research: `research/` (fan list from listium.com, checked against the rulebook's shield table).
- Card data `src/game/cards.ts` is generated: `node tools/gen-cards.mjs research/cards.json src/game/cards.ts`.
  Scoring rules per card are written by hand in the generator.
- Tests: `npm test` (the rulebook example on page 11 must score 75). Dev server: `.claude/launch.json` (port 5198).
- Leftover coins are put on purses by the engine; tie-break = coins outside purses.
- Open items: 70 Czech card names missing; Red Chaplain, Pilgrim, Patron and the duplicate "Chaplain" name are guesses (`needsCheck`).
