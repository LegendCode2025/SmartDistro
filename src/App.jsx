import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../src/assets/database/authcontext";
import Encabezado from "./components/Encabezado";
import Login from "./views/Login";
import Inicio from "./views/Inicio";
import RegistroDistribuidora from "./components/Registros/RegistroDistribuidora";
import RegistroAdmin from "./components/Registros/RegistroAdmin";
import ListarEmpleados from "./components/Registros/ListarEmpleados";
import GestionProductos from "./components/Productos/GestionProductos";
import GestionOrdenes from "./components/Ordenes/GestionOrdenes";
import GestionCaja from "./components/Caja/GestionCaja";
import ProtectedRoute from "./components/ProtectedRoute";
import GestionConfiguracion from "./components/Configuracion/GestionConfiguracion";
import './App.css';
import Estadisticas from "./components/Estadisticas/Estadisticas";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App d-flex flex-column min-vh-100">
          <Encabezado />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/inicio" element={<Inicio />} />
              <Route path="/" element={<Navigate to="/inicio" replace />} />
              <Route path="/registro-distribuidora" element={<RegistroDistribuidora />} />
              <Route path="/registro-admin" element={<RegistroAdmin />} />
              <Route path="/listar-empleados" element={<ListarEmpleados />} />
              <Route path="/gestion-productos" element={<ProtectedRoute element={<GestionProductos />} allowedRoles={["admin"]} />} />
              <Route path="/gestion-ordenes" element={<ProtectedRoute element={<GestionOrdenes />} allowedRoles={["Atención al cliente", "admin"]} />} />
              <Route path="/gestion-caja" element={<ProtectedRoute element={<GestionCaja />} allowedRoles={["Caja", "admin"]} />} />
              <Route path="/estadisticas" element={<ProtectedRoute element={<Estadisticas/>} allowedRoles={["admin"]} />} />
              <Route path="/gestion-configuracion" element={<ProtectedRoute element={<GestionConfiguracion />} allowedRoles={["admin"]} />} />
              <Route path="*" element={<div>404 - Página no encontrada</div>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;