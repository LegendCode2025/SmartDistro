import React, { useState, useEffect } from "react";
import { Button, Modal, Table, Form, FormControl, Card, Row, Col, InputGroup, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { db } from "../../assets/database/firebaseconfig";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../assets/database/authcontext";
import "../Styles/GestionOrdenes.css";

const GestionOrdenes = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [filteredOrdenes, setFilteredOrdenes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [selectedProductos, setSelectedProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showProductosModal, setShowProductosModal] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [cantidad, setCantidad] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("Pendiente");
  const [filterDigito, setFilterDigito] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOrdenId, setEditingOrdenId] = useState(null);
  const ordenesPorPagina = 5;
  const navigate = useNavigate();
  const { distribuidoraId } = useAuth();

  useEffect(() => {
    const fetchOrdenes = async () => {
      if (!distribuidoraId) {
        setError("No se encontró el ID de la distribuidora. Inicia sesión de nuevo.");
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const ordenesQuery = query(
          collection(db, "ordenes"),
          where("distribuidoraId", "==", distribuidoraId)
        );
        const ordenesSnapshot = await getDocs(ordenesQuery);
        const ordenesList = ordenesSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn));
        console.log("Órdenes cargadas en GestionOrdenes (ordenadas por creadoEn descendente):", ordenesList);
        setOrdenes(ordenesList);
        setFilteredOrdenes(ordenesList);
      } catch (error) {
        setError("Error al cargar las órdenes. Intenta de nuevo.");
        console.error("Error al cargar las órdenes:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchProductos = async () => {
      if (!distribuidoraId) {
        setError("No se encontró el ID de la distribuidora. Inicia sesión de nuevo.");
        navigate("/login");
        return;
      }

      setLoading(true);
      try {
        const productosQuery = query(
          collection(db, "productos"),
          where("distribuidoraId", "==", distribuidoraId)
        );
        const productosSnapshot = await getDocs(productosQuery);
        const productosList = productosSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((producto) => {
            const precio = Number(producto.precioUnitario || producto.precio || 0);
            if (precio <= 0) {
              console.warn(`Producto ${producto.nombre} tiene precio inválido: ${precio}`);
              return false;
            }
            return true;
          });
        setProductos(productosList);
        setFilteredProductos(productosList);
      } catch (error) {
        setError("Error al cargar los productos. Intenta de nuevo.");
        console.error("Error al cargar los productos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdenes();
    fetchProductos();

    // Cleanup para evitar actualizaciones en componente desmontado
    return () => {
      setOrdenes([]);
      setFilteredOrdenes([]);
      setProductos([]);
      setFilteredProductos([]);
    };
  }, [distribuidoraId, navigate]);

  useEffect(() => {
    let filtered = ordenes;
    if (searchTerm) {
      filtered = filtered.filter((orden) =>
        orden.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterEstado && filterEstado !== "Todos") {
      filtered = filtered.filter((orden) => orden.estado === filterEstado);
    }
    setFilteredOrdenes(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterEstado, ordenes]);

  useEffect(() => {
    let filtered = productos;
    if (searchTerm) {
      filtered = filtered.filter(
        (producto) =>
          producto.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (producto.categoria && producto.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (filterDigito) {
      filtered = filtered.filter((producto) => producto.digito === filterDigito);
    }
    setFilteredProductos(filtered);
  }, [searchTerm, filterDigito, productos]);

  const generateUniqueCode = async () => {
    let unique = false;
    let code;
    while (!unique) {
      code = Math.floor(10000 + Math.random() * 90000).toString();
      const codeQuery = query(
        collection(db, "ordenes"),
        where("codigo", "==", code),
        where("distribuidoraId", "==", distribuidoraId)
      );
      const codeSnapshot = await getDocs(codeQuery);
      if (codeSnapshot.empty) {
        unique = true;
      }
    }
    return code;
  };

  const handleSelectProducto = (producto) => {
    setSelectedProducto(producto);
    setShowProductosModal(false);
  };

  const handleAddProductoToOrder = () => {
    if (!selectedProducto || !cantidad || cantidad <= 0) {
      setError("Selecciona un producto y una cantidad válida.");
      return;
    }

    const precio = Number(selectedProducto.precioUnitario || selectedProducto.precio || 0);
    if (precio <= 0) {
      setError("El producto seleccionado tiene un precio inválido.");
      return;
    }

    const productoEnOrden = {
      id: selectedProducto.id,
      nombreProducto: selectedProducto.nombre,
      categoria: selectedProducto.categoria || "Sin categoría",
      precio,
      cantidad: Number(cantidad),
    };

    console.log("Añadiendo producto a la orden:", productoEnOrden);
    setSelectedProductos([...selectedProductos, productoEnOrden]);
    setSelectedProducto(null);
    setCantidad("");
    setError("");
  };

  const handleRemoveProductoFromOrder = (index) => {
    setSelectedProductos(selectedProductos.filter((_, i) => i !== index));
  };

  const handleAddOrden = async (e) => {
    e.preventDefault();

    if (!distribuidoraId) {
      setError("No se encontró el ID de la distribuidora. Inicia sesión de nuevo.");
      navigate("/login");
      return;
    }

    if (selectedProductos.length === 0) {
      setError("Debes seleccionar al menos un producto para crear la orden.");
      return;
    }

    setLoading(true);
    try {
      const estado = "Pendiente";
      const fecha = new Date().toISOString().split("T")[0];
      const creadoEn = new Date().toISOString();
      const codigo = isEditing ? ordenes.find((o) => o.id === editingOrdenId)?.codigo : await generateUniqueCode();
      const cantidadTotal = selectedProductos.reduce((sum, p) => sum + p.cantidad, 0);
      const total = selectedProductos.reduce((sum, p) => sum + p.cantidad * p.precio, 0);

      console.log("Productos seleccionados:", selectedProductos);
      console.log("Total calculado:", total);

      if (total <= 0) {
        throw new Error("El total de la orden es inválido. Verifica los precios de los productos.");
      }

      const nuevaOrden = {
        cantidadTotal,
        codigo,
        creadoEn,
        estado,
        fecha,
        productos: selectedProductos,
        distribuidoraId,
        total,
      };

      if (isEditing) {
        const ordenRef = doc(db, "ordenes", editingOrdenId);
        await updateDoc(ordenRef, nuevaOrden);
        setOrdenes(
          ordenes
            .map((o) => (o.id === editingOrdenId ? { id: editingOrdenId, ...nuevaOrden } : o))
            .sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn))
        );
        setFilteredOrdenes(
          filteredOrdenes
            .map((o) => (o.id === editingOrdenId ? { id: editingOrdenId, ...nuevaOrden } : o))
            .sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn))
        );
      } else {
        const ordenRef = await addDoc(collection(db, "ordenes"), nuevaOrden);
        const ordenConId = { id: ordenRef.id, ...nuevaOrden };
        setOrdenes([ordenConId, ...ordenes].sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn)));
        setFilteredOrdenes([ordenConId, ...filteredOrdenes].sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn)));
      }

      for (const producto of selectedProductos) {
        const productoRef = doc(db, "productos", producto.id);
        const productoActual = productos.find((p) => p.id === producto.id);
        const nuevaCantidad = (productoActual?.stock || productoActual?.cantidad || 0) - producto.cantidad;

        if (nuevaCantidad < 0) {
          throw new Error(`No hay suficiente stock para ${producto.nombreProducto}`);
        }

        await updateDoc(productoRef, { stock: nuevaCantidad });
      }

      setSelectedProductos([]);
      setShowModal(false);
      setIsEditing(false);
      setEditingOrdenId(null);
    } catch (error) {
      setError(error.message || "Error al guardar la orden. Intenta de nuevo.");
      console.error("Error al guardar la orden:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditOrden = (index) => {
    const orden = filteredOrdenes[index];
    setIsEditing(true);
    setEditingOrdenId(orden.id);
    setSelectedProductos(orden.productos || []);
    setShowModal(true);
  };

  const handleDeleteOrden = async (index) => {
    const orden = filteredOrdenes[index];
    if (!orden.id) return;

    setLoading(true);
    try {
      await deleteDoc(doc(db, "ordenes", orden.id));
      setOrdenes(ordenes.filter((o) => o.id !== orden.id));
      setFilteredOrdenes(filteredOrdenes.filter((o) => o.id !== orden.id));
    } catch (error) {
      setError("Error al eliminar la orden. Intenta de nuevo.");
      console.error("Error al eliminar la orden:", error);
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastOrden = currentPage * ordenesPorPagina;
  const indexOfFirstOrden = indexOfLastOrden - ordenesPorPagina;
  const ordenesActuales = filteredOrdenes.slice(indexOfFirstOrden, indexOfLastOrden);
  const totalPaginas = Math.ceil(filteredOrdenes.length / ordenesPorPagina);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="gestion-ordenes-container">
      <div className="gestion-ordenes-content">
        {loading && <div className="text-center">Cargando...</div>}
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="header-section">
          <div>
            <h1 className="gestion-ordenes-title">
              <i className="bi bi-cart me-2"></i>Gestión de Órdenes
            </h1>
            <p className="gestion-ordenes-subtitle">
              Administra las órdenes de tu distribuidora
            </p>
          </div>
          <Button
            className="nuevas-ordenes-button"
            onClick={() => {
              setIsEditing(false);
              setSelectedProductos([]);
              setShowModal(true);
            }}
            disabled={loading}
          >
            <i className="bi bi-plus-circle me-2"></i>Nueva Orden
          </Button>
        </div>

        <Row className="mb-4">
          <Col md={6} className="mb-2 mb-md-0">
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <FormControl
                type="text"
                placeholder="Buscar por código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
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
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                disabled={loading}
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Pagada">Pagada</option>
                <option value="Entregada">Entregada</option>
                <option value="Todos">Todos</option>
              </Form.Select>
            </InputGroup>
          </Col>
        </Row>

        {filteredOrdenes.length === 0 && !loading && (
          <p className="text-center">No hay órdenes registradas.</p>
        )}
        {filteredOrdenes.length > 0 && (
          <Table className="ordenes-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Creado En</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Cantidad Total</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenesActuales.map((orden, index) => (
                <tr key={orden.id}>
                  <td>{orden.codigo || "N/A"}</td>
                  <td>{orden.creadoEn || "N/A"}</td>
                  <td>{orden.fecha || "N/A"}</td>
                  <td>
                    <span
                      className={`badge ${
                        orden.estado === "Pendiente"
                          ? "bg-warning"
                          : orden.estado === "Pagada"
                          ? "bg-success"
                          : "bg-primary"
                      }`}
                    >
                      {orden.estado || "Pendiente"}
                    </span>
                  </td>
                  <td>{orden.cantidadTotal || 0}</td>
                  <td>
                    {orden.total != null && orden.total >= 0
                      ? `$${orden.total.toFixed(2)}`
                      : <span className="text-warning">Sin total</span>}
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEditOrden(index)}
                      className="me-2"
                      disabled={loading}
                    >
                      <i className="bi bi-pencil me-1"></i>Editar
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteOrden(index)}
                      disabled={loading}
                    >
                      <i className="bi bi-trash me-1"></i>Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {totalPaginas > 1 && (
          <div className="pagination-container">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
              (page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "primary" : "outline-primary"}
                  onClick={() => handlePageChange(page)}
                  className="pagination-button"
                  disabled={loading}
                >
                  {page}
                </Button>
              )
            )}
          </div>
        )}
      </div>

      <Modal show={showModal} onHide={() => {
        setShowModal(false);
        setIsEditing(false);
        setSelectedProductos([]);
        setEditingOrdenId(null);
      }} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-cart-plus me-2"></i>
            {isEditing ? "Editar Orden" : "Agregar Nueva Orden"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading && <div className="text-center">Cargando...</div>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleAddOrden}>
            <Form.Group className="mb-3">
              <Form.Label>
                <i className="bi bi-box me-2"></i>Seleccionar Producto
              </Form.Label>
              <div className="d-flex align-items-center">
                <Button
                  variant="outline-primary"
                  onClick={() => setShowProductosModal(true)}
                  className="me-2"
                  disabled={loading}
                >
                  {selectedProducto ? selectedProducto.nombre : "Seleccionar Producto"}
                </Button>
                <Form.Control
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="Cantidad"
                  min="1"
                  className="me-2"
                  style={{ width: "100px" }}
                  disabled={loading}
                />
                <Button
                  variant="outline-primary"
                  onClick={handleAddProductoToOrder}
                  disabled={loading}
                >
                  <i className="bi bi-plus-circle me-1"></i>Agregar
                </Button>
              </div>
              {selectedProducto && selectedProducto.imagen && (
                <img
                  src={selectedProducto.imagen}
                  alt={selectedProducto.nombre}
                  className="modal-img-preview mt-2"
                />
              )}
            </Form.Group>

            {selectedProductos.length > 0 && (
              <div className="mb-3">
                <h6>Productos Seleccionados:</h6>
                <ul>
                  {selectedProductos.map((producto, index) => (
                    <li key={index}>
                      {producto.nombreProducto} - Cantidad: {producto.cantidad} - Precio: ${producto.precio.toFixed(2)}
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="ms-2"
                        onClick={() => handleRemoveProductoFromOrder(index)}
                        disabled={loading}
                      >
                        <i className="bi bi-trash me-1"></i>Quitar
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="modal-actions">
              <Button type="submit" variant="primary" disabled={loading}>
                <i className="bi bi-save me-2"></i>{loading ? "Guardando..." : isEditing ? "Actualizar Orden" : "Crear Orden"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowModal(false);
                  setIsEditing(false);
                  setSelectedProductos([]);
                  setEditingOrdenId(null);
                }}
                disabled={loading}
              >
                <i className="bi bi-x-circle me-2"></i>Cancelar
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showProductosModal} onHide={() => setShowProductosModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-box-seam me-2"></i>Seleccionar Producto
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading && <div className="text-center">Cargando...</div>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Row className="mb-4">
            <Col md={6} className="mb-2 mb-md-0">
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <FormControl
                  type="text"
                  placeholder="Buscar por nombre o categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
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
          {filteredProductos.length === 0 && !loading && (
            <p className="text-center">No hay productos disponibles.</p>
          )}
          <Row>
            {filteredProductos.map((producto) => (
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
                    <Card.Title>{producto.nombre || "Sin nombre"}</Card.Title>
                    <Card.Text>
                      <strong>Categoría:</strong> {producto.categoria || "Sin categoría"} <br />
                      <strong>Precio:</strong> ${(producto.precioUnitario || producto.precio || 0).toFixed(2)} <br />
                      <strong>Stock:</strong> {producto.stock || producto.cantidad || 0}
                    </Card.Text>
                    <div className="card-actions">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleSelectProducto(producto)}
                        disabled={loading}
                      >
                        <i className="bi bi-check-circle me-1"></i>Seleccionar
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GestionOrdenes;