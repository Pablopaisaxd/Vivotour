import Presentacion from './pages/inicio/Presentacion.jsx'
import { Login } from './pages/inicio/Login.jsx';
import { Registro } from './pages/inicio/Registro.jsx';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Forgotpassword } from './pages/inicio/Forgotpassword.jsx';
import Reset from './pages/inicio/Reset.jsx';
import Reserva from './pages/inicio/Reserva.jsx';
import PrivateRoute from './components/use/PrivateRoute.jsx';
import { Perfil } from './pages/inicio/Perfil.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import CompleteProfile from './pages/inicio/CompleteProfile.jsx';
import CheckoutPage from './pages/payment/CheckoutPage.jsx';
import TestPayment from './pages/TestPayment.jsx';
import ReservasDashboard from './pages/dashboard/ReservasDashboard.jsx';

const App = () => {
  return (
    <Router>
      <Routes >
        <Route path='/' element={<Presentacion />}/>
        <Route path='/Login' element={<Login />} />
        <Route path='/Registro' element={<Registro />}/>
        <Route path='' element={<Registro />}/>
        <Route path='forgotpassword' element={<Forgotpassword />}/>
  <Route path='reset' element={<Reset />}/>
    <Route path='/completar-perfil' element={<CompleteProfile />} />
        <Route element={<PrivateRoute />}>
            <Route path="/Reserva" element={<Reserva />} />
            <Route path="/Perfil" element={<Perfil />}/>
            <Route path="/checkout/:reservaId" element={<CheckoutPage />} />
            <Route path="/test-payment" element={<TestPayment />} />
            <Route path="/dashboard/reservas" element={<ReservasDashboard />} />
          </Route>
          <Route path='/Admin' element={<AdminDashboard />}/>
      </Routes>
    </Router>
  );
};

export default App;