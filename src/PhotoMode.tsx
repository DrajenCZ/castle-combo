import { useMemo, useState } from 'react'
import { CardPicker } from './CardPicker'
import { CARD_BY_ID } from './game/cards'
import type { Cell } from './game/types'
import { cardName, TEXT, type Lang } from './i18n'
import { CornerEditor } from './vision/CornerEditor'
import { defaultQuad, loadRaster, rasterToDataUrl } from './vision/image'
import { BACK_PREFIX, cellPreview, GRID_3X3, recognizeGrid, resolveDuplicates, type References } from './vision/recognize'
import references from './vision/references.json'
import type { Quad, Raster } from './vision/warp'

const REFS = references as References
const CONFIDENT = 0.12

interface Props {
  lang: Lang
  usedIds: Set<string>
  onApply: (grid: Cell[]) => void
  onClose: () => void
}

interface Review {
  previews: string[]
  cells: Cell[]
  sure: boolean[]
}

const toCell = (id: string): Cell => (id.startsWith(BACK_PREFIX) ? { faceDown: true } : { cardId: id })

export default function PhotoMode({ lang, usedIds, onApply, onClose }: Props) {
  const t = TEXT[lang]
  const [raster, setRaster] = useState<Raster | null>(null)
  const [quad, setQuad] = useState<Quad | null>(null)
  const [review, setReview] = useState<Review | null>(null)
  const [pickerCell, setPickerCell] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)

  const load = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    const r = await loadRaster(file)
    setRaster(r)
    setQuad(defaultQuad(r))
    setReview(null)
    setBusy(false)
  }

  const recognize = () => {
    if (!raster || !quad) return
    const guesses = recognizeGrid(raster, quad, REFS)
    const ids = resolveDuplicates(guesses)
    setReview({
      previews: guesses.map((_, i) => rasterToDataUrl(cellPreview(raster, quad, i, GRID_3X3))),
      cells: ids.map(toCell),
      sure: guesses.map((g, i) => g.cardId === ids[i] && g.confidence >= CONFIDENT),
    })
  }

  const othersUsed = useMemo(() => {
    const own = new Set(review?.cells.flatMap(c => (c && 'cardId' in c ? [c.cardId] : [])) ?? [])
    return new Set([...usedIds].filter(id => !own.has(id)))
  }, [usedIds, review])

  return (
    <div className="overlay photo-overlay">
      <div className="photo-mode">
        <div className="picker-head">
          <h2>{t.photoTitle}</h2>
          <button className="ghost" onClick={onClose}>{t.close}</button>
        </div>

        {!raster && (
          <div className="photo-start">
            <p>{t.photoHint}</p>
            <label className="file-button">
              📷 {t.takePhoto}
              <input type="file" accept="image/*" capture="environment" onChange={e => load(e.target.files?.[0])} hidden />
            </label>
            <label className="file-button ghost">
              🖼️ {t.uploadPhoto}
              <input type="file" accept="image/*" onChange={e => load(e.target.files?.[0])} hidden />
            </label>
            {busy && <p>…</p>}
          </div>
        )}

        {raster && quad && !review && (
          <>
            <p className="photo-help">{t.cornersHint}</p>
            <CornerEditor raster={raster} quad={quad} layout={GRID_3X3} onChange={setQuad} />
            <div className="picker-actions">
              <button onClick={() => setRaster(null)} className="ghost">{t.otherPhoto}</button>
              <button className="primary" onClick={recognize}>{t.recognize}</button>
            </div>
          </>
        )}

        {review && (
          <>
            <p className="photo-help">{t.reviewHint}</p>
            <div className="grid review">
              {review.cells.map((cell, i) => {
                const card = cell && 'cardId' in cell ? CARD_BY_ID.get(cell.cardId) : null
                const sure = review.sure[i]
                return (
                  <button key={i} className={`cell review-cell ${sure ? 'sure' : 'unsure'}`} onClick={() => setPickerCell(i)}>
                    <img src={review.previews[i]} alt="" />
                    <span className="cell-name">{card ? cardName(card, lang) : cell ? t.faceDown : '—'}</span>
                    {!sure && <span className="badge">?</span>}
                  </button>
                )
              })}
            </div>
            <div className="picker-actions">
              <button className="ghost" onClick={() => setReview(null)}>{t.adjustCorners}</button>
              <button className="primary" onClick={() => onApply(review.cells)}>{t.applyPhoto}</button>
            </div>
          </>
        )}
      </div>

      {review && pickerCell !== null && (
        <CardPicker
          lang={lang}
          usedIds={othersUsed}
          onPick={cell => {
            setReview({
              ...review,
              cells: review.cells.map((c, i) => (i === pickerCell ? cell : c)),
              sure: review.sure.map((x, i) => x || i === pickerCell),
            })
            setPickerCell(null)
          }}
          onClose={() => setPickerCell(null)}
        />
      )}
    </div>
  )
}
