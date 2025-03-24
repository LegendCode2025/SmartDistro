import React, { useState } from "react";
import { Modal, Form, Button, InputGroup } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const ModalRegistroProducto = ({
  showModal,
  setShowModal,
  nuevoProducto,
  handleInputChange,
  handleAddProducto,
  categorias
}) => {
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        handleInputChange({
          target: {
            name: 'imagen',
            value: reader.result
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal show={showModal} onHide={() => setShowModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Agregar Producto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombreProducto"
              value={nuevoProducto.nombreProducto}
              onChange={handleInputChange}
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
                value={nuevoProducto.precio}
                onChange={handleInputChange}
                placeholder="Ingresa el precio"
              />
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              name="categoria"
              value={nuevoProducto.categoria}
              onChange={handleInputChange}
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
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {previewImage && (
              <div className="mt-2">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  style={{ maxWidth: '200px', maxHeight: '200px' }} 
                />
              </div>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowModal(false)}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleAddProducto}>
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroProducto;