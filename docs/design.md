# Castle Combo – score counter

A phone-first PWA that counts the final score of Castle Combo. The whole app
runs offline in the browser and makes no AI or server calls.

## Goals

1. **Manual mode (v1).** Each player fills a 3×3 grid by picking cards by name
   (Czech or English). The app shows the points for each card and the total.
2. **Photo mode (v2).** Take or upload a photo of a tableau. The app recognises the 9
   cards on the device and fills the same grid, then the player checks the result
   and fixes any card it got wrong.
3. Czech and English UI and card names; Czech is the default.

## Non-goals

- Running the game itself (turns, market, messenger).
- Cloud recognition or any call to a paid API.

## Game facts that drive scoring

From the Czech rulebook (*Hradní devatero*, MINDOK 2024; original *Castle Combo*, Catch Up Games):

- 78 cards: 39 castle (grey background, *hrad*) and 39 village (brown, *podhradí*).
  Each card has a **banner** (*fábor*) of its location. Banners can be counted by scoring rules.
- 6 shield types (*erby*):

  | colour | CS | EN | castle | village | total |
  |---|---|---|---|---|---|
  | blue | urozenost | nobility | 14 | 1 | 15 |
  | purple | víra | faith | 12 | 5 | 17 |
  | green | učenost | learning | 11 | 6 | 17 |
  | red | vojsko | military | 8 | 10 | 18 |
  | orange | řemesla | crafts | 7 | 11 | 18 |
  | yellow | rolnictvo | peasantry | 0 | 20 | 20 |

  These totals are a checksum for the card data.
- Each card has a **scroll** (*bodovací svitek*) that scores only at game end, and only
  for the owner's own grid. A **face-down** card scores 0 and has no banner, shield
  or scroll. It may still be counted as a card, for example by the 9 cards of the grid.
- Placement scoring is checked only at the end (row/column/position in the final 3×3).
- **Keys**: 1 pt per leftover key.
- **Purses** (*měšec*): at game end the player may put leftover coins on purse cards, up
  to each purse's capacity, and the purse's scroll scores per stored coin. The app should
  **put the coins on the purses that score most automatically** (greedy by points per
  coin) and show the result, instead of asking the player to work it out.
- Coins that don't fit in a purse score nothing but break ties: more coins left outside
  purses wins, otherwise a draw.
- The rulebook's worked example adds up to **75 points** (page 11). It will be the
  first engine test once the card identities are known.

## Data model

```ts
type Deck = 'castle' | 'village';

interface CardDef {
  id: string;            // stable slug, e.g. "blacksmith"
  nameEn: string;
  nameCs: string;
  deck: Deck;
  shields: ShieldColor[];
  icons: Icon[];         // purse, key, … – whatever end scoring refers to
  scoring: ScoringRule;  // structured, see below
  scoringText: { en: string; cs: string };
}

interface PlacedCard {
  cardId: string | null; // null = face-down (any card), scores 0
}

interface PlayerBoard {
  name: string;
  grid: (PlacedCard | null)[]; // 9 cells, row-major, index = row * 3 + col
  keys: number;                // leftover keys, 1 pt each
  coins: number;               // leftover coins; the engine puts them on purses
}
```

Card data lives in `src/data/cards.json`, generated from `research/cards.json`
after a manual check. The Czech names are part of the same file, so there is
only one source of truth.

## Scoring engine

The engine is a pure function `scoreBoard(board, cards) → { perCell, keys, total }`,
covered by unit tests built from the rulebook's scoring example.

Card scoring is **data, not code**: each card has a `ScoringRule` from a
small closed set of rule kinds, for example:

| kind | meaning |
|---|---|
| `perShield` | N pts per shield of a colour in a scope (row, column, row+column, whole grid) |
| `perCard` | N pts per card matching a filter (deck, icon, …) in a scope |
| `position` | N pts if the card sits in given cells (corner, centre, edge, …) |
| `missingShield` | N pts if a shield colour is absent from the grid |
| `purse` | N pts per stored coin, capacity C (coins placed by the engine) |
| `flat` | fixed N pts |
| `custom` | escape hatch, implemented by a named function – used sparingly |

