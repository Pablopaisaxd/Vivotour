import React from "react";
import "./style/Forgot.css";
import Footer from "../../components/use/Footer";
import logo from "../../assets/Logos/new vivo contorno2.png";

export const Forgotpassword = () => {
  return (
    <div className="forgot-page">
      <div className="forgot-container">
        <div className="forgot-card">
          <div className="forgot-logo">
            <img src={logo} alt="logoVentana" className="main-logo" />
          </div>
          <h1 className="forgot-title">Recuperar Contraseña</h1>

          <form className="forgot-form" method="post">
            <input
              type="text"
              id="email"
              name="email"
              placeholder="Ingresar Email o Teléfono"
              required
            />
            <button type="submit" className="forgot-btn">
              Recuperar
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};