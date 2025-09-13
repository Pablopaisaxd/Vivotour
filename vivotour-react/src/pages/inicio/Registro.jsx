import React, { useState } from "react";
import "/src/pages/inicio/style/Registro.css";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Controller, useForm } from "react-hook-form";
import Footer from "../../components/use/Footer";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/Logos/new vivo contorno2.png";

export const Registro = () => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm();

  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const password = watch("password");
  const [showPassword, setShowPassword] = useState(false);

  const Submit = async (data) => {
    try {
      const res = await axios.post("http://localhost:5000/registro", data);
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        setTimeout(() => navigate("/"), 1000);
      } else {
        setMessage(res.data.mensaje);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="registro-page">
      <div className="registro-container">
        <div className="registro-card">
          <div className="registro-logo">
            <img src={logo} alt="logoVentana" className="main-logo" />
          </div>
          <h1 className="registro-title">Registro</h1>

          <form
            onSubmit={handleSubmit(Submit)}
            id="form-registro"
            className="registro-form"
            method="post"
          >
            <input
              type="text"
              {...register("nombre", {
                required: "El nombre es obligatorio",
              })}
              placeholder="Nombres y Apellidos"
            />
            {errors.nombre && (
              <div className="registro-error">
                <p>{errors.nombre.message}</p>
              </div>
            )}

            <input
              type="text"
              {...register("email", {
                required: "El email es obligatorio",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Formato de email inválido",
                },
              })}
              placeholder="Email"
            />
            {errors.email && (
              <div className="registro-error">
                <p>{errors.email.message}</p>
              </div>
            )}

            <Controller
              name="celular"
              control={control}
              rules={{
                required: "El teléfono es obligatorio",
                validate: (value) => {
                  if (!value || !/^\+?[0-9]{10,15}$/.test(value)) {
                    return "Formato de teléfono inválido";
                  }
                },
              }}
              render={({ field, fieldState }) => (
                <div>
                  <PhoneInput
                    {...field}
                    defaultCountry="CO"
                    placeholder="Ingresa tu número"
                  />
                  {fieldState.error && (
                    <div className="registro-error">
                      <p>{fieldState.error.message}</p>
                    </div>
                  )}
                </div>
              )}
            />

            <div className="registro-documento">
              <select {...register("tipoDocumento")}>
                <option value="CC">CC</option>
                <option value="TI">TI</option>
                <option value="DNI">DNI</option>
                <option value="CE">CE</option>
                <option value="NIT">NIT</option>
              </select>

              <input
                type="text"
                {...register("numeroDocumento", {
                  required: "El documento es obligatorio",
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "El documento solo debe contener números",
                  },
                })}
                placeholder="Número de documento"
              />
            </div>
            {errors.numeroDocumento && (
              <div className="registro-error">
                <p>{errors.numeroDocumento.message}</p>
              </div>
            )}

            <div className="registro-password">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password", {
                  required: "La contraseña es obligatoria",
                  pattern: {
                    value:
                      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{16,}$/,
                    message:
                      "Debe contener al menos una mayúscula, un número, un carácter especial y 16 caracteres",
                  },
                })}
                placeholder="Contraseña"
              />
                <span
                  className="login-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg className="login-eye-icon" viewBox="0 0 24 24">
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
              <div className="registro-error">
                <p>{errors.password.message}</p>
              </div>
            )}

            <input
              type={showPassword ? "text" : "password"}
              {...register("confirmPassword", {
                required: "Debes confirmar la contraseña",
                validate: (value) => {
                  if (value !== password) {
                    return "Las contraseñas no coinciden";
                  }
                },
              })}
              placeholder="Confirmar contraseña"
            />
            {errors.confirmPassword && (
              <div className="registro-error">
                <p>{errors.confirmPassword.message}</p>
              </div>
            )}

            <button type="submit" className="registro-btn">
              Registrarse
            </button>
          </form>

          <div className="registro-login">
            <h3 className="textcolor">¿Tienes una cuenta?</h3>
            <Link to={"/Login"} className="registro-link">
              Inicia Sesión
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
