import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Modal, Form, Alert, Card, Col, Row, Pagination, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../../assets/database/firebaseconfig";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../../assets/database/authcontext";
import "../Styles/GestionProductos.css";

const GestionProductos = () => {
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [editProductoId, setEditProductoId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagenFile, setImagenFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDigito, setFilterDigito] = useState("");
  const [formValues, setFormValues] = useState({
    nombre: "",
    unitSize: "",
    digito: "",
    precioUnitario: "",
    descripcion: "",
    stock: "",
    imagen: "",
  });
  const productosPorPagina = 6;
  const navigate = useNavigate();
  const { distribuidoraId } = useAuth();

  // Obtener productos de Firestore
  const fetchProductos = useCallback(async () => {
    if (!distribuidoraId) {
      setError("No se encontró el ID de la distribuidora. Inicia sesión de nuevo.");
      return;
    }

    setLoading(true);
    try {
      const productosQuery = query(
        collection(db, "productos"),
        where("distribuidoraId", "==", distribuidoraId)
      );
      const productosSnapshot = await getDocs(productosQuery);
      const productosList = productosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProductos(productosList);
      setFilteredProductos(productosList);
    } catch (error) {
      setError("Error al cargar los productos. Intenta de nuevo.");
      console.error("Error al cargar los productos:", error);
    } finally {
      setLoading(false);
    }
  }, [distribuidoraId]);

  useEffect(() => {
    fetchProductos();
  }, [fetchProductos]);

  // Manejar búsqueda y filtro
  useEffect(() => {
    let filtered = productos;
    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterDigito) {
      filtered = filtered.filter((p) => p.digito === filterDigito);
    }
    setFilteredProductos(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterDigito, productos]);

  // Manejar cambios en los inputs del formulario
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };

  // Manejar envío del formulario (agregar o editar)
  const handleSubmitProducto = async (e) => {
    e.preventDefault();
    if (!distribuidoraId) {
      setError("No se encontró el ID de la distribuidora. Inicia sesión de nuevo.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const unitSize = Number(formValues.unitSize);
      const precioUnitario = Number(formValues.precioUnitario);
      const stock = Number(formValues.stock);

      if (isNaN(unitSize) || unitSize <= 0) {
        throw new Error("La cantidad por unidad debe ser un número positivo.");
      }
      if (isNaN(precioUnitario) || precioUnitario <= 0) {
        throw new Error("El precio unitario debe ser un número positivo.");
      }
      if (isNaN(stock) || stock < 0) {
        throw new Error("El stock debe ser un número no negativo.");
      }
      if (!formValues.nombre.trim()) {
        throw new Error("El nombre del producto es obligatorio.");
      }
      if (!formValues.digito) {
        throw new Error("Selecciona una unidad de medida.");
      }

      let imagenUrl = formValues.imagen || "";
      if (imagenFile) {
        const storageRef = ref(storage, `productos/${distribuidoraId}/${Date.now()}_${imagenFile.name}`);
        const snapshot = await uploadBytes(storageRef, imagenFile);
        imagenUrl = await getDownloadURL(snapshot.ref);
      }

      const precioTotal = unitSize * precioUnitario;
      const productoData = {
        imagen: imagenUrl,
        nombre: formValues.nombre.trim(),
        unitSize,
        digito: formValues.digito,
        precioUnitario,
        precioTotal,
        descripcion: formValues.descripcion.trim(),
        stock,
        fechaRegistro: new Date().toISOString().split("T")[0],
        distribuidoraId,
      };

      if (editProductoId) {
        const productoRef = doc(db, "productos", editProductoId);
        await updateDoc(productoRef, productoData);
        setProductos(productos.map((p) => (p.id === editProductoId ? { ...productoData, id: editProductoId } : p)));
      } else {
        const productoRef = await addDoc(collection(db, "productos"), productoData);
        setProductos([...productos, { ...productoData, id: productoRef.id }]);
      }

      resetForm();
    } catch (error) {
      setError(error.message || `Error al ${editProductoId ? "actualizar" : "guardar"} el producto. Intenta de nuevo.`);
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar eliminación de producto
  const handleDeleteProducto = async (id) => {
    if (!id) return;

    setLoading(true);
    setError("");
    try {
      await deleteDoc(doc(db, "productos", id));
      setProductos(productos.filter((p) => p.id !== id));
    } catch (error) {
      setError("Error al eliminar el producto. Intenta de nuevo.");
      console.error("Error al eliminar el producto:", error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar edición de producto
  const handleEditProducto = (producto) => {
    setFormValues({
      nombre: producto.nombre || "",
      unitSize: producto.unitSize || "",
      digito: producto.digito || "",
      precioUnitario: producto.precioUnitario || "",
      descripcion: producto.descripcion || "",
      stock: producto.stock || "",
      imagen: producto.imagen || "",
    });
    setEditProductoId(producto.id);
    setShowModal(true);
  };

  // Manejar detalles del producto
  const handleViewDetails = (producto) => {
    setSelectedProducto(producto);
    setShowDetailsModal(true);
  };

  // Reiniciar formulario y modal
  const resetForm = () => {
    setShowModal(false);
    setEditProductoId(null);
    setImagenFile(null);
    setFormValues({
      nombre: "",
      unitSize: "",
      digito: "",
      precioUnitario: "",
      descripcion: "",
      stock: "",
      imagen: "",
    });
  };

  // Paginación
  const indexOfLastProducto = currentPage * productosPorPagina;
  const indexOfFirstProducto = indexOfLastProducto - productosPorPagina;
  const productosActuales = filteredProductos.slice(indexOfFirstProducto, indexOfLastProducto);
  const totalPaginas = Math.ceil(filteredProductos.length / productosPorPagina);

  const paginationItems = useMemo(() => {
    const items = [];
    for (let page = 1; page <= totalPaginas; page++) {
      items.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => setCurrentPage(page)}
          disabled={loading}
        >
          {page}
        </Pagination.Item>
      );
    }
    return items;
  }, [currentPage, totalPaginas, loading]);

  return (
    <div className="gestion-productos-container">
      <div className="gestion-productos-content">
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="header-section">
          <div>
            <h1 className="gestion-productos-title">
              <i className="bi bi-box-seam me-2"></i>Gestión de Productos
            </h1>
            <p className="gestion-productos-subtitle">
              Administra el inventario de productos de tu tienda
            </p>
          </div>
          <Button
            className="nuevos-productos-button"
            onClick={() => setShowModal(true)}
            disabled={loading}
          >
            <i className="bi bi-plus-circle me-2"></i>Nuevos Productos
          </Button>
        </div>

        {/* Búsqueda y Filtro */}
        <Row className="mb-4">
          <Col md={6} className="mb-2 mb-md-0">
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
            </InputGroup>
          </Col>
          <Col md={6}>
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-funnel"></i>
              </InputGroup.Text>
              <Form.Select
                value={filterDigito}
                onChange={(e) => setFilterDigito(e.target.value)}
                disabled={loading}
              >
                <option value="">Todas las unidades</option>
                <option value="litros">Litros</option>
                <option value="unidades">Unidades</option>
                <option value="litras">Litras</option>
              </Form.Select>
            </InputGroup>
          </Col>
        </Row>

        {loading && <div className="text-center">Cargando...</div>}
        <Row>
          {productosActuales.length === 0 ? (
            <Col>
              <p className="text-center">No hay productos registrados.</p>
            </Col>
          ) : (
            productosActuales.map((producto) => (
              <Col xs={12} sm={6} md={4} key={producto.id} className="mb-4">
                <Card className="producto-card">
                  {producto.imagen && (
                    <Card.Img
                      variant="top"
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="producto-imagen"
                    />
                  )}
                  <Card.Body>
                    <Card.Title>{producto.nombre}</Card.Title>
                    <Card.Text>
                      <strong>Stock:</strong> {producto.stock} <br />
                      <strong>Precio Unitario:</strong> ${producto.precioUnitario}
                    </Card.Text>
                    <div className="card-actions">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleEditProducto(producto)}
                        disabled={loading}
                        aria-label="Editar producto"
                      >
                        <i className="bi bi-pencil me-1"></i>Editar
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteProducto(producto.id)}
                        disabled={loading}
                        aria-label="Eliminar producto"
                      >
                        <i className="bi bi-trash me-1"></i>Eliminar
                      </Button>
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => handleViewDetails(producto)}
                        disabled={loading}
                        aria-label="Ver detalles del producto"
                      >
                        <i className="bi bi-eye me-1"></i>Ver Más
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>

        {totalPaginas > 1 && (
          <Pagination className="pagination-container">{paginationItems}</Pagination>
        )}
      </div>

      {/* Modal para Agregar/Editar Producto */}
      <Modal show={showModal} onHide={resetForm} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-box me-2"></i>
            {editProductoId ? "Editar Producto" : "Agregar Nuevo Producto"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmitProducto}>
            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-image me-2"></i>Imagen
              </Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setImagenFile(e.target.files[0])}
              />
              {formValues.imagen && (
                <img src={formValues.imagen} alt="Vista previa" className="modal-img-preview mt-2" />
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-tag me-2"></i>Nombre
              </Form.Label>
              <Form.Control
                type="text"
                id="nombre"
                value={formValues.nombre}
                onChange={handleInputChange}
                placeholder="Nombre del producto"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-rulers me-2"></i>Cantidad por Unidad
              </Form.Label>
              <Form.Control
                type="number"
                id="unitSize"
                value={formValues.unitSize}
                onChange={handleInputChange}
                placeholder="Ej: 2 (para 2 litros)"
                required
                min="0.1"
                step="0.1"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-boxes me-2"></i>Unidad de Medida
              </Form.Label>
              <Form.Select
                id="digito"
                value={formValues.digito}
                onChange={handleInputChange}
                required
              >
                <option value="">Selecciona una unidad</option>
                <option value="litros">Litros</option>
                <option value="unidades">Unidades</option>
                <option value="litras">Litras</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-currency-dollar me-2"></i>Precio Unitario
              </Form.Label>
              <Form.Control
                type="number"
                id="precioUnitario"
                value={formValues.precioUnitario}
                onChange={handleInputChange}
                placeholder="Precio por unidad"
                required
                min="0.01"
                step="0.01"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-text-paragraph me-2"></i>Descripción
              </Form.Label>
              <Form.Control
                as="textarea"
                id="descripcion"
                value={formValues.descripcion}
                onChange={handleInputChange}
                placeholder="Descripción del producto"
                rows="3"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-stack me-2"></i>Stock Inicial
              </Form.Label>
              <Form.Control
                type="number"
                id="stock"
                value={formValues.stock}
                onChange={handleInputChange}
                placeholder="Cantidad disponible"
                required
                min="0"
                step="1"
              />
            </Form.Group>
            <div className="modal-actions">
              <Button type="submit" variant="primary" disabled={loading}>
                <i className="bi bi-save me-2"></i>
                {loading ? "Guardando..." : editProductoId ? "Actualizar" : "Agregar"}
              </Button>
              <Button variant="secondary" onClick={resetForm} disabled={loading}>
                <i className="bi bi-x-circle me-2"></i>Cancelar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal para Ver Detalles del Producto */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-info-circle me-2"></i>Detalles del Producto
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProducto && (
            <div>
              {selectedProducto.imagen && (
                <img
                  src={selectedProducto.imagen}
                  alt={selectedProducto.nombre}
                  className="modal-img-preview mb-3"
                />
              )}
              <p><strong><i className="bi bi-tag me-2"></i>Nombre:</strong> {selectedProducto.nombre}</p>
              <p><strong><i className="bi bi-rulers me-2"></i>Cantidad por Unidad:</strong> {selectedProducto.unitSize}</p>
              <p><strong><i className="bi bi-boxes me-2"></i>Unidad:</strong> {selectedProducto.digito}</p>
              <p><strong><i className="bi bi-currency-dollar me-2"></i>Precio Unitario:</strong> ${selectedProducto.precioUnitario}</p>
              <p><strong><i className="bi bi-currency-dollar me-2"></i>Precio Total:</strong> ${selectedProducto.precioTotal}</p>
              <p><strong><i className="bi bi-text-paragraph me-2"></i>Descripción:</strong> {selectedProducto.descripcion || "Sin descripción"}</p>
              <p><strong><i className="bi bi-stack me-2"></i>Stock:</strong> {selectedProducto.stock}</p>
              <p><strong><i className="bi bi-calendar me-2"></i>Fecha de Registro:</strong> {selectedProducto.fechaRegistro}</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            <i className="bi bi-x-circle me-2"></i>Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GestionProductos;