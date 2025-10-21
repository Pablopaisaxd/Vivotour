import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import db from "./db.js";
import { google } from "googleapis"; // Google OAuth2
import Stripe from 'stripe'; // Stripe para pagos

dotenv.config();

// Configuración de Stripe
console.log('Configurando Stripe con clave:', process.env.STRIPE_SECRET_KEY ? 'Configurada ✓' : 'NO CONFIGURADA ❌');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS (permitir frontend definido en .env o localhost por defecto)
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5174", // Puerto alternativo de Vite
  "http://localhost:3000"  // Puerto de desarrollo común
];

// Mantener compatibilidad con código existente
const allowedOrigin = allowedOrigins[0];

app.use(cors({ 
  origin: allowedOrigins, 
  credentials: true 
}));
app.use(express.json());

// Servir archivos estáticos de la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de multer para subida de avatares
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads', 'avatars');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Usar el ID del usuario + timestamp para nombre único
    const userId = req.user.id;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${userId}_${timestamp}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Solo permitir imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

const JWT_SECRET = process.env.JWT_SECRET || "clave_super_secreta"; 

// Middleware para autenticar token JWT
const autenticarToken = (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    if (!auth.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, mensaje: "No autorizado" });
    }
    const token = auth.slice("Bearer ".length);
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, mensaje: "Token inválido" });
  }
}; 

// Función helper para convertir avatar path a URL completa
function getAvatarUrl(avatarPath) {
  if (!avatarPath) return null;
  if (avatarPath.startsWith('http')) return avatarPath; // Ya es URL completa
  return `http://localhost:5000${avatarPath}`;
}

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

    // Verificar / crear usuario y obtener datos con rol
    let celular = ""; let numeroDocumento = ""; let tipoDocumento = ""; let IdRol = null; let nombreRol = null;
    try {
      // Buscar usuario con JOIN para obtener rol
      const [rows] = await db.query(`
        SELECT a.*, r.NombreRol 
        FROM accounts a 
        LEFT JOIN roles r ON a.IdRol = r.IdRol 
        WHERE a.email = ?
      `, [email]);
      
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
      }
      
      // Consultar el usuario para obtener IdAccount y datos actualizados con rol
      const [userRows] = await db.query(`
        SELECT a.*, r.NombreRol 
        FROM accounts a 
        LEFT JOIN roles r ON a.IdRol = r.IdRol 
        WHERE a.email = ?
      `, [email]);
      
      if (userRows.length > 0) {
        const u = userRows[0];
        celular = u.celular || "";
        numeroDocumento = u.numeroDocumento || "";
        tipoDocumento = u.tipoDocumento || "";
        var IdAccount = u.IdAccount;
        
        // Si el usuario no tiene rol asignado, asignarlo automáticamente
        IdRol = u.IdRol;
        nombreRol = u.NombreRol;
        
        if (!IdRol) {
          IdRol = asignarRolPorEmail(email);
          await db.query("UPDATE accounts SET IdRol = ? WHERE IdAccount = ?", [IdRol, IdAccount]);
          
          const [rolRows] = await db.query("SELECT NombreRol FROM roles WHERE IdRol = ?", [IdRol]);
          nombreRol = rolRows.length > 0 ? rolRows[0].NombreRol : "Cliente";
        }
      }
    } catch (dbErr) {
      console.error("Error consultando usuario Google:", dbErr);
    }

      const token = jwt.sign(
        { IdAccount, nombre, email, celular, numeroDocumento, tipoDocumento, IdRol, rol: nombreRol },
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

    // Verificar / crear usuario en DB y obtener datos con rol
    let celular = ""; let numeroDocumento = ""; let tipoDocumento = ""; let IdRol = null; let nombreRol = null;
    try {
      // Buscar usuario con JOIN para obtener rol
      const [rows] = await db.query(`
        SELECT a.*, r.NombreRol 
        FROM accounts a 
        LEFT JOIN roles r ON a.IdRol = r.IdRol 
        WHERE a.email = ?
      `, [email]);
      
      if (rows.length === 0) {
        try {
          await db.query(
            "INSERT INTO accounts (nombre, email, password, celular, numeroDocumento, tipoDocumento) VALUES (?, ?, ?, ?, ?, ?)",
            [nombre, email, "", "", "", ""]
          );
        } catch (insertErr) {
          console.error("Error insertando usuario Facebook:", insertErr);
        }
      }
      
      // Consultar el usuario para obtener IdAccount y datos actualizados con rol
      const [userRows] = await db.query(`
        SELECT a.*, r.NombreRol 
        FROM accounts a 
        LEFT JOIN roles r ON a.IdRol = r.IdRol 
        WHERE a.email = ?
      `, [email]);
      
      if (userRows.length > 0) {
        const u = userRows[0];
        celular = u.celular || "";
        numeroDocumento = u.numeroDocumento || "";
        tipoDocumento = u.tipoDocumento || "";
        var IdAccount = u.IdAccount;
        
        // Si el usuario no tiene rol asignado, asignarlo automáticamente
        IdRol = u.IdRol;
        nombreRol = u.NombreRol;
        
        if (!IdRol) {
          IdRol = asignarRolPorEmail(email);
          await db.query("UPDATE accounts SET IdRol = ? WHERE IdAccount = ?", [IdRol, IdAccount]);
          
          const [rolRows] = await db.query("SELECT NombreRol FROM roles WHERE IdRol = ?", [IdRol]);
          nombreRol = rolRows.length > 0 ? rolRows[0].NombreRol : "Cliente";
        }
      }
    } catch (dbErr) {
      console.error("Error consultando usuario Facebook:", dbErr);
    }

      const token = jwt.sign(
        { IdAccount, nombre, email, celular, numeroDocumento, tipoDocumento, IdRol, rol: nombreRol },
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
        CantidadAdultos INT DEFAULT 0,
        CantidadNinos INT DEFAULT 0,
        InformacionReserva TEXT,
        IdAccount INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (IdAlojamiento),
        INDEX (IdAccount),
        FOREIGN KEY (IdAccount) REFERENCES accounts(IdAccount) ON DELETE RESTRICT ON UPDATE RESTRICT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    
    // Agregar columnas si no existen (para migración)
    try {
      await db.query(`
        ALTER TABLE reservas ADD COLUMN IF NOT EXISTS CantidadAdultos INT DEFAULT 0
      `);
    } catch (e) {
      // Ignorar si la columna ya existe
    }
    
    try {
      await db.query(`
        ALTER TABLE reservas ADD COLUMN IF NOT EXISTS CantidadNinos INT DEFAULT 0
      `);
    } catch (e) {
      // Ignorar si la columna ya existe
    }
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

  // Asegurar columna avatar en accounts
  try {
    const [avatarCols] = await db.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='accounts' AND COLUMN_NAME='avatar'");
    if (!avatarCols || avatarCols.length === 0) {
      await db.query("ALTER TABLE accounts ADD COLUMN avatar VARCHAR(500) NULL AFTER IdRol");
      console.log("Columna avatar agregada a accounts");
    }
  } catch (e) {
    console.warn("No se pudo asegurar columna avatar en accounts:", e.code || e.message);
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
    console.log('[LOGIN] Intento de login para:', email);

    // JOIN con roles para obtener información completa del usuario incluyendo avatar
    const [rows] = await db.query(`
      SELECT a.IdAccount, a.nombre, a.email, a.celular, a.numeroDocumento, a.tipoDocumento, a.password, a.IdRol, a.avatar, r.NombreRol 
      FROM accounts a 
      LEFT JOIN roles r ON a.IdRol = r.IdRol 
      WHERE a.email = ?
    `, [email]);

    if (rows.length === 0) {
      console.log('[LOGIN] Usuario no encontrado:', email);
      return res.status(401).json({ success: false, mensaje: "Usuario no encontrado" });
    }

    const user = rows[0];
    console.log('[LOGIN] Usuario encontrado:', {
      IdAccount: user.IdAccount,
      nombre: user.nombre,
      email: user.email,
      avatar: user.avatar
    });

    if (user.password !== password) { // temporal, sin encriptar
      console.log('[LOGIN] Contraseña incorrecta para:', email);
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
      rol: nombreRol,
      avatar: getAvatarUrl(user.avatar)
    }, JWT_SECRET, { expiresIn: "3h" });

    console.log('[LOGIN] Token generado con avatar:', getAvatarUrl(user.avatar));

    res.json({ 
      success: true, 
      mensaje: "Login exitoso", 
      token,
      rol: nombreRol,
      IdAccount: user.IdAccount,
      user: {
        IdAccount: user.IdAccount,
        nombre: user.nombre,
        email: user.email,
        celular: user.celular,
        numeroDocumento: user.numeroDocumento,
        tipoDocumento: user.tipoDocumento,
        IdRol,
        rol: nombreRol,
        avatar: getAvatarUrl(user.avatar)
      }
    });
  } catch (error) {
    console.error("Error en DB:", error);
    res.status(500).json({ success: false, mensaje: "Error del servidor" });
  }
});

