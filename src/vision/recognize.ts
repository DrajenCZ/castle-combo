import { quadMapping, sample, type Mapping, type Quad, type Raster } from './warp'

export const FEATURE_COLS = 12
export const FEATURE_ROWS = 16
const SAMPLE_W = FEATURE_COLS * 4
const SAMPLE_H = FEATURE_ROWS * 4
const INSET = 0.06
const SHIFTS = [-0.02, 0, 0.02]
const SCALES = [0.96, 1, 1.04]
const SEARCH = 0.2
const REGION_W = 96
const REGION_H = 128
const EDGE_STEP = 10
const MIN_EDGE_SUPPORT = 0.2
const MAX_CANDIDATES = 4
const CARD_ASPECT = 0.72
const ASPECT_TOLERANCE = 0.05

export const BACK_PREFIX = 'back-'

export type References = Record<string, number[]>

export interface CellGuess {
  cardId: string
  distance: number
  confidence: number
  alternatives: string[]
}

export interface GridLayout {
  cols: number
  rows: number
}

export interface Rect {
  u0: number
  v0: number
  u1: number
  v1: number
}

export const GRID_3X3: GridLayout = { cols: 3, rows: 3 }

function cellRect(index: number, layout: GridLayout, pad = 0): Rect {
  const col = index % layout.cols
  const row = Math.floor(index / layout.cols)
  return {
    u0: (col - pad) / layout.cols,
    v0: (row - pad) / layout.rows,
    u1: (col + 1 + pad) / layout.cols,
    v1: (row + 1 + pad) / layout.rows,
  }
}

function luminance(region: Raster): Float32Array {
  const lum = new Float32Array(region.width * region.height)
  for (let i = 0; i < lum.length; i++) {
    lum[i] = 0.299 * region.data[i * 4] + 0.587 * region.data[i * 4 + 1] + 0.114 * region.data[i * 4 + 2]
  }
  return lum
}

interface Edge {
  pos: number
  support: number
}

function edgeCandidates(count: (pos: number) => number, from: number, to: number, lines: number): Edge[] {
  const counts = Array.from({ length: to - from + 1 }, (_, i) => count(from + i))
  const peaks: Edge[] = []
  counts.forEach((c, i) => {
    if (c >= lines * MIN_EDGE_SUPPORT && c >= (counts[i - 1] ?? 0) && c >= (counts[i + 1] ?? 0)) {
      peaks.push({ pos: from + i, support: c / lines })
    }
  })
  return peaks.sort((x, y) => y.support - x.support).slice(0, MAX_CANDIDATES)
}

function pixelScale(map: Mapping, u: number, v: number) {
  const p = map(u, v)
  const pu = map(u + 0.01, v)
  const pv = map(u, v + 0.01)
  return { su: Math.hypot(pu.x - p.x, pu.y - p.y) / 0.01, sv: Math.hypot(pv.x - p.x, pv.y - p.y) / 0.01 }
}

export function locateCard(photo: Raster, map: Mapping, index: number, layout: GridLayout): Rect {
  const cell = cellRect(index, layout)
  const outer = cellRect(index, layout, SEARCH)
  const region = sample(photo, map, outer.u0, outer.v0, outer.u1, outer.v1, REGION_W, REGION_H)
  const lum = luminance(region)
  const at = (x: number, y: number) => lum[y * REGION_W + x]
  const y0 = Math.round(REGION_H * 0.3)
  const y1 = Math.round(REGION_H * 0.7)
  const x0 = Math.round(REGION_W * 0.3)
  const x1 = Math.round(REGION_W * 0.7)
  const columnCount = (sign: number) => (x: number) => {
    let n = 0
    for (let y = y0; y < y1; y++) if (sign * (at(x + 1, y) - at(x - 1, y)) > EDGE_STEP) n++
    return n
  }
  const rowCount = (sign: number) => (y: number) => {
    let n = 0
    for (let x = x0; x < x1; x++) if (sign * (at(x, y + 1) - at(x, y - 1)) > EDGE_STEP) n++
    return n
  }
  const lefts = edgeCandidates(columnCount(1), 1, Math.round(REGION_W * 0.45), y1 - y0)
  const rights = edgeCandidates(columnCount(-1), Math.round(REGION_W * 0.55), REGION_W - 2, y1 - y0)
  const tops = edgeCandidates(rowCount(1), 1, Math.round(REGION_H * 0.45), x1 - x0)
  const bottoms = edgeCandidates(rowCount(-1), Math.round(REGION_H * 0.55), REGION_H - 2, x1 - x0)

  const u = (x: number) => outer.u0 + (x / REGION_W) * (outer.u1 - outer.u0)
  const v = (y: number) => outer.v0 + (y / REGION_H) * (outer.v1 - outer.v0)
  const { su, sv } = pixelScale(map, (cell.u0 + cell.u1) / 2, (cell.v0 + cell.v1) / 2)
  const aspect = (l: number, r: number, t: number, b: number) => ((u(r + 1) - u(l)) * su) / ((v(b + 1) - v(t)) * sv)

  let best: { rect: Rect; score: number } | null = null
  for (const l of lefts) {
    for (const r of rights) {
      for (const t of tops) {
        for (const b of bottoms) {
          if (Math.abs(aspect(l.pos, r.pos, t.pos, b.pos) / CARD_ASPECT - 1) > ASPECT_TOLERANCE) continue
          const score = l.support + r.support + t.support + b.support
          if (!best || score > best.score) {
            best = { rect: { u0: u(l.pos), u1: u(r.pos + 1), v0: v(t.pos), v1: v(b.pos + 1) }, score }
          }
        }
      }
    }
  }
  if (best) return best.rect

  const pairScore = (a: Edge[], b: Edge[]) => (a[0] && b[0] ? a[0].support + b[0].support : 0)
  if (pairScore(lefts, rights) >= pairScore(tops, bottoms) && lefts[0] && rights[0]) {
    const u0 = u(lefts[0].pos)
    const u1 = u(rights[0].pos + 1)
    const half = ((u1 - u0) * su) / CARD_ASPECT / sv / 2
    const cv = (cell.v0 + cell.v1) / 2
    return { u0, u1, v0: cv - half, v1: cv + half }
  }
  if (tops[0] && bottoms[0]) {
    const v0 = v(tops[0].pos)
    const v1 = v(bottoms[0].pos + 1)
    const half = ((v1 - v0) * sv * CARD_ASPECT) / su / 2
    const cu = (cell.u0 + cell.u1) / 2
    return { u0: cu - half, u1: cu + half, v0, v1 }
  }
  return cell
}

