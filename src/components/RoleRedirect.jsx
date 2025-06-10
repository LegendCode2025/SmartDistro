import { useEffect } from "react";
import { useAuth } from "../assets/database/authcontext";
import { useNavigate } from "react-router-dom";

const RoleRedirect = () => {
  const { isLoggedIn, userType } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      if (userType === "admin") {
        navigate("/gestion-productos", { replace: true });
      } else if (userType === "Caja") {
        navigate("/gestion-caja", { replace: true });
      } else if (userType === "Atención al cliente") {
        navigate("/gestion-ordenes", { replace: true });
      }
    }
  }, [isLoggedIn, userType, navigate]);

  return null;
};

export default RoleRedirect;
