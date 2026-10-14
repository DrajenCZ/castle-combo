import { CARD_BY_ID } from './cards'
import { SHIELDS, type Board, type BoardScore, type CardDef, type CardFilter, type Rule, type Scope, type Shield } from './types'

function scopeCells(scope: Scope, index: number): number[] {
  const row = Math.floor(index / 3)
  const col = index % 3
  const rowCells = [row * 3, row * 3 + 1, row * 3 + 2]
  const colCells = [col, col + 3, col + 6]
  switch (scope) {
    case 'row': return rowCells
    case 'column': return colCells
    case 'cross': return [...new Set([...rowCells, ...colCells])]
    case 'grid': return [0, 1, 2, 3, 4, 5, 6, 7, 8]
  }
}

function matches(card: CardDef, filter: CardFilter): boolean {
  switch (filter.k) {
    case 'banner': return card.banner === filter.banner
    case 'doubleShield': return card.shields.length === 2
    case 'cost': return card.cost >= filter.min && card.cost <= filter.max
    case 'discount': return card.discount
  }
}

export function placedCards(board: Board): (CardDef | null)[] {
  return board.grid.map(cell => (cell && 'cardId' in cell ? CARD_BY_ID.get(cell.cardId) ?? null : null))
}

function distributeCoins(cards: (CardDef | null)[], coins: number): number[] {
  const stored = cards.map(() => 0)
  const purses = cards
    .map((card, index) => ({ card, index }))
    .filter(p => p.card?.rule.k === 'purse')
    .sort((a, b) => (b.card!.rule as { pts: number }).pts - (a.card!.rule as { pts: number }).pts)
  let left = coins
  for (const { card, index } of purses) {
    const capacity = (card!.rule as { capacity: number }).capacity
    stored[index] = Math.min(capacity, left)
    left -= stored[index]
  }
  return stored
}

export function scoreBoard(board: Board): BoardScore {
  const cards = placedCards(board)
  const stored = distributeCoins(cards, board.coins)
  const totalStored = stored.reduce((a, b) => a + b, 0)
  const faceDownCount = board.grid.filter(cell => cell && 'faceDown' in cell).length

  const shieldsIn = (cells: number[]): Shield[] => cells.flatMap(i => cards[i]?.shields ?? [])
  const countShield = (shields: Shield[], shield: Shield) => shields.filter(s => s === shield).length
  const allShields = shieldsIn(scopeCells('grid', 0))

  const scoreRule = (rule: Rule, index: number): number => {
    switch (rule.k) {
      case 'perShield':
        return rule.pts * countShield(shieldsIn(scopeCells(rule.scope, index)), rule.shield)
      case 'perDistinctShield':
        return rule.pts * new Set(shieldsIn(scopeCells(rule.scope, index))).size
      case 'perShieldSet':
        return rule.pts * Math.min(...rule.shields.map(s => countShield(allShields, s)))
      case 'perMatchingTriple':
        return rule.pts * SHIELDS.reduce((sum, s) => sum + Math.floor(countShield(allShields, s) / 3), 0)
      case 'ifMissing':
        return countShield(allShields, rule.shield) === 0 ? rule.pts : 0
      case 'perMissingType':
        return rule.pts * SHIELDS.filter(s => countShield(allShields, s) === 0).length
      case 'ifPosition':
        return rule.cells.includes(index) ? rule.pts : 0
      case 'perCard': {
        const count = scopeCells(rule.scope, index).filter(i => cards[i] && matches(cards[i], rule.filter)).length
        return rule.pts * Math.floor(count / (rule.setSize ?? 1))
      }
      case 'perBannerPair': {
        const castle = cards.filter(c => c?.banner === 'castle').length
        const village = cards.filter(c => c?.banner === 'village').length
        return rule.pts * Math.min(castle, village)
      }
      case 'perKey':
        return rule.pts * board.keys
      case 'purse':
        return rule.pts * stored[index]
      case 'perStoredCoin':
        return rule.pts * totalStored
      case 'ifFaceDown':
        return faceDownCount > 0 ? rule.pts : 0
    }
  }

  const cellScores = cards.map((card, index) => (card ? scoreRule(card.rule, index) : 0))
  const total = cellScores.reduce((a, b) => a + b, 0) + board.keys
  return { cells: cellScores, stored, keys: board.keys, total, coinsLeft: board.coins - totalStored }
}
