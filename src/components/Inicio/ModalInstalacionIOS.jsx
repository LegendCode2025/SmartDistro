import React from 'react';
import { Modal, Button } from 'react-bootstrap';

// Puedes reemplazar esta imagen por un GIF con pasos visuales si lo agregas en assets
import instruccionesGif from '../../assets/instrucciones.gif';

const ModalInstalacionIOS = ({ mostrar, cerrar }) => {
  return (
    <Modal show={mostrar} onHide={cerrar} centered>
      <Modal.Header closeButton>
        <Modal.Title>Cómo instalar la app en iPhone</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Sigue estos pasos para agregar la app a tu pantalla de inicio:</p>
        <ol>
          <li>Abre esta página en Safari.</li>
          <li>Presiona el botón de compartir (<i className="bi bi-box-arrow-up"></i>).</li>
          <li>Selecciona «Agregar a pantalla de inicio».</li>
          <li>Confirma el nombre y presiona «Agregar».</li>
        </ol>
        <div className="text-center mt-3">
          <img src={instruccionesGif} alt="Instrucciones visuales" className="img-fluid" />
        </div> 
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={cerrar}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalInstalacionIOS;