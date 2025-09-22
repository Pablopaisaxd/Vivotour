import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom"; // 👈 IMPORTANTE
import './style/Presentacion.css';
import img1 from '../../assets/Fondos/Río.jpg';
import img2 from '../../assets/Fondos/Fondo5.jpg';
import img3 from '../../assets/Fondos/Entrada.jpg';

import icon1 from '../../assets/icons/swimming.png';
import icon2 from '../../assets/icons/campfire.png';
import icon3 from '../../assets/icons/horse-head.png';
import icon4 from '../../assets/icons/camping-tent.png';
import icon5 from '../../assets/icons/fishing-hook-svgrepo-com.svg';  
import icon6 from '../../assets/icons/walk-to-left-walk-move-stroll-svgrepo-com.svg';   

import card1 from '../../assets/imgs/rio/476022210_635393129001775_3760402276992579991_n.jpg';
import card2 from '../../assets/imgs/experiencias/472915340_618551387352616_3310294784352409225_n.jpg';
import card3 from '../../assets/imgs/cabalgatas/478083588_643635631510858_4332432915899354854_n.jpg';
import card4 from '../../assets/imgs/experiencias/464307822_17998791962651046_1107245631182794721_n.jpg';
import card5 from '../../assets/imgs/experiencias/476379184_641234188417669_2194839864525418984_n.jpg';
import card6 from '../../assets/imgs/experiencias/472789283_618975403976881_5986626510168628097_n-fotor-2025092023730.jpg';

import Nav from './Navbar';
import Texto from './Texto';
import Separacion from './Separacion';
import Opinion from './Opinion';
import Footer from '../../components/use/Footer';
import Mapa from './Mapa';
import Galeria from './Galeria';

const cards = [
  { img: card1, title: 'Natación' },
  { img: card2, title: 'Fogatas' },
  { img: card3, title: 'Cabalgatas' },
  { img: card4, title: 'Acampar' },
  { img: card5, title: 'Pesca' },
  { img: card6, title: 'Senderismo' },
];

const Presentacion = ({ cambiarvista }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedServicio, setSelectedServicio] = useState(null);
  const [startIndex, setStartIndex] = useState(0); // índice del primer servicio visible
  const location = useLocation(); // 👈 Para detectar el hash en la URL

  const images = [img1, img2, img3];

  // Carrusel automático
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [images.length]);

  // 👇 Scroll automático cuando hay hash (#Inicio, #Descubre)
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const section = document.getElementById(id);
      if (section) {
        setTimeout(() => {
          section.scrollIntoView({ behavior: "smooth" });
        }, 200); // pequeño delay para asegurar que ya esté en el DOM
      }
    }
  }, [location]);

  const servicios = [
    { nombre: 'Natación', img: icon1, descripcion: 'Disfruta de nuestras piscinas naturales.' },
    { nombre: 'Fogatas', img: icon2, descripcion: 'Comparte momentos únicos alrededor del fuego.' },
    { nombre: 'Cabalgatas', img: icon3, descripcion: 'Recorre senderos a caballo en medio de la naturaleza.' },
    { nombre: 'Acampar', img: icon4, descripcion: 'Vive la experiencia de acampar bajo las estrellas.' },
    { nombre: 'Pesca', img: icon5, descripcion: 'Relájate y disfruta de la pesca en el río.' },
    { nombre: 'Senderismo', img: icon6, descripcion: 'Explora los senderos llenos de paisajes espectaculares.' },
  ];

  const handlePrev = () => {
    if (startIndex > 0) setStartIndex(startIndex - 1);
  };

  const handleNext = () => {
    if (startIndex < servicios.length - 4) setStartIndex(startIndex + 1);
  };

  return (
    <>
      <Texto />
      <Nav cambiarvista={cambiarvista} />
      
      {/* Sección Inicio */}
      <section className="presentacion" id="Inicio">
        <div className="somos">
          <div className="quesomos">
            <h4 className="hsomos">¿Qué somos?</h4>
            <p className="contentp">
              Somos La Ventana del Río Melcocho, un destino mágico ubicado en el
              corazón de Cocorná, Antioquia, donde la belleza natural y la
              tranquilidad se fusionan para ofrecerte una experiencia
              inolvidable.
            </p>
            <p className="pfinal">¡Explora con nosotros un paraíso natural!</p>
          </div>

          <div className="servicios">
  <div className="nuestro">
    <p className="pservicios">Nuestros servicios</p>
  </div>
  <div className="sservicios">
    {/* Flecha izquierda */}
    <button className="arrow-btn" onClick={handlePrev} disabled={startIndex === 0}>
      ◀
    </button>

    {/* Contenedor con overflow hidden */}
    <div className="servicios-viewport">
      <div 
        className="servicios-track"
        style={{ transform: `translateX(-${startIndex * 150}px)` }}
      >
        {servicios.map((servicio, index) => (
          <div
            className="servicio-card"
            key={index}
            onClick={() => {
              const cardMatch = cards.find(card => card.title === servicio.nombre);
              setSelectedServicio({ ...servicio, img: cardMatch?.img });
            }}
          >
            <div className="circle">
              <img
                className="darkimgs"
                src={servicio.img}
                alt={servicio.nombre}
                height="70%"
              />
            </div>
            <p className="ps">{servicio.nombre}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Flecha derecha */}
    <button
      className="arrow-btn"
      onClick={handleNext}
      disabled={startIndex >= servicios.length - 4}
    >
      ▶
    </button>
  </div>
</div>

        </div>

        <div className="imgsomos">
          <div className="imgprin">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt=""
                className={currentImageIndex === index ? '' : 'imgprinactive'}
                height="100%"
              />
            ))}
          </div>
        </div>
      </section>

      <Separacion />
      <Opinion />
      <Galeria />

      {/* Sección Descubre */}
      <section id="Descubre"></section>
      
      <Mapa />
      <Footer />

      {/* MODAL PERSONALIZADO */}
      {selectedServicio && (
        <div className="modal-overlay" onClick={() => setSelectedServicio(null)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="close-btn" onClick={() => setSelectedServicio(null)}>✕</button>
            <div className="postal">
              <img src={selectedServicio.img} alt={selectedServicio.nombre} />
              <div className="postal-text">
                <h2>{selectedServicio.nombre}</h2>
                <p>{selectedServicio.descripcion}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Presentacion;
