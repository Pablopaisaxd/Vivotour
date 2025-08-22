import React, { useContext, useState } from "react";
import "./style/Login.css";
import Footer from "../../components/use/Footer";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AuthContext } from "../../AuthContext";
import axios from "axios";


export const Login = () => {

    const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);



    const [showPassword, setShowPassword] = useState(false);
   const Submit = async (data) => {
  try {
    const res = await axios.post("http://localhost:5000/login", data); // await aquí
    console.log("Respuesta del server:", res.data);

    if (res.data.success) {
      login(res.data.token, { nombre: res.data.nombre || data.email });
      navigate("/");
    } else {
      alert(res.data.mensaje);
    }
  } catch (error) {
    console.error(error);
  }
};
    return (
        <div>
            
            <div className="maindiv">
                <div className="font-login">
                {/* <Link to={"/"}>
                <svg
                    className="arrow-icon"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="50"
                    height="50"
                    fill="none"
                    viewBox="0 0 24 24"
                    
                >
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 12h14M5 12l4-4m-4 4 4 4"
                    />
                </svg>
                </Link> */}

                <div className="divlogin">
                    <h1>Iniciar Sesion</h1>
                    <form action="" id="form-login" onSubmit={handleSubmit(Submit)}>
                        {errors.email && <div className="errordiv"><p>{errors.email.message}</p></div>}
                        <div className="inputslogin">
                            <input type="email" id="email" placeholder="Email" {...register("email",{required:"El email es obligatorio"})} />
                            
                        </div>
                        

                        <div className="inputslogin">
                            <div className="password-div">
                                <input type={showPassword ? "text" : "password"} id="password" placeholder="Contraseña" {...register("password",{required:"La contraseña es obligatoria"})} />
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
                            {errors.password && <div className="errordiv"><p>{errors.password   .message}</p></div>}
                        </div>

                        <div className="remember-div">
                            <div className="check">
                                <input type="checkbox" id="remember" />
                                <label>Recordar contraseña</label>
                            </div>
                            <Link to={"/forgotpassword"} className="forgot-password">Olvidé mi contraseña</Link>
                        </div>
                        <button className="login-btn">Iniciar Sesion</button>
                    </form>

                    <div className="divider">
                        <div className="circle-left"></div>
                        <span>o desea usar</span>
                        <div className="circle-right"></div>
                    </div>

                    <div className="login-method">
                        <div className="method">
                            <img
                                src="/src/assets/Icons/Facebook.png"
                                alt="facebook"
                            />
                        </div>
                        <div className="method google">
                            <img
                                src="/src/assets/Icons/Google.png"
                                alt="google"
                                className="Google"
                            />
                        </div>
                        <div className="method apple">
                            <img
                                src="/src/assets/Icons/Apple.png"
                                alt="apple"
                                className="Apple"
                            />
                        </div>
                    </div>

                    <div className="register">
                        <h3>No te has registrado?</h3>
                        <Link to={"/Registro"} className="registro" >Registrate</Link>
                    </div>
                </div>
            </div>
            </div>
            <Footer />
        </div>
    );
};
