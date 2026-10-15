import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const ReferenceBuilder = import.meta.env.DEV
  ? lazy(() => import('./vision/ReferenceBuilder').then(m => ({ default: m.ReferenceBuilder })))
  : null
const showBuilder = ReferenceBuilder && new URLSearchParams(location.search).has('refs')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {ReferenceBuilder && showBuilder ? <Suspense><ReferenceBuilder /></Suspense> : <App />}
  </StrictMode>,
)
