import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import App from './App.jsx'
import Reserva from './pages/inicio/Reserva.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App/> */}
    <Reserva/>
  </StrictMode>,
)
