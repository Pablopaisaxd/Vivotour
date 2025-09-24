import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../../AuthContext";


const PrivateRoute = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    // Puedes mostrar un loader o simplemente null
    return null;
  }

  if (!isAuthenticated) {
    // si no está autenticado → redirige a login
    // usamos replace:true para no dejar la ruta protegida en el historial
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // si está autenticado → renderiza la ruta protegida
  return <Outlet />;
};

export default PrivateRoute;
