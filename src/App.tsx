import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { CardPicker } from './CardPicker'
import { useBackToClose } from './useBackToClose'
import { CARD_BY_ID } from './game/cards'
import { scoreBoard } from './game/score'
import type { Board, Cell } from './game/types'
import { describeRule } from './describe'
import { cardName, TEXT, type Lang } from './i18n'
import { Shields } from './Shields'

interface Player {
  id: number
  name: string
  board: Board
}

interface State {
  lang: Lang
  players: Player[]
  active: number
}

const PhotoMode = lazy(() => import('./PhotoMode'))

const STORAGE_KEY = 'castle-combo-v1'

const emptyBoard = (): Board => ({ grid: Array(9).fill(null), keys: 0, coins: 0 })
const newPlayer = (id: number, lang: Lang): Player => ({ id, name: `${TEXT[lang].player} ${id}`, board: emptyBoard() })

function loadState(): State {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved) as State
  } catch {
    // storage unavailable – start fresh
  }
  return { lang: 'cs', players: [newPlayer(1, 'cs')], active: 1 }
}

export default function App() {
  const [state, setState] = useState<State>(loadState)
  const [pickerCell, setPickerCell] = useState<number | null>(null)
  const [photoOpen, setPhotoOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useBackToClose(pickerCell !== null, () => setPickerCell(null))
  useBackToClose(photoOpen, () => setPhotoOpen(false))
  useBackToClose(menuOpen, () => setMenuOpen(false))
  const { lang, players, active } = state
  const t = TEXT[lang]
  const player = players.find(p => p.id === active) ?? players[0]

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // storage unavailable – keep going in memory
    }
  }, [state])

  const scores = useMemo(() => new Map(players.map(p => [p.id, scoreBoard(p.board)])), [players])
  const score = scores.get(player.id)!

  const updateBoard = (change: Partial<Board>) =>
    setState(s => ({ ...s, players: s.players.map(p => (p.id === player.id ? { ...p, board: { ...p.board, ...change } } : p)) }))

  const setCell = (index: number, cell: Cell) => {
    updateBoard({ grid: player.board.grid.map((c, i) => (i === index ? cell : c)) })
    setPickerCell(null)
  }

  const addPlayer = () => {
    const id = Math.max(...players.map(p => p.id)) + 1
    setState(s => ({ ...s, players: [...s.players, newPlayer(id, lang)], active: id }))
    setMenuOpen(true)
  }

  const renamePlayer = (name: string) =>
    setState(s => ({ ...s, players: s.players.map(p => (p.id === player.id ? { ...p, name } : p)) }))

  const removePlayer = () => {
    if (players.length === 1 || !confirm(t.removeConfirm.replace('{name}', player.name))) return
    setMenuOpen(false)
    setState(s => {
      const rest = s.players.filter(p => p.id !== player.id)
      return { ...s, players: rest, active: rest[0].id }
    })
  }

  const newGame = () => {
    if (confirm(t.newGameConfirm)) setState({ lang, players: [newPlayer(1, lang)], active: 1 })
  }

  const usedIds = new Set(
    players.flatMap(p => p.board.grid.flatMap(c => (c && 'cardId' in c ? [c.cardId] : []))),
  )

  const ranking = [...players].sort((a, b) => {
    const sa = scores.get(a.id)!
    const sb = scores.get(b.id)!
    return sb.total - sa.total || sb.coinsLeft - sa.coinsLeft
  })

  return (
    <main>
      <header>
        <div>
          <h1>{t.title}</h1>
          <p className="subtitle">{t.subtitle}</p>
        </div>
        <div className="header-actions">
          <button className="ghost" onClick={() => setState(s => ({ ...s, lang: lang === 'cs' ? 'en' : 'cs' }))}>
            {lang === 'cs' ? 'EN' : 'CZ'}
          </button>
          <button className="ghost" onClick={newGame}>{t.newGame}</button>
        </div>
      </header>

      <nav className="players">
        {players.map(p => (p.id === player.id ? (
          <span key={p.id} className="tab-split">
            <button className="tab active" onClick={() => setMenuOpen(true)}>
              {p.name} <b>{scores.get(p.id)!.total}</b>
            </button>
            <button className="tab active menu" aria-label={t.editPlayer} onClick={() => setMenuOpen(true)}>⋯</button>
          </span>
        ) : (
          <button key={p.id} className="tab" onClick={() => setState(s => ({ ...s, active: p.id }))}>
            {p.name} <b>{scores.get(p.id)!.total}</b>
          </button>
        )))}
        {players.length < 5 && <button className="tab add" onClick={addPlayer}>+ {t.addPlayer}</button>}
      </nav>

      <button className="photo-button" onClick={() => setPhotoOpen(true)}>📷 {t.photoTitle}</button>

      <section className="grid">
        {player.board.grid.map((cell, index) => (
          <GridCell key={index} cell={cell} lang={lang} points={score.cells[index]} stored={score.stored[index]} onClick={() => setPickerCell(index)} />
        ))}
      </section>

      <section className="counters">
        <Counter label={t.keys} value={player.board.keys} onChange={keys => updateBoard({ keys })} />
        <Counter label={t.coins} value={player.board.coins} onChange={coins => updateBoard({ coins })} />
      </section>

      <section className="summary">
        <span>{t.keysRow}: {score.keys}</span>
        <span>{score.coinsLeft} {t.coinsLeft}</span>
        <strong>{t.total}: {score.total}</strong>
      </section>

      {players.length > 1 && (
        <section className="results">
          <h2>{t.results}</h2>
          <ol>
            {ranking.map(p => (
              <li key={p.id}>
                <span>{p.name}</span>
                <small>{scores.get(p.id)!.coinsLeft} {t.coinsLeft}</small>
                <b>{scores.get(p.id)!.total}</b>
              </li>
            ))}
          </ol>
        </section>
      )}

      {menuOpen && (
        <div className="overlay" onClick={() => setMenuOpen(false)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <label className="field">
              <span>{t.playerName}</span>
              <input autoFocus value={player.name} onFocus={e => e.target.select()} onChange={e => renamePlayer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setMenuOpen(false)} />
            </label>
            <div className="picker-actions">
              {players.length > 1 && <button className="danger" onClick={removePlayer}>{t.remove}</button>}
              <button className="primary" onClick={() => setMenuOpen(false)}>{t.done}</button>
            </div>
          </div>
        </div>
      )}

      {photoOpen && (
        <Suspense>
          <PhotoMode
            lang={lang}
            usedIds={usedIds}
            onApply={grid => {
              updateBoard({ grid })
              setPhotoOpen(false)
            }}
            onClose={() => setPhotoOpen(false)}
          />
        </Suspense>
      )}

      {pickerCell !== null && (
        <CardPicker lang={lang} usedIds={usedIds} onPick={cell => setCell(pickerCell, cell)} onClose={() => setPickerCell(null)} />
      )}
    </main>
  )
}

