import React, { useState } from "react";
import { db, appfirebase } from "../../assets/database/firebaseconfig"; // Ajusta la ruta según tu estructura
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import "../Styles/RegistroEmpleado.css";

const RegistroEmpleado = ({ onAddEmpleado }) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Registrar el empleado en Firebase Authentication
      const auth = getAuth(appfirebase);
      const userCredential = await createUserWithEmailAndPassword(auth, email, contrasena);
      const user = userCredential.user;

      const nuevoEmpleado = {
        rol,
        nombres,
        apellidos,
        email,
        telefono,
        telefonoFamiliar,
        cedula,
        fechaNacimiento,
        uid: user.uid, // Guardar el UID de Firebase Auth
      };

      onAddEmpleado(nuevoEmpleado);

      // Limpiar el formulario
      setRol("");
      setNombres("");
      setApellidos("");
      setEmail("");
      setContrasena("");
      setTelefono("");
      setTelefonoFamiliar("");
      setCedula("");
      setFechaNacimiento("");
    } catch (error) {
      setError("Error al registrar el empleado. Intenta de nuevo.");
      console.error("Error al registrar el empleado:", error);
    }
  };

  return (
    <div className="registro-empleado-container">
      {error && <div className="alert alert-danger">{error}</div>}
      <form className="registro-empleado-form" onSubmit={handleSubmit}>
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
          <button type="submit" className="agregar-button">
            Agregar
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistroEmpleado;