import React, { useEffect, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Footer from '../../components/use/Footer';
import './style/Login.css';
import { AuthContext } from '../../AuthContext';

const CompleteProfile = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
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
    <div className="login-page">
      <div className="login-container">
        <div className="login-box">
          <h1>Completar perfil</h1>
          <p className="textcolor" style={{ marginBottom: 16 }}>Solo necesitamos unos datos más para finalizar tu registro.</p>
          <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="login-input-group">
              <input
                type="tel"
                placeholder="Teléfono"
                {...register('celular', { required: 'El teléfono es obligatorio' })}
                aria-invalid={errors.celular ? 'true' : 'false'}
              />
              {errors.celular && (
                <div className="login-error" role="alert"><p>{errors.celular.message}</p></div>
              )}
            </div>
            <div className="login-input-group">
              <input
                type="text"
                placeholder="Número de documento"
                {...register('numeroDocumento', { required: 'El número de documento es obligatorio' })}
                aria-invalid={errors.numeroDocumento ? 'true' : 'false'}
              />
              {errors.numeroDocumento && (
                <div className="login-error" role="alert"><p>{errors.numeroDocumento.message}</p></div>
              )}
            </div>
            <div className="login-input-group">
              <select
                {...register('tipoDocumento', { required: 'Selecciona el tipo de documento' })}
                aria-invalid={errors.tipoDocumento ? 'true' : 'false'}
                defaultValue=""
              >
                <option value="" disabled>Tipo de documento</option>
                <option value="CC">Cédula de ciudadanía</option>
                <option value="CE">Cédula de extranjería</option>
                <option value="TI">Tarjeta de identidad</option>
                <option value="PAS">Pasaporte</option>
              </select>
              {errors.tipoDocumento && (
                <div className="login-error" role="alert"><p>{errors.tipoDocumento.message}</p></div>
              )}
            </div>

            {serverError && <div className="login-error" role="alert"><p>{serverError}</p></div>}

            <button className="login-btn" type="submit" disabled={submitting}>
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
