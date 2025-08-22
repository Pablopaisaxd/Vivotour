import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from './db.js'; 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


// Iniciar servidor
app.listen(5000, () => {
  console.log("Servidor corriendo en http://localhost:5000");
});
