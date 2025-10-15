import React, { useEffect, useState, useContext } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Footer from '../../components/use/Footer';
import './style/Registro.css';
import { AuthContext } from '../../AuthContext';
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import logo from "../../assets/Logos/new vivo contorno2.png";

const CompleteProfile = () => {
  const { register, handleSubmit, control, formState: { errors } } = useForm();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const { login } = useContext(AuthContext);

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setServerError('');
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/auth/complete-profile', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success && res.data?.token) {
        // Refresh token with updated claims and update context
        localStorage.setItem('token', res.data.token);
        if (login) {
          login(res.data.token);
        }
        navigate(from, { replace: true });
      } else {
        setServerError(res.data?.mensaje || 'No se pudo actualizar el perfil');
      }
    } catch (e) {
      console.error(e);
      setServerError('Error del servidor');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="registro-page">
      <div className="registro-container">
        <div className="registro-card">
          <div className="registro-logo">
            <img src={logo} alt="logoVentana" className="main-logo" onClick={() => navigate("/")} />
          </div>
          <h1 className="registro-title">Completar perfil</h1>
          <p className="textcolor" style={{ marginBottom: 16, textAlign: 'center', opacity: 0.8 }}>
            Solo necesitamos unos datos más para finalizar tu registro.
          </p>
          
          <form className="registro-form" onSubmit={handleSubmit(onSubmit)} noValidate>
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
              <select 
                {...register("tipoDocumento", { required: "Selecciona el tipo de documento" })}
                defaultValue=""
              >
                <option value="" disabled>Tipo</option>
                <option value="CC">CC</option>
                <option value="CE">CE</option>
                <option value="TI">TI</option>
                <option value="PAS">PAS</option>
                <option value="DNI">DNI</option>
                <option value="NIT">NIT</option>
              </select>

              <input
                type="text"
                {...register('numeroDocumento', { 
                  required: 'El número de documento es obligatorio',
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "El documento solo debe contener números",
                  },
                })}
                placeholder="Número de documento"
              />
            </div>
            {(errors.tipoDocumento || errors.numeroDocumento) && (
              <div className="registro-error">
                <p>{errors.tipoDocumento?.message || errors.numeroDocumento?.message}</p>
              </div>
            )}

            {serverError && (
              <div className="registro-error">
                <p>{serverError}</p>
              </div>
            )}

            <button className="registro-btn" type="submit" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar y continuar'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CompleteProfile;