We pin down the exact set of kinds once the card list is collected; every card has to
fit into one of them, with `custom` only as a last resort.

## UI (v1)

- **Players screen** – add 1–5 players.
- **Board screen** per player – 3×3 grid; tapping a cell opens a picker with a
  search box (Czech and English names, ignoring diacritics), and a "face-down"
  option. Fields for leftover keys and leftover coins; the board shows where the
  coins were put on purses.
- **Result screen** – table of players × total, tap a player to see points per card.
- State is kept in `localStorage`, so a reload during scoring loses nothing.

## Photo mode (v2) – recognition

Everything runs on the device, with no libraries: plain TypeScript in `src/vision/`.

1. Get the image from the camera (`<input type="file" capture>`) or a file upload.
2. The player drags 4 handles onto the corners of the 3×3 card grid. A perspective
   mapping (homography) straightens the grid and splits it into 9 cells.
3. **Find the card in each cell.** Cards never sit exactly on a grid, so each cell is
   searched (20 % beyond its borders) for the card's own edges. A card's border is
   lighter than the table, so the direction of the brightness step tells our card's
   edge apart from the neighbour's. The best few candidates per edge are combined,
   and only rectangles with real card proportions (63 × 88 mm, ±5 %) are kept.
4. The card (inset 6 %) becomes a **fingerprint**: a 12×16 grid of brightness
   (normalised, so the light level doesn't matter) plus two colour channels.
   It is compared with the fingerprint of every card and of both card backs, at
   27 small shifts and sizes. Confidence = how much better the best match is than the
   second best.
5. A card can be in the grid only once: the surer cell keeps the card and the other
   moves to its next match. Card backs may repeat; they become face-down cells.
6. The review screen shows each cut-out with the recognised card; uncertain cells are
   marked **?**. Tapping a cell opens the card picker. "Použít" puts the grid on the board.

**Reference fingerprints** (`src/vision/references.json`) are built from photos of every card
and both backs (`research/photos/`, git-ignored) on the developer page `/?refs` (dev server only).
That page stores the grid corners of each photo, shows a contact sheet of the detected cards,
saves the fingerprints through a dev-only endpoint, and evaluates recognition
(`refBuilder.evaluate(jitter, refs)`) on all photos, including two photos of real games
marked `test: true`, which are never used as references. Fingerprints are tiny averages,
not the artwork.

Why not OCR: the card names are small, vertical and in a decorative font, and the
user photographed all 78 cards, so matching the whole card is both easier and stronger.

**Measured** (2026-10-15), all 98 cells of the 12 photos, corners placed exactly or moved at random
by up to 20, 40 and 60 px (about a sixth of a card): every cell correct at every level, at most
2 cells marked uncertain. The two real-game photos (one with two face-down cards): 9/9 each,
none uncertain. About 0.06 s per photo.
Before card detection the real-game photos got only 8/9 with many uncertain cells: cutting
the plain grid doesn't line up with where the cards actually lie.

Tried and dropped: per-cell white balance (it swapped the two card backs).

**Not done yet:** automatic corner detection; more real-game photos (other tables, light).

## Stack

Vite + React + TypeScript, `vite-plugin-pwa` for offline/installable,
Vitest for the engine and the vision maths. Photo mode is loaded only when the
player opens it, so the manual mode stays small.

## Milestones

1. Card data researched and verified (EN + CS). ✔
2. Scoring engine + tests against the rulebook example. ✔
3. Manual grid UI, multiple players, result table. ✔
4. Photo mode: corners → card detection → fingerprints → review screen, face-down cards. ✔
5. PWA install + offline (needs HTTPS hosting).
