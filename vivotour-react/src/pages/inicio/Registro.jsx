import React, {useState } from "react";
import "/src/pages/inicio/style/Registro.css";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Controller, useForm } from "react-hook-form";
import Footer from "../../components/use/Footer";
import { Link,  useNavigate } from "react-router-dom";

export const Registro = () => {
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
    } = useForm();

    // const [value, setValue] = useState({
    //     nombre: "",
    //     email: "",
    //     telefono: "",
    //     tipo: "CC",
    //     documento: "",
    //     password: "",
    //     confirmPassword: "",
    // })

    const [message, setMessage] = useState("");

 const Submit = async (data) => {
  try {
    const res = await fetch("http://localhost:5000/registro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    console.log("Estado HTTP:", res.status);
    

    const result = await res.json(success => success);
    console.log("Respuesta del servidor:", result);

    if (result.success) {
      localStorage.setItem("token");
      setMessage(result.mensaje);
      setTimeout(() => navigate("/"), 3000);
    } else {
      setMessage(result.mensaje);
    }
  } catch (error) {
    console.error("Error en fetch:", error);
    setMessage("Hubo un error de conexión");
  }

  console.log("Form data enviado:", data);
};



    const password = watch("password");

    const [showPassword, setShowPassword] = useState(false);
    return (
        <div>
            <div className="maindiv">
                <div className="font-registro">
                <div className="divregistro">
                    <h1>Registro</h1>
                    {message && <p className="success-message">{message}</p>}

                    <form
                        onSubmit={handleSubmit(Submit)}
                        id="form-registro"
                        className="inputsregistro"
                        method="post"
                    >
                        <input
                            type="text"
                            id="nombreCompleto"
                            {...register("nombre", {
                                required: "El nombre es obligatorio",
                            })}
                            placeholder="Nombres y Apellidos"
                        />
                        {errors.nombre && 
                        <div className="errordiv">
                        <p className="errorp">{errors.nombre.message}</p>
                        </div>}

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
                        {errors.email && 
                        <div className="errordiv">
                        <p className="errorp">{errors.email.message}</p>
                        </div>}
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
                                        <div className="errordiv">
                                        <p className="errorp">{fieldState.error.message}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        />
                        <div className="input-documento">
                            <select name="tipo" className="tipo" {...register("tipoDocumento")}>
                                <option value="CC">CC</option>
                                <option value="TI">TI</option>
                                <option value="DNI">DNI</option>
                                <option value="CE">CE</option>
                                <option value="NIT">NIT</option>
                            </select>

                            <input
                                type="text"
                                id="documento"
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
                            <div className="errordiv">
                            <p className="errorp">{errors.numeroDocumento.message}</p>
                            </div>
                        )}

                        <div className="password-div">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                {...register("password",{
                                    required:"La contraseña es obligatoria",
                                    pattern:{
                                        value: /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{16,}$/,
                                        message: "Debe contener al menos una mayúscula, un número, un carácter especial y 16 caracteres",
                                    }
                                })}
                                placeholder="Contraseña"
                            />
                            
                            <span
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <svg className="eye-icon" viewBox="0 0 24 24">
                                    {/* ojo abierto */}
                                    {!showPassword && (
                                        <>
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </>
                                    )}
                                    {/* ojo cerrado */}
                                    {showPassword && (
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
                                        <div className="errordiv">
                                <p className="errorp">{errors.password.message}</p>
                                </div>
                            )}
                        <input
                            type={showPassword ? "text" : "password"}
                            className="confirmPassword"
                            {...register("confirmPassword",{
                                required: "Debes confirmar la contraseña",
                                validate: (value) =>{
                                    if (value !== password) {
                                        return "Las contraseñas no coinciden";
                                    }
                                }
                            })}
                            placeholder="Confirmar contraseña"
                        />
                        {errors.confirmPassword && (
                            <div className="errordiv">
                                <p>{errors.confirmPassword.message}</p>
                            </div>
                        )}

                        <button type="submit" className="register-btn">
                            Registrarse
                        </button>
                    </form>

                    <div className="register">
                        <h3>¿Tienes una cuenta?</h3>
                        <Link to={"/Login"} className="sesion">Inicia Sesión</Link>
                    </div>
                </div>
            </div>
            </div>
            <Footer />
        </div>
    );
};
