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

async function seedPlans() {
  try {
    const connection = await db.getConnection();
    
    
    
    // Planes a insertar
    const plans = [
      {
        name: 'Plan Amanecer Ventana del Río Melcocho',
        description: 'Incluye reserva y seguro, cena del día de llegada, desayuno y fiambre al día siguiente, transporte en mula para entrar (1.5h aprox) y tour al río Melcocho con guía al día siguiente. Comodidades: baño con agua caliente, jacuzzi climatizado al aire libre, malla catamarán y hamacas.',
        price: 200000,
        duration: 1,
        maxPersons: 6
      },
      {
        name: 'Cabaña Fénix (pareja)',
        description: 'Incluye reserva y seguro, tres comidas (cena, desayuno y fiambre), transporte en mula para entrar y salir, tour al río Melcocho. Comodidades exclusivas: baño con agua caliente, jacuzzi privado y malla catamarán.',
        price: 600000,
        duration: 1,
        maxPersons: 2
      },
      {
        name: 'Cabaña de los Aventureros',
        description: '2 días, 1 noche. Incluye reserva, seguro, transporte en mula a la finca, cena de bienvenida, desayuno, fiambre y excursión guiada al río Melcocho. Comodidades: jacuzzi al aire libre, malla catamarán y hamacas.',
        price: 200000,
        duration: 1,
        maxPersons: 8
      },
      {
        name: 'Día de sol en el Río Melcocho',
        description: 'Incluye reserva, seguro y fiambre. Caminata de 20 a 60 minutos según el charco elegido. Ideal para disfrutar el día y conectar con la naturaleza.',
        price: 40000,
        duration: 0,
        maxPersons: 12
      }
    ];
    
    for (const plan of plans) {
      try {
        const [result] = await connection.execute(
          'INSERT INTO plans (name, description, price, duration, maxPersons) VALUES (?, ?, ?, ?, ?)',
          [plan.name, plan.description, plan.price, plan.duration, plan.maxPersons]
        );
        
      } catch (error) {
          if (error.code === 'ER_DUP_ENTRY') {
        } else {
          throw error;
        }
      }
    }
    
    // Verificar los planes creados
    const [allPlans] = await connection.execute('SELECT id, name, price, maxPersons FROM plans ORDER BY id');
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedPlans();
