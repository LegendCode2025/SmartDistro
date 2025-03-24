import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Offcanvas from "react-bootstrap/Offcanvas";
import logo from "../assets/react.svg";
import { useAuth } from "../assets/database/authcontext";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "../App.css";
import { Link } from "react-router-dom";

const Encabezado = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Cerrar el offcanvas antes de proceder
      setIsCollapsed(false);

      // Eliminar variables almacenadas en localStorage
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("adminPassword");

      // Cerrar sesión
      await logout();

      // Redirigir al inicio
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleToggle = () => setIsCollapsed(!isCollapsed);

  // Funciones de navegación
  const handleNavigate = (path) => {
    navigate(path);
    setIsCollapsed(false);
  };

  return (
    <Navbar expand="sm" fixed="top" className="color-navbar">
      <Container>
        <Navbar.Brand onClick={() => handleNavigate("/inicio")} className="text-white" style={{ cursor: "pointer" }}>
          <img alt="" src={logo} width="30" height="30" className="d-inline-block align-top" />{" "}
          <strong>SmartDistro</strong>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="offcanvasNavbar-expand-sm" onClick={handleToggle} />
        <Navbar.Offcanvas
          id="offcanvasNavbar-expand-sm"
          aria-labelledby="offcanvasNavbarLabel-expand-sm"
          placement="end"
          show={isCollapsed}
          onHide={() => setIsCollapsed(false)}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title
              id="offcanvasNavbarLabel-expand-sm"
              className={isCollapsed ? "color-texto-marca" : "text-white"}
            >
              <i className="bi bi-list me-2"></i>Menú
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="justify-content-end flex-grow-1 pe-3">
              <Nav.Link
                onClick={() => handleNavigate("/inicio")}
                className={isCollapsed ? "color-texto-marca" : "text-white"}
              >
                <i className="bi bi-house-door-fill me-2"></i>
                <strong>Inicio</strong>
              </Nav.Link>
              <Nav.Link
                onClick={() => handleNavigate("/productos")}
                className={isCollapsed ? "color-texto-marca" : "text-white"}
              >
                <i className="bi bi-box-seam me-2"></i>
                <strong>Productos</strong>
              </Nav.Link>
              <Nav.Link
                onClick={() => handleNavigate("/categorias")}
                className={isCollapsed ? "color-texto-marca" : "text-white"}
              >
                <i className="bi bi-tags me-2"></i>
                <strong>Categorías</strong>
              </Nav.Link>
              <Nav.Link
                onClick={() => handleNavigate("/catalogo")}
                className={isCollapsed ? "color-texto-marca" : "text-white"}
              >
                <i className="bi bi-book me-2"></i>
                <strong>Catálogo</strong>
              </Nav.Link>
              {isLoggedIn ? (
                <Nav.Link onClick={handleLogout} className={isCollapsed ? "color-texto-marca" : "text-white"}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  <strong>Cerrar Sesión</strong>
                </Nav.Link>
              ) : (
                <Nav.Link
                  onClick={() => handleNavigate("/")}
                  className={isCollapsed ? "color-texto-marca" : "text-white"}
                >
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  <strong>Iniciar Sesión</strong>
                </Nav.Link>
              )}
            </Nav>
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
};

export default Encabezado; 