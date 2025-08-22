import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../../AuthContext";

const PrivateRoute = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  if (!isAuthenticated) {
    // si no está autenticado → redirige a login
    // usamos replace:true para no dejar la ruta protegida en el historial
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // si está autenticado → renderiza la ruta protegida
  return <Outlet />;
};

export default PrivateRoute;
