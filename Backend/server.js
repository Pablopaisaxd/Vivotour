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

// Función para asignar rol automáticamente basado en el email
function asignarRolPorEmail(email) {
  const emailLower = email.toLowerCase();
  
  // Admin específico
  if (emailLower === "pablogira71@gmail.com") {
    return 1; // Admin
  }
  
  // Empleados (dominio @vivotour.com)
  if (emailLower.endsWith("@vivotour.com")) {
    return 3; // Empleado
  }
  
  // Clientes (cualquier @gmail.com u otros dominios)
  return 2; // Cliente
}

// Middleware simple para verificar JWT en endpoints protegidos
function requireAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    if (!auth.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, mensaje: "No autorizado" });
    }
    const token = auth.slice("Bearer ".length);
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { nombre, email, numeroDocumento, tipoDocumento, ... }
    next();
  } catch (e) {
    return res.status(401).json({ success: false, mensaje: "Token inválido" });
  }
}

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

    // Verificar / crear usuario y obtener datos
    let celular = ""; let numeroDocumento = ""; let tipoDocumento = "";
    try {
      const [rows] = await db.query("SELECT * FROM accounts WHERE email = ?", [email]);
      if (rows.length === 0) {
        // Insertar usuario mínimo
        try {
          await db.query(
            "INSERT INTO accounts (nombre, email, password, celular, numeroDocumento, tipoDocumento) VALUES (?, ?, ?, ?, ?, ?)",
            [nombre, email, "", "", "", ""]
          );
        } catch (insertErr) {
          console.error("Error insertando usuario Google (posibles restricciones de la tabla):", insertErr);
        }
      } else {
        const u = rows[0];
        celular = u.celular || "";
        numeroDocumento = u.numeroDocumento || "";
        tipoDocumento = u.tipoDocumento || "";
      }
    } catch (dbErr) {
      console.error("Error consultando usuario Google:", dbErr);
    }

    const token = jwt.sign(
      { nombre, email, celular, numeroDocumento, tipoDocumento },
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

    // Verificar / crear usuario en DB y obtener datos
    let celular = ""; let numeroDocumento = ""; let tipoDocumento = "";
    try {
      const [rows] = await db.query("SELECT * FROM accounts WHERE email = ?", [email]);
      if (rows.length === 0) {
        try {
          await db.query(
            "INSERT INTO accounts (nombre, email, password, celular, numeroDocumento, tipoDocumento) VALUES (?, ?, ?, ?, ?, ?)",
            [nombre, email, "", "", "", ""]
          );
        } catch (insertErr) {
          console.error("Error insertando usuario Facebook:", insertErr);
        }
      } else {
        const u = rows[0];
        celular = u.celular || "";
        numeroDocumento = u.numeroDocumento || "";
        tipoDocumento = u.tipoDocumento || "";
      }
    } catch (dbErr) {
      console.error("Error consultando usuario Facebook:", dbErr);
    }

    const token = jwt.sign(
      { nombre, email, celular, numeroDocumento, tipoDocumento },
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

  // Crear tablas del sistema de reservas
  try {
    // Tabla de roles
    await db.query(`
      CREATE TABLE IF NOT EXISTS roles (
        IdRol INT AUTO_INCREMENT PRIMARY KEY,
        NombreRol VARCHAR(50) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Insertar roles por defecto si no existen
    await db.query(`
      INSERT IGNORE INTO roles (IdRol, NombreRol) VALUES 
      (1, 'Admin'),
      (2, 'Cliente'),
      (3, 'Empleado');
    `);
    console.log("Tabla roles lista");

    // Tabla de alojamientos
    await db.query(`
      CREATE TABLE IF NOT EXISTS alojamientos (
        IdAlojamiento INT AUTO_INCREMENT PRIMARY KEY,
        IdTipoAlojamiento INT NULL,
        IdEmpleado INT NULL,
        Descripcion TEXT,
        Proveedor VARCHAR(255),
        Ubicacion VARCHAR(50),
        Capacidad VARCHAR(40),
        FechaIngreso DATE NULL,
        FechaSalida DATE NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (IdEmpleado)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Tabla alojamientos lista");

    // Tabla de reservas actualizada
    await db.query(`
      CREATE TABLE IF NOT EXISTS reservas (
        IdReserva INT AUTO_INCREMENT PRIMARY KEY,
        IdAlojamiento INT,
        IdCliente INT NULL,
        FechaReserva DATE,
        FechaIngreso DATE,
        FechaSalida DATE,
        InformacionReserva TEXT,
        IdAccount INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (IdAlojamiento),
        INDEX (IdAccount),
        FOREIGN KEY (IdAccount) REFERENCES accounts(IdAccount) ON DELETE RESTRICT ON UPDATE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Tabla reservas actualizada lista");

  } catch (e) {
    console.error("Error creando tablas del sistema:", e);
  }

  // Crear tabla reservas antigua (para compatibilidad temporal)
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS reservas_old (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        estado ENUM('pendiente','confirmado') DEFAULT 'pendiente',
        detalles JSON NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Tabla reservas_old (backup) lista");
  } catch (e) {
    console.error("Error creando tabla reservas_old:", e);
  }

  // Asegurar columna email en opiniones para asociar al usuario
  try {
    const [cols] = await db.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='opiniones' AND COLUMN_NAME='email'");
    if (!cols || cols.length === 0) {
      await db.query("ALTER TABLE opiniones ADD COLUMN email VARCHAR(255) NULL AFTER nombre");
      console.log("Columna email agregada a opiniones");
    }
  } catch (e) {
    console.warn("No se pudo asegurar columna email en opiniones (puede existir ya):", e.code || e.message);
  }

  // Asegurar columna IdAccount en opiniones
  try {
    const [cols] = await db.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='opiniones' AND COLUMN_NAME='IdAccount'");
    if (!cols || cols.length === 0) {
      await db.query("ALTER TABLE opiniones ADD COLUMN IdAccount INT NULL AFTER email");
      console.log("Columna IdAccount agregada a opiniones");
    }
  } catch (e) {
    console.warn("No se pudo asegurar columna IdAccount en opiniones:", e.code || e.message);
  }

  // Asegurar columna IdRol en accounts
  try {
    const [cols] = await db.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='accounts' AND COLUMN_NAME='IdRol'");
    if (!cols || cols.length === 0) {
      await db.query("ALTER TABLE accounts ADD COLUMN IdRol INT NULL AFTER email");
      console.log("Columna IdRol agregada a accounts");
    }
  } catch (e) {
    console.warn("No se pudo asegurar columna IdRol en accounts:", e.code || e.message);
  }
})();

async function sendResetMail(toEmail, resetLink) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || 'no-reply@localhost';
  const mailOptions = {
    from,
    to: toEmail,
    subject: 'Recuperación de contraseña - VivoTour',
    html: `
      <p>Hola,</p>
      <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>Este enlace expirará en 1 hora. Si no solicitaste este cambio, ignora este correo.</p>
    `,
  };

  // Intento 1: usar SMTP real si está configurado
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: !!process.env.SMTP_SECURE && process.env.SMTP_SECURE !== "false", // true para 465
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      const info = await transporter.sendMail(mailOptions);
      return info;
    } catch (e) {
      const msg = String(e && e.message ? e.message : e);
      const isAuthError = e && (e.code === 'EAUTH' || /Invalid login|Username and Password not accepted/i.test(msg));
      if (!isAuthError) throw e; // si es otro error, no hacemos fallback
      console.warn('Fallo SMTP real (auth). Usando Ethereal para pruebas...');
    }
  } else {
    console.warn('SMTP no configurado completamente. Usando Ethereal para pruebas.');
  }

  // Intento 2 (fallback): Ethereal (solo pruebas)
  const testAccount = await nodemailer.createTestAccount();
  const testTransporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  const info = await testTransporter.sendMail(mailOptions);
  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) console.log('Vista previa del correo (Ethereal):', preview);
  return info;
}

// Solicitar reset de contraseña
app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, mensaje: 'Email requerido' });

    // Buscar usuario (respuesta genérica para evitar enumeración)
    let userExists = false;
    try {
      const [rows] = await db.query("SELECT email FROM accounts WHERE email = ?", [email]);
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
      const resetBase = process.env.RESET_URL || `${allowedOrigin}/reset`;
      const resetLink = `${resetBase}?token=${encodeURIComponent(token)}`;
      try {
        await sendResetMail(email, resetLink);
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
    await db.query("UPDATE accounts SET password = ? WHERE email = ?", [password, rec.email]);

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

    // Asignar rol automáticamente basado en el email
    const IdRol = asignarRolPorEmail(email);

    const query = `
      INSERT INTO accounts (nombre, email, password, celular, numeroDocumento, tipoDocumento, IdRol)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [resultado] = await db.query(query, [nombre, email, password, celular, numeroDocumento, tipoDocumento, IdRol]);

    // Obtener el nombre del rol para incluirlo en el token
    const [rolRows] = await db.query("SELECT NombreRol FROM roles WHERE IdRol = ?", [IdRol]);
    const nombreRol = rolRows.length > 0 ? rolRows[0].NombreRol : "Cliente";

    const token = jwt.sign({ 
      IdAccount: resultado.insertId,
      nombre, 
      email, 
      celular, 
      numeroDocumento, 
      tipoDocumento,
      IdRol,
      rol: nombreRol
    }, JWT_SECRET, { expiresIn: "3h" });

    res.json({
      success: true,
      mensaje: `Usuario registrado correctamente como ${nombreRol}`,
      token,
      rol: nombreRol
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
    // JOIN con roles para obtener información completa del usuario
    const [rows] = await db.query(`
      SELECT a.*, r.NombreRol 
      FROM accounts a 
      LEFT JOIN roles r ON a.IdRol = r.IdRol 
      WHERE a.email = ?
    `, [email]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, mensaje: "Usuario no encontrado" });
    }

    const user = rows[0];

    if (user.password !== password) { // temporal, sin encriptar
      return res.status(401).json({ success: false, mensaje: "Contraseña incorrecta" });
    }

    // Si el usuario no tiene rol asignado, asignarlo automáticamente
    let IdRol = user.IdRol;
    let nombreRol = user.NombreRol;
    
    if (!IdRol) {
      IdRol = asignarRolPorEmail(email);
      await db.query("UPDATE accounts SET IdRol = ? WHERE IdAccount = ?", [IdRol, user.IdAccount]);
      
      const [rolRows] = await db.query("SELECT NombreRol FROM roles WHERE IdRol = ?", [IdRol]);
      nombreRol = rolRows.length > 0 ? rolRows[0].NombreRol : "Cliente";
    }

    const token = jwt.sign({ 
      IdAccount: user.IdAccount,
      nombre: user.nombre,  
      email: user.email, 
      celular: user.celular, 
      numeroDocumento: user.numeroDocumento, 
      tipoDocumento: user.tipoDocumento,
      IdRol,
      rol: nombreRol
    }, JWT_SECRET, { expiresIn: "3h" });

    res.json({ 
      success: true, 
      mensaje: "Login exitoso", 
      token,
      rol: nombreRol,
      IdAccount: user.IdAccount
    });
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

// Completar perfil tras OAuth (o cuando falten datos)
// Requiere JWT en Authorization: Bearer <token>
app.post("/auth/complete-profile", requireAuth, async (req, res) => {
  try {
    const { celular, numeroDocumento, tipoDocumento } = req.body;
    if (!celular || !numeroDocumento || !tipoDocumento) {
      return res.status(400).json({ success: false, mensaje: "Todos los campos son obligatorios" });
    }

    const email = req.user.email;
    if (!email) return res.status(400).json({ success: false, mensaje: "Usuario inválido" });

    // Actualizar registros
    const [result] = await db.query(
      "UPDATE accounts SET celular = ?, numeroDocumento = ?, tipoDocumento = ? WHERE email = ?",
      [celular, numeroDocumento, tipoDocumento, email]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, mensaje: "Usuario no encontrado" });
    }

    // Obtener datos actualizados para token nuevo
    const [rows] = await db.query("SELECT nombre, email, celular, numeroDocumento, tipoDocumento FROM accounts WHERE email = ?", [email]);
    const u = rows[0];
    const newToken = jwt.sign({ nombre: u.nombre, email: u.email, celular: u.celular, numeroDocumento: u.numeroDocumento, tipoDocumento: u.tipoDocumento }, JWT_SECRET, { expiresIn: "3h" });

    return res.json({ success: true, mensaje: "Perfil actualizado", token: newToken });
  } catch (err) {
    console.error("Error en /auth/complete-profile:", err);
    return res.status(500).json({ success: false, mensaje: "Error del servidor" });
  }
});

app.post("/opinion", async (req, res) => {
  const { nombre, opinion } = req.body;
  if (!nombre || !opinion) {
    return res.status(400).json({ success: false, mensaje: "Nombre y opinión requeridos" });
  }

  try {
    // Capturar datos del usuario si viene autenticado
    let email = null;
    let IdAccount = null;
    try {
      const auth = req.headers.authorization || "";
      if (auth.startsWith("Bearer ")) {
        const token = auth.slice("Bearer ".length);
        const payload = jwt.verify(token, JWT_SECRET);
        email = payload.email || null;
        
        // Obtener IdAccount desde la tabla accounts
        if (email) {
          const [userRows] = await db.query("SELECT IdAccount FROM accounts WHERE email = ?", [email]);
          if (userRows.length > 0) {
            IdAccount = userRows[0].IdAccount;
          }
        }
      }
    } catch {}
    
    // Insertar la nueva opinión con relación a accounts
    await db.query(
      "INSERT INTO opiniones (nombre, email, opinion, IdAccount) VALUES (?, ?, ?, ?)", 
      [nombre, email, opinion, IdAccount]
    );

    //Traer solo las 3 más recientes (sin borrar las demás)
    const [ultimasOpiniones] = await db.query(`
      SELECT * FROM opiniones
      ORDER BY IdOpinion DESC
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
      SELECT * FROM opiniones
      ORDER BY IdOpinion DESC
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
      SELECT * FROM opiniones
      ORDER BY IdOpinion DESC
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
    await db.query("DELETE FROM opiniones WHERE IdOpinion = ?", [id]);
    res.json({ success: true, mensaje: "Opinión eliminada correctamente" });
  } catch (err) {
    console.error("Error en DB:", err);
    res.status(500).json({ success: false, mensaje: "Error al eliminar opinión" });
  }
});

// ----- Opiniones del usuario autenticado -----
app.get('/mis-opiniones', requireAuth, async (req, res) => {
  try {
    const email = req.user.email;
    
    // Obtener opiniones del usuario usando JOIN con accounts para mayor precisión
    const [rows] = await db.query(`
      SELECT 
        o.IdOpinion as id, 
        o.nombre, 
        o.opinion, 
        o.email,
        a.IdAccount,
        a.numeroDocumento,
        a.tipoDocumento
      FROM opiniones o
      LEFT JOIN accounts a ON o.IdAccount = a.IdAccount
      WHERE o.email = ? OR a.email = ?
      ORDER BY o.IdOpinion DESC
    `, [email, email]);
    
    res.json({ success: true, opiniones: rows });
  } catch (e) {
    console.error('Error obteniendo mis opiniones:', e);
    res.status(500).json({ success: false, mensaje: 'Error del servidor' });
  }
});

app.delete('/mis-opiniones/:id', requireAuth, async (req, res) => {
  try {
    const email = req.user.email;
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM opiniones WHERE IdOpinion = ? AND email = ?", [id, email]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, mensaje: 'Opinión no encontrada o no pertenece al usuario' });
    }
    res.json({ success: true, mensaje: 'Opinión eliminada' });
  } catch (e) {
    console.error('Error eliminando mi opinión:', e);
    res.status(500).json({ success: false, mensaje: 'Error del servidor' });
  }
});

// ----- Reservas del usuario autenticado -----
app.get('/mis-reservas', requireAuth, async (req, res) => {
  try {
    const IdAccount = req.user.IdAccount;
    
    // JOIN con alojamientos para obtener información completa
    const [rows] = await db.query(`
      SELECT 
        r.IdReserva,
        r.FechaReserva,
        r.FechaIngreso,
        r.FechaSalida,
        r.InformacionReserva,
        a.Descripcion as AlojamientoDescripcion,
        a.Ubicacion,
        a.Capacidad,
        a.Proveedor
      FROM reservas r
      LEFT JOIN alojamientos a ON r.IdAlojamiento = a.IdAlojamiento
      WHERE r.IdAccount = ?
      ORDER BY r.IdReserva DESC
    `, [IdAccount]);
    
    const reservas = rows.map(r => ({
      id: r.IdReserva,
      fechaReserva: r.FechaReserva,
      fechaIngreso: r.FechaIngreso,
      fechaSalida: r.FechaSalida,
      informacion: r.InformacionReserva,
      alojamiento: {
        descripcion: r.AlojamientoDescripcion,
        ubicacion: r.Ubicacion,
        capacidad: r.Capacidad,
        proveedor: r.Proveedor
      }
    }));
    
    res.json({ success: true, reservas });
  } catch (e) {
    console.error('Error obteniendo mis reservas:', e);
    res.status(500).json({ success: false, mensaje: 'Error del servidor' });
  }
});

app.delete('/reservas/:id', requireAuth, async (req, res) => {
  try {
    const IdAccount = req.user.IdAccount;
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM reservas WHERE IdReserva = ? AND IdAccount = ?", [id, IdAccount]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, mensaje: 'Reserva no encontrada o no pertenece al usuario' });
    }
    res.json({ success: true, mensaje: 'Reserva eliminada' });
  } catch (e) {
    console.error('Error eliminando reserva:', e);
    res.status(500).json({ success: false, mensaje: 'Error del servidor' });
  }
});

// ===== GESTIÓN DE ALOJAMIENTOS =====

// Obtener todos los alojamientos (público)
app.get('/alojamientos', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        a.*,
        emp.nombre as NombreEmpleado,
        emp.email as EmailEmpleado
      FROM alojamientos a
      LEFT JOIN accounts emp ON a.IdEmpleado = emp.IdAccount AND emp.IdRol = 3
      ORDER BY a.IdAlojamiento DESC
    `);
    
    res.json({ success: true, alojamientos: rows });
  } catch (e) {
    console.error('Error obteniendo alojamientos:', e);
    res.status(500).json({ success: false, mensaje: 'Error del servidor' });
  }
});

// Crear nuevo alojamiento (solo Admin y Empleados)
app.post('/alojamientos', requireAuth, async (req, res) => {
  try {
    const { IdRol } = req.user;
    
    // Verificar permisos (Admin=1 o Empleado=3)
    if (IdRol !== 1 && IdRol !== 3) {
      return res.status(403).json({ success: false, mensaje: 'Sin permisos para crear alojamientos' });
    }

    const { 
      IdTipoAlojamiento, 
      Descripcion, 
      Proveedor, 
      Ubicacion, 
      Capacidad, 
      FechaIngreso, 
      FechaSalida,
      IdEmpleado 
    } = req.body;

    // Validaciones
    if (!Descripcion || !Ubicacion || !Capacidad) {
      return res.status(400).json({ success: false, mensaje: 'Descripción, ubicación y capacidad son requeridos' });
    }

    const [resultado] = await db.query(`
      INSERT INTO alojamientos (
        IdTipoAlojamiento, IdEmpleado, Descripcion, Proveedor, 
        Ubicacion, Capacidad, FechaIngreso, FechaSalida
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      IdTipoAlojamiento || null,
      IdEmpleado || null,
      Descripcion,
      Proveedor || null,
      Ubicacion,
      Capacidad,
      FechaIngreso || null,
      FechaSalida || null
    ]);

    res.json({
      success: true,
      mensaje: 'Alojamiento creado correctamente',
      IdAlojamiento: resultado.insertId
    });
  } catch (e) {
    console.error('Error creando alojamiento:', e);
    res.status(500).json({ success: false, mensaje: 'Error del servidor' });
  }
});

// Crear nueva reserva
app.post('/reservas', requireAuth, async (req, res) => {
  try {
    const IdAccount = req.user.IdAccount;
    console.log('Datos del usuario autenticado:', req.user);
    console.log('IdAccount recibido:', IdAccount);

    if (!IdAccount) {
      return res.status(400).json({ 
        success: false, 
        mensaje: 'Usuario no tiene IdAccount válido. Por favor, inicia sesión nuevamente.' 
      });
    }

    const { 
      IdAlojamiento, 
      FechaIngreso, 
      FechaSalida, 
      InformacionReserva 
    } = req.body;

    console.log('Datos de la reserva recibidos:', req.body);

    // Validaciones
    if (!IdAlojamiento || !FechaIngreso || !FechaSalida) {
      return res.status(400).json({ 
        success: false, 
        mensaje: 'Alojamiento, fecha de ingreso y fecha de salida son requeridos' 
      });
    }

    // Verificar que el alojamiento existe
    const [alojamientoRows] = await db.query(
      "SELECT IdAlojamiento FROM alojamientos WHERE IdAlojamiento = ?", 
      [IdAlojamiento]
    );
    
    if (alojamientoRows.length === 0) {
      return res.status(404).json({ success: false, mensaje: 'Alojamiento no encontrado' });
    }

    // Verificar que el usuario existe
    const [userRows] = await db.query(
      "SELECT IdAccount FROM accounts WHERE IdAccount = ?", 
      [IdAccount]
    );
    
    if (userRows.length === 0) {
      return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado' });
    }

    console.log('Creando reserva con datos:', {
      IdAlojamiento,
      IdAccount,
      FechaIngreso,
      FechaSalida,
      InformacionReserva
    });

    // Crear la reserva
    const [resultado] = await db.query(`
      INSERT INTO reservas (
        IdAlojamiento, IdAccount, FechaReserva, FechaIngreso, FechaSalida, InformacionReserva
      ) VALUES (?, ?, CURDATE(), ?, ?, ?)
    `, [IdAlojamiento, IdAccount, FechaIngreso, FechaSalida, InformacionReserva || null]);

    console.log('Reserva creada exitosamente:', resultado.insertId);

    res.json({
      success: true,
      mensaje: 'Reserva creada correctamente',
      IdReserva: resultado.insertId
    });
  } catch (e) {
    console.error('Error detallado creando reserva:', e);
    res.status(500).json({ 
      success: false, 
      mensaje: 'Error del servidor: ' + e.message 
    });
  }
});

// Obtener empleados (para asignar a alojamientos)
app.get('/empleados', requireAuth, async (req, res) => {
  try {
    const { IdRol } = req.user;
    
    // Solo Admin puede ver lista de empleados
    if (IdRol !== 1) {
      return res.status(403).json({ success: false, mensaje: 'Sin permisos para ver empleados' });
    }

    const [rows] = await db.query(`
      SELECT IdAccount, nombre, email 
      FROM accounts 
      WHERE IdRol = 3 
      ORDER BY nombre
    `);
    
    res.json({ success: true, empleados: rows });
  } catch (e) {
    console.error('Error obteniendo empleados:', e);
    res.status(500).json({ success: false, mensaje: 'Error del servidor' });
  }
});

// Endpoint temporal para verificar token
app.get('/verify-token', requireAuth, (req, res) => {
  res.json({ 
    success: true, 
    user: req.user,
    hasIdAccount: !!req.user.IdAccount 
  });
});

// Endpoint temporal para insertar datos de prueba (GET para fácil acceso)
app.get('/setup-data', async (req, res) => {
  try {
    // Insertar alojamientos de ejemplo
    const alojamientos = [
      {
        Descripcion: 'Cabaña Familiar Vista al Río',
        Ubicacion: 'Sector Norte',
        Capacidad: '4-6 personas',
        Proveedor: 'VivoTour'
      },
      {
        Descripcion: 'Camping Premium con Servicios',
        Ubicacion: 'Zona Central',
        Capacidad: '2-4 personas',
        Proveedor: 'VivoTour'
      },
      {
        Descripcion: 'Casa de Campo Completa',
        Ubicacion: 'Sector Sur',
        Capacidad: '8-10 personas',
        Proveedor: 'Aliado Local'
      }
    ];

    for (const aloj of alojamientos) {
      await db.query(`
        INSERT IGNORE INTO alojamientos (Descripcion, Ubicacion, Capacidad, Proveedor)
        VALUES (?, ?, ?, ?)
      `, [aloj.Descripcion, aloj.Ubicacion, aloj.Capacidad, aloj.Proveedor]);
    }

    res.json({ success: true, mensaje: 'Datos de prueba insertados' });
  } catch (e) {
    console.error('Error insertando datos de prueba:', e);
    res.status(500).json({ success: false, mensaje: 'Error insertando datos' });
  }
});

// Endpoint temporal para insertar datos de prueba
app.post('/setup-data', async (req, res) => {
  try {
    // Insertar alojamientos de ejemplo
    const alojamientos = [
      {
        Descripcion: 'Cabaña Familiar Vista al Río',
        Ubicacion: 'Sector Norte',
        Capacidad: '4-6 personas',
        Proveedor: 'VivoTour'
      },
      {
        Descripcion: 'Camping Premium con Servicios',
        Ubicacion: 'Zona Central',
        Capacidad: '2-4 personas',
        Proveedor: 'VivoTour'
      },
      {
        Descripcion: 'Casa de Campo Completa',
        Ubicacion: 'Sector Sur',
        Capacidad: '8-10 personas',
        Proveedor: 'Aliado Local'
      }
    ];

    for (const aloj of alojamientos) {
      await db.query(`
        INSERT IGNORE INTO alojamientos (Descripcion, Ubicacion, Capacidad, Proveedor)
        VALUES (?, ?, ?, ?)
      `, [aloj.Descripcion, aloj.Ubicacion, aloj.Capacidad, aloj.Proveedor]);
    }

    res.json({ success: true, mensaje: 'Datos de prueba insertados' });
  } catch (e) {
    console.error('Error insertando datos de prueba:', e);
    res.status(500).json({ success: false, mensaje: 'Error insertando datos' });
  }
});

app.post("/opinion", async (req, res) => {
  const { nombre: nombreBody, opinion } = req.body;
  try {
    if (!opinion || String(opinion).trim().length === 0) {
      return res.status(400).json({ success: false, mensaje: "La opinión es requerida" });
    }

    // Capturar email del usuario si viene autenticado
    let email = null;
    try {
      const auth = req.headers.authorization || "";
      if (auth.startsWith("Bearer ")) {
        const token = auth.slice("Bearer ".length);
        const payload = jwt.verify(token, JWT_SECRET);
        email = payload.email || null;
      }
    } catch {}

    // Determinar el nombre a guardar
    let nombreFinal = nombreBody;
    if (email) {
      try {
        const [uRows] = await db.query("SELECT nombre FROM registros WHERE email = ? LIMIT 1", [email]);
        if (uRows && uRows.length > 0) {
          nombreFinal = uRows[0].nombre;
        }
      } catch (e) {
        console.warn('No se pudo obtener nombre desde registros:', e.message || e);
      }
    }

    if (!nombreFinal || String(nombreFinal).trim().length === 0) {
      return res.status(400).json({ success: false, mensaje: "El nombre es requerido" });
    }

    // Insertar la nueva opinión
    await db.query("INSERT INTO opinion (nombre, email, opinion) VALUES (?, ?, ?)", [nombreFinal, email, opinion]);

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

// ----- ENDPOINTS PARA DASHBOARD ADMIN -----

// Obtener estadísticas diarias de reservas
app.get('/admin/daily-stats', requireAuth, async (req, res) => {
  try {
    // Debug: Verificar qué contiene el token
    console.log('Token payload:', req.user);
    console.log('IdRol del usuario:', req.user.IdRol);
    console.log('Email del usuario:', req.user.email);
    
    // Verificar que sea admin
    if (req.user.IdRol !== 1) {
      return res.status(403).json({ 
        success: false, 
        mensaje: 'Acceso denegado. Solo administradores.',
        debug: {
          userRole: req.user.IdRol,
          email: req.user.email,
          requiredRole: 1
        }
      });
    }

    // Obtener estadísticas basadas en fechas de ingreso
    const [dailyStats] = await db.query(`
      SELECT 
        DATE(FechaIngreso) as fecha,
        COUNT(*) as reservas
      FROM reservas 
      WHERE FechaIngreso IS NOT NULL 
        AND FechaIngreso >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(FechaIngreso)
      ORDER BY fecha ASC
    `);

    console.log('Daily stats query result:', dailyStats);
    
    res.json({ success: true, data: dailyStats });
  } catch (error) {
    console.error('Error obteniendo estadísticas diarias:', error);
    res.status(500).json({ success: false, mensaje: 'Error del servidor' });
  }
});

// Obtener estadísticas totales
app.get('/admin/total-stats', requireAuth, async (req, res) => {
  try {
    // Debug: Verificar qué contiene el token
    console.log('Total-stats - Token payload:', req.user);
    
    // Verificar que sea admin
    if (req.user.IdRol !== 1) {
      return res.status(403).json({ 
        success: false, 
        mensaje: 'Acceso denegado. Solo administradores.',
        debug: {
          userRole: req.user.IdRol,
          email: req.user.email,
          requiredRole: 1
        }
      });
    }

    const [stats] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM accounts) as totalUsuarios,
        (SELECT COUNT(*) FROM reservas) as totalReservas,
        (SELECT COUNT(*) FROM reservas WHERE MONTH(FechaReserva) = MONTH(CURDATE()) AND YEAR(FechaReserva) = YEAR(CURDATE())) as reservasMesActual,
        (SELECT COUNT(*) FROM reservas WHERE MONTH(FechaReserva) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND YEAR(FechaReserva) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))) as reservasMesAnterior,
        (SELECT COUNT(*) FROM opiniones) as totalOpiniones
    `);

    res.json({ success: true, data: stats[0] });
  } catch (error) {
    console.error('Error obteniendo estadísticas totales:', error);
    res.status(500).json({ success: false, mensaje: 'Error del servidor' });
  }
});

// Obtener estadísticas de planes preferidos
app.get('/admin/preferred-plans', requireAuth, async (req, res) => {
  try {
    // Debug: Verificar qué contiene el token
    console.log('Preferred-plans - Token payload:', req.user);
    
    // Verificar que sea admin
    if (req.user.IdRol !== 1) {
      return res.status(403).json({ 
        success: false, 
        mensaje: 'Acceso denegado. Solo administradores.',
        debug: {
          userRole: req.user.IdRol,
          email: req.user.email,
          requiredRole: 1
        }
      });
    }

    const [planStats] = await db.query(`
      SELECT 
        CASE 
          WHEN InformacionReserva LIKE '%Cabaña Fénix%' OR InformacionReserva LIKE '%Fenix%' THEN 'Cabaña Fénix'
          WHEN InformacionReserva LIKE '%Plan Amanecer%' OR InformacionReserva LIKE '%Amanecer%' THEN 'Plan Amanecer del Río'
          WHEN InformacionReserva LIKE '%Camping%' OR InformacionReserva LIKE '%camping%' THEN 'Zona de Camping'
          WHEN InformacionReserva LIKE '%Cabalgata%' OR InformacionReserva LIKE '%cabalgata%' THEN 'Cabalgatas'
          WHEN InformacionReserva LIKE '%Aventureros%' THEN 'Cabaña Aventureros'
          ELSE 'Otros'
        END as planTipo,
        COUNT(*) as cantidad,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM reservas WHERE InformacionReserva IS NOT NULL AND InformacionReserva != '')), 2) as porcentaje
      FROM reservas 
      WHERE InformacionReserva IS NOT NULL AND InformacionReserva != ''
      GROUP BY planTipo
      HAVING planTipo != 'Otros'
      ORDER BY cantidad DESC
      LIMIT 4
    `);

    res.json({ success: true, data: planStats });
  } catch (error) {
    console.error('Error obteniendo planes preferidos:', error);
    res.status(500).json({ success: false, mensaje: 'Error del servidor' });
  }
});

app.listen(5000, () => {
  console.log(" Servidor corriendo en http://localhost:5000");
});
