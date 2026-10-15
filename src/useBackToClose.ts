import { useEffect, useRef } from 'react'

interface Entry {
  close: () => void
  poppedByBack: boolean
}

const open: Entry[] = []
let ownBackCalls = 0

window.addEventListener('popstate', () => {
  if (ownBackCalls > 0) {
    ownBackCalls--
    return
  }
  const top = open[open.length - 1]
  if (!top) return
  top.poppedByBack = true
  top.close()
})

export function useBackToClose(isOpen: boolean, close: () => void) {
  const closeRef = useRef(close)
  useEffect(() => {
    closeRef.current = close
  })

  useEffect(() => {
    if (!isOpen) return
    const entry: Entry = { close: () => closeRef.current(), poppedByBack: false }
    open.push(entry)
    history.pushState({ overlay: open.length }, '')
    return () => {
      open.splice(open.indexOf(entry), 1)
      if (!entry.poppedByBack) {
        ownBackCalls++
        history.back()
      }
    }
  }, [isOpen])
}
