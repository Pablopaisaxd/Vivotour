import Presentacion from './pages/inicio/Presentacion.jsx'
import { Login } from './pages/inicio/Login.jsx';
import { Registro } from './pages/inicio/Registro.jsx';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Forgotpassword } from './pages/inicio/Forgotpassword.jsx';
import Reserva from './pages/inicio/Reserva.jsx';
import PrivateRoute from './components/use/PrivateRoute.jsx';
import { Perfil } from './pages/inicio/Perfil.jsx';

const App = () => {

  return (
    <Router>
      <Routes >
        <Route path='/' element={<Presentacion />}/>
        <Route path='/Login' element={<Login />} />
        <Route path='/Registro' element={<Registro />}/>
        <Route path='forgotpassword' element={<Forgotpassword />}/>
        <Route element={<PrivateRoute />}>
            <Route path="/Reserva" element={<Reserva />} />
            <Route path="/Perfil" element={<Perfil />}/>
          </Route>
      </Routes>
    </Router>
  );
};

export default App;