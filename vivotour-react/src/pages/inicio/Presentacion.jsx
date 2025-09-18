import React, { useEffect, useState } from 'react';
import './style/Presentacion.css';
import img1 from '../../assets/Fondos/Río.jpg';
import img2 from '../../assets/Fondos/Fondo5.jpg';
import img3 from '../../assets/Fondos/Entrada.jpg';

import icon1 from '../../assets/icons/swimming.png';
import icon2 from '../../assets/icons/campfire.png';
import icon3 from '../../assets/icons/horse-head.png';
import icon4 from '../../assets/icons/camping-tent.png';
import icon5 from '../../assets/icons/swimming.png';  
import icon6 from '../../assets/icons/horse-head.png';   

import Nav from './Navbar';
import Texto from './Texto';
import Separacion from './Separacion';
import Opinion from './Opinion';
import Footer from '../../components/use/Footer';
import Mapa from './Mapa';
import Galeria from './Galeria';

const Presentacion = ({ cambiarvista }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedServicio, setSelectedServicio] = useState(null);

  // índice del primer servicio visible en el carrusel
  const [startIndex, setStartIndex] = useState(0);

  const images = [img1, img2, img3];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [images.length]);

  const servicios = [
    { nombre: 'Natación', img: icon1, descripcion: 'Disfruta de nuestras piscinas naturales.' },
    { nombre: 'Fogatas', img: icon2, descripcion: 'Comparte momentos únicos alrededor del fuego.' },
    { nombre: 'Cabalgatas', img: icon3, descripcion: 'Recorre senderos a caballo en medio de la naturaleza.' },
    { nombre: 'Acampar', img: icon4, descripcion: 'Vive la experiencia de acampar bajo las estrellas.' },
    { nombre: 'Pesca', img: icon5, descripcion: 'Relájate y disfruta de la pesca en el río.' },
    { nombre: 'Senderismo', img: icon6, descripcion: 'Explora los senderos llenos de paisajes espectaculares.' },
  ];

  const visibleServicios = servicios.slice(startIndex, startIndex + 4);

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

              {visibleServicios.map((servicio, index) => (
                <div
                  className={`s${index + 1}`}
                  key={index}
                  onClick={() => setSelectedServicio(servicio)}
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
            <h2>{selectedServicio.nombre}</h2>
            <img src={selectedServicio.img} alt={selectedServicio.nombre} width="100" />
            <p>{selectedServicio.descripcion}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Presentacion;
