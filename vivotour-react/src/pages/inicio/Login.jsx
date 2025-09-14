import React, { useContext, useState } from "react";
import "./style/Login.css";
import logo from '../../assets/Logos/new vivo contorno2.png';
import Footer from "../../components/use/Footer";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../AuthContext";
import axios from "axios";

export const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const from = location.state?.from || "/";

  const Submit = async (data) => {
    try {
      const res = await axios.post("http://localhost:5000/Login", data);
      if (res.data.success) {
        login(res.data.token, { nombre: data.email });
        navigate(from, { replace: true });
      } else {
        alert(res.data.mensaje);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-box">
          <div className="login-logo-space">
            <img src={logo} alt="logoVentana" className="main-logo" />
          </div>

          <h1>Iniciar Sesión</h1>
          <form className="login-form" onSubmit={handleSubmit(Submit)} noValidate>
            
            <div className="login-input-group">
              <input
                type="email"
                placeholder="Email"
                {...register("email", { required: "El email es obligatorio" })}
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && (
                <div className="login-error" role="alert"><p>{errors.email.message}</p></div>
              )}
            </div>

            <div className="login-input-group">
              <div className="login-password">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  {...register("password", { required: "La contraseña es obligatoria" })}
                  aria-invalid={errors.password ? "true" : "false"}
                />
                <span
                  className="login-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShowPassword(!showPassword); }}
                >
                  <svg className="login-eye-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    {!showPassword ? (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </>
                    ) : (
                      <>
                        <path d="M2 2l20 20"></path>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <path d="M9 9a3 3 0 1 1 6 6"></path>
                      </>
                    )}
                  </svg>
                </span>
              </div>
              {errors.password && (
                <div className="login-error" role="alert"><p>{errors.password.message}</p></div>
              )}
            </div>

            <div className="login-remember">
              <div className="login-check">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember" className="textcolor">Recordar contraseña</label>
              </div>
              <Link to={"/forgotpassword"} className="login-forgot">Olvidé mi contraseña</Link>
            </div>

            <button className="login-btn" type="submit">Iniciar Sesión</button>
          </form>

          <div className="login-divider">
            <div className="login-divider-line"></div>
            <span>o desea usar</span>
            <div className="login-divider-line"></div>
          </div>

          <div className="login-methods">
            <div className="login-method facebook" title="Iniciar sesión con Facebook">
              <img src="/src/assets/Icons/Facebook.png" alt="facebook" />
            </div>
            <div className="login-method google" title="Iniciar sesión con Google">
              <img src="/src/assets/Icons/Google.png" alt="google" />
            </div>
            <div className="login-method apple" title="Iniciar sesión con Apple">
              <img src="/src/assets/Icons/Apple.png" alt="apple" />
            </div>
          </div>

          <div className="login-register">
            <h3 className="textcolor">No te has registrado?</h3>
            <Link to={"/Registro"} className="login-register-link">Regístrate</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};