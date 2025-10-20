// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export { API_BASE_URL };

export const apiConfig = {
  baseUrl: API_BASE_URL,
  endpoints: {
    // Autenticación
    login: `${API_BASE_URL}/login`,
    register: `${API_BASE_URL}/registro`,
    
    // Reservas
    reserva: (id) => `${API_BASE_URL}/api/reserva/${id}`,
    reservas: `${API_BASE_URL}/api/reservas`,
    misReservas: `${API_BASE_URL}/mis-reservas`,
    
    // Pagos
    createPaymentIntent: `${API_BASE_URL}/api/payment/create-intent`,
    confirmPayment: `${API_BASE_URL}/api/payment/confirm`,
    paymentHistory: `${API_BASE_URL}/api/payment/history`,
    paymentDetails: (id) => `${API_BASE_URL}/api/payment/${id}`,
    
    // Galería
    galleryCategories: `${API_BASE_URL}/api/gallery/categories`,
    galleryImages: (categoryId) => `${API_BASE_URL}/api/gallery/images/${categoryId}`,
    galleryUpload: (categoryId) => `${API_BASE_URL}/api/gallery/upload/${categoryId}`,
    galleryDeleteImage: (imageId) => `${API_BASE_URL}/api/gallery/image/${imageId}`,
    galleryCoverUpdate: (categoryId) => `${API_BASE_URL}/api/gallery/category/${categoryId}/cover`
  }
};

export default apiConfig;