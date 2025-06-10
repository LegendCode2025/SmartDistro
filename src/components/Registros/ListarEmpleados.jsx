import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { db } from "../../assets/database/firebaseconfig"; // Ajusta la ruta según tu estructura
import { collection, addDoc } from "firebase/firestore";
import RegistroEmpleado from "./RegistroEmpleado";
import "../Styles/ListarEmpleados.css";

const ListarEmpleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { distribuidoraId } = location.state || {};

  const handleAddEmpleado = async (nuevoEmpleado) => {
    if (!distribuidoraId) {
      setError("No se encontró el ID de la distribuidora. Vuelve a intentarlo.");
      return;
    }

    try {
      // Guardar el empleado en la subcolección 'empleados' de la distribuidora
      const empleadoRef = await addDoc(
        collection(db, "distribuidoras", distribuidoraId, "empleados"),
        nuevoEmpleado
      );

      // Agregar el empleado a la lista local con su ID
      setEmpleados([...empleados, { ...nuevoEmpleado, id: empleadoRef.id }]);
      setShowModal(false);
    } catch (error) {
      setError("Error al guardar el empleado. Intenta de nuevo.");
      console.error("Error al guardar el empleado:", error);
    }
  };

  const handleDeleteEmpleado = async (index) => {
    // Aquí puedes implementar la lógica para eliminar el empleado de Firestore si es necesario
    setEmpleados(empleados.filter((_, i) => i !== index));
  };

  const handleOmitir = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmOmitir = () => {
    setShowConfirmModal(false);
    navigate("/gestion-productos");
  };

  const handleSiguiente = () => {
    navigate("/gestion-productos");
  };

  const handleBack = () => {
    navigate("/registro-admin");
  };

  return (
    <div className="listar-empleados-container">
      <div className="listar-empleados-form-container">
        <h1 className="listar-empleados-title">Registrar Trabajadores</h1>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="listar-empleados-header">
          <Button
            className="agregar-empleados-button"
            onClick={() => setShowModal(true)}
          >
            Agregar Empleados
          </Button>
        </div>
        <div className="empleados-list">
          {empleados.length === 0 ? (
            <p>No hay empleados registrados.</p>
          ) : (
            empleados.map((empleado, index) => (
              <div key={index} className="empleado-item">
                <span>{`${empleado.nombres} ${empleado.apellidos}`}</span>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteEmpleado(index)}
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
        <div className="button-container">
          <Button className="back-button" onClick={handleBack}>
            Volver
          </Button>
          <Button className="omitir-button" onClick={handleOmitir}>
            Omitir
          </Button>
          <Button className="siguiente-button" onClick={handleSiguiente}>
            Siguiente
          </Button>
        </div>
      </div>

      {/* Modal para agregar empleado */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>TEST MODAL REGISTRO</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <RegistroEmpleado onAddEmpleado={handleAddEmpleado} />
        </Modal.Body>
      </Modal>

      {/* Modal de confirmación para omitir */}
      <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Omisión</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas omitir el registro de empleados? Esto
          continuará con la gestión de productos.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirmOmitir}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ListarEmpleados;