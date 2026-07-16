import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Vehiculos from './pages/Vehiculos';
import Ordenes from './pages/Ordenes';
import Reservas from './pages/Reservas';
import Mecanicos from './pages/Mecanicos';
import Repuestos from './pages/Repuestos';
import Diagnosticos from './pages/Diagnosticos';
import Presupuestos from './pages/Presupuestos';
import Avances from './pages/Avances';
import SolicitudesRepuesto from './pages/SolicitudesRepuesto';
import DocumentosPago from './pages/DocumentosPago';
import Historial from './pages/Historial';

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/vehiculos" element={<Vehiculos />} />
        <Route path="/ordenes" element={<Ordenes />} />
        <Route path="/reservas" element={<Reservas />} />
        <Route path="/mecanicos" element={<Mecanicos />} />
        <Route path="/repuestos" element={<Repuestos />} />
        <Route path="/diagnosticos" element={<Diagnosticos />} />
        <Route path="/presupuestos" element={<Presupuestos />} />
        <Route path="/avances" element={<Avances />} />
        <Route path="/solicitudes-repuesto" element={<SolicitudesRepuesto />} />
        <Route path="/documentos-pago" element={<DocumentosPago />} />
        <Route path="/historial" element={<Historial />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
