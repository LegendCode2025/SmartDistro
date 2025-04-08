import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../src/assets/database/authcontext";
import Encabezado from "./components/Encabezado";
import Productos from "./views/Productos";
import Categorias from "./views/Categorias";
import Catalogo from "./components/Catalogo/Catalogo";
import Login from "./views/Login";
import Inicio from "./views/Inicio";
import RegistroDistribuidora from "./components/Registros/RegistroDistribuidora";
import RegistroAdmin from "./components/Registros/RegistroAdmin";
import ListarEmpleados from "./components/Registros/ListarEmpleados";
import GestionProductos from "./components/Productos/GestionProductos"; // Nuevo componente
import ProtectedRoute from "./components/ProtectedRoute";
import './App.css';

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
              <Route path="/categorias" element={<ProtectedRoute element={<Categorias />} />} />
              <Route path="/productos" element={<ProtectedRoute element={<Productos />} />} />
              <Route path="/catalogo" element={<ProtectedRoute element={<Catalogo />} />} />
              <Route path="/registro-distribuidora" element={<RegistroDistribuidora />} />
              <Route path="/registro-admin" element={<RegistroAdmin />} />
              <Route path="/listar-empleados" element={<ListarEmpleados />} />
              <Route path="/gestion-productos" element={<GestionProductos />} /> {/* Nueva ruta */}
              <Route path="/recuperar-contrasena" element={<div>Recuperar Contraseña (Placeholder)</div>} />
              <Route path="/caja" element={<div>Caja (Placeholder)</div>} />
              <Route path="/ordenes" element={<div>Órdenes (Placeholder)</div>} />
              <Route path="/estadisticas" element={<div>Estadísticas (Placeholder)</div>} />
              <Route path="/menu" element={<div>Menú (Placeholder)</div>} />
              <Route path="*" element={<div>404 - Página no encontrada</div>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;