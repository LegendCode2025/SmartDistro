import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../assets/database/firebaseconfig"; // Ajusta la ruta según tu estructura
import { collection, addDoc } from "firebase/firestore";
import "../Styles/RegistroDistribuidora.css";

const RegistroDistribuidora = () => {
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Guardar la distribuidora en Firestore
      const distribuidoraRef = await addDoc(collection(db, "distribuidoras"), {
        nombre,
        direccion,
        adminId: null, // Se actualizará después de crear el administrador
      });

      // Redirigir a RegistroAdmin y pasar el distribuidoraId
      navigate("/registro-admin", { state: { distribuidoraId: distribuidoraRef.id } });
    } catch (error) {
      setError("Error al guardar la distribuidora. Intenta de nuevo.");
      console.error("Error al guardar la distribuidora:", error);
    }
  };

  const handleBack = () => {
    navigate("/inicio");
  };

  return (
    <div className="registro-distribuidora-container">
      <div className="registro-distribuidora-form-container">
        <h1 className="registro-distribuidora-title">Registrar Nueva Distribuidora</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="registro-distribuidora-content">
          <div className="logo-placeholder">
            <span>LOGO</span>
          </div>
          <form className="registro-distribuidora-form" onSubmit={handleSubmit}>
            <div className="input-container">
              <span className="input-icon">📛</span>
              <input
                type="text"
                placeholder="Nombre de Distribuidora"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div className="input-container">
              <span className="input-icon">📍</span>
              <input
                type="text"
                placeholder="Dirección"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                required
              />
            </div>
            <div className="button-container">
              <button type="button" className="back-button" onClick={handleBack}>
                Volver
              </button>
              <button type="submit" className="next-button">
                Siguiente
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistroDistribuidora;