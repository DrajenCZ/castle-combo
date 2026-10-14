import type { CardDef, Shield } from './game/types'

export type Lang = 'cs' | 'en'

export const TEXT = {
  cs: {
    title: 'Hradní devatero',
    subtitle: 'počítání bodů',
    addPlayer: 'Přidat hráče',
    player: 'Hráč',
    keys: 'Klíče',
    coins: 'Mince',
    total: 'Celkem',
    results: 'Výsledky',
    search: 'Hledat kartu…',
    faceDown: 'Lícem dolů',
    clear: 'Vyprázdnit',
    close: 'Zavřít',
    castle: 'Hrad',
    village: 'Podhradí',
    all: 'Vše',
    coinsLeft: 'mince mimo měšce',
    stored: 'v měšci',
    remove: 'Odebrat hráče',
    newGame: 'Nová hra',
    newGameConfirm: 'Smazat všechny hráče a karty?',
    keysRow: 'Zbylé klíče',
    needsCheck: 'Text karty ověř na skutečné kartě',
    emptyCell: 'Vyber kartu',
  },
  en: {
    title: 'Castle Combo',
    subtitle: 'score counter',
    addPlayer: 'Add player',
    player: 'Player',
    keys: 'Keys',
    coins: 'Coins',
    total: 'Total',
    results: 'Results',
    search: 'Search card…',
    faceDown: 'Face down',
    clear: 'Clear',
    close: 'Close',
    castle: 'Castle',
    village: 'Village',
    all: 'All',
    coinsLeft: 'coins outside purses',
    stored: 'in purse',
    remove: 'Remove player',
    newGame: 'New game',
    newGameConfirm: 'Delete all players and cards?',
    keysRow: 'Leftover keys',
    needsCheck: 'Check this text against the real card',
    emptyCell: 'Pick a card',
  },
} satisfies Record<Lang, Record<string, string>>

export const SHIELD_NAMES: Record<Lang, Record<Shield, string>> = {
  cs: { blue: 'urozenost', purple: 'víra', green: 'učenost', red: 'vojsko', orange: 'řemesla', yellow: 'rolnictvo' },
  en: { blue: 'nobility', purple: 'faith', green: 'scholarship', red: 'military', orange: 'craftsmanship', yellow: 'peasantry' },
}

export function cardName(card: CardDef, lang: Lang): string {
  return lang === 'cs' ? card.nameCs ?? card.nameEn : card.nameEn
}

export function fold(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}
