import React from "react";
import { Outlet } from "react-router-dom";
import Menu from "./Menu"; // Asegúrate de ajustar la ruta

const Layout = () => {
  return (
    <div className="layout-container">
      <Menu />
      <div className="content-container">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;