export interface Point {
  x: number
  y: number
}

export interface Raster {
  width: number
  height: number
  data: Uint8ClampedArray
}

export type Quad = [Point, Point, Point, Point]

export type Mapping = (u: number, v: number) => Point

export function quadMapping([p0, p1, p2, p3]: Quad): Mapping {
  const dx1 = p1.x - p2.x
  const dx2 = p3.x - p2.x
  const dx3 = p0.x - p1.x + p2.x - p3.x
  const dy1 = p1.y - p2.y
  const dy2 = p3.y - p2.y
  const dy3 = p0.y - p1.y + p2.y - p3.y
  const det = dx1 * dy2 - dx2 * dy1
  const g = det === 0 ? 0 : (dx3 * dy2 - dx2 * dy3) / det
  const h = det === 0 ? 0 : (dx1 * dy3 - dx3 * dy1) / det
  const a = p1.x - p0.x + g * p1.x
  const b = p3.x - p0.x + h * p3.x
  const d = p1.y - p0.y + g * p1.y
  const e = p3.y - p0.y + h * p3.y
  return (u, v) => {
    const w = g * u + h * v + 1
    return { x: (a * u + b * v + p0.x) / w, y: (d * u + e * v + p0.y) / w }
  }
}

export function sample(src: Raster, map: Mapping, u0: number, v0: number, u1: number, v1: number, width: number, height: number): Raster {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const { x, y } = map(u0 + ((i + 0.5) / width) * (u1 - u0), v0 + ((j + 0.5) / height) * (v1 - v0))
      const o = (j * width + i) * 4
      bilinear(src, x, y, data, o)
    }
  }
  return { width, height, data }
}

function bilinear(src: Raster, x: number, y: number, out: Uint8ClampedArray, o: number) {
  const fx = Math.min(Math.max(x - 0.5, 0), src.width - 1.001)
  const fy = Math.min(Math.max(y - 0.5, 0), src.height - 1.001)
  const x0 = Math.floor(fx)
  const y0 = Math.floor(fy)
  const tx = fx - x0
  const ty = fy - y0
  const i00 = (y0 * src.width + x0) * 4
  const i10 = i00 + 4
  const i01 = i00 + src.width * 4
  const i11 = i01 + 4
  for (let c = 0; c < 3; c++) {
    const top = src.data[i00 + c] * (1 - tx) + src.data[i10 + c] * tx
    const bottom = src.data[i01 + c] * (1 - tx) + src.data[i11 + c] * tx
    out[o + c] = top * (1 - ty) + bottom * ty
  }
  out[o + 3] = 255
}
