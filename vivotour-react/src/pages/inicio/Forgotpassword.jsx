import React from 'react'
import "./style/Forgot.css"
import Footer from '../../components/use/Footer'
export const Forgotpassword = () => {
  return (
    <div>
        <div className="maindiv">
        <div className='font-forgot'>
        <div className="divRecuperar">
            <h1>Recuperar Contraseña</h1>
            <div className="inputsRecuperar">
                <input type="text" id="email" placeholder="Ingresar Email o Telefono" ></input>
            </div>
            <button className="Recuperar-btn">Recuperar</button>

        </div>
    </div>
    </div>
    <Footer />
    </div>
  )
}
