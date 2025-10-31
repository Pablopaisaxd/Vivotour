import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { apiConfig } from '../../config/apiConfig';

// Carga Stripe con tu clave pública desde variables de entorno
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Componente interno del formulario de pago
const CheckoutForm = ({ reservaDetails, onPaymentSuccess, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [error, setError] = useState('');
  const [succeeded, setSucceeded] = useState(false);
  const [mockMode, setMockMode] = useState(false);

  useEffect(() => {
    // Crear Payment Intent cuando se monta el componente
    if (reservaDetails) {
      createPaymentIntent();
    }
  }, [reservaDetails]);

  const createPaymentIntent = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No se encontró token de autenticación');
        return;
      }
      
      console.log('Creando Payment Intent para reserva:', reservaDetails.IdReserva, 'Monto:', reservaDetails.total);
      
      const response = await fetch(apiConfig.endpoints.createPaymentIntent, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reservaId: reservaDetails.IdReserva,
          amount: reservaDetails.total,
          currency: 'cop'
        })
      });

      const data = await response.json();
      
      console.log('Respuesta del servidor:', data);

      if (data.success) {
        setClientSecret(data.clientSecret);
        setPaymentId(data.paymentId);
        setMockMode(data.mockMode || false);
        console.log('Payment Intent creado exitosamente:', data.paymentIntentId);
        console.log('Modo mock activado:', data.mockMode);
      } else {
        console.error('Error del servidor:', data.mensaje);
        setError(data.mensaje || 'Error creando intención de pago');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión con el servidor');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (processing || succeeded) {
      return;
    }

    setProcessing(true);
    setError('');

    try {
      // MODO MOCK: Simular pago exitoso
      if (mockMode) {
        console.log('Simulando pago en modo desarrollo...');
        
        // Simular delay de procesamiento
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simular confirmación de pago
        try {
          await confirmPayment(clientSecret.replace('_secret_test123', ''));
        } catch (confirmError) {
          console.warn('Error en confirmación (simulado), continuando...', confirmError);
        }
        
        setSucceeded(true);
        setProcessing(false);
        
        if (onPaymentSuccess) {
          onPaymentSuccess({
            id: clientSecret.replace('_secret_test123', ''),
            status: 'succeeded',
            mockMode: true
          });
        }
        return;
      }

      // MODO REAL: Procesar con Stripe
      if (!stripe || !elements) {
        setError('Stripe no está disponible');
        setProcessing(false);
        return;
      }

      const cardElement = elements.getElement(CardElement);

      // Confirmar pago con Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: reservaDetails.nombreCliente || 'Cliente VivoTour',
            email: reservaDetails.emailCliente
          }
        }
      });

      if (error) {
        setError(`Error de pago: ${error.message}`);
        setProcessing(false);
        if (onPaymentError) {
          onPaymentError(error);
        }
      } else if (paymentIntent.status === 'succeeded') {
        // Confirmar en nuestro backend
        await confirmPayment(paymentIntent.id);
        setSucceeded(true);
        setProcessing(false);
        
        if (onPaymentSuccess) {
          onPaymentSuccess(paymentIntent);
        }
      }
    } catch (error) {
      console.error('Error procesando pago:', error);
      setError('Error procesando el pago');
      setProcessing(false);
      if (onPaymentError) {
        onPaymentError(error);
      }
    }
  };

  const confirmPayment = async (paymentIntentId) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('Confirmando pago:', paymentIntentId, 'PaymentId:', paymentId);
      
      const response = await fetch(apiConfig.endpoints.confirmPayment, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntentId,
          paymentId: paymentId
        })
      });

      const data = await response.json();
      
      console.log('Respuesta confirmación:', data);
      
      if (!data.success) {
        throw new Error(data.mensaje || 'Error confirmando pago');
      }
    } catch (error) {
      console.error('Error confirmando pago:', error);
      throw error;
    }
  };

  // Estilos para el CardElement
  const cardStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  // Formato COP usado en la pasarela
  const formatCOP = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(n || 0));

  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: '0 auto', 
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      {/* Nota: el banner de modo desarrollo se ha removido de la UI por petición. (mockMode sigue funcionando internamente) */}

      {/* Resumen de la reserva */}
      {reservaDetails && (
        <div style={{ 
          marginBottom: '30px', 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ 
            color: '#2c5530', 
            marginBottom: '15px',
            textAlign: 'center'
          }}>
            Resumen de Reserva
          </h3>
          {/* Reservar: ya no mostramos el número de reserva en la pasarela por privacidad */}
          <div style={{ marginBottom: '10px' }}>
            <strong>Check-in:</strong> {new Date(reservaDetails.FechaIngreso).toLocaleDateString()}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Check-out:</strong> {new Date(reservaDetails.FechaSalida).toLocaleDateString()}
          </div>
          <div style={{ 
            marginTop: '15px', 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#2c5530',
            textAlign: 'center',
            padding: '10px',
            backgroundColor: '#e8f5e8',
            borderRadius: '5px'
          }}>
            Total: {formatCOP(reservaDetails.total)}
          </div>
        </div>
      )}

      {/* Formulario de pago */}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: 'bold',
            color: '#333'
          }}>
            Información de Tarjeta
          </label>
          <div style={{ 
            padding: '12px', 
            border: '2px solid #ccc', 
            borderRadius: '6px',
            backgroundColor: '#fff'
          }}>
            <CardElement 
              options={cardStyle}
              onChange={(event) => {
                if (event.error) {
                  setError(event.error.message);
                } else {
                  setError('');
                }
              }}
            />
          </div>
        </div>

        {/* Mostrar errores */}
        {error && (
          <div style={{ 
            color: '#d63384', 
            marginBottom: '15px', 
            padding: '10px',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c2c7',
            borderRadius: '5px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Mensaje de éxito */}
        {succeeded && (
          <div style={{ 
            color: '#0f5132', 
            marginBottom: '15px', 
            padding: '10px',
            backgroundColor: '#d1e7dd',
            border: '1px solid #badbcc',
            borderRadius: '5px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            ¡Pago realizado exitosamente! 🎉
          </div>
        )}

        {/* Botón de pagar */}
        <button
          type="submit"
          disabled={!stripe || processing || succeeded || !clientSecret}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#fff',
            backgroundColor: processing || succeeded ? '#6c757d' : '#2c5530',
            border: 'none',
            borderRadius: '8px',
            cursor: processing || succeeded || !stripe ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            marginTop: '10px'
          }}
        >
          {processing ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ 
                marginRight: '10px',
                width: '16px',
                height: '16px',
                border: '2px solid transparent',
                borderTop: '2px solid #fff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}>
                <style>
                  {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
                </style>
              </span>
              Procesando...
            </span>
          ) : succeeded ? (
            'Pago Completado ✓'
          ) : (
            `Pagar ${formatCOP(reservaDetails?.total || 0)}`
          )}
        </button>
      </form>

      {/* Información de seguridad */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '6px',
        fontSize: '12px',
        color: '#6c757d',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '8px' }}>
          🔒 Tus datos están seguros con cifrado SSL
        </div>
        <div>
          Powered by <strong>Stripe</strong> - Procesamiento seguro de pagos
        </div>
      </div>
    </div>
  );
};

// Componente principal que envuelve con Stripe Elements
const PaymentForm = ({ reservaDetails, onPaymentSuccess, onPaymentError }) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm 
        reservaDetails={reservaDetails}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />
    </Elements>
  );
};

export default PaymentForm;