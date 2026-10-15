import type { Quad, Raster } from './warp'

const MAX_SIDE = 1600

export async function loadRaster(source: Blob): Promise<Raster> {
  const bitmap = await createImageBitmap(source, { imageOrientation: 'from-image' })
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  const { data } = ctx.getImageData(0, 0, width, height)
  return { width, height, data }
}

export function rasterToDataUrl(raster: Raster): string {
  const canvas = document.createElement('canvas')
  canvas.width = raster.width
  canvas.height = raster.height
  canvas.getContext('2d')!.putImageData(new ImageData(new Uint8ClampedArray(raster.data), raster.width, raster.height), 0, 0)
  return canvas.toDataURL('image/jpeg', 0.85)
}

export function defaultQuad(raster: Raster): Quad {
  const mx = raster.width * 0.08
  const my = raster.height * 0.08
  return [
    { x: mx, y: my },
    { x: raster.width - mx, y: my },
    { x: raster.width - mx, y: raster.height - my },
    { x: mx, y: raster.height - my },
  ]
}
