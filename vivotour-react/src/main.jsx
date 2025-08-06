import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Nav from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Footer/>
  </StrictMode>,
)
