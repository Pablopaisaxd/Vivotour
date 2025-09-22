import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './AuthContext.jsx'
import { AdminProvider } from './pages/Admin/AdminContext.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AdminProvider>
        <App/>
      </AdminProvider>
    </AuthProvider>
  </StrictMode>,
)