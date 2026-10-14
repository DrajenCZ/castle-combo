import { readFileSync, writeFileSync } from 'node:fs'

const [, , inFile, outFile] = process.argv
const research = JSON.parse(readFileSync(inFile, 'utf8'))

const color = { urozenost: 'blue', vira: 'purple', ucenost: 'green', vojsko: 'red', remesla: 'orange', rolnictvo: 'yellow' }
const C = {
  TOP: [0, 1, 2], MID_ROW: [3, 4, 5], BOTTOM: [6, 7, 8],
  LEFT: [0, 3, 6], MID_COL: [1, 4, 7], RIGHT: [2, 5, 8],
  CORNERS: [0, 2, 6, 8], EDGE_MIDS: [1, 3, 5, 7],
}
const sh = (shield, scope, pts) => ({ k: 'perShield', shield, scope, pts })
const distinct = (scope, pts) => ({ k: 'perDistinctShield', scope, pts })
const set = (shields, pts) => ({ k: 'perShieldSet', shields, pts })
const missing = (shield, pts) => ({ k: 'ifMissing', shield, pts })
const pos = (cells, pts) => ({ k: 'ifPosition', cells: C[cells], pts })
const card = (filter, pts, scope = 'grid', setSize) => ({ k: 'perCard', filter, scope, pts, ...(setSize ? { setSize } : {}) })
const banner = b => ({ k: 'banner', banner: b })
const cost = (min, max) => ({ k: 'cost', min, max })
const purse = capacity => ({ k: 'purse', capacity, pts: 2 })

const rules = {
  'lookout': distinct('column', 4),
  'knight': sh('blue', 'cross', 3),
  'general': { k: 'perMatchingTriple', pts: 6 },
  'captain': pos('RIGHT', 8),
  'officer': set(['blue', 'red'], 4),
  'mercenary': set(['purple', 'red', 'yellow'], 7),
  'master-at-arms': purse(4),
  'blacksmith': card({ k: 'doubleShield' }, 2),
  'squire': sh('orange', 'cross', 2),
  'bombardier': sh('red', 'column', 3),
  'militiaman': sh('red', 'row', 3),
  'barbarian': missing('green', 10),
  'executioner': card(banner('castle'), 1),
  'guildmaster': pos('BOTTOM', 5),
  'glassblower': set(['purple', 'orange'], 4),
  'pawnbroker': card(cost(4, 4), 3),
  'banker': { k: 'perStoredCoin', pts: 1 },
  'potter': purse(4),
  'carpenter': { k: 'ifFaceDown', pts: 8 },
  'locksmith': { k: 'perKey', pts: 1 },
  'stonemason': sh('orange', 'column', 3),
  'armorer': sh('red', 'cross', 3),
  'spice-merchant': pos('MID_ROW', 5),
  'clockmaker': sh('orange', 'row', 3),
  'innkeeper': purse(6),
  'chatelaine': distinct('row', 2),
  'duchess': pos('TOP', 8),
  'his-majesty': sh('blue', 'column', 4),
  'queen-mother': purse(5),
  'jester': sh('blue', 'cross', 2),
  'chancellor': card(banner('castle'), 2),
  'princess': sh('blue', 'row', 3),
  'prince': sh('blue', 'row', 4),
  'her-majesty-the-queen': set(['blue', 'green', 'orange'], 10),
  'baron': missing('yellow', 10),
  'steward': purse(3),
  'royal-guard': sh('blue', 'column', 3),
  'stable-boy': sh('yellow', 'column', 3),
  'nun': sh('purple', 'column', 3),
  'devout': missing('orange', 10),
  'his-holiness': { k: 'perMissingType', pts: 6 },
  'cardinal': sh('purple', 'row', 3),
  'templar': { k: 'perKey', pts: 1 },
  'pilgrim': distinct('row', 4),
  'chaplain': card(banner('village'), 2),
  'gravedigger': purse(8),
  'scribe': sh('green', 'cross', 3),
  'mother-superior': pos('TOP', 5),
  'monk': sh('yellow', 'row', 2),
  'sculptor': purse(7),
  'miraculously-cured': purse(4),
  'vicar': purse(5),
  'astronomer': pos('LEFT', 8),
  'alchemist': card({ k: 'discount' }, 4),
  'professor': sh('green', 'row', 3),
  'apothecary': sh('green', 'column', 3),
  'goldsmith': pos('LEFT', 6),
  'architect': distinct('grid', 2),
  'patron': card(cost(5, 99), 5),
  'judge': { k: 'perBannerPair', pts: 3 },
  'winemaker': distinct('column', 2),
  'spy': pos('MID_COL', 6),
  'inventor': card(banner('village'), 1),
  'doctor': set(['green', 'yellow'], 4),
  'philosopher': missing('red', 10),
  'brigand': card(banner('village'), 7, 'grid', 3),
  'beggar': sh('purple', 'cross', 2),
  'shepherd': sh('yellow', 'row', 3),
  'farmer': pos('BOTTOM', 7),
  'woodcutter': pos('RIGHT', 5),
  'witch': missing('purple', 9),
  'farmhand': purse(5),
  'traveler': card(cost(0, 0), 2),
  'usurper': card(banner('castle'), 2),
  'fisherman': pos('CORNERS', 4),
  'revolutionary': missing('blue', 9),
  'baker': pos('EDGE_MIDS', 3),
  'beekeeper': purse(9),
}

const out = research.map(r => {
  const rule = rules[r.id]
  if (!rule) throw new Error(`no rule for ${r.id}`)
  if (rule.k === 'purse' && rule.capacity !== r.purseCapacity) throw new Error(`purse mismatch ${r.id}`)
  if (rule.k !== 'purse' && r.purseCapacity) throw new Error(`missing purse ${r.id}`)
  const def = {
    id: r.id,
    nameEn: r.nameEn,
    nameCs: r.nameCs ?? null,
    banner: r.banner,
    cost: r.cost,
    shields: r.shields.map(s => color[s]),
    discount: r.otherIcons.some(i => i.startsWith('discount:')),
    rule,
    scoringText: r.scoringText,
  }
  return '  ' + JSON.stringify(def)
})
if (out.length !== Object.keys(rules).length) throw new Error('rule count mismatch')

writeFileSync(outFile, `import type { CardDef } from './types'

export const CARDS: CardDef[] = [
${out.join(',\n')},
]

export const CARD_BY_ID: ReadonlyMap<string, CardDef> = new Map(CARDS.map(c => [c.id, c]))
`)
console.log(`wrote ${out.length} cards`)