function GridCell({ cell, lang, points, stored, onClick }: { cell: Cell; lang: Lang; points: number; stored: number; onClick: () => void }) {
  const t = TEXT[lang]
  if (!cell) return <button className="cell empty" onClick={onClick}>+<small>{t.emptyCell}</small></button>
  if ('faceDown' in cell) {
    return (
      <button className="cell face-down" onClick={onClick}>
        <span className="cell-top"><span className="cell-name">{t.faceDown}</span></span>
        <span className="cell-bottom"><span className="points">0</span></span>
      </button>
    )
  }

  const card = CARD_BY_ID.get(cell.cardId)!
  return (
    <button className={`cell ${card.banner}`} onClick={onClick} title={describeRule(card.rule, lang)}>
      <span className="cell-top">
        <span className="cell-name">{cardName(card, lang)}</span>
        <Shields shields={card.shields} lang={lang} />
      </span>
      <span className="cell-bottom">
        {stored > 0 && <span className="stored" title={`${stored} ${t.stored}`}>🪙 {stored}</span>}
        <span className="points">{points}</span>
      </span>
    </button>
  )
}

function Counter({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null)
  return (
    <label className="counter">
      <span>{label}</span>
      <button onClick={() => onChange(Math.max(0, value - 1))}>−</button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={draft ?? String(value)}
        onFocus={e => e.target.select()}
        onChange={e => {
          const digits = e.target.value.replace(/\D/g, '')
          setDraft(digits)
          onChange(Number(digits) || 0)
        }}
        onBlur={() => setDraft(null)}
      />
      <button onClick={() => onChange(value + 1)}>+</button>
    </label>
  )
}