function innerRect(card: Rect, du = 0, dv = 0, scale = 1): Rect {
  const w = card.u1 - card.u0
  const h = card.v1 - card.v0
  const cu = (card.u0 + card.u1) / 2 + du * w
  const cv = (card.v0 + card.v1) / 2 + dv * h
  const hw = (w / 2) * (1 - 2 * INSET) * scale
  const hh = (h / 2) * (1 - 2 * INSET) * scale
  return { u0: cu - hw, v0: cv - hh, u1: cu + hw, v1: cv + hh }
}

export function features(cell: Raster): number[] {
  const bw = cell.width / FEATURE_COLS
  const bh = cell.height / FEATURE_ROWS
  const blocks: [number, number, number][] = []
  for (let by = 0; by < FEATURE_ROWS; by++) {
    for (let bx = 0; bx < FEATURE_COLS; bx++) {
      let r = 0
      let g = 0
      let b = 0
      let n = 0
      for (let y = Math.floor(by * bh); y < Math.floor((by + 1) * bh); y++) {
        for (let x = Math.floor(bx * bw); x < Math.floor((bx + 1) * bw); x++) {
          const o = (y * cell.width + x) * 4
          r += cell.data[o]
          g += cell.data[o + 1]
          b += cell.data[o + 2]
          n++
        }
      }
      blocks.push([r / n, g / n, b / n])
    }
  }
  const lum = blocks.map(([r, g, b]) => 0.299 * r + 0.587 * g + 0.114 * b)
  const mean = lum.reduce((s, x) => s + x, 0) / lum.length
  const std = Math.sqrt(lum.reduce((s, x) => s + (x - mean) ** 2, 0) / lum.length) || 1
  return [
    ...lum.map(x => (x - mean) / std),
    ...blocks.map(([r, g]) => ((r - g) / mean) * 3),
    ...blocks.map(([r, g, b]) => (((r + g) / 2 - b) / mean) * 3),
  ]
}

function rectFeatures(photo: Raster, map: Mapping, rect: Rect): number[] {
  return features(sample(photo, map, rect.u0, rect.v0, rect.u1, rect.v1, SAMPLE_W, SAMPLE_H))
}

export function cellFeatures(photo: Raster, map: Mapping, index: number, layout: GridLayout): number[] {
  return rectFeatures(photo, map, innerRect(locateCard(photo, map, index, layout)))
}

function distance(a: number[], b: number[]): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2
  return Math.sqrt(sum / a.length)
}

export function recognizeCell(photo: Raster, map: Mapping, index: number, layout: GridLayout, refs: References): CellGuess {
  const card = locateCard(photo, map, index, layout)
  const best = new Map<string, number>()
  for (const scale of SCALES) {
    for (const du of SHIFTS) {
      for (const dv of SHIFTS) {
        const f = rectFeatures(photo, map, innerRect(card, du, dv, scale))
        for (const [id, ref] of Object.entries(refs)) {
          const d = distance(f, ref)
          if (d < (best.get(id) ?? Infinity)) best.set(id, d)
        }
      }
    }
  }
  const ranked = [...best.entries()].sort((a, b) => a[1] - b[1])
  const [first, second] = ranked
  return {
    cardId: first[0],
    distance: first[1],
    confidence: second ? 1 - first[1] / second[1] : 1,
    alternatives: ranked.slice(1, 4).map(([id]) => id),
  }
}

export function recognizeGrid(photo: Raster, quad: Quad, refs: References, layout = GRID_3X3): CellGuess[] {
  const map = quadMapping(quad)
  return Array.from({ length: layout.cols * layout.rows }, (_, i) => recognizeCell(photo, map, i, layout, refs))
}

export function cellPreview(photo: Raster, quad: Quad, index: number, layout = GRID_3X3): Raster {
  const map = quadMapping(quad)
  const card = locateCard(photo, map, index, layout)
  return sample(photo, map, card.u0, card.v0, card.u1, card.v1, 100, 140)
}

export function resolveDuplicates(guesses: CellGuess[]): string[] {
  const taken = new Set<string>()
  const result: string[] = Array(guesses.length)
  const order = guesses.map((_, i) => i).sort((a, b) => guesses[b].confidence - guesses[a].confidence)
  for (const i of order) {
    const id = [guesses[i].cardId, ...guesses[i].alternatives].find(c => c.startsWith(BACK_PREFIX) || !taken.has(c)) ?? guesses[i].cardId
    taken.add(id)
    result[i] = id
  }
  return result
}
