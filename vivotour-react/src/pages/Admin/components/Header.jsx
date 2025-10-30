import React, { useContext } from "react";
import Home from "./Home";
import Dashboard from "./Dashboard";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { AdminContext } from '../AdminContext';

function Header() {
    const { sidebarOpen, toggleSidebar } = useContext(AdminContext);
    return (
        <div className="admin-header">
            <div className="header-left">
                <button
                    className="sidebar-toggle"
                    aria-label={sidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
                    aria-expanded={sidebarOpen}
                    onClick={toggleSidebar}
                >
                    {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
                </button>
                <Home />
            </div>
            <Dashboard />
        </div>
    )
}

export default Header;