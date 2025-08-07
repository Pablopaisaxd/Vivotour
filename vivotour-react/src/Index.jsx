import React, { useEffect, useState } from 'react';


const Presentacion = () => {
  const [index, setIndex] = useState(0);


  return (
    <section className="presentacion" id="Inicio">
      <div className="somos">
        <div className="quesomos">
          <h4 className="hsomos">¿Qué somos?</h4>
          <p className="contentp">
            Somos La Ventana del Río Melcocho, un destino mágico ubicado en el corazón de Cocorná, Antioquia, donde la belleza natural y la tranquilidad se fusionan para ofrecerte una experiencia inolvidable. Somos mucho más que un lugar, somos tu conexión con la naturaleza, un refugio perfecto para quienes buscan aventura, descanso y momentos únicos en un entorno espectacular.
          </p>
          <p className="pfinal">¡Explora con nosotros un paraíso natural!</p>
        </div>

        <div className="servicios">
          <div className="nuestro">
            <p className="pservicios">Nuestros servicios</p>
          </div>
          <div className="sservicios">
            <div className="s1">
              <div className="circle">
                <img className="darkimgs" src="./Media/Icons/swimming.png" alt="swim" height="70%" />
              </div>
              <p className="ps">Natación</p>
            </div>
            <div className="s2">
              <div className="circle">
                <img className="darkimgs" src="./Media/Icons/campfire.png" alt="campfire" height="65%" style={{ paddingBottom: '5px' }} />
              </div>
              <p className="ps">Fogatas</p>
            </div>
            <div className="s3">
              <div className="circle">
                <img className="darkimgs" src="./Media/Icons/horse-head.png" alt="horse" height="75%" style={{ paddingLeft: '5px' }} />
              </div>
              <p className="ps">Cabalgatas</p>
            </div>
            <div className="s4">
              <div className="circle">
                <img className="darkimgs" src="./Media/Icons/camping-tent.png" alt="campingtent" height="87%" style={{ paddingLeft: '3px' }} />
              </div>
              <p className="ps">Acampar</p>
            </div>
          </div>
          <div className="mas">
            <p className="pservicios">Ver más</p>
          </div>
        </div>
      </div>

      <div className="imgsomos">
      </div>
    </section>
  );
};

export default Presentacion;
