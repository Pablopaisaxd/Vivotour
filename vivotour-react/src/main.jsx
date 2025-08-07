import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Presentacion from './index.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Presentacion/>
  </StrictMode>,
)
