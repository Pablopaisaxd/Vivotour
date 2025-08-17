import React, { useEffect, useState } from 'react';
import './style/Texto.css';

const Texto = () => {
  const textos = [
    "Tu próximo viaje en lugares increíbles",
    "Escápate a un paraíso de ensueño",
    "Cotiza ahora"
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % textos.length);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="intro">
      {textos.map((texto, i) => (
        <p
          key={i}
          className={`pint ${index === i ? 'visible' : ''}`}>
          {texto}
        </p>
      ))}
    </div>
  );
};

export default Texto;
