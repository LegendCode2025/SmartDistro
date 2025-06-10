import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../assets/database/authcontext";

const ProtectedRoute = ({ element, allowedRoles }) => {
  const { isLoggedIn, userType } = useAuth();

  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(userType)) {
    return <Navigate to="/inicio" replace />;
  }
  return element;
};

export default ProtectedRoute;