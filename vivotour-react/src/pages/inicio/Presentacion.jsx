import React, { useEffect, useState } from 'react';
import { useLocation } from "react-router-dom";
import './style/Presentacion.css';
import img1 from '../../assets/Fondos/Río.jpg';
import img2 from '../../assets/Fondos/Fondo5.jpg';
import img3 from '../../assets/Fondos/Entrada.jpg';
import apiConfig from '../../config/apiConfig';

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
  const [startIndex, setStartIndex] = useState(0);
  const [modalDirection, setModalDirection] = useState('');
  const [isModalTransitioning, setIsModalTransitioning] = useState(false);
  const [isFirstOpen, setIsFirstOpen] = useState(true);
  const [images, setImages] = useState([img1, img2, img3]);
  const location = useLocation();

  // Mapeo de rutas de /assets/ a imports locales
  const assetMap = {
    '/assets/Fondos/Río.jpg': img1,
    '/assets/Fondos/Fondo5.jpg': img2,
    '/assets/Fondos/Entrada.jpg': img3,
  };

  // Resolver URLs de imágenes - pueden ser rutas del frontend o URLs del servidor
  const resolveImageUrl = (imgUrl) => {
    if (!imgUrl) return null;
    
    // Si está en el mapeo de assets, usar el import local
    if (assetMap[imgUrl]) {
      return assetMap[imgUrl];
    }
    
    // Si es una URL completa, retornar como está
    if (imgUrl.startsWith('http')) {
      return imgUrl;
    }
    
    // Si es una ruta del servidor (/uploads/...), prepender el URL base
    if (imgUrl.startsWith('/uploads/')) {
      return `${apiConfig.baseUrl}${imgUrl}`;
    }
    
    // Retornar como está
    return imgUrl;
  };

  // Cargar imágenes de presentación del servidor
  useEffect(() => {
    const fetchPresentationImages = async () => {
      try {
        const response = await fetch(`${apiConfig.baseUrl}/api/homepage-images`);
        if (response.ok) {
          const data = await response.json();
          if (data.presentationImages && data.presentationImages.length > 0) {
            const resolvedImages = data.presentationImages.map(resolveImageUrl);
            setImages(resolvedImages);
          }
        }
      } catch (error) {
        console.error('Error loading presentation images:', error);
        // Usar imágenes por defecto si falla
        setImages([img1, img2, img3]);
      }
    };
    
    fetchPresentationImages();
  }, []);

  // Carrusel automático
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [images.length]);

  // Scroll automático cuando hay hash
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const section = document.getElementById(id);
      if (section) {
        setTimeout(() => {
          section.scrollIntoView({ behavior: "smooth" });
        }, 200);
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

  const navigateModal = (direction) => {
    const currentIndex = servicios.findIndex(s => s.nombre === selectedServicio.nombre);
    let newIndex;
    
    if (direction === 'prev' && currentIndex > 0) {
      newIndex = currentIndex - 1;
      setModalDirection('prev');
    } else if (direction === 'next' && currentIndex < servicios.length - 1) {
      newIndex = currentIndex + 1;
      setModalDirection('next');
    } else {
      return;
    }
    
    // Iniciar transición
    setIsModalTransitioning(true);
    
    // Cambiar contenido después de un pequeño delay
    setTimeout(() => {
      const newServicio = servicios[newIndex];
      const cardMatch = cards.find(card => card.title === newServicio.nombre);
      setSelectedServicio({ ...newServicio, img: cardMatch?.img });
      setIsModalTransitioning(false);
      setModalDirection('');
      setIsFirstOpen(false); // Ya no es primera apertura
    }, 350);
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
              <button className="servicios-arrow-btniz servicios-arrow-btn" onClick={handlePrev} disabled={startIndex === 0}>
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
                        setIsFirstOpen(true); // Marcar como primera apertura
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
                className="servicios-arrow-btnder servicios-arrow-btn"
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

      {/* MODAL CON ANIMACIONES LATERALES */}
      {selectedServicio && (
        <div className="servicios-modal-overlay" onClick={() => setSelectedServicio(null)}>
          <div
            className={`servicios-modal-content ${
              isModalTransitioning 
                ? modalDirection === 'next' 
                  ? 'slide-out-left' 
                  : 'slide-out-right'
                : isFirstOpen ? 'slide-in-center' : ''
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón anterior */}
            <button
              className="servicios-modal-nav-btn servicios-modal-nav-prev"
              onClick={() => navigateModal('prev')}
              disabled={servicios.findIndex(s => s.nombre === selectedServicio.nombre) === 0 || isModalTransitioning}
            >
              ◀
            </button>

            {/* Botón cerrar */}
            <button className="servicios-close-btn" onClick={() => setSelectedServicio(null)}>✕</button>

            {/* Botón siguiente */}
            <button
              className="servicios-modal-nav-btn servicios-modal-nav-next"
              onClick={() => navigateModal('next')}
              disabled={servicios.findIndex(s => s.nombre === selectedServicio.nombre) === servicios.length - 1 || isModalTransitioning}
            >
              ▶
            </button>

            <div className="servicios-postal">
              <div className="servicios-postal-img-container">
                <img src={selectedServicio.img} alt={selectedServicio.nombre} />
              </div>
              <div className="servicios-postal-text">
                <h2>{selectedServicio.nombre}</h2>
                <p>{selectedServicio.descripcion}</p>
              </div>

              {/* Indicador de página actual */}
              <div className="modal-page-indicators">
                {servicios.map((_, index) => (
                  <div
                    key={index}
                    className={`page-dot ${
                      index === servicios.findIndex(s => s.nombre === selectedServicio.nombre) 
                        ? 'active' 
                        : ''
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Presentacion;