// Alias para mayúscula usado en el frontend ("/Login")
app.post("/Login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Usuarios de prueba temporal mientras solucionamos la DB
    const testUsers = {
      'pablogira71@gmail.com': {
        IdAccount: 1,
        nombre: 'Pablo Gira',
        email: 'pablogira71@gmail.com',
        password: '123',
        celular: '123456789',
        numeroDocumento: '12345678',
        tipoDocumento: 'CC',
        IdRol: 1,
        rol: 'Admin',
        avatar: null
      },
      'test@gmail.com': {
        IdAccount: 2,
        nombre: 'Usuario Test',
        email: 'test@gmail.com',
        password: '123',
        celular: '987654321',
        numeroDocumento: '87654321',
        tipoDocumento: 'CC',
        IdRol: 2,
        rol: 'Cliente',
        avatar: null
      }
    };

    // Verificar si la DB está disponible
    let useDatabase = true;
    try {
      await db.query('SELECT 1');
    } catch (dbError) {
      console.log('DB no disponible, usando usuarios de prueba');
      useDatabase = false;
    }

    if (useDatabase) {
      console.log('[LOGIN-CAPS] Usando base de datos para:', email);

      // Usar base de datos si está disponible
      const [rows] = await db.query(`
        SELECT a.IdAccount, a.nombre, a.email, a.celular, a.numeroDocumento, a.tipoDocumento, a.password, a.IdRol, a.avatar, r.NombreRol 
        FROM accounts a 
        LEFT JOIN roles r ON a.IdRol = r.IdRol 
        WHERE a.email = ?
      `, [email]);

      if (rows.length === 0) {
        return res.status(401).json({ success: false, mensaje: "Usuario no encontrado" });
      }

      const user = rows[0];
      console.log('[LOGIN-CAPS] Usuario encontrado:', {
        IdAccount: user.IdAccount,
        nombre: user.nombre,
        email: user.email,
        avatar: user.avatar
      });

      if (user.password !== password) {
        return res.status(401).json({ success: false, mensaje: "Contraseña incorrecta" });
      }

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
        rol: nombreRol,
        avatar: getAvatarUrl(user.avatar)
      }, JWT_SECRET, { expiresIn: "3h" });

      console.log('[LOGIN-CAPS] Token generado con avatar:', getAvatarUrl(user.avatar));

      return res.json({ 
        success: true, 
        token, 
        user: {
          IdAccount: user.IdAccount,
          nombre: user.nombre,
          email: user.email,
          celular: user.celular,
          numeroDocumento: user.numeroDocumento,
          tipoDocumento: user.tipoDocumento,
          IdRol,
          rol: nombreRol,
          avatar: getAvatarUrl(user.avatar)
        }
      });
    } else {
      // Fallback a usuarios de prueba
      const user = testUsers[email];
      
      if (!user) {
        return res.status(401).json({ success: false, mensaje: "Usuario no encontrado. Prueba: pablogira71@gmail.com o test@gmail.com con contraseña: 123" });
      }

      if (user.password !== password) {
        return res.status(401).json({ success: false, mensaje: "Contraseña incorrecta. Prueba: 123" });
      }

      const token = jwt.sign({ 
        IdAccount: user.IdAccount,
        nombre: user.nombre,  
        email: user.email, 
        celular: user.celular, 
        numeroDocumento: user.numeroDocumento, 
        tipoDocumento: user.tipoDocumento,
        IdRol: user.IdRol,
        rol: user.rol,
        avatar: getAvatarUrl(user.avatar)
      }, JWT_SECRET, { expiresIn: "3h" });

      return res.json({ 
        success: true, 
        token, 
        user: {
          IdAccount: user.IdAccount,
          nombre: user.nombre,
          email: user.email,
          celular: user.celular,
          numeroDocumento: user.numeroDocumento,
          tipoDocumento: user.tipoDocumento,
          IdRol: user.IdRol,
          rol: user.rol,
          avatar: getAvatarUrl(user.avatar)
        }
      });
    }
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ success: false, mensaje: "Error del servidor" });
  }
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

