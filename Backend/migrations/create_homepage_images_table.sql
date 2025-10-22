-- Crear tabla para imágenes de la página de inicio
CREATE TABLE IF NOT EXISTS homepage_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('presentation', 'opinion') NOT NULL,
  posicion INT NOT NULL,
  ruta VARCHAR(255) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_tipo_posicion (tipo, posicion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar imágenes por defecto si no existen
INSERT IGNORE INTO homepage_images (tipo, posicion, ruta) VALUES
('presentation', 1, '/uploads/homepage/default-presentation-1.jpg'),
('presentation', 2, '/uploads/homepage/default-presentation-2.jpg'),
('presentation', 3, '/uploads/homepage/default-presentation-3.jpg'),
('opinion', 1, '/uploads/homepage/default-opinion-1.jpg'),
('opinion', 2, '/uploads/homepage/default-opinion-2.jpg'),
('opinion', 3, '/uploads/homepage/default-opinion-3.jpg');
