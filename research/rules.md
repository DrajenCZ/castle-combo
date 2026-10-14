# Castle Combo (CZ: Hradní devatero) — end-game scoring rules

Sources: official English rulebook (Catch Up Games 2024, English translation by Mathieu Rivero), via
https://tesera.ru/images/items/2392014/castle_combo_rules_en.pdf and https://rulespal.com/castle-combo/rulebook.
Czech terms come from the Czech game aid (photo on https://www.zatrolene-hry.cz/spolecenska-hra/hradni-devatero-16925/obrazky/)
and from the coordinator's reading of the Czech rulebook (MINDOK).

## When the game ends
- The game ends once every player has built a full 3x3 tableau (9 cards, 9 rounds).

## Step 1: place leftover gold on purses
- Cards with "Purse scoring" (CZ: měšec) can hold leftover gold at game end.
- Each purse holds at most the amount printed in black on it (e.g. 4 gold).
- The player chooses how to spread leftover gold over their purse cards.
- Purse cards score per gold stored on them (usually 2 points per gold, up to the capacity).
- The Banker scores 1 point per gold stored on all purses (on top of the purses' own points).

## Step 2: score each card's scroll
- Every face-up card scores its scoring scroll.
- Each scroll refers only to elements in YOUR OWN tableau.
- "Row" / "column" means the 3 cards of that row or column, the card itself included.
  The game aid's Faith example counts "all 5 cards of this row AND this column".
- Face-down cards score 0. They also have no shield, no banner and no other icon, so they count for nothing.
  The rulebook example says "the card flipped face down gives no banner".

## Step 3: keys
- Each key you still hold is worth 1 point (key tokens come as 1 and 3).

## Gold
- Gold that is not stored on a purse scores nothing.
- Keep it anyway: it breaks ties.

## Final score and tie-breaker
- Final score = sum of all card scrolls + 1 per key.
- Most points wins.
- Tie: the tied player with the most leftover gold wins (gold left after filling purses).
- If still tied, the tied players share the win.

## Icons a scoring app must track per card
- **Shields** (1 or 2 per card), 6 types:

  | Colour | EN rulebook | CZ (Hradní devatero) | slug in cards.json |
  |---|---|---|---|
  | blue | Nobility | urozenost | `urozenost` |
  | purple | Faith | víra | `vira` |
  | green | Scholarship | učenost | `ucenost` |
  | red | Military | vojsko | `vojsko` |
  | orange | Craftsmanship | řemesla | `remesla` |
  | yellow | Peasantry | rolnictvo | `rolnictvo` |

- **Shield distribution** (printed in the rulebook): castle 14/12/11/8/7/0 and village 1/5/6/10/11/20
  (in the colour order of the table above). Totals 15/17/17/18/18/20.
- **Banner** (CZ: fábor): every Castle card has the castle banner and every Village card has the village banner (CZ: fábor hradu / fábor podhradí).
  Some cards score per banner (Chancellor, Inventor, Brigand, Judge, Executioner, Usurper, Chaplain).
- **Discount icon** (golden line, CZ: sleva 1 zlaťák): castle, village or any.
  The Alchemist scores per discount card.
- **Cost** (top-left gold value): the Pawnbroker, Traveler and probably the Patron score by cost.
- **Purse capacity**: see `purseCapacity` in cards.json.
- **Position** in the 3x3 grid: rows (top/middle/bottom), columns (left/middle/right), corners, middle of an edge.

## Scroll patterns on the game aid
- per X shield in your tableau
- per different shield type (of all 6) in your tableau
- per X shield on the 3 cards of this row / column
- per different shield type on the 3 cards of this row / column
- per X shield on the 5 cards of this row AND column
- per missing shield type (of all 6)
- fixed points if a given shield type is missing
- per set of shield A + shield B anywhere (e.g. 1 Scholarship + 1 Peasantry)
- per set of 3 identical shields anywhere

## Rulebook scoring example (player "LOUISON", total 75)
The score-pad column reads 9, 12, 11, 9, 4, 5, 6, 0, 8, 11 (sum 75). The callouts are:
- 3 sets of Scholarship + Peasantry, at 3 points each = 9
- 2 missing shield types, at 6 points each = 12
- 3 shields on this row, at 3 points each = 9
- 2 gold stored on this card, at 2 points each = 4
- card on one of its required spaces = 5
- 2 gold on the Sculptor + 4 gold on the Miraculously cured = 6 (a Banker-style "per gold on purses" card)
- face-down card = 0
- 4 gold on a card whose maximum is 4, at 2 points each = 8
- 11 keys = 11

The PDF text layer shows the keys callout twice and the 11 twice in the column.
It is not clear whether one of the 11s is another card's score. The total of 75 holds either way.
