import { describe, expect, it } from 'vitest'
import { CARDS } from '../game/cards'
import { features, resolveDuplicates, type CellGuess } from './recognize'
import references from './references.json'
import { quadMapping, sample, type Raster } from './warp'

const guess = (cardId: string, confidence: number, alternatives: string[] = []): CellGuess =>
  ({ cardId, confidence, alternatives, distance: 1 })

function gradient(width: number, height: number, tint = 1): Raster {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const o = (y * width + x) * 4
      data[o] = ((x * 255) / width) * tint
      data[o + 1] = ((y * 255) / height) * tint
      data[o + 2] = (((x + y) * 127) / (width + height)) * tint
      data[o + 3] = 255
    }
  }
  return { width, height, data }
}

describe('quadMapping', () => {
  it('maps the unit square onto the quad corners', () => {
    const map = quadMapping([{ x: 10, y: 20 }, { x: 110, y: 15 }, { x: 120, y: 160 }, { x: 5, y: 150 }])
    expect(map(0, 0)).toEqual({ x: 10, y: 20 })
    expect(map(1, 0).x).toBeCloseTo(110)
    expect(map(1, 1).y).toBeCloseTo(160)
    expect(map(0, 1).x).toBeCloseTo(5)
  })

  it('samples an axis-aligned quad as a plain crop', () => {
    const src = gradient(40, 40)
    const crop = sample(src, quadMapping([{ x: 0, y: 0 }, { x: 40, y: 0 }, { x: 40, y: 40 }, { x: 0, y: 40 }]), 0, 0, 1, 1, 40, 40)
    expect(Math.abs(crop.data[(10 * 40 + 20) * 4] - src.data[(10 * 40 + 20) * 4])).toBeLessThanOrEqual(1)
  })
})

describe('features', () => {
  it('ignores overall brightness', () => {
    const a = features(gradient(48, 64))
    const b = features(gradient(48, 64, 0.6))
    const diff = Math.max(...a.map((x, i) => Math.abs(x - b[i])))
    expect(diff).toBeLessThan(0.1)
  })
})

describe('resolveDuplicates', () => {
  it('keeps the surer cell and moves the other to its next alternative', () => {
    const ids = resolveDuplicates([guess('baker', 0.05, ['monk']), guess('baker', 0.4, ['spy'])])
    expect(ids).toEqual(['monk', 'baker'])
  })

  it('lets several cells be face down', () => {
    const ids = resolveDuplicates([guess('back-castle', 0.3), guess('back-castle', 0.2, ['spy'])])
    expect(ids).toEqual(['back-castle', 'back-castle'])
  })
})

describe('references', () => {
  it('has a fingerprint for every card and both card backs', () => {
    expect(Object.keys(references).sort()).toEqual([...CARDS.map(c => c.id), 'back-castle', 'back-village'].sort())
  })
})
