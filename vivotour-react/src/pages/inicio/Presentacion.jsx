import React, { useEffect, useState } from 'react';
import './style/Presentacion.css';


import img1 from '../../assets/Fondos/Río.jpg';
import img2 from '../../assets/Fondos/Fondo5.jpg';
import img3 from '../../assets/Fondos/Entrada.jpg';

import icon1 from '../../assets/icons/swimming.png';
import icon2 from '../../assets/icons/campfire.png';
import icon3 from '../../assets/icons/horse-head.png';
import icon4 from '../../assets/icons/camping-tent.png';

const Presentacion = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = [
        img1,
        img2,
        img3
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 10000);

        return () => clearInterval(interval);
    }, [images.length]);


    const servicios = [
        { nombre: 'Natación', img: icon1 },
        { nombre: 'Fogatas', img: icon2 },
        { nombre: 'Cabalgatas', img: icon3 },
        { nombre: 'Acampar', img: icon4 }
    ];
    

    return (
        <section className="presentacion" id="Inicio">
            <div className="somos">
                <div className="quesomos">
                    <h4 className="hsomos">¿Qué somos?</h4>
                    <p className="contentp">Somos La Ventana del Río Melcocho, un destino mágico ubicado en el corazón
                        de Cocorná,
                        Antioquia, donde la belleza natural y la tranquilidad se fusionan para ofrecerte
                        una experiencia inolvidable. Somos mucho más que un lugar, somos tu conexión con la
                        naturaleza,
                        un refugio perfecto para quienes buscan aventura, descanso y momentos únicos
                        en un entorno espectacular.
                    </p>
                    <p className="pfinal">¡Explora con nosotros un paraíso natural!</p>
                </div>

                <div className="servicios">
                    <div className="nuestro">
                        <p className="pservicios">Nuestros servicios</p>
                    </div>
                    <div className="sservicios">
                        {servicios.map((servicio, index) => (
                            <div className={`s${index + 1}`} key={index}>
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
                    <div className="mas">
                        <p className="pservicios">Ver más</p>
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
    );
};

export default Presentacion;
