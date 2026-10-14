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

## Photo mode (v2) – recognition plan

Everything runs on the device:

1. Get the image from the camera (`<input type="file" capture>`) or a file upload.
2. Find the grid: OpenCV.js finds the card outlines and straightens the photo, then
   cuts it into 9 cells. Fallback: the player drags 4 corners by hand.
3. Recognise each cell:
   - **Primary:** OCR of the card name strip with Tesseract.js (`ces` + `eng`),
     then fuzzy-match (Levenshtein) against the known card names in both
     languages.
   - **Fallback:** ORB feature matching against one reference image per card.
     This needs a reference scan of each card (taken by the user, not shipped
     publicly).
4. Show the filled grid with a confidence for each cell; anything below a set
   threshold is highlighted for the player to check.

Face-down cards are recognised by their card back. Coins and keys are always
entered by hand.

## Stack

Vite + React + TypeScript, `vite-plugin-pwa` for offline/installable,
Vitest for the engine. Tesseract.js and OpenCV.js are loaded only when the
player opens photo mode, so the manual mode stays small.

## Milestones

1. Card data researched and verified (EN + CS).
2. Scoring engine + tests against the rulebook example.
3. Manual grid UI, multiple players, result table.
4. PWA install + offline.
5. Photo mode: grid detection → OCR → fuzzy match → review screen.
