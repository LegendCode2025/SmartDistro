import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../assets/database/authcontext";
import "../components/Styles/Encabezado.css";

const Encabezado = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, userType, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Determinar el rol del usuario para mostrarlo
  const getUserRole = () => {
    if (!userType) return "";
    return userType === "admin" ? "Administrador" : "Empleado";
  };

  return (
    <Navbar expand="lg" className="encabezado">
      <Container>
        <Navbar.Brand onClick={() => navigate("/inicio")} className="d-flex align-items-center">
        
          <span className="ms-2">Smart Distro</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {isLoggedIn ? (
              <>
                <span className="user-info me-3">
                  {getUserRole()} - {user?.email}
                </span>
                <Button
                  className="cerrar-sesion-btn"
                  onClick={handleLogout}
                >
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
  );
};

export default Encabezado;