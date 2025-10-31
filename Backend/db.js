import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
    host:process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASS,
    port:process.env.DB_PORT,
    database:process.env.DB_NAME

})

try {
  const connection = await db.getConnection();
  // debug: removed console.log for production
  connection.release();
} catch (err) {
  console.error("Error al conectar a la base de datos:", err);
}

export default db 