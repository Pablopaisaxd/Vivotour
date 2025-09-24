import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import db from "./db.js";
import { google } from "googleapis"; // Google OAuth2

dotenv.config();

const app = express();

// CORS (permitir frontend definido en .env o localhost por defecto)
const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "clave_super_secreta"; 

// ---------- GOOGLE OAUTH CONFIG ----------
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:5000/auth/google/callback"
);

// Endpoint para iniciar flujo OAuth (redirect a Google)
app.get("/auth/google", (req, res) => {
  // Validar configuración antes de generar URL
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({
      success: false,
      mensaje: "Faltan GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET en .env",
    });
  }
  if (!process.env.GOOGLE_REDIRECT_URI) {
    return res.status(500).json({
      success: false,
      mensaje: "Falta GOOGLE_REDIRECT_URI en .env",
    });
  }
  if (process.env.GOOGLE_CLIENT_ID.startsWith("TU_CLIENT_ID")) {
    return res.status(500).json({
      success: false,
      mensaje: "Reemplaza los valores de ejemplo GOOGLE_CLIENT_ID / SECRET por los reales de Google Cloud Console",
    });
  }
  const scopes = ["openid", "profile", "email"];
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
    state: req.query.state || ""
  });
  return res.redirect(url);
});

// Callback de Google
app.get("/auth/google/callback", async (req, res) => {
  try {
    const { code, error } = req.query;
    if (error) {
      console.error("Google OAuth error:", error);
      return res.redirect(`${allowedOrigin}/Login?error=google_oauth_cancelled`);
    }
    if (!code) return res.redirect(`${allowedOrigin}/Login?error=missing_code`);

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: oauth2Client, version: "v2" });
    const { data: profile } = await oauth2.userinfo.get();

    // Datos relevantes
    const email = profile.email;
    const nombre = profile.name || profile.given_name || email;

    if (!email) {
      return res.redirect(`${allowedOrigin}/Login?error=no_email`);
    }

    // Verificar / crear usuario
    try {
      const [rows] = await db.query("SELECT * FROM registros WHERE email = ?", [email]);
      if (rows.length === 0) {
        // Intentar insertar usuario mínimo
        try {
          await db.query(
            "INSERT INTO registros (nombre, email, password, celular, numeroDocumento, tipoDocumento) VALUES (?, ?, ?, ?, ?, ?)",
            [nombre, email, "", "", "", ""]
          );
        } catch (insertErr) {
          console.error("Error insertando usuario Google (posibles restricciones de la tabla):", insertErr);
        }
      }
    } catch (dbErr) {
      console.error("Error consultando usuario Google:", dbErr);
    }

    const token = jwt.sign(
      { nombre, email, numeroDocumento: "", tipoDocumento: "" },
      JWT_SECRET,
      { expiresIn: "3h" }
    );

    // Redirigir al frontend con el token (query param)
    return res.redirect(`${allowedOrigin}/Login?token=${token}`);
  } catch (err) {
    console.error("Error en callback Google:", err);
    return res.redirect(`${allowedOrigin}/Login?error=google_auth_failed`);
  }
});

