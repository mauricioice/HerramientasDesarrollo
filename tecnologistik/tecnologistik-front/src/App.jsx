import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import AdminUsuarios from './pages/AdminUsuarios';
import AdminCuentas from './pages/AdminCuentas';
import EmpleadoDashboard from './pages/EmpleadoDashboard';
import Transacciones from './pages/Transacciones';

function ProtectedRoute({ children, rolPermitido }) {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol')?.toUpperCase();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (rolPermitido && rol !== rolPermitido) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RedirectByRole() {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol')?.toUpperCase();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (rol === 'ADMIN') {
    return <Navigate to="/admin/usuarios" replace />;
  }

  return <Navigate to="/empleado/dashboard" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin/usuarios"
          element={
            <ProtectedRoute rolPermitido="ADMIN">
              <AdminUsuarios />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/cuentas"
          element={
            <ProtectedRoute rolPermitido="ADMIN">
              <AdminCuentas />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transacciones"
          element={
            <ProtectedRoute>
              <Transacciones />
            </ProtectedRoute>
          }
        />

        <Route
          path="/empleado/dashboard"
          element={
            <ProtectedRoute rolPermitido="USUARIO">
              <EmpleadoDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<RedirectByRole />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}