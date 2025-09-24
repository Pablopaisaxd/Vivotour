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

    const token = jwt.sign({ nombre, email, numeroDocumento, tipoDocumento  }, JWT_SECRET, { expiresIn: "3h" });

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

    const token = jwt.sign({ nombre: user.nombre,  email: user.email, numeroDocumento: user.numeroDocumento, tipoDocumento: user.tipoDocumento }, JWT_SECRET, { expiresIn: "3h" });

    res.json({ success: true, mensaje: "Login exitoso", token });
  } catch (error) {
    console.error("Error en DB:", error);
    res.status(500).json({ success: false, mensaje: "Error del servidor" });
  }
});

app.post("/opinion", async (req, res) => {
  const { nombre, opinion } = req.body;
  if (!nombre || !opinion) {
    return res.status(400).json({ success: false, mensaje: "Nombre y opinión requeridos" });
  }

  try {
    // Insertar la nueva opinión
    await db.query("INSERT INTO opinion (nombre, opinion) VALUES (?, ?)", [nombre, opinion]);

    //Traer solo las 3 más recientes (sin borrar las demás)
    const [ultimasOpiniones] = await db.query(`
      SELECT * FROM opinion
      ORDER BY id DESC
      LIMIT 3
    `);

    res.json({ success: true, mensaje: "Opinión agregada correctamente", opiniones: ultimasOpiniones });
  } catch (err) {
    console.error("Error en DB:", err);
    res.status(500).json({ success: false, mensaje: "Error al guardar opinión" });
  }
});

app.get("/ultimas-opiniones", async (req, res) => {
  try {
    const [ultimasOpiniones] = await db.query(`
      SELECT * FROM opinion
      ORDER BY id DESC
      LIMIT 3
    `);

    res.json({ success: true, opiniones: ultimasOpiniones });
  } catch (err) {
    console.error("Error en DB:", err);
    res.status(500).json({ success: false, mensaje: "Error al obtener opiniones" });
  }
});

//obtener todas las opiniones
app.get("/opiniones", async (req, res) => {
  try {
    const [todasOpiniones] = await db.query(`
      SELECT * FROM opinion
      ORDER BY id DESC
    `);

    res.json({ success: true, opiniones: todasOpiniones });
  } catch (err) {
    console.error("Error en DB:", err);
    res.status(500).json({ success: false, mensaje: "Error al obtener opiniones" });
  }
});

//borrar una opinión por id
app.delete("/opiniones/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM opinion WHERE id = ?", [id]);
    res.json({ success: true, mensaje: "Opinión eliminada correctamente" });
  } catch (err) {
    console.error("Error en DB:", err);
    res.status(500).json({ success: false, mensaje: "Error al eliminar opinión" });
  }
});

app.listen(5000, () => {
  console.log(" Servidor corriendo en http://localhost:5000");
});
