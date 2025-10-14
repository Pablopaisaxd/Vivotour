// Test simple del endpoint de login
const axios = require('axios');

async function testLogin() {
  try {
    console.log('Probando login con usuarios de prueba...');
    
    const testData = {
      email: 'test@gmail.com',
      password: '123'
    };
    
    console.log('Enviando datos:', testData);
    
    const response = await axios.post('http://localhost:5000/Login', testData);
    
    console.log('Respuesta exitosa:', response.data);
    
    if (response.data.success) {
      console.log('✅ Login funcionando correctamente');
      console.log('Token recibido:', response.data.token ? 'SÍ' : 'NO');
      console.log('Usuario recibido:', response.data.user ? 'SÍ' : 'NO');
      if (response.data.user) {
        console.log('Avatar del usuario:', response.data.user.avatar);
      }
    } else {
      console.log('❌ Login falló:', response.data.mensaje);
    }
    
  } catch (error) {
    console.error('❌ Error en test de login:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Esperar un poco antes de hacer la prueba
setTimeout(() => {
  testLogin();
}, 2000);