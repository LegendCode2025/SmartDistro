import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { db, appfirebase } from "../../assets/database/firebaseconfig"; // Ajusta la ruta según tu estructura
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import "../Styles/RegistroAdmin.css";

const RegistroAdmin = () => {
  const [rol, setRol] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [telefono, setTelefono] = useState("");
  const [telefonoFamiliar, setTelefonoFamiliar] = useState("");
  const [cedula, setCedula] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { distribuidoraId } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!distribuidoraId) {
      setError("No se encontró el ID de la distribuidora. Vuelve a intentarlo.");
      return;
    }

    try {
      // Registrar el administrador en Firebase Authentication
      const auth = getAuth(appfirebase);
      const userCredential = await createUserWithEmailAndPassword(auth, email, contrasena);
      const user = userCredential.user;

      // Guardar el administrador en Firestore
      const adminRef = await addDoc(collection(db, "admins"), {
        rol,
        nombres,
        apellidos,
        email,
        telefono,
        telefonoFamiliar,
        cedula,
        fechaNacimiento,
        distribuidoraId,
        uid: user.uid, // Guardar el UID de Firebase Auth
      });

      // Actualizar la distribuidora con el adminId
      const distribuidoraRef = doc(db, "distribuidoras", distribuidoraId);
      await updateDoc(distribuidoraRef, {
        adminId: adminRef.id,
      });

      navigate("/listar-empleados", { state: { distribuidoraId } });
    } catch (error) {
      setError("Error al registrar el administrador. Intenta de nuevo.");
      console.error("Error al registrar el administrador:", error);
    }
  };

  const handleBack = () => {
    navigate("/registro-distribuidora");
  };

  return (
    <div className="registro-admin-container">
      <div className="registro-admin-form-container">
        <h1 className="registro-admin-title">Registrar Dueño del Negocio</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="registro-admin-content">
          <div className="foto-perfil-placeholder">
            <span>Foto Perfil</span>
          </div>
          <form className="registro-admin-form" onSubmit={handleSubmit}>
            <div className="input-container">
              <span className="input-icon">👤</span>
              <input
                type="text"
                placeholder="Asignar Rol"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                required
              />
            </div>
            <div className="input-container">
              <span className="input-icon">📛</span>
              <input
                type="text"
                placeholder="Nombres"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                required
              />
            </div>
            <div className="input-container">
              <span className="input-icon">📛</span>
              <input
                type="text"
                placeholder="Apellidos"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                required
              />
            </div>
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
            <div className="input-container">
              <span className="input-icon">📞</span>
              <input
                type="tel"
                placeholder="Teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
              />
            </div>
            <div className="input-container">
              <span className="input-icon">📞</span>
              <input
                type="tel"
                placeholder="Teléfono Familiar"
                value={telefonoFamiliar}
                onChange={(e) => setTelefonoFamiliar(e.target.value)}
                required
              />
            </div>
            <div className="input-container">
              <span className="input-icon">🪪</span>
              <input
                type="text"
                placeholder="Cédula de Identidad"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                required
              />
            </div>
            <div className="input-container">
              <span className="input-icon">📅</span>
              <input
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
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

export default RegistroAdmin;