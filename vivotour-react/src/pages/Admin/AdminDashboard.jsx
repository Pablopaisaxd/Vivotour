import React from 'react';
import './Admin.css';
import './style/ScrollFix.css';
import './style/Metrics.css';
import Header from './components/Header';
import Sidebar from "./components/Sidebar";
import Content from "./components/Content";
import OrientationWarning from "./components/OrientationWarning";
import { Theme } from "./Theme";
import { ThemeProvider } from '@mui/material/styles';
import { AdminProvider } from './AdminContext';

function AdminDashboard() {
  return (
    <AdminProvider>
      <ThemeProvider theme={Theme}>
        <OrientationWarning />
        <div className="admin-page-container">
          <div className="admin-dashboard">
            <Header />
            <Sidebar />
            <Content />
          </div>
        </div>
      </ThemeProvider>
    </AdminProvider>
  );
}

export default AdminDashboard;