// Obtener una reserva específica
app.get('/api/reserva/:id', autenticarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const IdAccount = req.user.IdAccount;

    const [rows] = await db.execute(`
      SELECT * FROM reservas 
      WHERE IdReserva = ? AND IdAccount = ?
    `, [id, IdAccount]);

    if (rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        mensaje: 'Reserva no encontrada o no autorizada' 
      });
    }

    res.json({
      success: true,
      reserva: rows[0]
    });

  } catch (error) {
    console.error('Error obteniendo reserva:', error);
    res.status(500).json({ 
      success: false, 
      mensaje: 'Error del servidor' 
    });
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
      CantidadAdultos,
      CantidadNinos,
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
      CantidadAdultos,
      CantidadNinos,
      InformacionReserva
    });

    // Crear la reserva
    const [resultado] = await db.query(`
      INSERT INTO reservas (
        IdAlojamiento, IdAccount, FechaReserva, FechaIngreso, FechaSalida, CantidadAdultos, CantidadNinos, InformacionReserva
      ) VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?)
    `, [IdAlojamiento, IdAccount, FechaIngreso, FechaSalida, CantidadAdultos || 0, CantidadNinos || 0, InformacionReserva || null]);

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

// Actualizar nombre y email del usuario autenticado
app.put('/usuario/update', requireAuth, async (req, res) => {
  try {
    const { nombre, email } = req.body;
    const userId = req.user.IdAccount || req.user.id || req.user.IdCliente;
    console.log('[UPDATE USUARIO] Datos recibidos:', { userId, nombre, email });
    console.log('[UPDATE USUARIO] Usuario completo:', req.user);
    
    if (!userId) {
      console.log('[UPDATE USUARIO] Usuario no identificado');
      return res.status(400).json({ success: false, mensaje: 'Usuario no identificado' });
    }

    // Verificar si la DB está disponible
    let useDatabase = true;
    try {
      await db.query('SELECT 1');
    } catch (dbError) {
      console.log('[UPDATE USUARIO] DB no disponible, usando datos del token');
      useDatabase = false;
    }

    if (useDatabase) {
      // Usar base de datos si está disponible
      if (nombre) {
        const [result] = await db.query('UPDATE accounts SET nombre = ? WHERE IdAccount = ?', [nombre, userId]);
        console.log('[UPDATE USUARIO] Resultado nombre:', result);
      }
      if (email) {
        const [result] = await db.query('UPDATE accounts SET email = ? WHERE IdAccount = ?', [email, userId]);
        console.log('[UPDATE USUARIO] Resultado email:', result);
      }
      
      const [[updatedUser]] = await db.query(`
        SELECT a.IdAccount, a.nombre, a.email, a.celular, a.numeroDocumento, a.tipoDocumento, a.IdRol, r.NombreRol as rol
        FROM accounts a
        LEFT JOIN roles r ON a.IdRol = r.IdRol
        WHERE a.IdAccount = ?
      `, [userId]);
      
      console.log('[UPDATE USUARIO] Usuario actualizado desde DB:', updatedUser);
      
      // Generar nuevo token JWT con información actualizada
      const newToken = jwt.sign({ 
        IdAccount: updatedUser.IdAccount,
        nombre: updatedUser.nombre,  
        email: updatedUser.email, 
        celular: updatedUser.celular, 
        numeroDocumento: updatedUser.numeroDocumento, 
        tipoDocumento: updatedUser.tipoDocumento,
        IdRol: updatedUser.IdRol,
        rol: updatedUser.rol
      }, JWT_SECRET, { expiresIn: "3h" });
      
      return res.json({ success: true, usuario: updatedUser, token: newToken });
    } else {
      // Fallback: devolver datos actualizados basados en el token
      const updatedUser = {
        IdAccount: req.user.IdAccount,
        nombre: nombre || req.user.nombre,
        email: email || req.user.email,
        celular: req.user.celular,
        numeroDocumento: req.user.numeroDocumento,
        tipoDocumento: req.user.tipoDocumento,
        IdRol: req.user.IdRol,
        rol: req.user.rol
      };
      
      // Generar nuevo token JWT con información actualizada
      const newToken = jwt.sign({ 
        IdAccount: updatedUser.IdAccount,
        nombre: updatedUser.nombre,  
        email: updatedUser.email, 
        celular: updatedUser.celular, 
        numeroDocumento: updatedUser.numeroDocumento, 
        tipoDocumento: updatedUser.tipoDocumento,
        IdRol: updatedUser.IdRol,
        rol: updatedUser.rol
      }, JWT_SECRET, { expiresIn: "3h" });
      
      console.log('[UPDATE USUARIO] Usuario actualizado desde token:', updatedUser);
      return res.json({ success: true, usuario: updatedUser, token: newToken });
    }
  } catch (e) {
    console.error('[UPDATE USUARIO] Error actualizando usuario:', e);
    return res.status(500).json({ success: false, mensaje: 'Error actualizando usuario' });
  }
});

// Endpoint para subir avatar
app.post("/upload-avatar", requireAuth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, mensaje: "No se subió ningún archivo" });
    }

    const userId = req.user.IdAccount || req.user.id;
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    console.log('[UPLOAD AVATAR] Usuario ID:', userId);
    console.log('[UPLOAD AVATAR] Archivo:', req.file.filename);

    // Buscar avatar anterior para eliminarlo
    const [userResult] = await db.query("SELECT avatar FROM accounts WHERE IdAccount = ?", [userId]);
    
    if (userResult.length > 0 && userResult[0].avatar) {
      const oldAvatarPath = path.join(__dirname, userResult[0].avatar);
      if (fs.existsSync(oldAvatarPath)) {
        try {
          fs.unlinkSync(oldAvatarPath);
          console.log('[UPLOAD AVATAR] Avatar anterior eliminado:', oldAvatarPath);
        } catch (e) {
          console.warn('[UPLOAD AVATAR] No se pudo eliminar avatar anterior:', e.message);
        }
      }
    }

    // Actualizar avatar en la base de datos
    await db.query("UPDATE accounts SET avatar = ? WHERE IdAccount = ?", [avatarUrl, userId]);

    // Obtener usuario actualizado
    const [[updatedUser]] = await db.query(`
      SELECT a.IdAccount, a.nombre, a.email, a.celular, a.numeroDocumento, a.tipoDocumento, a.IdRol, a.avatar, r.NombreRol as rol
      FROM accounts a
      LEFT JOIN roles r ON a.IdRol = r.IdRol
      WHERE a.IdAccount = ?
    `, [userId]);

    // Generar nuevo token con avatar actualizado
    const newToken = jwt.sign({ 
      IdAccount: updatedUser.IdAccount,
      nombre: updatedUser.nombre,  
      email: updatedUser.email, 
      celular: updatedUser.celular, 
      numeroDocumento: updatedUser.numeroDocumento, 
      tipoDocumento: updatedUser.tipoDocumento,
      IdRol: updatedUser.IdRol,
      rol: updatedUser.rol,
      avatar: getAvatarUrl(updatedUser.avatar)
    }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      success: true,
      mensaje: "Avatar actualizado correctamente",
      avatarUrl: getAvatarUrl(avatarUrl),
      token: newToken,
      user: {
        IdAccount: updatedUser.IdAccount,
        nombre: updatedUser.nombre,
        email: updatedUser.email,
        celular: updatedUser.celular,
        numeroDocumento: updatedUser.numeroDocumento,
        tipoDocumento: updatedUser.tipoDocumento,
        IdRol: updatedUser.IdRol,
        rol: updatedUser.rol,
        avatar: getAvatarUrl(updatedUser.avatar)
      }
    });

  } catch (error) {
    console.error("Error al subir avatar:", error);
    // Si hay error, eliminar el archivo subido
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        console.warn("No se pudo eliminar archivo temporal:", e.message);
      }
    }
    res.status(500).json({ success: false, mensaje: "Error interno del servidor" });
  }
});

