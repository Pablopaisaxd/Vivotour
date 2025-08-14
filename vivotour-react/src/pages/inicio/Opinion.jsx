import React, { useEffect, useState } from 'react';
import './style/Opinion.css';
import imgs1 from '../../assets/Fondos/columpio delante.jpg';
import imgs2 from '../../assets/Fondos/turista acostado en hamaca.jpg';
import imgs3 from '../../assets/Fondos/turistas en rio 2.jpg';
import imgs4 from '../../assets/Fondos/columpio detras.jpg';
import imgs5 from '../../assets/Fondos/turistas en rio.jpg';  

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
            text: 'La Ventana del Río Melcocho es un paraíso escondido, con aguas cristalinas y paisajes espectaculares. La organización del tour fue impecable.'
        },
        {
            name: 'Luis Giraldo Vargas',
            text: 'Pasé un fin de semana inolvidable con Vivo Tour. Desde las fogatas bajo las estrellas hasta las cabalgatas por los senderos de Cocorná, cada momento fue especial.'
        },
        {
            name: 'Gustavo Petro Urrego',
            text: 'Si buscas desconectarte del ruido y disfrutar de la naturaleza, este es el lugar.'
        }
    ];

    return (
        <div className="opinion" id="Descubre">
            <div className="opres">
                {opinions.map((opinion, index) => (
                    <div className={`op${index + 1}`} key={index}>
                        <div className="desper">
                            <div className="imgcircle">
                                <img src={`https://example.com/person${index + 1}.jpg`} alt={opinion.name} />
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
                        <img key={index} src={image} alt="" className={currentImageIndex === index ? '' : 'opimgactive'} />
                    ))}
                </div>
                
                <div className="masres">
                    <h3>Reserva ahora</h3>
                </div>

            </div>
        </div>
    );
};

export default Opinion;
