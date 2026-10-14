import { describe, expect, it } from 'vitest'
import { CARDS } from './cards'
import { scoreBoard } from './score'
import { SHIELDS, type Board, type Cell } from './types'

const c = (cardId: string): Cell => ({ cardId })
const faceDown: Cell = { faceDown: true }

describe('card data', () => {
  it('has 39 castle and 39 village cards', () => {
    expect(CARDS.filter(x => x.banner === 'castle')).toHaveLength(39)
    expect(CARDS.filter(x => x.banner === 'village')).toHaveLength(39)
  })

  it('matches the shield distribution printed in the rulebook', () => {
    const count = (banner: string) =>
      SHIELDS.map(s => CARDS.filter(x => x.banner === banner).flatMap(x => x.shields).filter(x => x === s).length)
    expect(count('castle')).toEqual([14, 12, 11, 8, 7, 0])
    expect(count('village')).toEqual([1, 5, 6, 10, 11, 20])
  })

  it('has unique ids', () => {
    expect(new Set(CARDS.map(x => x.id)).size).toBe(CARDS.length)
  })
})

describe('scoreBoard', () => {
  it('scores the rulebook example to 75', () => {
    const board: Board = {
      grid: [
        c('judge'), c('his-holiness'), c('locksmith'),
        c('clockmaker'), c('sculptor'), c('spice-merchant'),
        c('banker'), faceDown, c('miraculously-cured'),
      ],
      keys: 11,
      coins: 6,
    }

    const score = scoreBoard(board)

    expect(score.cells.slice(0, 4)).toEqual([9, 12, 11, 9])
    expect(score.cells.slice(5, 8)).toEqual([5, 6, 0])
    expect(score.cells[4] + score.cells[8]).toBe(4 + 8)
    expect(score.coinsLeft).toBe(0)
    expect(score.total).toBe(75)
  })

  it('fills purses up to capacity and keeps the rest for the tie-break', () => {
    const board: Board = {
      grid: [c('steward'), c('potter'), null, null, null, null, null, null, null],
      keys: 0,
      coins: 10,
    }

    const score = scoreBoard(board)

    expect(score.stored).toEqual([3, 4, 0, 0, 0, 0, 0, 0, 0])
    expect(score.cells.slice(0, 2)).toEqual([6, 8])
    expect(score.coinsLeft).toBe(3)
    expect(score.total).toBe(14)
  })

  it('counts row and column together without the card twice', () => {
    const board: Board = {
      grid: [
        c('knight'), c('duchess'), null,
        c('prince'), null, null,
        null, null, c('jester'),
      ],
      keys: 0,
      coins: 0,
    }

    expect(scoreBoard(board).cells[0]).toBe(3 * 3)
  })

  it('scores sets, triples and missing shields across the grid', () => {
    const board: Board = {
      grid: [
        c('general'), c('officer'), c('his-holiness'),
        c('knight'), c('royal-guard'), c('baron'),
        c('militiaman'), c('bombardier'), c('carpenter'),
      ],
      keys: 0,
      coins: 0,
    }

    const score = scoreBoard(board)

    expect(score.cells[0]).toBe(6 * 2)
    expect(score.cells[1]).toBe(4 * 2)
    expect(score.cells[2]).toBe(6 * 2)
    expect(score.cells[5]).toBe(10)
    expect(score.cells[8]).toBe(0)
  })

  it('gives face-down cards nothing and lets the Carpenter see them', () => {
    const board: Board = {
      grid: [c('carpenter'), faceDown, null, null, null, null, null, null, null],
      keys: 0,
      coins: 0,
    }

    expect(scoreBoard(board).cells).toEqual([8, 0, 0, 0, 0, 0, 0, 0, 0])
  })
})