// ============================================
// GALERÍA - ENDPOINTS PARA ADMINISTRACIÓN
// ============================================

// Función para crear categorías de galería automáticamente
const createGalleryCategories = async () => {
  try {
    // Crear tabla CategoriaImagen si no existe
    await db.query(`
      CREATE TABLE IF NOT EXISTS CategoriaImagen (
        IdCategoria INT AUTO_INCREMENT PRIMARY KEY,
        NombreCategoria VARCHAR(255) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Crear tabla imagenes si no existe
    await db.query(`
      CREATE TABLE IF NOT EXISTS imagenes (
        IdImagen INT AUTO_INCREMENT PRIMARY KEY,
        RutaImagen VARCHAR(255) NOT NULL,
        IdCategoria INT,
        FOREIGN KEY (IdCategoria) REFERENCES CategoriaImagen(IdCategoria) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Insertar categorías predefinidas
    const categories = [
      { id: 1, name: 'Fauna' },
      { id: 2, name: 'Flora' },
      { id: 3, name: 'Río' },
      { id: 4, name: 'Cabañas' },
      { id: 5, name: 'Puentes' },
      { id: 6, name: 'Cabalgatas' },
      { id: 7, name: 'Experiencias' }
    ];

    for (const cat of categories) {
      await db.query(`
        INSERT IGNORE INTO CategoriaImagen (IdCategoria, NombreCategoria) 
        VALUES (?, ?)
      `, [cat.id, cat.name]);
    }

    console.log('Tablas y categorías de galería creadas correctamente');
  } catch (error) {
    console.error('Error creando estructura de galería:', error);
  }
};

// Ejecutar la función al iniciar el servidor
createGalleryCategories();

// Configuración de multer para galería
const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads', 'gallery');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `gallery_${timestamp}_${Math.random().toString(36).substring(7)}${ext}`;
    cb(null, filename);
  }
});

const galleryUpload = multer({
  storage: galleryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// Middleware para verificar admin

const verificarAdmin = (req, res, next) => {
  if (req.user.IdRol !== 1) {
    return res.status(403).json({ success: false, mensaje: "Acceso denegado. Solo administradores." });
  }
  next();
};

// Obtener todas las categorías de imágenes
app.get('/api/gallery/categories', autenticarToken, verificarAdmin, async (req, res) => {
  try {
    const query = 'SELECT * FROM CategoriaImagen ORDER BY IdCategoria';
    const [results] = await db.execute(query);
    res.json({ success: true, categories: results });
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({ success: false, mensaje: 'Error obteniendo categorías' });
  }
});

// Obtener imágenes por categoría
app.get('/api/gallery/images/:categoryId', autenticarToken, verificarAdmin, async (req, res) => {
  try {
    const { categoryId } = req.params;
    const query = 'SELECT * FROM imagenes WHERE IdCategoria = ? ORDER BY IdImagen';
    const [results] = await db.execute(query, [categoryId]);
    res.json({ success: true, images: results });
  } catch (error) {
    console.error('Error obteniendo imágenes:', error);
    res.status(500).json({ success: false, mensaje: 'Error obteniendo imágenes' });
  }
});

// Subir múltiples imágenes a una categoría
app.post('/api/gallery/upload/:categoryId', autenticarToken, verificarAdmin, galleryUpload.array('images', 20), async (req, res) => {
  try {
    const { categoryId } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, mensaje: 'No se subieron archivos' });
    }

    const insertedImages = [];
    
    for (const file of files) {
      const rutaImagen = `/uploads/gallery/${file.filename}`;
      const query = 'INSERT INTO imagenes (RutaImagen, IdCategoria) VALUES (?, ?)';
      const [result] = await db.execute(query, [rutaImagen, categoryId]);
      
      insertedImages.push({
        IdImagen: result.insertId,
        RutaImagen: rutaImagen,
        IdCategoria: categoryId
      });
    }

    res.json({ success: true, images: insertedImages });
  } catch (error) {
    console.error('Error subiendo imágenes:', error);
    res.status(500).json({ success: false, mensaje: 'Error subiendo imágenes' });
  }
});

// Eliminar imagen
app.delete('/api/gallery/image/:imageId', autenticarToken, verificarAdmin, async (req, res) => {
  try {
    const { imageId } = req.params;
    
    // Obtener información de la imagen antes de eliminar
    const selectQuery = 'SELECT * FROM imagenes WHERE IdImagen = ?';
    const [images] = await db.execute(selectQuery, [imageId]);
    
    if (images.length === 0) {
      return res.status(404).json({ success: false, mensaje: 'Imagen no encontrada' });
    }

    const imagen = images[0];
    
    // Eliminar de base de datos
    const deleteQuery = 'DELETE FROM imagenes WHERE IdImagen = ?';
    await db.execute(deleteQuery, [imageId]);

    // Intentar eliminar archivo físico solo si está en uploads (no assets)
    if (imagen.RutaImagen.includes('/uploads/')) {
      const filePath = path.join(__dirname, imagen.RutaImagen.replace(/^\//, ''));
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {
        console.warn('No se pudo eliminar archivo físico:', e.message);
      }
    }

    res.json({ success: true, mensaje: 'Imagen eliminada correctamente' });
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    res.status(500).json({ success: false, mensaje: 'Error eliminando imagen' });
  }
});

// Actualizar imagen de portada de categoría
app.put('/api/gallery/category/:categoryId/cover', autenticarToken, verificarAdmin, galleryUpload.single('coverImage'), async (req, res) => {
  try {
    const { categoryId } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, mensaje: 'No se subió archivo de portada' });
    }

    const rutaImagen = `/uploads/gallery/${file.filename}`;
    
    // Insertar nueva imagen de portada en la base de datos
    const query = 'INSERT INTO imagenes (RutaImagen, IdCategoria) VALUES (?, ?)';
    const [result] = await db.execute(query, [rutaImagen, categoryId]);

    const newCoverImage = {
      IdImagen: result.insertId,
      RutaImagen: rutaImagen,
      IdCategoria: categoryId
    };

    res.json({ success: true, coverImage: newCoverImage });
  } catch (error) {
    console.error('Error actualizando portada:', error);
    res.status(500).json({ success: false, mensaje: 'Error actualizando portada' });
  }
});

