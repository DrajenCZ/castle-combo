import { useEffect, useMemo, useRef, useState } from 'react'
import { rasterToDataUrl } from './image'
import { quadMapping, type Quad, type Raster } from './warp'
import type { GridLayout } from './recognize'

interface Props {
  raster: Raster
  quad: Quad
  layout: GridLayout
  onChange: (quad: Quad) => void
}

export function CornerEditor({ raster, quad, layout, onChange }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [dragging, setDragging] = useState<number | null>(null)
  const src = useMemo(() => rasterToDataUrl(raster), [raster])

  useEffect(() => {
    const el = box.current
    if (!el) return
    const update = () => setScale(el.clientWidth / raster.width)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [raster])

  const lines = useMemo(() => {
    const map = quadMapping(quad)
    const path = (points: [number, number][]) =>
      points.map(([u, v]) => map(u, v)).map(p => `${p.x * scale},${p.y * scale}`).join(' ')
    const steps = Array.from({ length: 21 }, (_, i) => i / 20)
    const result: string[] = []
    for (let c = 0; c <= layout.cols; c++) result.push(path(steps.map(t => [c / layout.cols, t])))
    for (let r = 0; r <= layout.rows; r++) result.push(path(steps.map(t => [t, r / layout.rows])))
    return result
  }, [quad, scale, layout])

  const move = (e: React.PointerEvent) => {
    if (dragging === null || !box.current) return
    const rect = box.current.getBoundingClientRect()
    const x = Math.min(Math.max((e.clientX - rect.left) / scale, 0), raster.width)
    const y = Math.min(Math.max((e.clientY - rect.top) / scale, 0), raster.height)
    onChange(quad.map((p, i) => (i === dragging ? { x, y } : p)) as Quad)
  }

  return (
    <div
      ref={box}
      className="corner-editor"
      onPointerMove={move}
      onPointerUp={() => setDragging(null)}
      onPointerCancel={() => setDragging(null)}
    >
      <img src={src} alt="" draggable={false} />
      <svg width={raster.width * scale} height={raster.height * scale}>
        {lines.map((points, i) => <polyline key={i} points={points} />)}
      </svg>
      {quad.map((p, i) => (
        <span
          key={i}
          className="handle"
          style={{ left: p.x * scale, top: p.y * scale }}
          onPointerDown={e => {
            e.currentTarget.parentElement?.setPointerCapture(e.pointerId)
            setDragging(i)
          }}
        />
      ))}
    </div>
  )
}
