import React, { useState } from 'react';
import Presentacion from './pages/inicio/Presentacion.jsx'
import { Login } from './pages/inicio/Login.jsx';
const App = () => {

  const [vista,setVista] = useState('Principal')

  const cambiarvista=(vista)=> setVista(vista)
  return (
    <div>
        {vista == 'Principal' && <Presentacion cambiarvista={cambiarvista}/>}
        {vista=='Login' && <Login cambiarvista={cambiarvista}/>}
    </div>
  );
};

export default App;