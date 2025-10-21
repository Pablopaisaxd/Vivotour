import db from './db.js';
import fs from 'fs';
import path from 'path';

// Mapeo de carpetas a categorías
const folderToCategoryMap = {
  'fauna': 1,
  'flora': 2,
  'rio': 3,
  'cabañas': 4,
  'puentes': 5,
  'cabalgatas': 6,
  'experiencias': 7
};

async function scanGalleryFolders() {
  try {
    const assetsImgsPath = path.join(process.cwd(), 'vivotour-react', 'src', 'assets', 'imgs');
    
    console.log('📂 Escaneando carpeta:', assetsImgsPath);
    
    if (!fs.existsSync(assetsImgsPath)) {
      console.error('❌ Carpeta no encontrada:', assetsImgsPath);
      process.exit(1);
    }

    // Para cada carpeta (fauna, flora, etc)
    for (const [folderName, categoryId] of Object.entries(folderToCategoryMap)) {
      const folderPath = path.join(assetsImgsPath, folderName);
      
      if (!fs.existsSync(folderPath)) {
        console.warn(`⚠️ Carpeta no encontrada: ${folderName}`);
        continue;
      }

      console.log(`\n📁 Procesando carpeta: ${folderName} (Categoría ${categoryId})`);

      // Para cabañas que tiene subcarpetas
      if (folderName === 'cabañas') {
        const subFolders = fs.readdirSync(folderPath);
        
        for (const subFolder of subFolders) {
          const subPath = path.join(folderPath, subFolder);
          
          if (!fs.statSync(subPath).isDirectory()) continue;
          
          const files = fs.readdirSync(subPath);
          
          for (const file of files) {
            if (!/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/.test(file)) continue;
            
            const relativePath = `/src/assets/imgs/cabañas/${subFolder}/${file}`;
            console.log(`  - ${file}`);
            
            try {
              await db.execute(
                'INSERT IGNORE INTO galeria (RutaImagen, IdCategoria, NombreArchivo) VALUES (?, ?, ?)',
                [relativePath, categoryId, file]
              );
            } catch (err) {
              console.warn(`    ⚠️ Error insertando: ${err.message}`);
            }
          }
        }
      } else {
        // Para otras carpetas
        const files = fs.readdirSync(folderPath);
        
        for (const file of files) {
          if (!/\.(jpg|jpeg|png|JPG|JPEG|PNG)$/.test(file)) continue;
          
          const relativePath = `/src/assets/imgs/${folderName}/${file}`;
          console.log(`  - ${file}`);
          
          try {
            await db.execute(
              'INSERT IGNORE INTO galeria (RutaImagen, IdCategoria, NombreArchivo) VALUES (?, ?, ?)',
              [relativePath, categoryId, file]
            );
          } catch (err) {
            console.warn(`    ⚠️ Error insertando: ${err.message}`);
          }
        }
      }
    }

    // Verificar resultados
    const [result] = await db.query('SELECT COUNT(*) as total FROM galeria');
    console.log(`\n✅ Total de imágenes en la BD: ${result[0].total}`);
    
    // Mostrar algunas imágenes por categoría
    for (let i = 1; i <= 7; i++) {
      const [rows] = await db.query(
        'SELECT COUNT(*) as count FROM galeria WHERE IdCategoria = ?',
        [i]
      );
      console.log(`   Categoría ${i}: ${rows[0].count} imágenes`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

scanGalleryFolders();
