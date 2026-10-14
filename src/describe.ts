import type { CardFilter, Rule, Scope, Shield } from './game/types'
import { SHIELD_NAMES, type Lang } from './i18n'

const SCOPE: Record<Lang, Record<Scope, string>> = {
  cs: { row: 'v řadě', column: 've sloupci', cross: 'v řadě i sloupci', grid: 'v sadě' },
  en: { row: 'in the same row', column: 'in the same column', cross: 'in the same row or column', grid: 'in your grid' },
}

const POSITION: Record<Lang, Record<string, string>> = {
  cs: {
    '0,1,2': 'v horní řadě', '3,4,5': 'v prostřední řadě', '6,7,8': 'v dolní řadě',
    '0,3,6': 'v levém sloupci', '1,4,7': 'v prostředním sloupci', '2,5,8': 'v pravém sloupci',
    '0,2,6,8': 'v rohu', '1,3,5,7': 'uprostřed okraje',
  },
  en: {
    '0,1,2': 'in the top row', '3,4,5': 'in the middle row', '6,7,8': 'in the bottom row',
    '0,3,6': 'in the left column', '1,4,7': 'in the middle column', '2,5,8': 'in the right column',
    '0,2,6,8': 'in a corner', '1,3,5,7': 'in the middle of an edge',
  },
}

function cardFilter(filter: CardFilter, lang: Lang): string {
  const cs = lang === 'cs'
  switch (filter.k) {
    case 'banner':
      return filter.banner === 'castle' ? (cs ? 'karta hradu' : 'castle card') : (cs ? 'karta podhradí' : 'village card')
    case 'doubleShield':
      return cs ? 'karta se dvěma erby' : 'card with two shields'
    case 'discount':
      return cs ? 'karta se slevou' : 'card with a discount'
    case 'cost':
      if (filter.min === filter.max) return cs ? `karta s cenou ${filter.min}` : `card costing ${filter.min}`
      return cs ? `karta s cenou ${filter.min} a víc` : `card costing ${filter.min}+`
  }
}

export function describeRule(rule: Rule, lang: Lang): string {
  const cs = lang === 'cs'
  const shield = (s: Shield) => SHIELD_NAMES[lang][s]
  const pts = `${rule.pts} ${cs ? 'b.' : 'pts'}`
  switch (rule.k) {
    case 'perShield':
      return cs ? `${pts} za každý erb ${shield(rule.shield)} ${SCOPE.cs[rule.scope]}` : `${pts} per ${shield(rule.shield)} shield ${SCOPE.en[rule.scope]}`
    case 'perDistinctShield':
      return cs ? `${pts} za každý druh erbu ${SCOPE.cs[rule.scope]}` : `${pts} per different shield type ${SCOPE.en[rule.scope]}`
    case 'perShieldSet':
      return cs ? `${pts} za každou sadu ${rule.shields.map(shield).join(' + ')}` : `${pts} per set of ${rule.shields.map(shield).join(' + ')}`
    case 'perMatchingTriple':
      return cs ? `${pts} za každou trojici stejných erbů` : `${pts} per set of 3 matching shields`
    case 'ifMissing':
      return cs ? `${pts}, pokud v sadě chybí ${shield(rule.shield)}` : `${pts} if you have no ${shield(rule.shield)} shield`
    case 'perMissingType':
      return cs ? `${pts} za každý chybějící druh erbu` : `${pts} per missing shield type`
    case 'ifPosition':
      return cs ? `${pts}, pokud leží ${POSITION.cs[rule.cells.join(',')]}` : `${pts} if placed ${POSITION.en[rule.cells.join(',')]}`
    case 'perCard': {
      const what = cardFilter(rule.filter, lang)
      const scope = rule.scope === 'grid' ? '' : ` ${SCOPE[lang][rule.scope]}`
      if (rule.setSize) return cs ? `${pts} za každé ${rule.setSize} × ${what}${scope}` : `${pts} per ${rule.setSize} × ${what}${scope}`
      return cs ? `${pts} za každou: ${what}${scope}` : `${pts} per ${what}${scope}`
    }
    case 'perBannerPair':
      return cs ? `${pts} za každý pár karta hradu + karta podhradí` : `${pts} per pair of castle + village card`
    case 'perKey':
      return cs ? `${pts} za každý klíč` : `${pts} per key`
    case 'purse':
      return cs ? `měšec: ${pts} za minci, max. ${rule.capacity}` : `purse: ${pts} per coin, max ${rule.capacity}`
    case 'perStoredCoin':
      return cs ? `${pts} za každou minci v měšcích` : `${pts} per coin stored on purses`
    case 'ifFaceDown':
      return cs ? `${pts}, máte-li aspoň 1 kartu lícem dolů` : `${pts} if you have at least 1 face-down card`
  }
}
