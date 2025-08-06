import React from 'react';
import './style/Footer.css';

const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <h3>REDES SOCIALES</h3>
          <ul className="list">
            <li><a className="footeropc">FACEBOOK</a></li>
            <li><a className="footeropc">INSTAGRAM</a></li>
            <li><a className="footeropc">WHATSAPP</a></li>
          </ul>
        </div>
        <div className="footer-content">
          <h3>CONTACTOS</h3>
          <p>Telefono: +57 322 4435315</p>
          <p>Telefono: +57 321 6921773</p>
          <ul className="list">
            <li>Email: <a className="footeropc">laventanadelriomelcocho@gmail.com</a></li>
          </ul>
        </div>
        <div className="footer-content">
          <h3>VIVO TOUR</h3>
          <ul className="list">
            <li><a className="footeropc">Inicio</a></li>
            <li><a className="footeropc">Descubre</a></li>
            <li><a className="footeropc" id="btnres">Reservar</a></li>
          </ul>
        </div>
        <div className="footer-logo">
        </div>
      </div>
      <div className="footer-content footerend">
        <ul className="list listend">
          <li><a className="footeropc">Terminos Y Condiciones</a></li>
          <span>°</span>
          <li><a className="footeropc">Soporte Tecnico</a></li>
        </ul>
        <ul className="list">
          <li><a className="footeropc">WRHV+69 COCORNA, ANTIOQUIA</a></li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
