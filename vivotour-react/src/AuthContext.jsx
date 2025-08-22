import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // Correct import for newer versions

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Al montar la app, revisa si hay token en localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token); // Direct use of jwtDecode
        console.log("Datos decodificados del token:", decoded);
        
        // Check if token is expired
        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          console.log("Token expired");
          logout();
          return;
        }
        
        setIsAuthenticated(true);
        setUser({  nombre: decoded.nombre,
                email: decoded.email, 
            numeroDocumento: decoded.numeroDocumento, tipoDocumento: decoded.tipoDocumento }); 
      } catch (error) {
        console.error("Token inválido:", error);
        setIsAuthenticated(false);
        setUser(null);
        // Remove invalid token
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};