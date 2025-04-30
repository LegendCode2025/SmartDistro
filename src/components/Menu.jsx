import React from "react";
import { Nav } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import "./Styles/Menu.css";

const Menu = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Nav className="secondary-nav">
      <Nav.Item>
        <Nav.Link
          active={location.pathname === "/GestionProductos"}
          onClick={() => navigate("/GestionProductos")}
          className="nav-link-custom"
        >
          Productos
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link
          active={location.pathname === "/caja"}
          onClick={() => navigate("/caja")}
          className="nav-link-custom"
        >
          Caja
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link
          active={location.pathname === "/ordenes"}
          onClick={() => navigate("/ordenes")}
          className="nav-link-custom"
        >
          Órdenes
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link
          active={location.pathname === "/estadisticas"}
          onClick={() => navigate("/estadisticas")}
          className="nav-link-custom"
        >
          Estadísticas
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link
          active={location.pathname === "/menu"}
          onClick={() => navigate("/menu")}
          className="nav-link-custom"
        >
          Menú
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
};

export default Menu;