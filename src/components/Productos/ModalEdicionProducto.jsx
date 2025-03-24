import React, { useState } from "react";
import { Modal, Form, Button, InputGroup } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const ModalEdicionProducto = ({
  showEditModal,
  setShowEditModal,
  productoEditado,
  handleEditInputChange,
  handleEditProducto,
  categorias
}) => {
  const [previewImage, setPreviewImage] = useState(productoEditado?.imagen || null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        handleEditInputChange({
          target: {
            name: 'imagen',
            value: reader.result
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  if (!productoEditado) return null;

  return (
    <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Editar Producto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombreProducto"
              value={productoEditado.nombreProducto}
              onChange={handleEditInputChange}
              placeholder="Ingresa el nombre"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Precio</Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-currency-dollar"></i>
              </InputGroup.Text>
              <Form.Control
                type="number"
                name="precio"
                value={productoEditado.precio}
                onChange={handleEditInputChange}
                placeholder="Ingresa el precio"
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              name="categoria"
              value={productoEditado.categoria}
              onChange={handleEditInputChange}
              className="form-select"
            >
              <option value="" className="text-muted">Selecciona una categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.nombreCategoria} className="text-dark">
                  {categoria.nombreCategoria}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Imagen</Form.Label>
            {productoEditado.imagen && (
              <div className="mb-2">
                <p className="text-muted mb-1">Imagen actual:</p>
                <img 
                  src={productoEditado.imagen} 
                  alt="Imagen actual" 
                  style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }} 
                />
              </div>
            )}
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {previewImage && previewImage !== productoEditado.imagen && (
              <div className="mt-2">
                <p className="text-muted mb-1">Nueva imagen:</p>
                <img 
                  src={previewImage} 
                  alt="Nueva imagen" 
                  style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'contain' }} 
                />
              </div>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowEditModal(false)}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleEditProducto}>
          Actualizar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionProducto;
