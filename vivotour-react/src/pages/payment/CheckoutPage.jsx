import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import PaymentForm from '../../components/payment/PaymentForm';
import { apiConfig } from '../../config/apiConfig';

// Hook para detectar si es móvil
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

const CheckoutPage = () => {
  const { reservaId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isMobile = useIsMobile();
  
  const [reservaDetails, setReservaDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  useEffect(() => {
    if (reservaId && user) {
      fetchReservaDetails();
    }
  }, [reservaId, user]);

  const fetchReservaDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No se encontró token de autenticación');
        setLoading(false);
        return;
      }
      
      console.log('Obteniendo detalles de reserva:', reservaId);
      
      const response = await fetch(apiConfig.endpoints.reserva(reservaId), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      console.log('Respuesta reserva:', data);

      if (data.success) {
        // Calcular el total basado en días y precio por noche
        const checkIn = new Date(data.reserva.FechaIngreso);
        const checkOut = new Date(data.reserva.FechaSalida);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const pricePerNight = 120000; // Precio base por noche en COP
        const total = nights * pricePerNight;

        console.log('Detalles calculados - Noches:', nights, 'Total:', total);

        setReservaDetails({
          ...data.reserva,
          total: total,
          nights: nights,
          pricePerNight: pricePerNight,
          nombreCliente: user.nombre,
          emailCliente: user.email
        });
      } else {
        console.error('Error del servidor:', data.mensaje);
        setError(data.mensaje || 'Error obteniendo detalles de reserva');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    console.log('Pago exitoso:', paymentIntent);
    setPaymentCompleted(true);
    setRedirectCountdown(3);
    
    // Iniciar countdown para redirección
    const countdown = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          // Redirigir a perfil
          navigate('/Perfil', { 
            state: { 
              message: 'Pago completado exitosamente',
              reservaId: reservaId 
            }
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePaymentError = (error) => {
    console.error('Error en pago:', error);
    setError(`Error en el pago: ${error.message || 'Error desconocido'}`);
  };

  // Estilos
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
      padding: '20px',
      position: 'relative'
    },
    checkoutWrapper: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '30px',
      gap: '20px'
    },
    backButton: {
      padding: '10px 15px',
      backgroundColor: '#6c757d',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.3s ease'
    },
    title: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#333',
      margin: '0'
    },
    content: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: '30px'
    },
    leftColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    rightColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    card: {
      backgroundColor: '#fff',
      padding: '25px',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      border: '1px solid #e9ecef'
    },
    cardTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '20px',
      color: '#333',
      borderBottom: '2px solid #007bff',
      paddingBottom: '10px'
    },
    detailItem: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '12px',
      fontSize: '16px'
    },
    label: {
      fontWeight: '500',
      color: '#555'
    },
    value: {
      fontWeight: 'bold',
      color: '#333'
    },
    separator: {
      height: '1px',
      backgroundColor: '#e9ecef',
      margin: '20px 0'
    },
    totalSection: {
      backgroundColor: '#f8f9fa',
      padding: '15px',
      borderRadius: '8px'
    },
    subtotalItem: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px',
      fontSize: '14px',
      color: '#6c757d'
    },
    totalItem: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#007bff',
      borderTop: '1px solid #dee2e6',
      paddingTop: '8px',
      marginTop: '8px'
    },
    policyText: {
      fontSize: '14px',
      color: '#666',
      lineHeight: '1.6'
    },
    paymentSection: {
      backgroundColor: '#fff',
      padding: '25px',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      border: '1px solid #e9ecef'
    },
    loadingCard: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '40px',
      textAlign: 'center',
      maxWidth: '400px',
      margin: '50px auto',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    errorCard: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '40px',
      textAlign: 'center',
      maxWidth: '400px',
      margin: '50px auto',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    successCard: {
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '40px',
      textAlign: 'center',
      maxWidth: '400px',
      margin: 'auto',
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
    successIcon: {
      fontSize: '48px',
      marginBottom: '20px'
    },
    button: {
      padding: '12px 24px',
      backgroundColor: '#2c5530',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
      transition: 'all 0.3s ease'
    },
    spinner: {
      width: '40px',
      height: '40px',
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #2c5530',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 20px'
    },
    errorMessage: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '20px',
      border: '1px solid #f5c2c7'
    }
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <h2>Acceso Requerido</h2>
          <p>Debes iniciar sesión para acceder al checkout.</p>
          <button 
            onClick={() => navigate('/login')}
            style={styles.button}
          >
            Ir a Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner}></div>
          <p>Cargando detalles de la reserva...</p>
        </div>
      </div>
    );
  }

  if (error && !reservaDetails) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <h2>Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            style={styles.button}
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (paymentCompleted) {
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>✅</div>
          <h2>¡Pago Completado!</h2>
          <p>Tu reserva ha sido confirmada exitosamente.</p>
          <p>Reserva #{reservaId}</p>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Serás redirigido en {redirectCountdown} segundo{redirectCountdown !== 1 ? 's' : ''}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.checkoutWrapper}>
        {/* Header */}
        <div style={styles.header}>
          <button 
            onClick={() => navigate('/dashboard/reservas')}
            style={styles.backButton}
          >
            ← Volver
          </button>
          <h1 style={styles.title}>Checkout - VivoTour</h1>
        </div>

        {/* Contenido principal */}
        <div style={styles.content}>
          {/* Columna izquierda - Detalles de reserva */}
          <div style={styles.leftColumn}>
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Detalles de tu Reserva</h3>
              
              {reservaDetails && (
                <>
                  <div style={styles.detailItem}>
                    <span style={styles.label}>Reserva #:</span>
                    <span style={styles.value}>{reservaDetails.IdReserva}</span>
                  </div>
                  
                  <div style={styles.detailItem}>
                    <span style={styles.label}>Check-in:</span>
                    <span style={styles.value}>
                      {new Date(reservaDetails.FechaIngreso).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div style={styles.detailItem}>
                    <span style={styles.label}>Check-out:</span>
                    <span style={styles.value}>
                      {new Date(reservaDetails.FechaSalida).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div style={styles.detailItem}>
                    <span style={styles.label}>Noches:</span>
                    <span style={styles.value}>{reservaDetails.nights}</span>
                  </div>
                  
                  <div style={styles.detailItem}>
                    <span style={styles.label}>Precio por noche:</span>
                    <span style={styles.value}>${reservaDetails.pricePerNight.toLocaleString()} COP</span>
                  </div>
                  
                  {reservaDetails.InformacionReserva && (
                    <div style={styles.detailItem}>
                      <span style={styles.label}>Información adicional:</span>
                      <span style={styles.value}>{reservaDetails.InformacionReserva}</span>
                    </div>
                  )}
                  
                  <div style={styles.separator}></div>
                  
                  <div style={styles.totalSection}>
                    <div style={styles.subtotalItem}>
                      <span>Subtotal ({reservaDetails.nights} noches):</span>
                      <span>${reservaDetails.total.toLocaleString()} COP</span>
                    </div>
                    <div style={styles.subtotalItem}>
                      <span>Impuestos y tasas:</span>
                      <span>Incluidos</span>
                    </div>
                    <div style={styles.totalItem}>
                      <span>Total:</span>
                      <span>${reservaDetails.total.toLocaleString()} COP</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Políticas */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Políticas de Cancelación</h3>
              <div style={styles.policyText}>
                <p>• Cancelación gratuita hasta 24 horas antes del check-in</p>
                <p>• Cancelación después de 24 horas: cargo del 50%</p>
                <p>• No show: cargo del 100%</p>
              </div>
            </div>
          </div>

          {/* Columna derecha - Formulario de pago */}
          <div style={styles.rightColumn}>
            <div style={styles.paymentSection}>
              <h3 style={styles.cardTitle}>Información de Pago</h3>
              
              {error && (
                <div style={styles.errorMessage}>
                  {error}
                </div>
              )}
              
              {reservaDetails && (
                <PaymentForm 
                  reservaDetails={reservaDetails}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default CheckoutPage;