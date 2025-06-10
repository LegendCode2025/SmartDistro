import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { appfirebase } from "../assets/database/firebaseconfig"; // Ajusta la ruta según tu estructura
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../assets/database/authcontext";
import "../components/Styles/Login.css";
import RoleRedirect from "../components/RoleRedirect";

const Login = () => {
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  // Redirigir si el usuario ya está autenticado
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/gestion-productos");
    }
  }, [isLoggedIn, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const auth = getAuth(appfirebase);
      await signInWithEmailAndPassword(auth, email, contrasena);
      // No necesitamos hacer nada más aquí, el AuthContext manejará el estado del usuario
    } catch (error) {
      setError("Error al iniciar sesión. Verifica tus credenciales.");
      console.error("Error al iniciar sesión:", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h1 className="login-title">Iniciar Sesión</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-container">
            <span className="input-icon">📧</span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-container">
            <span className="input-icon">🔒</span>
            <input
              type="password"
              placeholder="Contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Iniciar Sesión
          </button>
        </form>
        <div className="login-links">
          <a href="/recuperar-contrasena">¿Olvidaste tu contraseña?</a>
          <p>
            ¿No tienes una cuenta?{" "}
            <a href="/registro-distribuidora">Regístrate</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;