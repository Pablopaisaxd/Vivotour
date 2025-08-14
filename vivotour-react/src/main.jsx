import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Presentacion from './pages/inicio/Presentacion.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Presentacion/>
  </StrictMode>,
)
