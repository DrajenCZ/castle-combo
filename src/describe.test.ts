import { describe, expect, it } from 'vitest'
import { CARDS } from './game/cards'
import { describeRule } from './describe'

describe('describeRule', () => {
  it('describes every card in both languages without gaps', () => {
    for (const card of CARDS) {
      expect(card.nameCs, card.id).toBeTruthy()
      expect(describeRule(card.rule, 'cs'), card.id).not.toMatch(/undefined/)
      expect(describeRule(card.rule, 'en'), card.id).not.toMatch(/undefined/)
    }
  })

  it('names the scope and position the card shows', () => {
    const byId = (id: string) => CARDS.find(c => c.id === id)!.rule
    expect(describeRule(byId('pilgrim'), 'cs')).toBe('4 b. za každý druh erbu v řadě')
    expect(describeRule(byId('captain'), 'cs')).toBe('8 b., pokud leží v pravém sloupci')
    expect(describeRule(byId('brigand'), 'en')).toBe('7 pts per 3 × village card')
  })
})
