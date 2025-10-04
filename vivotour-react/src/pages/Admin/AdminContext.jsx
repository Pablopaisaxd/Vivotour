import React, { createContext, useState, useEffect } from 'react';

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [activeComponent, setActiveComponent] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(o => !o);
    const closeSidebar = () => setSidebarOpen(false);

    // ESC key handler and body scroll lock
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && sidebarOpen) {
                closeSidebar();
            }
        };

        if (sidebarOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [sidebarOpen]);

    return (
        <AdminContext.Provider value={{ activeComponent, setActiveComponent, sidebarOpen, toggleSidebar, closeSidebar }}>
            {children}
        </AdminContext.Provider>
    );
};