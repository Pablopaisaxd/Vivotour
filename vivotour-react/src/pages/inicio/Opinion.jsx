import React, { useEffect, useState } from 'react';
import './style/Opinion.css';


import imgs1 from '../../assets/Fondos/columpio delante.jpg';
import imgs2 from '../../assets/Fondos/turista acostado en hamaca.jpg';
import imgs3 from '../../assets/Fondos/turistas en rio 2.jpg';
import imgs4 from '../../assets/Fondos/columpio detras.jpg';
import imgs5 from '../../assets/Fondos/turistas en rio.jpg';  

import imgs6 from '../../assets/Personas/Rubius.png';
import imgs7 from '../../assets/Personas/Persona.png';
import imgs8 from '../../assets/Personas/Petro.png';  

const Opinion = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = [
        imgs1,
        imgs2,
        imgs3,
        imgs4,
        imgs5
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 10000);

        return () => clearInterval(interval);
    }, [images.length]);

    const opinions = [
        {
            name: 'Roberto Jacinto Ramírez',
            text: 'La Ventana del Río Melcocho es un paraíso escondido, con aguas cristalinas y paisajes espectaculares. La organización del tour fue impecable.',
            image: imgs6
        },
        {
            name: 'Luis Giraldo Vargas',
            text: 'Pasé un fin de semana inolvidable con Vivo Tour. Desde las fogatas bajo las estrellas hasta las cabalgatas por los senderos de Cocorná, cada momento fue especial.',
            image: imgs7
        },
        {
            name: 'Gustavo Petro Urrego',
            text: 'Si buscas desconectarte del ruido y disfrutar de la naturaleza, este es el lugar.',
            image: imgs8
        }
    ];

    return (
        <div className="opinion" id="Descubre">
            <div className="opres">
                {opinions.map((opinion, index) => (
                    <div className={`op${index + 1}`} key={index}>
                        <div className="desper">
                            <div className="imgcircle">
                                <img src={opinion.image} alt={opinion.name} />
                            </div>
                            <p>{opinion.name}</p>
                        </div>
                        <div className="opr">
                            <p>{opinion.text}</p>
                        </div>
                    </div>
                ))}

                <div className="opimg">
                    {images.map((image, index) => (
                        <img 
                            key={index} 
                            src={image} 
                            alt="" 
                            className={currentImageIndex === index ? '' : 'opimgactive'} 
                        />
                    ))}
                </div>
                
                <div className="masres">
                    <p>Reserva ahora</p>
                </div>

                <div className="masres opinas">
                    <p>Qué opinas?</p>
                </div>
            </div>
        </div>
    );

};

export default Opinion;
