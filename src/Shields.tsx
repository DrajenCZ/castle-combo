import type { Shield } from './game/types'
import { SHIELD_NAMES, type Lang } from './i18n'

export function Shields({ shields, lang }: { shields: Shield[]; lang: Lang }) {
  return (
    <span className="shields">
      {shields.map((s, i) => (
        <span key={i} className={`shield ${s}`} title={SHIELD_NAMES[lang][s]} />
      ))}
    </span>
  )
}
