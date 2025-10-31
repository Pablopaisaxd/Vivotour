import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

async function createTables() {
  try {
    const connection = await db.getConnection();
    
    
    
    // Tabla de planes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS plans (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        duration INT NOT NULL DEFAULT 1,
        maxPersons INT NOT NULL DEFAULT 6,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    
    // Tabla de imágenes de planes (nuevas)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS plan_images (
        id INT PRIMARY KEY AUTO_INCREMENT,
        plan_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        filename VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
      )
    `);
    
    
    // Tabla de imágenes legacy
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS plan_images_legacy (
        id INT PRIMARY KEY AUTO_INCREMENT,
        plan_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_plan_image (plan_id, image_url),
        FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
      )
    `);
    
    
    // Tabla de servicios extra
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS extra_services (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    
    
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTables();
