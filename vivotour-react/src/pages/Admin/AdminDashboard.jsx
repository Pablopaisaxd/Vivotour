import React from 'react';
import './Admin.css'; // Importa el CSS específico del dashboard
import Header from './components/Header';
import Sidebar from "./components/Sidebar";
import Content from "./components/Content";
import { Theme } from "./Theme"; // Importa el tema actualizado
import { ThemeProvider } from '@mui/material/styles'; // Importa ThemeProvider de MUI v5

function AdminDashboard() {
  return (
    <ThemeProvider theme={Theme}> {/* Usa ThemeProvider de MUI v5 */}
      <div className="App"> {/* La clase "App" se refiere al contenedor principal del dashboard */}
        <Header />
        <Sidebar />
        <Content />
      </div>
    </ThemeProvider>
  );
}

export default AdminDashboard;