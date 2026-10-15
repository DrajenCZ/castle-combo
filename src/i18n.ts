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
    emptyCell: 'Vyber kartu',
    fromPhoto: 'Z fotky',
    photoTitle: 'Rozpoznat z fotky',
    photoHint: 'Vyfoť celou mřížku 3 × 3 shora, bez odlesků.',
    takePhoto: 'Vyfotit',
    uploadPhoto: 'Nahrát fotku',
    cornersHint: 'Přetáhni 4 žluté body na rohy mřížky karet.',
    otherPhoto: 'Jiná fotka',
    recognize: 'Rozpoznat',
    reviewHint: 'Zkontroluj karty. Karty s ? jsou nejisté – klepnutím je opravíš.',
    adjustCorners: 'Upravit rohy',
    applyPhoto: 'Použít',
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
    emptyCell: 'Pick a card',
    fromPhoto: 'From photo',
    photoTitle: 'Recognise from photo',
    photoHint: 'Photograph the whole 3 × 3 grid from above, without glare.',
    takePhoto: 'Take photo',
    uploadPhoto: 'Upload photo',
    cornersHint: 'Drag the 4 yellow points onto the corners of the card grid.',
    otherPhoto: 'Other photo',
    recognize: 'Recognise',
    reviewHint: 'Check the cards. Cards marked ? are uncertain – tap to fix them.',
    adjustCorners: 'Adjust corners',
    applyPhoto: 'Apply',
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
