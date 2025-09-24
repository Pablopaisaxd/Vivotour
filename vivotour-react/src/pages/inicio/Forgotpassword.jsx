import React, { useState } from "react";
import "./style/Forgot.css";
import Footer from "../../components/use/Footer";
import logo from "../../assets/Logos/new vivo contorno2.png";
import axios from "axios";

export const Forgotpassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ sending: false, message: "", error: false });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setStatus({ sending: false, message: "Ingresa tu email", error: true });
    try {
      setStatus({ sending: true, message: "", error: false });
      const res = await axios.post("http://localhost:5000/forgot-password", { email });
      if (res.data?.success) {
        setStatus({ sending: false, message: "Si el email existe, te enviamos un enlace de recuperación.", error: false });
      } else {
        setStatus({ sending: false, message: res.data?.mensaje || "No se pudo enviar el correo", error: true });
      }
    } catch (err) {
      console.error(err);
      setStatus({ sending: false, message: "Error del servidor", error: true });
    }
  };
  return (
    <div className="forgot-page">
      <div className="forgot-container">
        <div className="forgot-card">
          <div className="forgot-logo">
            <img src={logo} alt="logoVentana" className="main-logo" />
          </div>
          <h1 className="forgot-title">Recuperar Contraseña</h1>

          <form className="forgot-form" onSubmit={onSubmit}>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Ingresar Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="forgot-btn" disabled={status.sending}>
              {status.sending ? "Enviando..." : "Recuperar"}
            </button>
          </form>
          {status.message && (
            <p className={status.error ? "forgot-error" : "forgot-success"}>
              {status.message}
            </p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};