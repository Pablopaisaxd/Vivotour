import React, { createContext, useState } from 'react';

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [activeComponent, setActiveComponent] = useState('dashboard');

    return (
        <AdminContext.Provider value={{ activeComponent, setActiveComponent }}>
            {children}
        </AdminContext.Provider>
    );
};