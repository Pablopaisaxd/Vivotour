const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();

app.use(cors());
app.use(express.json());

// Conexión a MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'vivotour'
});

db.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
  } else {
    console.log('Conectado a MySQL');
  }
});

// Ruta para recibir el registro
app.post('/registro', (req, res) => {
  const { Nombre, Email, Contraseña, Celular, NumeroDocumento, TipoDocumento } = req.body;
  console.log("Datos recibidos:", req.body);

  const query = 'INSERT INTO registros (Nombre, Email, Contraseña, Celular, NumeroDocumento, TipoDocumento) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [Nombre, Email, Contraseña, Celular, NumeroDocumento, TipoDocumento], (err, resultado) => {
    if (err) {
      console.error(err);
      res.status(500).json({ mensaje: 'Error al registrar usuario' });
    } else {
      res.json({ mensaje: 'Usuario registrado correctamente' });
    }
  });
});

// Autenticar login
app.post('/login', (req, res) => {
  const { correo, contraseña } = req.body;

  const query = 'SELECT * FROM registros WHERE Email = ? AND Contraseña = ?';
  db.query(query, [correo, contraseña], (err, resultados) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ mensaje: 'Error interno' });
    }

    if (resultados.length > 0) {
      const usuario = resultados[0];
      res.json({ mensaje: 'Login exitoso', nombre: usuario.Nombre });
    } else {
      res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }
  });
});


// Iniciar servidor
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});