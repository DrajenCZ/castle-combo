export type Banner = 'castle' | 'village'

export type Shield = 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'yellow'

export const SHIELDS: Shield[] = ['blue', 'purple', 'green', 'red', 'orange', 'yellow']

export type Scope = 'row' | 'column' | 'cross' | 'grid'

export type CardFilter =
  | { k: 'banner'; banner: Banner }
  | { k: 'doubleShield' }
  | { k: 'cost'; min: number; max: number }
  | { k: 'discount' }

export type Rule =
  | { k: 'perShield'; shield: Shield; scope: Scope; pts: number }
  | { k: 'perDistinctShield'; scope: Scope; pts: number }
  | { k: 'perShieldSet'; shields: Shield[]; pts: number }
  | { k: 'perMatchingTriple'; pts: number }
  | { k: 'ifMissing'; shield: Shield; pts: number }
  | { k: 'perMissingType'; pts: number }
  | { k: 'ifPosition'; cells: number[]; pts: number }
  | { k: 'perCard'; filter: CardFilter; scope: Scope; pts: number; setSize?: number }
  | { k: 'perBannerPair'; pts: number }
  | { k: 'perKey'; pts: number }
  | { k: 'purse'; capacity: number; pts: number }
  | { k: 'perStoredCoin'; pts: number }
  | { k: 'ifFaceDown'; pts: number }

export interface CardDef {
  id: string
  nameEn: string
  nameCs: string | null
  banner: Banner
  cost: number
  shields: Shield[]
  discount: boolean
  rule: Rule
  scoringText: string
  needsCheck?: string
}

export type Cell = { cardId: string } | { faceDown: true } | null

export interface Board {
  grid: Cell[]
  keys: number
  coins: number
}

export interface BoardScore {
  cells: number[]
  stored: number[]
  keys: number
  total: number
  coinsLeft: number
}
