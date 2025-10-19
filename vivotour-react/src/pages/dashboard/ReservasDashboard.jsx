import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiConfig } from '../../config/apiConfig';

const ReservasDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchReservas();
    }
  }, [user]);

  const fetchReservas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(apiConfig.endpoints.misReservas, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setReservas(data.reservas || []);
      } else {
        setError(data.mensaje || 'Error cargando reservas');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleNuevaReserva = () => {
    navigate('/Reserva');
  };

  const handleVerDetalles = (reservaId) => {
    navigate(`/checkout/${reservaId}`);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      padding: '20px'
    },
    header: {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
      margin: 0
    },
    button: {
      backgroundColor: '#2c5530',
      color: '#fff',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold'
    },
    reservaCard: {
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      marginBottom: '15px'
    },
    reservaTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#2c5530',
      marginBottom: '10px'
    },
    reservaInfo: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px'
    },
    label: {
      fontWeight: '500',
      color: '#555'
    },
    value: {
      color: '#333'
    },
    noReservas: {
      backgroundColor: '#fff',
      padding: '40px',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      textAlign: 'center'
    },
    loading: {
      textAlign: 'center',
      padding: '40px'
    },
    error: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '15px',
      borderRadius: '8px',
      border: '1px solid #f5c6cb',
      marginBottom: '20px'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <h2>Cargando reservas...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Mis Reservas</h1>
        <button style={styles.button} onClick={handleNuevaReserva}>
          Nueva Reserva
        </button>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {reservas.length === 0 ? (
        <div style={styles.noReservas}>
          <h3>No tienes reservas aún</h3>
          <p>¡Haz tu primera reserva en VivoTour!</p>
          <button style={styles.button} onClick={handleNuevaReserva}>
            Hacer Primera Reserva
          </button>
        </div>
      ) : (
        <div>
          {reservas.map((reserva) => (
            <div key={reserva.IdReserva} style={styles.reservaCard}>
              <div style={styles.reservaTitle}>
                Reserva #{reserva.IdReserva}
              </div>
              
              <div style={styles.reservaInfo}>
                <span style={styles.label}>Check-in:</span>
                <span style={styles.value}>
                  {new Date(reserva.FechaIngreso).toLocaleDateString('es-ES')}
                </span>
              </div>
              
              <div style={styles.reservaInfo}>
                <span style={styles.label}>Check-out:</span>
                <span style={styles.value}>
                  {new Date(reserva.FechaSalida).toLocaleDateString('es-ES')}
                </span>
              </div>
              
              <div style={styles.reservaInfo}>
                <span style={styles.label}>Estado:</span>
                <span style={styles.value}>
                  {reserva.EstadoReserva || 'Pendiente'}
                </span>
              </div>
              
              {reserva.InformacionReserva && (
                <div style={styles.reservaInfo}>
                  <span style={styles.label}>Información:</span>
                  <span style={styles.value}>
                    {reserva.InformacionReserva}
                  </span>
                </div>
              )}

              <div style={{ marginTop: '15px' }}>
                <button 
                  style={styles.button} 
                  onClick={() => handleVerDetalles(reserva.IdReserva)}
                >
                  Ver Detalles / Pagar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservasDashboard;