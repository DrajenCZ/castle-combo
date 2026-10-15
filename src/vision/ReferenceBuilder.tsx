import { useEffect, useState } from 'react'
import { CornerEditor } from './CornerEditor'
import { loadRaster, rasterToDataUrl } from './image'
import { cellFeatures, cellPreview, recognizeGrid, resolveDuplicates, type GridLayout, type References } from './recognize'
import { quadMapping, type Quad, type Raster } from './warp'

interface RefPhoto {
  file: string
  layout: GridLayout
  corners: [number, number][]
  cards: string[]
  test?: boolean
}

const PHOTOS: RefPhoto[] = [
  { file: '20261014_171449.jpg', layout: { cols: 3, rows: 3 }, corners: [[42,48],[1115,32],[1117,1518],[35,1510]], cards: ['clockmaker', 'sculptor', 'innkeeper', 'potter', 'armorer', 'carpenter', 'blacksmith', 'miraculously-cured', 'shepherd'] },
  { file: '20261014_171616.jpg', layout: { cols: 3, rows: 3 }, corners: [[62,37],[1130,40],[1120,1508],[40,1515]], cards: ['baker', 'stable-boy', 'farmhand', 'witch', 'usurper', 'revolutionary', 'beekeeper', 'woodcutter', 'stonemason'] },
  { file: '20261014_171713.jpg', layout: { cols: 3, rows: 3 }, corners: [[48,40],[1080,42],[1092,1505],[22,1500]], cards: ['beggar', 'monk', 'bombardier', 'militiaman', 'barbarian', 'executioner', 'spice-merchant', 'philosopher', 'squire'] },
  { file: '20261014_171816.jpg', layout: { cols: 3, rows: 3 }, corners: [[48,28],[1108,30],[1110,1540],[30,1505]], cards: ['traveler', 'locksmith', 'fisherman', 'inventor', 'vicar', 'winemaker', 'doctor', 'brigand', 'spy'] },
  { file: '20261014_171920.jpg', layout: { cols: 3, rows: 3 }, corners: [[48,32],[1115,32],[1105,1520],[40,1505]], cards: ['gravedigger', 'templar', 'his-holiness', 'steward', 'mother-superior', 'scribe', 'mercenary', 'farmer', 'master-at-arms'] },
  { file: '20261014_172017.jpg', layout: { cols: 3, rows: 3 }, corners: [[40,15],[1132,20],[1115,1520],[25,1510]], cards: ['jester', 'queen-mother', 'devout', 'baron', 'princess', 'chancellor', 'prince', 'cardinal', 'chaplain'] },
  { file: '20261014_172118.jpg', layout: { cols: 3, rows: 3 }, corners: [[48,40],[1118,40],[1108,1525],[15,1520]], cards: ['judge', 'captain', 'his-majesty', 'goldsmith', 'architect', 'patron', 'pilgrim', 'astronomer', 'alchemist'] },
  { file: '20261014_172216.jpg', layout: { cols: 3, rows: 3 }, corners: [[40,30],[1110,25],[1110,1525],[25,1515]], cards: ['professor', 'banker', 'pawnbroker', 'royal-guard', 'lookout', 'apothecary', 'her-majesty-the-queen', 'duchess', 'nun'] },
  { file: '20261014_172302.jpg', layout: { cols: 3, rows: 2 }, corners: [[118,28],[1290,20],[1285,1095],[118,1090]], cards: ['knight', 'guildmaster', 'officer', 'glassblower', 'general', 'chatelaine'] },
  { file: 'cards_back.jpg', layout: { cols: 2, rows: 1 }, corners: [[125,222],[1278,212],[1272,995],[125,988]], cards: ['back-castle', 'back-village'] },
  { file: 'test_01.jpg', test: true, layout: { cols: 3, rows: 3 }, corners: [[95,78],[1040,82],[1030,1465],[85,1440]], cards: ['general', 'miraculously-cured', 'officer', 'knight', 'glassblower', 'carpenter', 'innkeeper', 'chatelaine', 'potter'] },
  { file: 'test_02.jpg', test: true, layout: { cols: 3, rows: 3 }, corners: [[100,103],[1015,105],[1030,1465],[93,1450]], cards: ['general', 'miraculously-cured', 'officer', 'knight', 'glassblower', 'carpenter', 'back-village', 'back-castle', 'potter'] },
]

