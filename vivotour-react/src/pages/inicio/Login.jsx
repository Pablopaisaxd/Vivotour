import React, { useState } from "react";
import "./style/Login.css";
import Footer from "../../components/use/Footer";
import { Link } from "react-router-dom";


export const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const handleSubmit = (e) => {
        e.preventDefault();
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
                    <form action="" id="form-login" onSubmit={handleSubmit}>
                        <div className="inputslogin">
                            <input type="email" id="email" placeholder="Email" />
                        </div>

                        <div className="inputslogin">
                            <div className="password-div">
                                <input type={showPassword ? "text" : "password"} id="password" placeholder="Contraseña"  />
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
