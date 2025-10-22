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
// Stripe configuration initialized
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

// Función para resolver planId (numérico o slug) al ID real de la BD
async function resolvePlanId(planId) {
  if (!planId) return null;
  
  // Mapeo de slugs conocidos a nombres
  const slugMap = {
    'ventana-rio': 'Plan Amanecer Ventana del Río Melcocho',
    'cabana-fenix': 'Cabaña Fénix (pareja)',
    'cabana-aventureros': 'Cabaña de los Aventureros',
    'dia-de-sol': 'Día de sol en el Río Melcocho'
  };
  
  // Intentar parsear como número primero
  const planIdNum = parseInt(planId, 10);
  
  if (!isNaN(planIdNum) && planIdNum > 0) {
    // Es un ID numérico válido, verificar que existe
    const [plans] = await db.execute('SELECT id FROM plans WHERE id = ?', [planIdNum]);
    if (plans.length > 0) {
      return planIdNum;
    }
  } else {
    // Es un slug de string
    const planName = slugMap[planId.toLowerCase()];
    if (planName) {
      const [plans] = await db.execute('SELECT id FROM plans WHERE name = ?', [planName]);
      if (plans.length > 0) {
        return plans[0].id;
      }
    }
  }
  
  return null;
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
    
    // Asegurar que las columnas CantidadAdultos y CantidadNinos existen
    try {
      await db.query(`ALTER TABLE reservas ADD COLUMN CantidadAdultos INT DEFAULT 0`);
    } catch (err) {
      // Column already exists, silently continue
    }
    
    try {
      await db.query(`ALTER TABLE reservas ADD COLUMN CantidadNinos INT DEFAULT 0`);
    } catch (err) {
      // Column already exists, silently continue
    }

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
  } catch (e) {
    console.error("Error creando tabla reservas_old:", e);
  }

  // Asegurar columna email en opiniones para asociar al usuario
  try {
    const [cols] = await db.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='opiniones' AND COLUMN_NAME='email'");
    if (!cols || cols.length === 0) {
      await db.query("ALTER TABLE opiniones ADD COLUMN email VARCHAR(255) NULL AFTER nombre");
    }
  } catch (e) {
    // Column may already exist, silently continue
  }

  // Asegurar columna IdAccount en opiniones
  try {
    const [cols] = await db.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='opiniones' AND COLUMN_NAME='IdAccount'");
    if (!cols || cols.length === 0) {
      await db.query("ALTER TABLE opiniones ADD COLUMN IdAccount INT NULL AFTER email");
    }
  } catch (e) {
    // Column may already exist, silently continue
  }

  // Asegurar columna IdRol en accounts
  try {
    const [cols] = await db.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='accounts' AND COLUMN_NAME='IdRol'");
    if (!cols || cols.length === 0) {
      await db.query("ALTER TABLE accounts ADD COLUMN IdRol INT NULL AFTER email");
    }
  } catch (e) {
    // Column may already exist, silently continue
  }

  // Asegurar columna avatar en accounts
  try {
    const [avatarCols] = await db.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='accounts' AND COLUMN_NAME='avatar'");
    if (!avatarCols || avatarCols.length === 0) {
      await db.query("ALTER TABLE accounts ADD COLUMN avatar VARCHAR(500) NULL AFTER IdRol");
    }
  } catch (e) {
    // Column may already exist, silently continue
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
      // SMTP auth failed, falling back to test account
    }
  } else {
    // SMTP not fully configured, using test account
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
    // JOIN con roles para obtener información completa del usuario incluyendo avatar
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
      rol: nombreRol,
      avatar: getAvatarUrl(user.avatar)
    }, JWT_SECRET, { expiresIn: "3h" });

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
      useDatabase = false;
    }

    if (useDatabase) {
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

    // Crear la reserva
    const [resultado] = await db.query(`
      INSERT INTO reservas (
        IdAlojamiento, IdAccount, FechaReserva, FechaIngreso, FechaSalida, CantidadAdultos, CantidadNinos, InformacionReserva
      ) VALUES (?, ?, CURDATE(), ?, ?, ?, ?, ?)
    `, [IdAlojamiento, IdAccount, FechaIngreso, FechaSalida, CantidadAdultos || 0, CantidadNinos || 0, InformacionReserva || null]);

    res.json({
      success: true,
      mensaje: 'Reserva creada correctamente',
      IdReserva: resultado.insertId
    });
  } catch (e) {
    console.error('Error creando reserva:', e);
    res.status(500).json({ 
      success: false, 
      mensaje: 'Error del servidor' 
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

    res.json({ success: true, data: dailyStats });
  } catch (error) {
    console.error('Error obteniendo estadísticas diarias:', error);
    res.status(500).json({ success: false, mensaje: 'Error del servidor' });
  }
});

