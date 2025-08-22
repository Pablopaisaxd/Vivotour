import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import db from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "clave_super_secreta"; 

// Registro
app.post("/registro", async (req, res) => {
  try {
    const { nombre, email, password, celular, numeroDocumento, tipoDocumento } = req.body;

    console.log(" Datos recibidos:", req.body);

    const query = `
      INSERT INTO registros (nombre, email, password, celular, numeroDocumento, tipoDocumento)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const [resultado] = await db.query(query, [nombre, email, password, celular, numeroDocumento, tipoDocumento]);

    const token = jwt.sign({ nombre }, JWT_SECRET, { expiresIn: "3h" });

    res.json({
      success: true,
      mensaje: "Usuario registrado correctamente ",
      token,
    });
  } catch (err) {
    console.error(" Error en DB:", err);
    res.status(500).json({
      success: false,
      mensaje: "Error al registrar usuario",
    });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM registros WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, mensaje: "Usuario no encontrado" });
    }

    const user = rows[0];

    if (user.password !== password) { // temporal, sin encriptar
      return res.status(401).json({ success: false, mensaje: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ email: user.email, nombre: user.nombre }, JWT_SECRET, { expiresIn: "3h" });

    res.json({ success: true, mensaje: "Login exitoso", token });
  } catch (error) {
    console.error("Error en DB:", error);
    res.status(500).json({ success: false, mensaje: "Error del servidor" });
  }
});




app.listen(5000, () => {
  console.log(" Servidor corriendo en http://localhost:5000");
});