interface Loaded {
  raster: Raster
  quad: Quad
}

declare global {
  interface Window {
    refBuilder?: {
      setQuad: (photo: number, quad: Quad) => void
      quads: () => Quad[]
      build: () => References
      evaluate: (jitter: number, refs: References) => Record<string, string>
    }
  }
}

export function ReferenceBuilder() {
  const [loaded, setLoaded] = useState<Loaded[]>([])
  const [current, setCurrent] = useState(0)
  const [sheet, setSheet] = useState(false)

  useEffect(() => {
    Promise.all(PHOTOS.map(async p => {
      const blob = await fetch(`/research/photos/${p.file}`).then(r => r.blob())
      const raster = await loadRaster(blob)
      return { raster, quad: p.corners.map(([x, y]) => ({ x, y })) as Quad }
    })).then(setLoaded)
  }, [])

  useEffect(() => {
    window.refBuilder = {
      setQuad: (photo, quad) => setLoaded(l => l.map((x, i) => (i === photo ? { ...x, quad } : x))),
      quads: () => loaded.map(l => l.quad),
      build: () => {
        const refs: References = {}
        loaded.forEach((l, p) => {
          if (PHOTOS[p].test) return
          const map = quadMapping(l.quad)
          PHOTOS[p].cards.forEach((id, i) => {
            refs[id] = cellFeatures(l.raster, map, i, PHOTOS[p].layout).map(x => Math.round(x * 1000) / 1000)
          })
        })
        return refs
      },
      evaluate: (jitter, refs) => {
        let seed = 7
        const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5
        return Object.fromEntries(loaded.map((l, p) => {
          const quad = l.quad.map(({ x, y }) => ({ x: x + rnd() * 2 * jitter, y: y + rnd() * 2 * jitter })) as Quad
          const guesses = recognizeGrid(l.raster, quad, refs, PHOTOS[p].layout)
          const ids = resolveDuplicates(guesses)
          const wrong = PHOTOS[p].cards.flatMap((id, i) => (ids[i] === id ? [] : [`${id} -> ${ids[i]}`]))
          const unsure = guesses.filter(g => g.confidence < 0.12).length
          const total = PHOTOS[p].cards.length
          return [PHOTOS[p].file, `${total - wrong.length}/${total}, unsure ${unsure}${wrong.length ? ` wrong: ${wrong.join(', ')}` : ''}`]
        }))
      },
    }
  }, [loaded])

  if (loaded.length === 0) return <main>Loading photos…</main>
  const photo = loaded[current]

  return (
    <main>
      <h1>Reference builder</h1>
      <nav className="players">
        {PHOTOS.map((p, i) => (
          <button key={p.file} className={i === current ? 'tab active' : 'tab'} onClick={() => setCurrent(i)}>{i + 1}</button>
        ))}
      </nav>
      <button onClick={() => setSheet(s => !s)}>{sheet ? 'Editor' : 'Contact sheet'}</button>
      {sheet ? (
        <div className="contact-sheet">
          {loaded.flatMap((l, p) => PHOTOS[p].cards.map((id, i) => (
            <figure key={id}>
              <img src={rasterToDataUrl(cellPreview(l.raster, l.quad, i, PHOTOS[p].layout))} alt={id} />
              <figcaption>{id}</figcaption>
            </figure>
          )))}
        </div>
      ) : (
        <CornerEditor
          raster={photo.raster}
          quad={photo.quad}
          layout={PHOTOS[current].layout}
          onChange={quad => setLoaded(l => l.map((x, i) => (i === current ? { ...x, quad } : x)))}
        />
      )}
    </main>
  )
}