// ============================================
// SISTEMA DE PAGOS CON STRIPE
// ============================================

// Función para crear datos iniciales de las tablas de pago
const createPaymentInitialData = async () => {
  try {
    // Insertar tipos de pago
    const paymentTypes = [
      { id: 1, name: 'Tarjeta de Crédito' },
      { id: 2, name: 'Tarjeta de Débito' },
      { id: 3, name: 'PayPal' },
      { id: 4, name: 'Transferencia Bancaria' }
    ];

    for (const type of paymentTypes) {
      await db.query(`
        INSERT IGNORE INTO tipopagos (IdTipoPago, NombreTipoPago) 
        VALUES (?, ?)
      `, [type.id, type.name]);
    }

    // Insertar estados de pago
    const paymentStates = [
      { id: 1, name: 'Pendiente', description: 'Pago en proceso de verificación' },
      { id: 2, name: 'Completado', description: 'Pago procesado exitosamente' },
      { id: 3, name: 'Fallido', description: 'Error en el procesamiento del pago' },
      { id: 4, name: 'Cancelado', description: 'Pago cancelado por el usuario' },
      { id: 5, name: 'Reembolsado', description: 'Pago devuelto al cliente' },
      { id: 6, name: 'Rechazado', description: 'Pago rechazado por el banco' }
    ];

    for (const state of paymentStates) {
      await db.query(`
        INSERT IGNORE INTO estadopago (IdEstadoPago, Nombre, Descripcion) 
        VALUES (?, ?, ?)
      `, [state.id, state.name, state.description]);
    }

    console.log('Datos iniciales de pagos creados correctamente');
  } catch (error) {
    console.error('Error creando datos iniciales de pagos:', error);
  }
};

// Ejecutar función de datos iniciales
createPaymentInitialData();

