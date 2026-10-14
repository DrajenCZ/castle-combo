# Sources

## Used
| URL | What it provided |
|---|---|
| https://listium.com/@Marc/143495/castle-combo-card-list | **The only full card list found.** It is a fan-made list of all 78 cards. Each card has an English name, deck (Castle/Village), cost, shield 1/2, ability and end-game score text. It is the basis of cards.json. The "Move messenger" field is empty for every card. |
| https://tesera.ru/images/items/2392014/castle_combo_rules_en.pdf | Official English rulebook (PDF, read via text extraction). It gave the end-game scoring, the tie-breaker, the shield types, the game-aid scoring patterns, the components (39 castle / 39 village) and the **shield distribution table**. That table is used to check the fan list (it matches exactly). It confirms the English names Royal guard, Spy, Militiaman, Sculptor and Miraculously cured, and the Miraculously cured purse maximum of 4. |
| https://rulespal.com/castle-combo/rulebook | HTML copy of the same rulebook. It gave the end-game rules, the Nobility/Faith/Scholarship (castle) vs Military/Craftsmanship/Peasantry (village) split, and the banner and discount icons. |
| https://en.doc.boardgamearena.com/Tips_castlecombo | BGA tips. Blue shields are almost only on castle cards and yellow never on castle cards (matches the data). It links the BGG "full card descriptions" file. |
| https://mindok.cz/hra/hradni-devatero/ | Czech edition product page. It has a link to the Czech rulebook PDF and lists the expansion "Hradní devatero: Pod zámkem". |
| https://www.tlamagames.com/en/hradni-devatero | Czech edition: brand MINDOK, Czech-language game and rules. |
| https://www.hras.cz/en/karetni-hry/hradni-devatero-karetni-hra | Czech edition: MINDOK s.r.o., EAN 8595558306404. |
| https://www.hrajeme.cz/esenska-novinka-castle-combo-dorazi-v-lete/ | Announcement (27 Nov 2024) that MINDOK will publish Castle Combo in Czech (summer 2025). |
| https://www.svet-her.cz/spolecenske-hry/hradni-devatero | Distributor MINDOK. No card names. |
| https://www.zatrolene-hry.cz/spolecenska-hra/hradni-devatero-16925/obrazky/ | Photos of the Czech edition. The photo of the Czech game aid ("Přehledový list") gave the Czech shield names (urozenost, učenost, víra, vojsko, rolnictvo), "fábor hradu / fábor podhradí", "zlaťák" and "klíč". A tableau photo confirmed the Chancellor, Inventor and His Holiness scroll icons and suggests the Patron counts cards costing 5+. Card names on the photos are too small to read. |
| https://www.zatrolene-hry.cz/spolecenska-hra/hradni-devatero-16925/recenze/15105/ | Czech review. Terms: měšec (purse), klíče, zlaťáky, posel. No card names. |
| https://www.riseher.cz/hradni-devatero/ | Czech review. It names the characters "alchymista", "cechmistr" and "královská stráž" and the erb type "řemesla". It calls the messenger "herold". |
| https://homemagazine.cz/2025/10/02/hradni-devatero-karetni-vyprava-do-sveta-erbu-klicu-a-dvorskych-intrik/ | Czech article. It mentions "Panoš", "Alchymista" and "Dvorní dáma". The descriptions look paraphrased or unreliable, so "Panoš" is kept at low confidence and "Dvorní dáma" is not mapped. |
| Coordinator message (from the Czech rulebook) | Czech names Královská stráž, Špeh, Domobranec, Sochař, Zázračně uzdravený; translator Karel Vlasák; shield and banner terminology. |

## Tried, not usable
- https://boardgamegeek.com/filepage/295527/full-card-descriptions-for-beginners: the BGG file "Full card descriptions for beginners". It would likely be the best cross-check, but it is blocked by a Cloudflare bot check (WebFetch 403, and the browser stalls on the check). Not bypassed.
- https://boardgamegeek.com/xmlapi2/thing?id=416851&versions=1: BGG API returns 401 (it needs a token).
- https://www.scribd.com/document/897842506/Chateau-Combo-Card-Roster-21Feb2025Upload: a "Chateau Combo Card Roster". Its content is not readable without a login.
- https://d2nh83hfsroc1i.cloudfront.net/wp-content/uploads/2025/09/10115922/Hradni-devatero-pravidlaweb.pdf: the Czech rulebook PDF. It is over 10 MB, so WebFetch refused it, and the browser turned it into a download. A save dialog may have been shown to the user; it was not accepted by the agent.
- https://goodat.games/416851/castle-combo: empty response.
- BGA game help page (https://en.doc.boardgamearena.com/Gamehelpcastlecombo): no card list.

## Not found
- **A complete Czech card-name list.** Only 5 Czech names are confirmed (from the Czech rulebook). 3 more come from reviews (Alchymista, Cechmistr: medium; Panoš: low). The other 70 are `null`. Ways to finish it: read the physical Czech cards, open the Czech rulebook PDF (it may only name the example cards), or check whether BGA's Czech UI uses MINDOK's names.
- **A second independent English card list** to cross-check the fan list's wording. The shield data is checked against the rulebook's distribution table (exact match). The scoring texts rest on the single fan source, plus a few photo and rulebook confirmations.
- **Copies:** every one of the 78 cards appears to be unique (39 + 39 distinct entries), so `copies` = 1. The fan list has two different cards both named "Chaplain", which is probably a naming error for one of them.
- **Purse capacity** is not a separate field in the fan list. It is inferred from "up to a maximum of N gold" in the scoring text.
- **Doubtful scoring texts** (confidence low): Chaplain (red) "...right column is full", Pilgrim "brown shield" (probably the village banner), Patron "per purse with cost 5+" (a photo suggests "per card with cost 5+").
- **Messenger icon**: not captured. It is not needed for end-game scoring.
