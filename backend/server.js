const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();

app.use(cors());
app.use(express.json());

// Conexión a MySQL
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: '', // sin contraseña por defecto en XAMPP
  database: 'vivotour'
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conectado a MySQL');
  }
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');})