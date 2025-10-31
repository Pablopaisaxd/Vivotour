import { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { apiConfig } from '../config/apiConfig';

const TestPayment = () => {
  const { user } = useContext(AuthContext);
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testAuth = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiConfig.baseUrl}/api/test-auth`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setTestResults(prev => ({
        ...prev,
        auth: data
      }));
      
  // debug: removed console.log for production
    } catch (error) {
      console.error('Error testing auth:', error);
      setTestResults(prev => ({
        ...prev,
        auth: { success: false, error: error.message }
      }));
    }
    setLoading(false);
  };

  const testCreateReserva = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Crear una reserva de prueba
      const reservaData = {
        IdAlojamiento: 1,
        FechaIngreso: '2025-01-15',
        FechaSalida: '2025-01-18',
        InformacionReserva: 'Reserva de prueba para testing de pagos'
      };
      
      const response = await fetch(`${apiConfig.baseUrl}/api/reservas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reservaData)
      });
      
      const data = await response.json();
      setTestResults(prev => ({
        ...prev,
        reserva: data
      }));
      
  // debug: removed console.log for production
    } catch (error) {
      console.error('Error creating test reserva:', error);
      setTestResults(prev => ({
        ...prev,
        reserva: { success: false, error: error.message }
      }));
    }
    setLoading(false);
  };

  const testPaymentIntent = async () => {
    if (!testResults.reserva || !testResults.reserva.success) {
      alert('Primero crea una reserva de prueba');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(apiConfig.endpoints.createPaymentIntent, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reservaId: testResults.reserva.reservaId || 1,
          amount: 360, // 3 noches x $120
          currency: 'usd'
        })
      });
      
      const data = await response.json();
      setTestResults(prev => ({
        ...prev,
        payment: data
      }));
      
  // debug: removed console.log for production
    } catch (error) {
      console.error('Error testing payment intent:', error);
      setTestResults(prev => ({
        ...prev,
        payment: { success: false, error: error.message }
      }));
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <h2>Debes iniciar sesión para probar los pagos</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Test de Sistema de Pagos</h1>
      
      <div style={styles.userInfo}>
        <h3>Usuario actual:</h3>
        <p><strong>Nombre:</strong> {user.nombre}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>ID:</strong> {user.IdAccount}</p>
      </div>

      <div style={styles.testsContainer}>
        <div style={styles.testSection}>
          <h3>1. Test de Autenticación</h3>
          <button 
            onClick={testAuth}
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Probando...' : 'Probar Autenticación'}
          </button>
          
          {testResults.auth && (
            <div style={styles.result}>
              <h4>Resultado:</h4>
              <pre>{JSON.stringify(testResults.auth, null, 2)}</pre>
            </div>
          )}
        </div>

        <div style={styles.testSection}>
          <h3>2. Test de Creación de Reserva</h3>
          <button 
            onClick={testCreateReserva}
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Creando...' : 'Crear Reserva de Prueba'}
          </button>
          
          {testResults.reserva && (
            <div style={styles.result}>
              <h4>Resultado:</h4>
              <pre>{JSON.stringify(testResults.reserva, null, 2)}</pre>
            </div>
          )}
        </div>

        <div style={styles.testSection}>
          <h3>3. Test de Payment Intent</h3>
          <button 
            onClick={testPaymentIntent}
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Creando...' : 'Crear Payment Intent'}
          </button>
          
          {testResults.payment && (
            <div style={styles.result}>
              <h4>Resultado:</h4>
              <pre>{JSON.stringify(testResults.payment, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>

      <div style={styles.info}>
        <h3>Información de Debug:</h3>
        <p><strong>API URL:</strong> {apiConfig.baseUrl}</p>
        <p><strong>Token presente:</strong> {localStorage.getItem('token') ? 'Sí' : 'No'}</p>
        <p><strong>Stripe Key:</strong> {import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'Configurada' : 'No configurada'}</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px'
  },
  title: {
    color: '#2c5530',
    textAlign: 'center',
    marginBottom: '30px'
  },
  userInfo: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '30px'
  },
  testsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
  },
  testSection: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    backgroundColor: '#fff'
  },
  button: {
    backgroundColor: '#2c5530',
    color: '#fff',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px'
  },
  result: {
    marginTop: '15px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px',
    maxHeight: '300px',
    overflow: 'auto'
  },
  info: {
    marginTop: '30px',
    padding: '15px',
    backgroundColor: '#e9ecef',
    borderRadius: '8px'
  }
};

export default TestPayment;