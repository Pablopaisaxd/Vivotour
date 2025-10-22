import React from 'react';
import './Admin.css';
import './style/ScrollFix.css';
import Header from './components/Header';
import Sidebar from "./components/Sidebar";
import Content from "./components/Content";
import { Theme } from "./Theme";
import { ThemeProvider } from '@mui/material/styles';
import { AdminProvider } from './AdminContext';

function AdminDashboard() {
  return (
    <AdminProvider>
      <ThemeProvider theme={Theme}>
        <div className="App">
          <Header />
          <Sidebar />
          <Content />
        </div>
      </ThemeProvider>
    </AdminProvider>
  );
}

export default AdminDashboard;