// ---------- FACEBOOK OAUTH CONFIG ----------
// Iniciar flujo OAuth (redirect a Facebook)
app.get("/auth/facebook", (req, res) => {
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
    return res.status(500).json({
      success: false,
      mensaje: "Faltan FACEBOOK_APP_ID o FACEBOOK_APP_SECRET en .env",
    });
  }
  if (!process.env.FACEBOOK_REDIRECT_URI) {
    return res.status(500).json({ success: false, mensaje: "Falta FACEBOOK_REDIRECT_URI en .env" });
  }
  if (process.env.FACEBOOK_APP_ID.startsWith("TU_")) {
    return res.status(500).json({ success: false, mensaje: "Reemplaza los valores de ejemplo de Facebook por los reales" });
  }

  const clientId = process.env.FACEBOOK_APP_ID;
  const redirectUri = encodeURIComponent(process.env.FACEBOOK_REDIRECT_URI);
  const state = encodeURIComponent(req.query.state || "");
  const scopeStr = process.env.FACEBOOK_SCOPES || "email,public_profile"; // permite ajustar si email da error
  const scope = encodeURIComponent(scopeStr);

  const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&state=${state}`;
  return res.redirect(url);
});

// Callback de Facebook
app.get("/auth/facebook/callback", async (req, res) => {
  try {
    const { code, error } = req.query;
    if (error) {
      console.error("Facebook OAuth error:", error);
      return res.redirect(`${allowedOrigin}/Login?error=facebook_oauth_cancelled`);
    }
    if (!code) return res.redirect(`${allowedOrigin}/Login?error=missing_code`);

    const clientId = process.env.FACEBOOK_APP_ID;
    const clientSecret = process.env.FACEBOOK_APP_SECRET;
    const redirectUri = encodeURIComponent(process.env.FACEBOOK_REDIRECT_URI || "http://localhost:5000/auth/facebook/callback");

    // Intercambiar code por access_token
    const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}&code=${encodeURIComponent(code)}`);
    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      console.error("Facebook token error:", text);
      return res.redirect(`${allowedOrigin}/Login?error=facebook_token_failed`);
    }
    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token;

    // Obtener perfil del usuario
    const profileRes = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`);
    if (!profileRes.ok) {
      const text = await profileRes.text();
      console.error("Facebook profile error:", text);
      return res.redirect(`${allowedOrigin}/Login?error=facebook_profile_failed`);
    }
    const profile = await profileRes.json();

    const email = profile.email || `${profile.id}@facebook.local`;
    const nombre = profile.name || email;

    // Verificar / crear usuario en DB
    try {
      const [rows] = await db.query("SELECT * FROM registros WHERE email = ?", [email]);
      if (rows.length === 0) {
        try {
          await db.query(
            "INSERT INTO registros (nombre, email, password, celular, numeroDocumento, tipoDocumento) VALUES (?, ?, ?, ?, ?, ?)",
            [nombre, email, "", "", "", ""]
          );
        } catch (insertErr) {
          console.error("Error insertando usuario Facebook:", insertErr);
        }
      }
    } catch (dbErr) {
      console.error("Error consultando usuario Facebook:", dbErr);
    }

    const token = jwt.sign(
      { nombre, email, numeroDocumento: "", tipoDocumento: "" },
      JWT_SECRET,
      { expiresIn: "3h" }
    );

    return res.redirect(`${allowedOrigin}/Login?token=${token}`);
  } catch (err) {
    console.error("Error en callback Facebook:", err);
    return res.redirect(`${allowedOrigin}/Login?error=facebook_auth_failed`);
  }
});

// Endpoint de diagnóstico de Facebook
app.get('/auth/facebook/config-check', (req, res) => {
  res.json({
    FACEBOOK_APP_ID: !!process.env.FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET: !!process.env.FACEBOOK_APP_SECRET,
    FACEBOOK_REDIRECT_URI: process.env.FACEBOOK_REDIRECT_URI,
    FRONTEND_URL: allowedOrigin
  });
});

// Endpoint de diagnóstico para revisar variables (no exponer en producción)
app.get('/auth/google/config-check', (req, res) => {
  res.json({
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
    FRONTEND_URL: allowedOrigin
  });
});

// ---------- RECUPERAR CONTRASEÑA ----------
// Asegurar tabla para tokens de reseteo
(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expiresAt DATETIME NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (email),
        UNIQUE KEY uniq_token (token)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Tabla password_resets lista");
  } catch (e) {
    console.error("Error creando tabla password_resets:", e);
  }
})();

function createMailer() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP no configurado completamente. Define SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS en .env");
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: !!process.env.SMTP_SECURE && process.env.SMTP_SECURE !== "false", // true para 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

// Solicitar reset de contraseña
app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, mensaje: 'Email requerido' });

    // Buscar usuario (respuesta genérica para evitar enumeración)
    let userExists = false;
    try {
      const [rows] = await db.query("SELECT email FROM registros WHERE email = ?", [email]);
      userExists = rows.length > 0;
    } catch (e) {
      console.error('Error buscando usuario para reset:', e);
    }

    // Generar token y guardar si existe el usuario
    if (userExists) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hora
      try {
        await db.query("INSERT INTO password_resets (email, token, expiresAt) VALUES (?, ?, ?)", [email, token, expiresAt]);
      } catch (e) {
        console.error('Error guardando token reset:', e);
      }

      // Enviar email con enlace
      const transporter = createMailer();
      const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@localhost';
      const resetBase = process.env.RESET_URL || `${allowedOrigin}/reset`;
      const resetLink = `${resetBase}?token=${encodeURIComponent(token)}`;
      const mailOptions = {
        from,
        to: email,
        subject: 'Recuperación de contraseña - VivoTour',
        html: `
          <p>Hola,</p>
          <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>Este enlace expirará en 1 hora. Si no solicitaste este cambio, ignora este correo.</p>
        `,
      };
      try {
        await transporter.sendMail(mailOptions);
      } catch (e) {
        console.error('Error enviando correo de reset:', e);
        // Continuamos retornando éxito para no filtrar info
      }
    }

    return res.json({ success: true, mensaje: 'Si el email existe, se ha enviado un enlace de recuperación.' });
  } catch (err) {
    console.error('Error en /forgot-password:', err);
    return res.status(500).json({ success: false, mensaje: 'Error del servidor' });
  }
});

// Completar reset de contraseña
app.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ success: false, mensaje: 'Token y nueva contraseña requeridos' });

    const [rows] = await db.query("SELECT email, expiresAt FROM password_resets WHERE token = ?", [token]);
    if (rows.length === 0) return res.status(400).json({ success: false, mensaje: 'Token inválido' });
    const rec = rows[0];
    if (new Date(rec.expiresAt) < new Date()) return res.status(400).json({ success: false, mensaje: 'Token expirado' });

    // Actualizar contraseña (en tu sistema actual no hay hash; mantener consistencia)
    await db.query("UPDATE registros SET password = ? WHERE email = ?", [password, rec.email]);

    // Limpiar tokens usados
    await db.query("DELETE FROM password_resets WHERE email = ?", [rec.email]);

    return res.json({ success: true, mensaje: 'Contraseña actualizada correctamente' });
  } catch (err) {
    console.error('Error en /reset-password:', err);
    return res.status(500).json({ success: false, mensaje: 'Error del servidor' });
  }
});

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

// Alias para mayúscula usado en el frontend ("/Login")
app.post("/Login", (req, res) => {
  // Reutiliza la lógica existente llamando internamente a /login
  req.url = "/login"; // redirigir internamente
  app._router.handle(req, res, () => {});
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