// Crear Payment Intent para Stripe
app.post('/api/payment/create-intent', autenticarToken, async (req, res) => {
  try {
    const { reservaId, amount, currency = 'cop' } = req.body;
    
    if (!reservaId || !amount) {
      return res.status(400).json({ 
        success: false, 
        mensaje: 'reservaId y amount son requeridos' 
      });
    }

    // Verificar que la reserva pertenece al usuario autenticado
    const [reservaResults] = await db.execute(
      'SELECT * FROM reservas WHERE IdReserva = ? AND IdAccount = ?', 
      [reservaId, req.user.IdAccount]
    );

    if (reservaResults.length === 0) {
      return res.status(404).json({ 
        success: false, 
        mensaje: 'Reserva no encontrada o no autorizada' 
      });
    }

    // MODO DE DESARROLLO: Simular PaymentIntent mientras configuramos Stripe
    if (process.env.NODE_ENV === 'development' || !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('sk_test_51QKT')) {
      console.log('Modo desarrollo: Simulando PaymentIntent');
      
      // Crear un PaymentIntent simulado
      const mockPaymentIntent = {
        id: `pi_mock_${Date.now()}`,
        client_secret: `pi_mock_${Date.now()}_secret_test123`,
        amount: amount,
        currency: currency,
        status: 'requires_payment_method'
      };

      // Registrar pago en BD con estado pendiente
      const [paymentResult] = await db.execute(`
        INSERT INTO pagos (
          IdTipoPago, IdAccount, IdReserva, IdEstadoPago, 
          Monto, Moneda, ProveedorPago, ReferenciaPasarela, 
          DescripcionPago, FechaPago
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        1, // Tarjeta de crédito por defecto
        req.user.IdAccount,
        reservaId,
        1, // Estado pendiente
        amount,
        currency,
        'Stripe_Mock',
        mockPaymentIntent.id,
        `Pago simulado para reserva #${reservaId}`,
      ]);

      return res.json({
        success: true,
        clientSecret: mockPaymentIntent.client_secret,
        paymentId: paymentResult.insertId,
        paymentIntentId: mockPaymentIntent.id,
        mockMode: true
      });
    }

    // Crear Payment Intent en Stripe
    // Para COP, el amount ya viene en pesos, necesitamos convertir a centavos
    const stripeAmount = currency === 'cop' ? Math.round(amount) : Math.round(amount * 100);
    console.log(`Creando PaymentIntent - Amount original: ${amount}, Amount para Stripe: ${stripeAmount}, Moneda: ${currency}`);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency: currency,
      metadata: {
        reservaId: reservaId.toString(),
        userId: req.user.IdAccount.toString()
      }
    });

    // Registrar pago en BD con estado pendiente
    const [paymentResult] = await db.execute(`
      INSERT INTO pagos (
        IdTipoPago, IdAccount, IdReserva, IdEstadoPago, 
        Monto, Moneda, ProveedorPago, ReferenciaPasarela, 
        DescripcionPago, FechaPago
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      1, // Tarjeta de crédito por defecto
      req.user.IdAccount,
      reservaId,
      1, // Estado pendiente
      amount,
      currency,
      'Stripe',
      paymentIntent.id,
      `Pago para reserva #${reservaId}`,
    ]);

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: paymentResult.insertId,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Error creando Payment Intent:', error);
    console.error('Detalles del error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
      decline_code: error.decline_code
    });
    res.status(500).json({ 
      success: false, 
      mensaje: 'Error creando intención de pago',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Confirmar pago exitoso
app.post('/api/payment/confirm', autenticarToken, async (req, res) => {
  try {
    const { paymentIntentId, paymentId } = req.body;

    if (!paymentIntentId || !paymentId) {
      return res.status(400).json({ 
        success: false, 
        mensaje: 'paymentIntentId y paymentId son requeridos' 
      });
    }

    // MODO DE DESARROLLO: Simular confirmación de pago
    if (process.env.NODE_ENV === 'development' || paymentIntentId.includes('pi_mock_')) {
      console.log('Modo desarrollo: Simulando confirmación de pago');
      
      // Actualizar el estado del pago a exitoso
      await db.execute(`
        UPDATE pagos 
        SET IdEstadoPago = ?, FechaPago = NOW() 
        WHERE IdPago = ? AND IdAccount = ?
      `, [2, paymentId, req.user.IdAccount]); // 2 = Completado

      // Actualizar el estado de la reserva a confirmada
      const [pagoResult] = await db.execute(`
        SELECT IdReserva FROM pagos WHERE IdPago = ?
      `, [paymentId]);

      if (pagoResult.length > 0) {
        await db.execute(`
          UPDATE reservas 
          SET EstadoReserva = 'Confirmada' 
          WHERE IdReserva = ?
        `, [pagoResult[0].IdReserva]);
      }

      return res.json({
        success: true,
        mensaje: 'Pago simulado confirmado exitosamente',
        mockMode: true
      });
    }

    // Verificar el estado del pago en Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Actualizar estado del pago en BD
      await db.execute(`
        UPDATE pagos 
        SET IdEstadoPago = 2, FechaPago = NOW()
        WHERE IdPago = ? AND IdAccount = ?
      `, [paymentId, req.user.IdAccount]);

      // Obtener información del pago para actualizar la reserva
      const [paymentInfo] = await db.execute(`
        SELECT IdReserva FROM pagos WHERE IdPago = ?
      `, [paymentId]);

      if (paymentInfo.length > 0) {
        // Opcional: Actualizar estado de la reserva si tienes ese campo
        // await db.execute(`
        //   UPDATE reservas SET estado = 'confirmada' WHERE IdReserva = ?
        // `, [paymentInfo[0].IdReserva]);
      }

      res.json({
        success: true,
        mensaje: 'Pago confirmado exitosamente',
        paymentStatus: 'completed'
      });
    } else {
      // Actualizar como fallido
      await db.execute(`
        UPDATE pagos 
        SET IdEstadoPago = 3
        WHERE IdPago = ? AND IdAccount = ?
      `, [paymentId, req.user.IdAccount]);

      res.json({
        success: false,
        mensaje: 'El pago no se completó',
        paymentStatus: paymentIntent.status
      });
    }

  } catch (error) {
    console.error('Error confirmando pago:', error);
    res.status(500).json({ 
      success: false, 
      mensaje: 'Error confirmando pago' 
    });
  }
});

// Obtener historial de pagos del usuario
app.get('/api/payment/history', autenticarToken, async (req, res) => {
  try {
    const [payments] = await db.execute(`
      SELECT 
        p.IdPago,
        p.Monto,
        p.Moneda,
        p.ProveedorPago,
        p.DescripcionPago,
        p.FechaPago,
        tp.NombreTipoPago,
        ep.Nombre as EstadoPago,
        r.IdReserva,
        r.FechaIngreso,
        r.FechaSalida
      FROM pagos p
      LEFT JOIN tipopagos tp ON p.IdTipoPago = tp.IdTipoPago
      LEFT JOIN estadopago ep ON p.IdEstadoPago = ep.IdEstadoPago
      LEFT JOIN reservas r ON p.IdReserva = r.IdReserva
      WHERE p.IdAccount = ?
      ORDER BY p.FechaPago DESC
    `, [req.user.IdAccount]);

    res.json({
      success: true,
      payments: payments
    });

  } catch (error) {
    console.error('Error obteniendo historial de pagos:', error);
    res.status(500).json({ 
      success: false, 
      mensaje: 'Error obteniendo historial de pagos' 
    });
  }
});

// Webhook de Stripe para notificaciones automáticas
app.post('/api/payment/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        
        // Actualizar pago en BD
        await db.execute(`
          UPDATE pagos 
          SET IdEstadoPago = 2, FechaPago = NOW()
          WHERE ReferenciaPasarela = ?
        `, [paymentIntent.id]);

        console.log('Pago exitoso confirmado vía webhook:', paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        
        // Actualizar como fallido
        await db.execute(`
          UPDATE pagos 
          SET IdEstadoPago = 3
          WHERE ReferenciaPasarela = ?
        `, [failedPayment.id]);

        console.log('Pago fallido registrado vía webhook:', failedPayment.id);
        break;

      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    res.json({received: true});

  } catch (error) {
    console.error('Error en webhook:', error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Obtener detalles de un pago específico
app.get('/api/payment/:paymentId', autenticarToken, async (req, res) => {
  try {
    const { paymentId } = req.params;

    const [payment] = await db.execute(`
      SELECT 
        p.*,
        tp.NombreTipoPago,
        ep.Nombre as EstadoPago,
        ep.Descripcion as DescripcionEstado,
        r.IdReserva,
        r.FechaIngreso,
        r.FechaSalida,
        a.nombre as NombreCliente
      FROM pagos p
      LEFT JOIN tipopagos tp ON p.IdTipoPago = tp.IdTipoPago
      LEFT JOIN estadopago ep ON p.IdEstadoPago = ep.IdEstadoPago
      LEFT JOIN reservas r ON p.IdReserva = r.IdReserva
      LEFT JOIN accounts a ON p.IdAccount = a.IdAccount
      WHERE p.IdPago = ? AND p.IdAccount = ?
    `, [paymentId, req.user.IdAccount]);

    if (payment.length === 0) {
      return res.status(404).json({ 
        success: false, 
        mensaje: 'Pago no encontrado' 
      });
    }

    res.json({
      success: true,
      payment: payment[0]
    });

  } catch (error) {
    console.error('Error obteniendo detalles de pago:', error);
    res.status(500).json({ 
      success: false, 
      mensaje: 'Error obteniendo detalles de pago' 
    });
  }
});

// Obtener detalles de una reserva específica
app.get('/api/reserva/:reservaId', autenticarToken, async (req, res) => {
  try {
    const { reservaId } = req.params;

    const [reserva] = await db.execute(`
      SELECT 
        r.*,
        a.nombre as NombreCliente,
        a.email as EmailCliente
      FROM reservas r
      LEFT JOIN accounts a ON r.IdAccount = a.IdAccount
      WHERE r.IdReserva = ? AND r.IdAccount = ?
    `, [reservaId, req.user.IdAccount]);

    if (reserva.length === 0) {
      return res.status(404).json({ 
        success: false, 
        mensaje: 'Reserva no encontrada o no autorizada' 
      });
    }

    res.json({
      success: true,
      reserva: reserva[0]
    });

  } catch (error) {
    console.error('Error obteniendo detalles de reserva:', error);
    res.status(500).json({ 
      success: false, 
      mensaje: 'Error obteniendo detalles de reserva' 
    });
  }
});

// Endpoint de prueba para verificar autenticación
app.get('/api/test-auth', autenticarToken, async (req, res) => {
  res.json({
    success: true,
    message: 'Autenticación exitosa',
    user: {
      IdAccount: req.user.IdAccount,
      nombre: req.user.nombre,
      email: req.user.email,
      IdRol: req.user.IdRol
    }
  });
});

// Crear nueva reserva (endpoint alternativo con autenticarToken)
app.post('/api/reservas', autenticarToken, async (req, res) => {
  try {
    const { IdAlojamiento, FechaIngreso, FechaSalida, InformacionReserva } = req.body;
    
    if (!IdAlojamiento || !FechaIngreso || !FechaSalida) {
      return res.status(400).json({ 
        success: false, 
        mensaje: 'IdAlojamiento, FechaIngreso y FechaSalida son requeridos' 
      });
    }

    const query = `
      INSERT INTO reservas (IdAlojamiento, IdCliente, IdAccount, FechaReserva, FechaIngreso, FechaSalida, InformacionReserva)
      VALUES (?, ?, ?, NOW(), ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      IdAlojamiento,
      req.user.IdAccount, // IdCliente (usando el mismo ID del usuario)
      req.user.IdAccount, // IdAccount
      FechaIngreso,
      FechaSalida,
      InformacionReserva || null
    ]);

    res.json({
      success: true,
      mensaje: 'Reserva creada exitosamente',
      reservaId: result.insertId
    });

  } catch (error) {
    console.error('Error creando reserva:', error);
    res.status(500).json({ 
      success: false, 
      mensaje: 'Error creando reserva',
      error: error.message 
    });
  }
});

// ===== ENDPOINTS PARA GESTIÓN DE USUARIOS (ADMIN) =====

// Obtener todos los usuarios con paginación y búsqueda
app.get('/admin/usuarios', requireAuth, async (req, res) => {
  try {
    console.log('[ADMIN/USUARIOS] Query params:', req.query);
    console.log('[ADMIN/USUARIOS] Usuario:', req.user.email, 'IdRol:', req.user.IdRol);
    
    // Verificar que sea admin
    if (req.user.IdRol !== 1) {
      console.log('[ADMIN/USUARIOS] Acceso denegado - rol requerido: 1, rol actual:', req.user.IdRol);
      return res.status(403).json({ success: false, mensaje: 'Acceso denegado. Solo administradores.' });
    }

    // Obtener página del query (por defecto página 1)
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 10;
    const offset = (page - 1) * itemsPerPage;
    const searchTerm = req.query.search || '';

    console.log('[ADMIN/USUARIOS] Parámetros: page=' + page + ', search="' + searchTerm + '"');

    // Construir la cláusula WHERE si hay búsqueda
    let whereClause = '';
    let countParams = [];
    let usuariosParams = [];
    
    if (searchTerm) {
      whereClause = `WHERE nombre LIKE ? OR email LIKE ? OR celular LIKE ? OR numeroDocumento LIKE ?`;
      const searchPattern = `%${searchTerm}%`;
      countParams = [searchPattern, searchPattern, searchPattern, searchPattern];
      usuariosParams = [searchPattern, searchPattern, searchPattern, searchPattern];
    }

    // Obtener el total de usuarios (con filtro si existe)
    const countQuery = `SELECT COUNT(*) as total FROM accounts ${whereClause}`;
    console.log('[ADMIN/USUARIOS] Count query:', countQuery);
    console.log('[ADMIN/USUARIOS] Count params:', countParams);
    
    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / itemsPerPage);

    console.log('[ADMIN/USUARIOS] Total encontrados:', total, 'Páginas totales:', totalPages);

    // Obtener usuarios con paginación y búsqueda
    const usuariosQuery = `
      SELECT 
        IdAccount as id, 
        nombre as name, 
        email, 
        celular as phone, 
        tipoDocumento as docType, 
        numeroDocumento as docNumber,
        IdRol,
        avatar
      FROM accounts 
      ${whereClause}
      ORDER BY IdAccount DESC
      LIMIT ? OFFSET ?
    `;
    
    console.log('[ADMIN/USUARIOS] Usuarios query:', usuariosQuery);
    
    // Agregar los parámetros de paginación
    usuariosParams.push(itemsPerPage, offset);
    console.log('[ADMIN/USUARIOS] Usuarios params:', usuariosParams);
    
    const [usuarios] = await db.query(usuariosQuery, usuariosParams);

    console.log('[ADMIN/USUARIOS] Usuarios obtenidos:', usuarios.length);

    res.json({ 
      success: true, 
      usuarios,
      pagination: {
        page,
        itemsPerPage,
        total,
        totalPages,
        search: searchTerm
      }
    });
  } catch (e) {
    console.error('[ADMIN/USUARIOS] Error obteniendo usuarios:', e);
    res.status(500).json({ success: false, mensaje: 'Error del servidor', error: e.message });
  }
});

// Actualizar usuario (editar)
app.put('/admin/usuarios/:id', requireAuth, async (req, res) => {
  try {
    // Verificar que sea admin
    if (req.user.IdRol !== 1) {
      return res.status(403).json({ success: false, mensaje: 'Acceso denegado. Solo administradores.' });
    }

    const userId = req.params.id;
    const { name, email, phone, docType, docNumber } = req.body;

    // Validaciones
    if (!name || !email || !phone || !docType || !docNumber) {
      return res.status(400).json({ success: false, mensaje: 'Todos los campos son requeridos' });
    }

    // Actualizar usuario
    const [result] = await db.query(`
      UPDATE accounts 
      SET nombre = ?, email = ?, celular = ?, tipoDocumento = ?, numeroDocumento = ? 
      WHERE IdAccount = ?
    `, [name, email, phone, docType, docNumber, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado' });
    }

    res.json({ success: true, mensaje: 'Usuario actualizado correctamente' });
  } catch (e) {
    console.error('Error actualizando usuario:', e);
    res.status(500).json({ success: false, mensaje: 'Error del servidor' });
  }
});

// Eliminar usuario
app.delete('/admin/usuarios/:id', requireAuth, async (req, res) => {
  try {
    // Verificar que sea admin
    if (req.user.IdRol !== 1) {
      return res.status(403).json({ success: false, mensaje: 'Acceso denegado. Solo administradores.' });
    }

    const userId = req.params.id;

    // No permitir eliminar al mismo admin
    if (parseInt(userId) === req.user.IdAccount) {
      return res.status(400).json({ success: false, mensaje: 'No puedes eliminar tu propia cuenta' });
    }

    // Eliminar usuario
    const [result] = await db.query('DELETE FROM accounts WHERE IdAccount = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado' });
    }

    res.json({ success: true, mensaje: 'Usuario eliminado correctamente' });
  } catch (e) {
    console.error('Error eliminando usuario:', e);
    res.status(500).json({ success: false, mensaje: 'Error del servidor' });
  }
});

// Obtener todas las reservas (para admin)
app.get('/api/admin/reservas', autenticarToken, async (req, res) => {
  try {
    // Verificar que el usuario sea admin (IdRol = 1)
    const [userResult] = await db.execute(
      'SELECT IdRol FROM accounts WHERE IdAccount = ?',
      [req.user.IdAccount]
    );

    if (!userResult.length || userResult[0].IdRol !== 1) {
      return res.status(403).json({ success: false, mensaje: 'Acceso denegado - No es administrador' });
    }

    // Obtener todas las reservas con información del usuario y alojamiento
    const [reservas] = await db.query(`
      SELECT 
        r.IdReserva,
        r.IdAccount,
        r.FechaIngreso,
        r.FechaSalida,
        r.FechaReserva,
        r.CantidadAdultos,
        r.CantidadNinos,
        r.InformacionReserva,
        a.nombre as NombreUsuario,
        a.email as EmailUsuario,
        alo.Descripcion as TipoAlojamiento,
        alo.Capacidad,
        p.Monto
      FROM reservas r
      INNER JOIN accounts a ON r.IdAccount = a.IdAccount
      LEFT JOIN alojamientos alo ON r.IdAlojamiento = alo.IdAlojamiento
      LEFT JOIN pagos p ON r.IdReserva = p.IdReserva AND p.IdEstadoPago = 2
      ORDER BY r.FechaIngreso DESC
    `);

    // Mapear datos al formato esperado por el frontend
    const reservasFormateadas = reservas.map(r => {
      // Intentar extraer adultos y niños del InformacionReserva si no están en las columnas
      let cantidadAdultos = r.CantidadAdultos || 0;
      let cantidadNinos = r.CantidadNinos || 0;
      
      // Si son 0, intentar extraer del texto de InformacionReserva
      if ((cantidadAdultos === 0 || cantidadNinos === 0) && r.InformacionReserva) {
        const adultoMatch = r.InformacionReserva.match(/Adultos:\s*(\d+)/);
        const ninosMatch = r.InformacionReserva.match(/Niños:\s*(\d+)/);
        if (adultoMatch) cantidadAdultos = parseInt(adultoMatch[1]) || 0;
        if (ninosMatch) cantidadNinos = parseInt(ninosMatch[1]) || 0;
      }
      
      return {
        IdReserva: r.IdReserva,
        IdAccount: r.IdAccount,
        FechaIngreso: r.FechaIngreso,
        FechaSalida: r.FechaSalida,
        FechaReserva: r.FechaReserva,
        CantidadAdultos: cantidadAdultos,
        CantidadNinos: cantidadNinos,
        InformacionReserva: r.InformacionReserva,
        NombreUsuario: r.NombreUsuario,
        EmailUsuario: r.EmailUsuario,
        TipoAlojamiento: r.TipoAlojamiento || 'No especificado',
        Capacidad: r.Capacidad,
        Monto: r.Monto || 0
      };
    });

    res.json({
      success: true,
      reservas: reservasFormateadas || []
    });
  } catch (e) {
    console.error('Error obteniendo reservas admin:', e);
    res.status(500).json({ success: false, mensaje: 'Error del servidor: ' + e.message });
  }
});

// Actualizar estado de reserva (para admin)
// Nota: Como la tabla no tiene una columna de estado, simplemente confirmamos el pago
app.put('/api/admin/reserva/:id/status', autenticarToken, async (req, res) => {
  try {
    const { estado } = req.body;
    const reservaId = req.params.id;

    if (!estado) {
      return res.status(400).json({ success: false, mensaje: 'Estado requerido' });
    }

    // Verificar que el usuario sea admin (IdRol = 1)
    const [userResult] = await db.execute(
      'SELECT IdRol FROM accounts WHERE IdAccount = ?',
      [req.user.IdAccount]
    );

    if (!userResult.length || userResult[0].IdRol !== 1) {
      return res.status(403).json({ success: false, mensaje: 'Acceso denegado - No es administrador' });
    }

    // Verificar que la reserva existe
    const [reservaCheck] = await db.execute(
      'SELECT IdReserva FROM reservas WHERE IdReserva = ?',
      [reservaId]
    );

    if (!reservaCheck.length) {
      return res.status(404).json({ success: false, mensaje: 'Reserva no encontrada' });
    }

    // Si es "confirmed", creamos un pago simulado confirmado
    if (estado === 'Confirmada') {
      // Verificar si ya existe un pago
      const [pagoExistente] = await db.execute(
        'SELECT IdPago FROM pagos WHERE IdReserva = ?',
        [reservaId]
      );

      if (pagoExistente.length === 0) {
        // Crear un pago confirmado
        await db.execute(`
          INSERT INTO pagos (IdTipoPago, IdAccount, IdReserva, IdEstadoPago, Monto, Moneda, ProveedorPago, ReferenciaPasarela, DescripcionPago, FechaPago)
          SELECT 1, r.IdAccount, r.IdReserva, 2, 0, 'cop', 'Admin', CONCAT('admin_', r.IdReserva), CONCAT('Confirmado por admin para reserva #', r.IdReserva), NOW()
          FROM reservas r
          WHERE r.IdReserva = ?
        `, [reservaId]);
      } else {
        // Actualizar pago existente a confirmado
        await db.execute(
          'UPDATE pagos SET IdEstadoPago = 2, FechaPago = NOW() WHERE IdReserva = ?',
          [reservaId]
        );
      }
    }

    res.json({
      success: true,
      mensaje: 'Reserva actualizada correctamente'
    });
  } catch (e) {
    console.error('Error actualizando reserva:', e);
    res.status(500).json({ success: false, mensaje: 'Error del servidor: ' + e.message });
  }
});

app.listen(5000, () => {
  console.log(" Servidor corriendo en http://localhost:5000");
});


