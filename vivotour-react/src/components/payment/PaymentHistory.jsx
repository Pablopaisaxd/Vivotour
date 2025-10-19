import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../AuthContext';

const PaymentHistory = () => {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/payment/history', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setPayments(data.payments);
      } else {
        setError(data.mensaje || 'Error obteniendo historial de pagos');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentDetails = async (paymentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/payment/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setSelectedPayment(data.payment);
        setShowModal(true);
      } else {
        setError(data.mensaje || 'Error obteniendo detalles del pago');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error obteniendo detalles del pago');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Completado': '#28a745',
      'Pendiente': '#ffc107',
      'Fallido': '#dc3545',
      'Cancelado': '#6c757d',
      'Reembolsado': '#17a2b8',
      'Rechazado': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Completado': '✅',
      'Pendiente': '⏳',
      'Fallido': '❌',
      'Cancelado': '⚫',
      'Reembolsado': '↩️',
      'Rechazado': '🚫'
    };
    return icons[status] || '❓';
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <h2>Acceso Requerido</h2>
          <p>Debes iniciar sesión para ver tu historial de pagos.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingCard}>
          <div style={styles.spinner}></div>
          <p>Cargando historial de pagos...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Historial de Pagos</h1>
        <p style={styles.subtitle}>Revisa todos tus pagos y transacciones</p>
      </div>

      {error && (
        <div style={styles.errorMessage}>
          {error}
        </div>
      )}

      {payments.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>💳</div>
          <h3>No hay pagos registrados</h3>
          <p>Cuando realices tu primera reserva, aparecerá aquí.</p>
        </div>
      ) : (
        <div style={styles.paymentsGrid}>
          {payments.map((payment) => (
            <div 
              key={payment.IdPago} 
              style={styles.paymentCard}
              onClick={() => fetchPaymentDetails(payment.IdPago)}
            >
              <div style={styles.cardHeader}>
                <div style={styles.paymentNumber}>
                  Pago #{payment.IdPago}
                </div>
                <div 
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: getStatusColor(payment.EstadoPago),
                  }}
                >
                  {getStatusIcon(payment.EstadoPago)} {payment.EstadoPago}
                </div>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.amountSection}>
                  <span style={styles.amount}>
                    ${payment.Monto} {payment.Moneda?.toUpperCase()}
                  </span>
                  <span style={styles.provider}>
                    vía {payment.ProveedorPago}
                  </span>
                </div>

                <div style={styles.detailsSection}>
                  <div style={styles.detail}>
                    <span style={styles.detailLabel}>Reserva:</span>
                    <span style={styles.detailValue}>#{payment.IdReserva}</span>
                  </div>
                  <div style={styles.detail}>
                    <span style={styles.detailLabel}>Tipo:</span>
                    <span style={styles.detailValue}>{payment.NombreTipoPago}</span>
                  </div>
                  <div style={styles.detail}>
                    <span style={styles.detailLabel}>Fecha:</span>
                    <span style={styles.detailValue}>
                      {new Date(payment.FechaPago).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                </div>

                {payment.DescripcionPago && (
                  <div style={styles.description}>
                    {payment.DescripcionPago}
                  </div>
                )}

                {payment.FechaIngreso && payment.FechaSalida && (
                  <div style={styles.stayDates}>
                    <span style={styles.stayLabel}>Estadía:</span>
                    {new Date(payment.FechaIngreso).toLocaleDateString('es-ES')} - 
                    {new Date(payment.FechaSalida).toLocaleDateString('es-ES')}
                  </div>
                )}
              </div>

              <div style={styles.cardFooter}>
                <span style={styles.clickHint}>Click para ver detalles</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      {showModal && selectedPayment && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>Detalles del Pago #{selectedPayment.IdPago}</h2>
              <button 
                style={styles.closeButton}
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.modalSection}>
                <h3>Información General</h3>
                <div style={styles.modalDetail}>
                  <span>Estado:</span>
                  <span style={{
                    color: getStatusColor(selectedPayment.EstadoPago),
                    fontWeight: 'bold'
                  }}>
                    {getStatusIcon(selectedPayment.EstadoPago)} {selectedPayment.EstadoPago}
                  </span>
                </div>
                <div style={styles.modalDetail}>
                  <span>Monto:</span>
                  <span>${selectedPayment.Monto} {selectedPayment.Moneda?.toUpperCase()}</span>
                </div>
                <div style={styles.modalDetail}>
                  <span>Tipo de Pago:</span>
                  <span>{selectedPayment.NombreTipoPago}</span>
                </div>
                <div style={styles.modalDetail}>
                  <span>Proveedor:</span>
                  <span>{selectedPayment.ProveedorPago}</span>
                </div>
                <div style={styles.modalDetail}>
                  <span>Fecha:</span>
                  <span>{new Date(selectedPayment.FechaPago).toLocaleString('es-ES')}</span>
                </div>
                <div style={styles.modalDetail}>
                  <span>Referencia:</span>
                  <span style={styles.reference}>{selectedPayment.ReferenciaPasarela}</span>
                </div>
              </div>

              <div style={styles.modalSection}>
                <h3>Información de la Reserva</h3>
                <div style={styles.modalDetail}>
                  <span>Reserva #:</span>
                  <span>{selectedPayment.IdReserva}</span>
                </div>
                <div style={styles.modalDetail}>
                  <span>Cliente:</span>
                  <span>{selectedPayment.NombreCliente}</span>
                </div>
                {selectedPayment.FechaIngreso && (
                  <div style={styles.modalDetail}>
                    <span>Check-in:</span>
                    <span>{new Date(selectedPayment.FechaIngreso).toLocaleDateString('es-ES')}</span>
                  </div>
                )}
                {selectedPayment.FechaSalida && (
                  <div style={styles.modalDetail}>
                    <span>Check-out:</span>
                    <span>{new Date(selectedPayment.FechaSalida).toLocaleDateString('es-ES')}</span>
                  </div>
                )}
              </div>

              {selectedPayment.DescripcionPago && (
                <div style={styles.modalSection}>
                  <h3>Descripción</h3>
                  <p style={styles.modalDescription}>{selectedPayment.DescripcionPago}</p>
                </div>
              )}

              {selectedPayment.DescripcionEstado && (
                <div style={styles.modalSection}>
                  <h3>Estado del Pago</h3>
                  <p style={styles.modalDescription}>{selectedPayment.DescripcionEstado}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Estilos
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f5f7fa',
    minHeight: '100vh'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  title: {
    color: '#2c5530',
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '10px'
  },
  subtitle: {
    color: '#6c757d',
    fontSize: '16px'
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1px solid #f5c2c7',
    textAlign: 'center'
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
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #2c5530',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
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
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '60px 40px',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '50px auto',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '20px'
  },
  paymentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    border: '1px solid #e9ecef',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
    }
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  paymentNumber: {
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#2c5530'
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#fff'
  },
  cardBody: {
    marginBottom: '15px'
  },
  amountSection: {
    marginBottom: '15px'
  },
  amount: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2c5530',
    display: 'block'
  },
  provider: {
    fontSize: '12px',
    color: '#6c757d'
  },
  detailsSection: {
    marginBottom: '15px'
  },
  detail: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px'
  },
  detailLabel: {
    fontSize: '14px',
    color: '#6c757d'
  },
  detailValue: {
    fontSize: '14px',
    color: '#212529',
    fontWeight: '500'
  },
  description: {
    fontSize: '14px',
    color: '#495057',
    backgroundColor: '#f8f9fa',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '10px'
  },
  stayDates: {
    fontSize: '12px',
    color: '#6c757d'
  },
  stayLabel: {
    fontWeight: 'bold',
    marginRight: '5px'
  },
  cardFooter: {
    textAlign: 'center',
    borderTop: '1px solid #e9ecef',
    paddingTop: '10px'
  },
  clickHint: {
    fontSize: '12px',
    color: '#6c757d',
    fontStyle: 'italic'
  },
  modalOverlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '1000'
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto'
  },
  modalHeader: {
    padding: '20px',
    borderBottom: '1px solid #e9ecef',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#6c757d'
  },
  modalBody: {
    padding: '20px'
  },
  modalSection: {
    marginBottom: '25px'
  },
  modalDetail: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    padding: '8px 0'
  },
  modalDescription: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#495057'
  },
  reference: {
    fontFamily: 'monospace',
    fontSize: '12px',
    backgroundColor: '#f8f9fa',
    padding: '2px 6px',
    borderRadius: '3px'
  }
};

export default PaymentHistory;