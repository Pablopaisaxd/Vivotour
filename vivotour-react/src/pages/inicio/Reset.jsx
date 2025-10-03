import React, { useMemo, useState } from 'react';
import axios from 'axios';
import Footer from "../../components/use/Footer";
import './style/Forgot.css';
import { useNavigate } from 'react-router-dom';

export default function Reset() {
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ sending: false, message: '', error: false });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) return setStatus({ sending: false, message: 'Token inválido o faltante', error: true });
    if (!password || password.length < 6) return setStatus({ sending: false, message: 'La contraseña debe tener al menos 6 caracteres', error: true });
    try {
      setStatus({ sending: true, message: '', error: false });
      const res = await axios.post('http://localhost:5000/reset-password', { token, password });
      if (res.data?.success) {
        setStatus({ sending: false, message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.', error: false });
      } else {
        setStatus({ sending: false, message: res.data?.mensaje || 'No se pudo actualizar la contraseña', error: true });
      }
    } catch (err) {
      console.error(err);
      setStatus({ sending: false, message: 'Error del servidor', error: true });
    }
  };

  return (
    <div className="forgot-page">
      <div className="forgot-container">
        <div className="forgot-card">
          <h1 className="forgot-title">Restablecer Contraseña</h1>
          <form className="forgot-form" onSubmit={onSubmit}>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={status.sending}
            />
            <button type="submit" className="forgot-btn" disabled={status.sending}>
              {status.sending ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
          {status.message && (
            <p className={status.error ? 'forgot-error' : 'forgot-success'}>{status.message}</p>
          )}
          {(!status.error && status.message && status.message.includes('correctamente')) && (
            <p style={{fontSize: '.8rem', marginTop: '.5rem'}}>Redirigiendo a inicio de sesión...</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
