import { useMemo, useState } from 'react'
import { CARDS } from './game/cards'
import type { Banner, CardDef, Cell } from './game/types'
import { describeRule } from './describe'
import { cardName, fold, TEXT, type Lang } from './i18n'
import { Shields } from './Shields'

interface Props {
  lang: Lang
  usedIds: Set<string>
  onPick: (cell: Cell) => void
  onClose: () => void
}

export function CardPicker({ lang, usedIds, onPick, onClose }: Props) {
  const t = TEXT[lang]
  const [query, setQuery] = useState('')
  const [banner, setBanner] = useState<Banner | null>(null)

  const cards = useMemo(() => {
    const q = fold(query.trim())
    return CARDS
      .filter(c => !banner || c.banner === banner)
      .filter(c => !q || fold(c.nameEn).includes(q) || (c.nameCs && fold(c.nameCs).includes(q)))
      .sort((a, b) => cardName(a, lang).localeCompare(cardName(b, lang), lang))
  }, [query, banner, lang])

  return (
    <div className="overlay" onClick={onClose}>
      <div className="picker" onClick={e => e.stopPropagation()}>
        <div className="picker-head">
          <input autoFocus type="search" placeholder={t.search} value={query} onChange={e => setQuery(e.target.value)} />
          <button className="ghost" onClick={onClose}>{t.close}</button>
        </div>
        <div className="tabs">
          {([null, 'castle', 'village'] as const).map(b => (
            <button key={b ?? 'all'} className={banner === b ? 'tab active' : 'tab'} onClick={() => setBanner(b)}>
              {b === null ? t.all : t[b]}
            </button>
          ))}
        </div>
        <div className="picker-actions">
          <button onClick={() => onPick({ faceDown: true })}>{t.faceDown}</button>
          <button className="ghost" onClick={() => onPick(null)}>{t.clear}</button>
        </div>
        <ul className="card-list">
          {cards.map(card => (
            <CardRow key={card.id} card={card} lang={lang} used={usedIds.has(card.id)} onClick={() => onPick({ cardId: card.id })} />
          ))}
        </ul>
      </div>
    </div>
  )
}

function CardRow({ card, lang, used, onClick }: { card: CardDef; lang: Lang; used: boolean; onClick: () => void }) {
  const other = lang === 'cs' ? card.nameEn : card.nameCs
  return (
    <li>
      <button className={`card-row ${card.banner}${used ? ' used' : ''}`} onClick={onClick}>
        <span className="cost">{card.cost}</span>
        <span className="card-row-main">
          <span className="card-row-name">
            {cardName(card, lang)}
            {other && other !== cardName(card, lang) && <small> · {other}</small>}
          </span>
          <span className="card-row-text">{describeRule(card.rule, lang)}</span>
        </span>
        <Shields shields={card.shields} lang={lang} />
      </button>
    </li>
  )
}
