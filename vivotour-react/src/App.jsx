import React from 'react';
import Presentacion from './pages/inicio/Presentacion.jsx'
import Navbar from './pages/inicio/Navbar.jsx'
import Separacion from './pages/inicio/Separacion.jsx';
import Opinion from './pages/inicio/Opinion.jsx';
import Footer from './components/use/Footer.jsx';
import Galeria from './pages/inicio/Galeria.jsx';
import Mapa from './pages/inicio/Mapa.jsx';
import Texto from './pages/inicio/Texto.jsx';
const App = () => {
  return (
    <div>
        <Texto/>
        <Navbar/>
        <Presentacion/>
        <Separacion/>
        <Opinion/>
        <Galeria/>
        <Mapa/>
        <Footer/>
    </div>
  );
};

export default App;