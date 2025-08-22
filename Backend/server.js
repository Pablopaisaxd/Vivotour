import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import db from './db.js' 

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())
const JWT_SECRET = "clave_super_secreta"

// Registro usuario
app.post('/registro', (req, res) => {
  const { nombre, email, password, celular, numeroDocumento, tipoDocumento } = req.body
  console.log("Datos recibidos:", req.body)

  const query = 'INSERT INTO registros (nombre, email, password, celular, numeroDocumento, tipoDocumento) VALUES (?, ?, ?, ?, ?, ?)'
  db.query(query, [nombre, email, password, celular, numeroDocumento, tipoDocumento], (err, resultado) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, mensaje: 'Error al registrar usuario' })
    } 
    
    // Aquí generamos el token
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '3h' })

    return res.json({
      success: true,
      mensaje: 'Usuario registrado correctamente',
      token,
    })
  })
})


// Iniciar servidor
app.listen(5000, () => {
  console.log("Servidor corriendo en http://localhost:5000")
})
