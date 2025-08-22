import Presentacion from './pages/inicio/Presentacion.jsx'
import { Login } from './pages/inicio/Login.jsx';
import { Registro } from './pages/inicio/Registro.jsx';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Forgotpassword } from './pages/inicio/Forgotpassword.jsx';
const App = () => {

  return (
    <Router>
      <Routes >
        <Route path='/' element={<Presentacion />}/>
        <Route path='/Login' element={<Login />} />
        <Route path='/Registro' element={<Registro />}/>
        <Route path='forgotpassword' element={<Forgotpassword />}/>
      </Routes>
    </Router>
  );
};

export default App;