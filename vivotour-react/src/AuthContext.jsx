import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // Correct import for newer versions

export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("Datos decodificados del token:", decoded);

        const currentTime = Date.now() / 1000;
        if (decoded.exp && decoded.exp < currentTime) {
          console.log("Token expired");
          logout();
          setLoading(false);
          return;
        }

        setIsAuthenticated(true);
        setUser({
          IdAccount: decoded.IdAccount,
          nombre: decoded.nombre,
          email: decoded.email,
          numeroDocumento: decoded.numeroDocumento,
          tipoDocumento: decoded.tipoDocumento,
          celular: decoded.celular,
          IdRol: decoded.IdRol,
          rol: decoded.rol
        });
      } catch (error) {
        console.error("Token inválido:", error);
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
    try {
      const decoded = jwtDecode(token);
      setUser({
        IdAccount: userData?.IdAccount ?? decoded?.IdAccount,
        nombre: userData?.nombre ?? decoded?.nombre,
        email: userData?.email ?? decoded?.email,
        celular: userData?.celular ?? decoded?.celular,
        numeroDocumento: userData?.numeroDocumento ?? decoded?.numeroDocumento,
        tipoDocumento: userData?.tipoDocumento ?? decoded?.tipoDocumento,
        IdRol: userData?.IdRol ?? decoded?.IdRol,
        rol: userData?.rol ?? decoded?.rol
      });
    } catch (e) {
      setUser(userData || null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};