// Obtener estadísticas totales
app.get('/admin/total-stats', requireAuth, async (req, res) => {
  try {
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
    
    if (!userId) {
      return res.status(400).json({ success: false, mensaje: 'Usuario no identificado' });
    }

    // Verificar si la DB está disponible
    let useDatabase = true;
    try {
      await db.query('SELECT 1');
    } catch (dbError) {
      useDatabase = false;
    }

    if (useDatabase) {
      // Usar base de datos si está disponible
      if (nombre) {
        await db.query('UPDATE accounts SET nombre = ? WHERE IdAccount = ?', [nombre, userId]);
      }
      if (email) {
        await db.query('UPDATE accounts SET email = ? WHERE IdAccount = ?', [email, userId]);
      }
      
      const [[updatedUser]] = await db.query(`
        SELECT a.IdAccount, a.nombre, a.email, a.celular, a.numeroDocumento, a.tipoDocumento, a.IdRol, r.NombreRol as rol
        FROM accounts a
        LEFT JOIN roles r ON a.IdRol = r.IdRol
        WHERE a.IdAccount = ?
      `, [userId]);
      
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
      
      return res.json({ success: true, usuario: updatedUser, token: newToken });
    }
  } catch (e) {
    console.error('Error actualizando usuario:', e);
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

    // Buscar avatar anterior para eliminarlo
    const [userResult] = await db.query("SELECT avatar FROM accounts WHERE IdAccount = ?", [userId]);
    
    if (userResult.length > 0 && userResult[0].avatar) {
      const oldAvatarPath = path.join(__dirname, userResult[0].avatar);
      if (fs.existsSync(oldAvatarPath)) {
        try {
          fs.unlinkSync(oldAvatarPath);
        } catch (e) {
          // Failed to delete old avatar file
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

    // Crear tabla galeria para guardar rutas de imágenes actuales
    await db.query(`
      CREATE TABLE IF NOT EXISTS galeria (
        IdGaleria INT AUTO_INCREMENT PRIMARY KEY,
        RutaImagen VARCHAR(500) NOT NULL,
        IdCategoria INT NOT NULL,
        NombreArchivo VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (IdCategoria) REFERENCES CategoriaImagen(IdCategoria) ON DELETE CASCADE,
        INDEX (IdCategoria)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);    // Insertar categorías predefinidas
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

// Endpoint para inicializar la galería (escanear carpetas y llenar tabla)
app.post('/api/gallery/init', autenticarToken, verificarAdmin, async (req, res) => {
  try {
    const folderToCategoryMap = {
      'fauna': 1,
      'flora': 2,
      'rio': 3,
      'cabañas': 4,
      'puentes': 5,
      'cabalgatas': 6,
      'experiencias': 7
    };

    const assetsImgsPath = path.join(__dirname, '../vivotour-react/src/assets/imgs');
    let totalAdded = 0;

    // Para cada carpeta
    for (const [folderName, categoryId] of Object.entries(folderToCategoryMap)) {
      const folderPath = path.join(assetsImgsPath, folderName);
      
      if (!fs.existsSync(folderPath)) {
        console.warn(`Carpeta no encontrada: ${folderName}`);
        continue;
      }

      if (folderName === 'cabañas') {
        // Para cabañas que tiene subcarpetas
        const subFolders = fs.readdirSync(folderPath);
        
        for (const subFolder of subFolders) {
          const subPath = path.join(folderPath, subFolder);
          
          if (!fs.statSync(subPath).isDirectory()) continue;
          
          const files = fs.readdirSync(subPath);
          
          for (const file of files) {
            if (!/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/.test(file)) continue;
            
            const relativePath = `/src/assets/imgs/cabañas/${subFolder}/${file}`;
            
            try {
              await db.execute(
                'INSERT IGNORE INTO galeria (RutaImagen, IdCategoria, NombreArchivo) VALUES (?, ?, ?)',
                [relativePath, categoryId, file]
              );
              totalAdded++;
            } catch (err) {
              console.warn(`Error insertando ${file}:`, err.message);
            }
          }
        }
      } else {
        // Para otras carpetas
        const files = fs.readdirSync(folderPath);
        
        for (const file of files) {
          if (!/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/.test(file)) continue;
          
          const relativePath = `/src/assets/imgs/${folderName}/${file}`;
          
          try {
            await db.execute(
              'INSERT IGNORE INTO galeria (RutaImagen, IdCategoria, NombreArchivo) VALUES (?, ?, ?)',
              [relativePath, categoryId, file]
            );
            totalAdded++;
          } catch (err) {
            console.warn(`Error insertando ${file}:`, err.message);
          }
        }
      }
    }

    res.json({ success: true, mensaje: `Se agregaron ${totalAdded} imágenes a la galería` });
  } catch (error) {
    console.error('Error inicializando galería:', error);
    res.status(500).json({ success: false, mensaje: 'Error inicializando galería' });
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
      try {
        const query = 'INSERT INTO galeria (RutaImagen, IdCategoria, NombreArchivo) VALUES (?, ?, ?)';
        const [result] = await db.execute(query, [rutaImagen, categoryId, file.originalname]);
        
        insertedImages.push({
          IdGaleria: result.insertId,
          RutaImagen: rutaImagen,
          IdCategoria: categoryId,
          NombreArchivo: file.originalname
        });
      } catch (err) {
        // Error al insertar, continuar con el siguiente archivo
      }
    }

    if (insertedImages.length === 0) {
      return res.status(500).json({ success: false, mensaje: 'No se pudieron procesar las imágenes' });
    }

    res.json({ success: true, images: insertedImages, mensaje: `${insertedImages.length} imagen(es) subida(s) correctamente` });
  } catch (error) {
    console.error('❌ Error subiendo imágenes:', error);
    res.status(500).json({ success: false, mensaje: 'Error subiendo imágenes: ' + error.message });
  }
});

// Obtener imágenes por categoría (PÚBLICO - sin autenticación)
app.get('/api/gallery/public/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    // Obtener imágenes subidas de la tabla galeria
    const queryGaleria = 'SELECT IdGaleria as IdImagen, RutaImagen, IdCategoria, NombreArchivo FROM galeria WHERE IdCategoria = ? ORDER BY IdGaleria';
    const [galeriaResults] = await db.execute(queryGaleria, [categoryId]);
    
    // Obtener imágenes de assets de la tabla imagenes
    const queryImagenes = 'SELECT IdImagen, RutaImagen, IdCategoria FROM imagenes WHERE IdCategoria = ? ORDER BY IdImagen';
    const [imagenesResults] = await db.execute(queryImagenes, [categoryId]);
    
    // Combinar ambos resultados (primero imágenes subidas, luego assets)
    const combinedResults = [...galeriaResults, ...imagenesResults];
    
    res.json({ success: true, images: combinedResults });
  } catch (error) {
    console.error('Error obteniendo imágenes públicas:', error);
    res.status(500).json({ success: false, mensaje: 'Error obteniendo imágenes' });
  }
});

// Obtener imágenes por categoría (desde tabla galeria)
app.get('/api/gallery/images/:categoryId', autenticarToken, verificarAdmin, async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    // Obtener imágenes subidas de la tabla galeria
    const queryGaleria = 'SELECT IdGaleria as IdImagen, RutaImagen, IdCategoria, NombreArchivo FROM galeria WHERE IdCategoria = ? ORDER BY IdGaleria';
    const [galeriaResults] = await db.execute(queryGaleria, [categoryId]);
    
    // Obtener imágenes de assets de la tabla imagenes
    const queryImagenes = 'SELECT IdImagen, RutaImagen, IdCategoria FROM imagenes WHERE IdCategoria = ? ORDER BY IdImagen';
    const [imagenesResults] = await db.execute(queryImagenes, [categoryId]);
    
    // Combinar ambos resultados (primero imágenes subidas, luego assets)
    const combinedResults = [...galeriaResults, ...imagenesResults];
    
    res.json({ success: true, images: combinedResults });
  } catch (error) {
    console.error('Error obteniendo imágenes:', error);
    res.status(500).json({ success: false, mensaje: 'Error obteniendo imágenes' });
  }
});

// Eliminar imagen
app.delete('/api/gallery/image/:imageId', autenticarToken, verificarAdmin, async (req, res) => {
  try {
    const { imageId } = req.params;
    
    // Obtener información de la imagen antes de eliminar
    let imagen = null;
    let isFromGaleria = false;
    
    // Intentar obtener de tabla galeria primero
    const [galeriaImages] = await db.execute('SELECT * FROM galeria WHERE IdGaleria = ?', [imageId]);
    
    if (galeriaImages.length > 0) {
      imagen = galeriaImages[0];
      isFromGaleria = true;
    } else {
      // Si no está en galeria, intentar en imagenes
      const [imagenes] = await db.execute('SELECT * FROM imagenes WHERE IdImagen = ?', [imageId]);
      if (imagenes.length === 0) {
        return res.status(404).json({ success: false, mensaje: 'Imagen no encontrada' });
      }
      imagen = imagenes[0];
    }
    
    // Eliminar solo del registro de base de datos (no eliminar archivos)
    if (isFromGaleria) {
      await db.execute('DELETE FROM galeria WHERE IdGaleria = ?', [imageId]);
    } else {
      await db.execute('DELETE FROM imagenes WHERE IdImagen = ?', [imageId]);
    }

    res.json({ success: true, mensaje: 'Imagen eliminada del registro correctamente' });
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

        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        
        // Actualizar como fallido
        await db.execute(`
          UPDATE pagos 
          SET IdEstadoPago = 3
          WHERE ReferenciaPasarela = ?
        `, [failedPayment.id]);

        break;

      default:
        // Event type not handled
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
    
    // Verificar que sea admin
    if (req.user.IdRol !== 1) {
      return res.status(403).json({ success: false, mensaje: 'Acceso denegado. Solo administradores.' });
    }

    // Obtener página del query (por defecto página 1)
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = 10;
    const offset = (page - 1) * itemsPerPage;
    const searchTerm = req.query.search || '';

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
    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / itemsPerPage);

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
    
    // Agregar los parámetros de paginación
    usuariosParams.push(itemsPerPage, offset);
    
    const [usuarios] = await db.query(usuariosQuery, usuariosParams);

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
        COALESCE(r.CantidadAdultos, 0) as CantidadAdultos,
        COALESCE(r.CantidadNinos, 0) as CantidadNinos,
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

    res.json({
      success: true,
      reservas: reservas || []
    });

  } catch (error) {
    res.status(500).json({ success: false, mensaje: 'Error del servidor' });
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

// Configurar multer para imágenes de homepage
const homepageImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads', 'homepage');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'homepage-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const homepageUpload = multer({
  storage: homepageImageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  }
});

// GET - Obtener imágenes de homepage (público, sin autenticación)
app.get('/api/homepage-images', async (req, res) => {
  try {
    console.log('GET /api/homepage-images');
    // Obtener imágenes de la base de datos
    const [images] = await db.execute(`
      SELECT * FROM homepage_images ORDER BY tipo ASC, posicion ASC
    `);

    console.log('Total images from DB:', images.length);
    console.log('Images:', images);

    // Agrupar por tipo
    const presentationImages = images
      .filter(img => img.tipo === 'presentation')
      .sort((a, b) => a.posicion - b.posicion)
      .map(img => {
        // Si la ruta comienza con /assets/, es una ruta del frontend que se debe retornar como está
        // El frontend la resolverá correctamente
        if (img.ruta.startsWith('/assets/')) {
          return img.ruta;
        }
        // Si es una ruta del servidor, construir URL completa
        return `${process.env.BACKEND_URL || 'http://localhost:5000'}${img.ruta}`;
      });

    const opinionImages = images
      .filter(img => img.tipo === 'opinion')
      .sort((a, b) => a.posicion - b.posicion)
      .map(img => {
        if (img.ruta.startsWith('/assets/')) {
          return img.ruta;
        }
        return `${process.env.BACKEND_URL || 'http://localhost:5000'}${img.ruta}`;
      });

    console.log('Presentation images:', presentationImages.length);
    console.log('Opinion images:', opinionImages.length);

    res.json({
      success: true,
      presentationImages,
      opinionImages
    });
  } catch (error) {
    console.error('Error obteniendo imágenes de homepage:', error);
    res.status(500).json({ success: false, mensaje: 'Error del servidor' });
  }
});

// POST - Guardar/actualizar imágenes de homepage
app.post('/api/homepage-images', requireAuth, homepageUpload.array('presentationImages', 3), async (req, res) => {
  try {
    console.log('POST /api/homepage-images - Inicio');
    console.log('Files:', req.files ? req.files.length : 0);
    console.log('Existing URLs:', req.body.existingUrls);
    
    // Procesar archivos nuevos
    let newImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        newImages.push({
          ruta: `/uploads/homepage/${file.filename}`
        });
      }
    }

    // Procesar URLs existentes
    let existingImages = [];
    if (req.body.existingUrls) {
      try {
        existingImages = JSON.parse(req.body.existingUrls);
      } catch (e) {
        console.log('Error parsing existingUrls:', e);
      }
    }

    console.log('New images:', newImages.length);
    console.log('Existing images:', existingImages.length);

    // Eliminar todas las imágenes de presentación actuales
    await db.execute('DELETE FROM homepage_images WHERE tipo = ?', ['presentation']);

    // Insertar las imágenes existentes
    for (const img of existingImages) {
      console.log(`Restoring image at position ${img.posicion}: ${img.ruta}`);
      await db.execute(
        'INSERT INTO homepage_images (tipo, posicion, ruta) VALUES (?, ?, ?)',
        ['presentation', img.posicion, img.ruta]
      );
    }

    // Insertar las nuevas imágenes en orden
    let posicion = 1;
    for (const img of newImages) {
      // Buscar la primera posición disponible
      while (existingImages.some(e => e.posicion === posicion)) {
        posicion++;
      }
      console.log(`Inserting new image at position ${posicion}: ${img.ruta}`);
      await db.execute(
        'INSERT INTO homepage_images (tipo, posicion, ruta) VALUES (?, ?, ?)',
        ['presentation', posicion, img.ruta]
      );
      posicion++;
    }

    console.log('Success');
    res.json({
      success: true,
      mensaje: 'Imágenes guardadas correctamente'
    });
  } catch (error) {
    console.error('Error guardando imágenes de homepage:', error);
    res.status(500).json({ success: false, mensaje: 'Error del servidor: ' + error.message });
  }
});

// POST - Guardar/actualizar imágenes de opinión (manejo separado)
app.post('/api/homepage-images/opinion', requireAuth, homepageUpload.array('opinionImages', 3), async (req, res) => {
  try {
    console.log('POST /api/homepage-images/opinion - Inicio');
    console.log('Files:', req.files ? req.files.length : 0);
    console.log('Existing URLs:', req.body.existingUrls);
    
    // Procesar archivos nuevos
    let newImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        newImages.push({
          ruta: `/uploads/homepage/${file.filename}`
        });
      }
    }

    // Procesar URLs existentes
    let existingImages = [];
    if (req.body.existingUrls) {
      try {
        existingImages = JSON.parse(req.body.existingUrls);
      } catch (e) {
        console.log('Error parsing existingUrls:', e);
      }
    }

    console.log('New images:', newImages.length);
    console.log('Existing images:', existingImages.length);

    // Eliminar todas las imágenes de opinión actuales
    await db.execute('DELETE FROM homepage_images WHERE tipo = ?', ['opinion']);

    // Insertar las imágenes existentes
    for (const img of existingImages) {
      console.log(`Restoring opinion image at position ${img.posicion}: ${img.ruta}`);
      await db.execute(
        'INSERT INTO homepage_images (tipo, posicion, ruta) VALUES (?, ?, ?)',
        ['opinion', img.posicion, img.ruta]
      );
    }

    // Insertar las nuevas imágenes en orden
    let posicion = 1;
    for (const img of newImages) {
      // Buscar la primera posición disponible
      while (existingImages.some(e => e.posicion === posicion)) {
        posicion++;
      }
      console.log(`Inserting new opinion image at position ${posicion}: ${img.ruta}`);
      await db.execute(
        'INSERT INTO homepage_images (tipo, posicion, ruta) VALUES (?, ?, ?)',
        ['opinion', posicion, img.ruta]
      );
      posicion++;
    }

    console.log('Opinion Success');
    res.json({
      success: true,
      mensaje: 'Imágenes de opinión guardadas correctamente'
    });
  } catch (error) {
    console.error('Error guardando imágenes de opinión:', error);
    res.status(500).json({ success: false, mensaje: 'Error del servidor: ' + error.message });
  }
});

// ======================= PLANES =======================

// Configuración de multer para imágenes de planes
const storageePlans = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads', 'plans');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}_${timestamp}${ext}`);
  }
});

const uploadPlans = multer({
  storage: storageePlans,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// GET /api/plans - Obtener todos los planes
app.get('/api/plans', requireAuth, async (req, res) => {
  try {
    const [plans] = await db.execute('SELECT * FROM plans ORDER BY id ASC');
    res.json({ success: true, plans });
  } catch (error) {
    console.error('Error obteniendo planes:', error);
    res.status(500).json({ success: false, mensaje: 'Error del servidor: ' + error.message });
  }
});

// GET /api/plans/:planId - Obtener un plan específico
app.get('/api/plans/:planId', requireAuth, async (req, res) => {
  try {
    const { planId } = req.params;
    const actualPlanId = await resolvePlanId(planId);
    
    if (!actualPlanId) {
      return res.status(404).json({ success: false, mensaje: 'Plan no encontrado' });
    }
    
    const [plans] = await db.execute('SELECT * FROM plans WHERE id = ?', [actualPlanId]);
    
    if (plans.length === 0) {
      return res.status(404).json({ success: false, mensaje: 'Plan no encontrado' });
    }
    
    res.json({ success: true, plan: plans[0] });
  } catch (error) {
    console.error('Error obteniendo plan:', error);
    res.status(500).json({ success: false, mensaje: 'Error del servidor: ' + error.message });
  }
});

// POST /api/plans - Crear un nuevo plan
app.post('/api/plans', requireAuth, async (req, res) => {
  try {
    // Verificar que sea admin
    if (req.user.IdRol !== 1) {
      return res.status(403).json({ success: false, mensaje: 'Acceso denegado. Solo administradores.' });
    }

    const { name, description, price, duration, maxPersons } = req.body;

    // Validar campos
    if (!name) {
      return res.status(400).json({ success: false, mensaje: 'El nombre es requerido' });
    }
    if (!description) {
      return res.status(400).json({ success: false, mensaje: 'La descripción es requerida' });
    }
    if (price === undefined || price === null || price === '') {
      return res.status(400).json({ success: false, mensaje: 'El precio es requerido' });
    }
    if (duration === undefined || duration === null) {
      return res.status(400).json({ success: false, mensaje: 'La duración es requerida' });
    }
    if (!maxPersons) {
      return res.status(400).json({ success: false, mensaje: 'La capacidad es requerida' });
    }

    let result;
    try {
      [result] = await db.execute(
        'INSERT INTO plans (name, description, price, duration, maxPersons) VALUES (?, ?, ?, ?, ?)',
        [name, description, price, duration, maxPersons]
      );
    } catch (dbError) {
      console.error('Error creando plan:', dbError.message);
      throw dbError;
    }

    const responseData = {
      success: true, 
      mensaje: 'Plan creado exitosamente',
      planId: result.insertId 
    };
    
    res.json(responseData);
  } catch (error) {
    console.error('Error creando plan:', error.message);
    res.status(500).json({ success: false, mensaje: 'Error del servidor: ' + error.message });
  }
});

// PUT /api/plans/:planId - Actualizar un plan
app.put('/api/plans/:planId', requireAuth, async (req, res) => {
  try {
    if (req.user.IdRol !== 1) {
      return res.status(403).json({ success: false, mensaje: 'Acceso denegado. Solo administradores.' });
    }

    const { planId } = req.params;
    const { name, description, price, duration, maxPersons } = req.body;

    const [result] = await db.execute(
      'UPDATE plans SET name = ?, description = ?, price = ?, duration = ?, maxPersons = ? WHERE id = ?',
      [name, description, price, duration, maxPersons, planId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, mensaje: 'Plan no encontrado' });
    }

    res.json({ success: true, mensaje: 'Plan actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando plan:', error);
    res.status(500).json({ success: false, mensaje: 'Error del servidor: ' + error.message });
  }
});

// DELETE /api/plans/:planId - Eliminar un plan
app.delete('/api/plans/:planId', requireAuth, async (req, res) => {
  try {
    if (req.user.IdRol !== 1) {
      return res.status(403).json({ success: false, mensaje: 'Acceso denegado. Solo administradores.' });
    }

    const { planId } = req.params;
    const actualPlanId = await resolvePlanId(planId);
    
    if (!actualPlanId) {
      return res.status(404).json({ success: false, mensaje: 'Plan no encontrado' });
    }

    // Primero eliminar todas las imágenes del plan
    const plansDir = path.join(__dirname, 'uploads', 'plans');
    const [images] = await db.execute(
      'SELECT filename FROM plan_images WHERE plan_id = ?',
      [actualPlanId]
    );

    for (const img of images) {
      const filePath = path.join(plansDir, img.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Eliminar registros de imágenes de la BD
    await db.execute('DELETE FROM plan_images WHERE plan_id = ?', [actualPlanId]);
    await db.execute('DELETE FROM plan_images_legacy WHERE plan_id = ?', [actualPlanId]);

    // Eliminar el plan
    const [result] = await db.execute('DELETE FROM plans WHERE id = ?', [actualPlanId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, mensaje: 'Plan no encontrado' });
    }

    res.json({ success: true, mensaje: 'Plan eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando plan:', error);
    res.status(500).json({ success: false, mensaje: 'Error del servidor: ' + error.message });
  }
});

// POST /api/plans/:planId/images - Subir una imagen para un plan
app.post('/api/plans/:planId/images', requireAuth, uploadPlans.single('image'), async (req, res) => {
  try {
    if (req.user.IdRol !== 1) {
      return res.status(403).json({ success: false, mensaje: 'Acceso denegado. Solo administradores.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, mensaje: 'No se envió ningún archivo' });
    }

    const { planId } = req.params;

    // Resolver el planId usando la función auxiliar
    const actualPlanId = await resolvePlanId(planId);

    if (!actualPlanId) {
      return res.status(404).json({ success: false, mensaje: 'Plan no encontrado en la BD' });
    }

    const filename = req.file.filename;
    const imageUrl = `/uploads/plans/${filename}`;

    // Insertar en la BD
    const [insertResult] = await db.execute(
      'INSERT INTO plan_images (plan_id, image_url, filename) VALUES (?, ?, ?)',
      [actualPlanId, imageUrl, filename]
    );

    res.json({ 
      success: true, 
      mensaje: 'Imagen subida exitosamente',
      imageUrl,
      filename,
      imageId: insertResult.insertId
    });
    
  } catch (error) {
    console.error('❌ Error subiendo imagen:', error.message);
    console.error('Stack:', error.stack);
    
    // Eliminar el archivo si hubo error
    if (req.file) {
      const fs = require('fs');
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error eliminando archivo temporal:', err);
      });
    }

    res.status(500).json({ success: false, mensaje: 'Error del servidor: ' + error.message });
  }
});

// GET /api/plans/:planId/images - Obtener imágenes de un plan (nuevas + legacy)
app.get('/api/plans/:planId/images', requireAuth, async (req, res) => {
  try {
    const { planId } = req.params;
    const actualPlanId = await resolvePlanId(planId);
    
    if (!actualPlanId) {
      return res.status(404).json({ success: false, images: [] });
    }

    // Obtener imágenes nuevas - ORDENAR POR ID (más confiable que created_at)
    const [newImages] = await db.execute(
      'SELECT image_url as url, filename, false as isLegacy FROM plan_images WHERE plan_id = ? ORDER BY id ASC',
      [actualPlanId]
    );

    // Obtener imágenes legacy - ORDENAR POR ID
    const [legacyImages] = await db.execute(
      'SELECT image_url as url, null as filename, true as isLegacy FROM plan_images_legacy WHERE plan_id = ? ORDER BY id ASC',
      [actualPlanId]
    );

    // Combinar: primero nuevas, luego legacy
    const allImages = [...newImages, ...legacyImages];

    res.json({ success: true, images: allImages });
  } catch (error) {
    console.error('Error obteniendo imágenes:', error);
    res.status(500).json({ success: false, mensaje: 'Error del servidor: ' + error.message });
  }
});

// GET /api/plans/:planId/images-with-legacy - Obtener imágenes con legacy (alias para compatibilidad frontend)
app.get('/api/plans/:planId/images-with-legacy', requireAuth, async (req, res) => {
  try {
    const { planId } = req.params;
    const actualPlanId = await resolvePlanId(planId);
    
    if (!actualPlanId) {
      return res.status(404).json({ success: false, mensaje: 'Plan no encontrado' });
    }

    // Obtener imágenes nuevas - ORDENAR POR ID (más confiable que created_at)
    const [newImages] = await db.execute(
      'SELECT image_url as url, filename, false as isLegacy FROM plan_images WHERE plan_id = ? ORDER BY id ASC',
      [actualPlanId]
    );

    // Si hay imágenes nuevas, retornar SOLO esas (sin las legacy)
    if (newImages.length > 0) {
      return res.json({ success: true, images: newImages });
    }

    // Si NO hay imágenes nuevas, retornar las legacy
    const [legacyImages] = await db.execute(
      'SELECT image_url as url, null as filename, true as isLegacy FROM plan_images_legacy WHERE plan_id = ? ORDER BY id ASC',
      [actualPlanId]
    );

    res.json({ success: true, images: legacyImages });
  } catch (error) {
    console.error('Error obteniendo imágenes con legacy:', error);
    res.status(500).json({ success: false, mensaje: 'Error del servidor: ' + error.message });
  }
});

// DELETE /api/plans/:planId/images/:filename - Eliminar una imagen
app.delete('/api/plans/:planId/images/:filename', requireAuth, async (req, res) => {
  try {
    if (req.user.IdRol !== 1) {
      return res.status(403).json({ success: false, mensaje: 'Acceso denegado. Solo administradores.' });
    }

    const { planId, filename } = req.params;
    const actualPlanId = await resolvePlanId(planId);
    
    if (!actualPlanId) {
      return res.status(404).json({ success: false, mensaje: 'Plan no encontrado' });
    }

    // Obtener la ruta del archivo
    const [images] = await db.execute(
      'SELECT * FROM plan_images WHERE plan_id = ? AND filename = ?',
      [actualPlanId, filename]
    );

    if (images.length === 0) {
      return res.status(404).json({ success: false, mensaje: 'Imagen no encontrada' });
    }

    // Eliminar archivo del disco
    const filePath = path.join(__dirname, 'uploads', 'plans', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Eliminar de la BD
    await db.execute(
      'DELETE FROM plan_images WHERE plan_id = ? AND filename = ?',
      [planId, filename]
    );

    res.json({ success: true, mensaje: 'Imagen eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    res.status(500).json({ success: false, mensaje: 'Error del servidor: ' + error.message });
  }
});

// ==================== SERVICIOS EXTRA ====================

// GET /api/extra-services - Obtener todos los servicios extra
app.get('/api/extra-services', requireAuth, async (req, res) => {
  try {
    const [services] = await db.execute('SELECT * FROM extra_services ORDER BY category ASC, name ASC');
    
    res.json({ success: true, services });
  } catch (error) {
    console.error('Error obteniendo servicios extra:', error);
    res.status(500).json({ success: false, mensaje: 'Error del servidor: ' + error.message });
  }
});

// POST /api/extra-services - Crear un nuevo servicio extra
app.post('/api/extra-services', requireAuth, async (req, res) => {
  try {
    if (req.user.IdRol !== 1) {
      return res.status(403).json({ success: false, mensaje: 'Acceso denegado. Solo administradores.' });
    }

    const { name, description, price, category } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, mensaje: 'Nombre y precio son requeridos' });
    }

    const [result] = await db.execute(
      'INSERT INTO extra_services (name, description, price, category) VALUES (?, ?, ?, ?)',
      [name, description || null, price, category || null]
    );

    res.json({ 
      success: true, 
      mensaje: 'Servicio creado exitosamente',
      serviceId: result.insertId
    });
  } catch (error) {
    console.error('Error creando servicio extra:', error);
    res.status(500).json({ success: false, mensaje: 'Error del servidor: ' + error.message });
  }
});

// PUT /api/extra-services/:serviceId - Actualizar un servicio extra
app.put('/api/extra-services/:serviceId', requireAuth, async (req, res) => {
  try {
    if (req.user.IdRol !== 1) {
      return res.status(403).json({ success: false, mensaje: 'Acceso denegado. Solo administradores.' });
    }

    const { serviceId } = req.params;
    const { name, description, price, category } = req.body;

    if (!name || !price) {
      return res.status(400).json({ success: false, mensaje: 'Nombre y precio son requeridos' });
    }

    const [result] = await db.execute(
      'UPDATE extra_services SET name = ?, description = ?, price = ?, category = ? WHERE id = ?',
      [name, description || null, price, category || null, serviceId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, mensaje: 'Servicio no encontrado' });
    }

    res.json({ success: true, mensaje: 'Servicio actualizado exitosamente' });
  } catch (error) {
    console.error('Error actualizando servicio extra:', error);
    res.status(500).json({ success: false, mensaje: 'Error del servidor: ' + error.message });
  }
});

// DELETE /api/extra-services/:serviceId - Eliminar un servicio extra
app.delete('/api/extra-services/:serviceId', requireAuth, async (req, res) => {
  try {
    if (req.user.IdRol !== 1) {
      return res.status(403).json({ success: false, mensaje: 'Acceso denegado. Solo administradores.' });
    }

    const { serviceId } = req.params;

    const [result] = await db.execute('DELETE FROM extra_services WHERE id = ?', [serviceId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, mensaje: 'Servicio no encontrado' });
    }

    res.json({ success: true, mensaje: 'Servicio eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando servicio extra:', error);
    res.status(500).json({ success: false, mensaje: 'Error del servidor: ' + error.message });
  }
});

app.listen(5000, () => {
  console.log(" Servidor corriendo en http://localhost:5000");
});
