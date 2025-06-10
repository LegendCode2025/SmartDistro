import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../assets/database/authcontext";
import "../components/Styles/Encabezado.css";

const Encabezado = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user, userType, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Determinar el rol del usuario para mostrarlo
  const getUserRole = () => {
    if (!userType) return "";
    return userType; // Devuelve el rol tal como está registrado: "Administrador", "Caja", "Atención al cliente"
  };

  // Determinar si mostrar el menú secundario
  const showSecondaryMenu = [
    "/gestion-productos",
    "/gestion-caja",
    "/gestion-ordenes",
    "/estadisticas",
    "/gestion-configuracion",
  ].includes(location.pathname);

  return (
    <div className="encabezado">
      <Navbar bg="light" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="w-100 align-items-center">
              {/* Logo */}
              <Nav.Link onClick={() => navigate("/inicio")} className="logo-text">
                Smart Distro
              </Nav.Link>

              {/* Menú Secundario (si está autenticado y en la ruta correcta) */}
              {isLoggedIn && showSecondaryMenu && (
  <Nav className="secondary-nav">
    {/* Administrador ve todos los botones */}
    {userType === "admin" && (
      <>
        <Nav.Link
          active={location.pathname === "/gestion-productos"}
          onClick={() => navigate("/gestion-productos")}
          className="nav-link-custom"
        >
          Productos
        </Nav.Link>
        <Nav.Link
          active={location.pathname === "/gestion-caja"}
          onClick={() => navigate("/gestion-caja")}
          className="nav-link-custom"
        >
          Caja
        </Nav.Link>
        <Nav.Link
          active={location.pathname === "/gestion-ordenes"}
          onClick={() => navigate("/gestion-ordenes")}
          className="nav-link-custom"
        >
          Órdenes
        </Nav.Link>
        <Nav.Link
          active={location.pathname === "/estadisticas"}
          onClick={() => navigate("/estadisticas")}
          className="nav-link-custom"
        >
          Estadísticas
        </Nav.Link>
        <Nav.Link
          active={location.pathname === "/gestion-configuracion"}
          onClick={() => navigate("/gestion-configuracion")}
          className="nav-link-custom"
        >
          Configuración
        </Nav.Link>
      </>
    )}
    {/* Solo Caja ve el botón Caja */}
    {userType === "Caja" && (
      <Nav.Link
        active={location.pathname === "/gestion-caja"}
        onClick={() => navigate("/gestion-caja")}
        className="nav-link-custom"
      >
        Caja
      </Nav.Link>
    )}
    {/* Solo Atención al cliente ve el botón Órdenes */}
    {userType === "Atención al cliente" && (
      <Nav.Link
        active={location.pathname === "/gestion-ordenes"}
        onClick={() => navigate("/gestion-ordenes")}
        className="nav-link-custom"
      >
        Órdenes
      </Nav.Link>
    )}
  </Nav>
)}

            {/* Espaciador para empujar los elementos a la derecha */}
            <div className="flex-grow-1"></div>

            {/* Elementos del usuario (si está autenticado) */}
            {isLoggedIn ? (
              <>
                <span className="user-info me-3">
                  {getUserRole()} - {user?.email}
                </span>
                <Button className="cerrar-sesion-btn" onClick={handleLogout}>
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Nav.Link
                  onClick={() => navigate("/login")}
                  className="iniciar-sesion-link me-3"
                >
                  Iniciar Sesión
                </Nav.Link>
                <Button
                  variant="primary"
                  className="registrar-distribuidora-btn"
                  onClick={() => navigate("/registro-distribuidora")}
                >
                  Registrar Distribuidora
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    </div>
  );
};

export default Encabezado;