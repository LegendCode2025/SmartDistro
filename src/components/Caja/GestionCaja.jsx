import React, { useState, useEffect } from "react";
import { Button, Modal, Table, Form, FormControl, Row, Col, InputGroup, Alert, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { db } from "../../assets/database/firebaseconfig";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../assets/database/authcontext";
import { jsPDF } from "jspdf";
import "../Styles/GestionCaja.css";

const GestionCaja = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [filteredOrdenes, setFilteredOrdenes] = useState([]);
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [montoPagado, setMontoPagado] = useState("");
  const [cambio, setCambio] = useState(0);
  const [estado, setEstado] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const ordenesPorPagina = 5;
  const navigate = useNavigate();
  const { distribuidoraId } = useAuth();

  useEffect(() => {
    const fetchOrdenes = async () => {
      if (!distribuidoraId) {
        setError("No se encontró el ID de la distribuidora. Inicia sesión de nuevo.");
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
        console.log("Órdenes cargadas:", ordenesList);
        setOrdenes(ordenesList);
        setFilteredOrdenes(ordenesList);
      } catch (error) {
        setError("Error al cargar las órdenes. Intenta de nuevo.");
        console.error("Error al cargar las órdenes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrdenes();
  }, [distribuidoraId]);

  useEffect(() => {
    let filtered = ordenes;
    if (searchTerm) {
      filtered = filtered.filter((orden) =>
        orden.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterEstado) {
      filtered = filtered.filter((orden) => orden.estado === filterEstado);
    }
    setFilteredOrdenes(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterEstado, ordenes]);

  useEffect(() => {
    if (selectedOrden && montoPagado) {
      const total = Number(selectedOrden.total) || 0;
      if (total === 0) {
        setWarning("El total de la orden es 0. Verifica los precios de los productos en la orden.");
        setCambio(Number(montoPagado));
      } else {
        const cambioCalculado = Number(montoPagado) - total;
        setCambio(cambioCalculado >= 0 ? cambioCalculado : 0);
        setWarning("");
      }
    } else {
      setCambio(0);
      setWarning("");
    }
  }, [montoPagado, selectedOrden]);

  const handleProcesarPago = async (e) => {
    e.preventDefault();

    if (!selectedOrden) {
      setError("No se ha seleccionado ninguna orden.");
      return;
    }

    const total = Number(selectedOrden.total) || 0;
    if (total > 0 && (!montoPagado || Number(montoPagado) < total)) {
      setError("El monto pagado debe ser mayor o igual al total de la orden.");
      return;
    }

    if (!estado) {
      setError("Selecciona un estado para la orden.");
      return;
    }

    setLoading(true);
    try {
      const ordenRef = doc(db, "ordenes", selectedOrden.id);
      await updateDoc(ordenRef, {
        estado,
        montoPagado: Number(montoPagado) || 0,
        cambio,
      });

      setOrdenes(
        ordenes.map((o) =>
          o.id === selectedOrden.id
            ? { ...o, estado, montoPagado: Number(montoPagado) || 0, cambio }
            : o
        )
      );
      setShowModal(false);
      setMontoPagado("");
      setEstado("");
      setCambio(0);
      setError("");
      setWarning("");
    } catch (error) {
      setError("Error al procesar el pago. Intenta de nuevo.");
      console.error("Error al procesar el pago:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = (orden, print = false) => {
    if (!orden) {
      setError("No se ha seleccionado ninguna orden.");
      return;
    }

    const total = Number(orden.total) || 0;
    if (total <= 0) {
      setError("No se puede generar el PDF: el total de la orden es 0 o inválido.");
      return;
    }

    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Recibo de Pago", 20, 20);
      doc.setFontSize(12);
      doc.text(`Código de Orden: ${orden.codigo || "N/A"}`, 20, 30);
      doc.text(`Fecha: ${orden.fecha || "N/A"}`, 20, 40);
      doc.text(`Estado: ${orden.estado || "N/A"}`, 20, 50);

      doc.text("Productos:", 20, 60);
      let y = 70;
      (orden.productos || []).forEach((producto, index) => {
        const subtotal = (producto.cantidad || 0) * (producto.precio || 0);
        doc.text(
          `${index + 1}. ${producto.nombreProducto || "Sin nombre"} - Cantidad: ${producto.cantidad || 0} - Precio: $${(producto.precio || 0).toFixed(2)} - Subtotal: $${subtotal.toFixed(2)}`,
          20,
          y
        );
        y += 10;
      });

      doc.text(`Total: $${total.toFixed(2)}`, 20, y + 10);
      doc.text(`Monto Pagado: $${Number(orden.montoPagado || 0).toFixed(2)}`, 20, y + 20);
      doc.text(`Cambio: $${Number(orden.cambio || 0).toFixed(2)}`, 20, y + 30);

      if (print) {
        const pdfBlob = doc.output("blob");
        const pdfUrl = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(pdfUrl);
        printWindow.onload = () => {
          printWindow.print();
        };
      } else {
        doc.save(`recibo_orden_${orden.codigo || "sin_codigo"}.pdf`);
      }
    } catch (error) {
      setError("Error al generar el PDF. Verifica la instalación de jsPDF.");
      console.error("Error al generar el PDF:", error);
    }
  };

  const handleOpenModal = (orden) => {
    setSelectedOrden(orden);
    setEstado(orden.estado || "Pendiente");
    setMontoPagado(orden.montoPagado || "");
    setCambio(orden.cambio || 0);
    setShowModal(true);
    if (!orden.total || orden.total <= 0) {
      setWarning("El total de la orden es 0 o inválido. Verifica los precios de los productos.");
    } else {
      setWarning("");
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
    <div className="gestion-caja-container">
      <div className="gestion-caja-content">
        {loading && <div className="text-center">Cargando...</div>}
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="header-section">
          <div>
            <h1 className="gestion-caja-title">
              <i className="bi bi-cash-stack me-2"></i>Gestión de Caja
            </h1>
            <p className="gestion-caja-subtitle">
              Procesa pagos y finaliza órdenes
            </p>
          </div>
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
                <option value="">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Pagada">Pagada</option>
                <option value="Entregada">Entregada</option>
              </Form.Select>
            </InputGroup>
          </Col>
        </Row>

        {filteredOrdenes.length === 0 && !loading && (
          <p className="text-center">No hay órdenes registradas.</p>
        )}
        {filteredOrdenes.length > 0 && (
          <>
            {/* Tabla para pantallas grandes (md y superiores) */}
            <Table className="caja-table d-none d-md-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Cantidad Total</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ordenesActuales.map((orden) => (
                  <tr key={orden.id}>
                    <td>{orden.codigo || "N/A"}</td>
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
                        onClick={() => handleOpenModal(orden)}
                        className="me-2"
                        disabled={loading}
                      >
                        <i className="bi bi-cash me-1"></i>Procesar Pago
                      </Button>
                      <Button
                        variant="outline-success"
                        size="sm"
                        onClick={() => generatePDF(orden, false)}
                        className="me-2"
                        disabled={loading || !orden.total || orden.total <= 0}
                      >
                        <i className="bi bi-file-earmark-pdf me-1"></i>Generar PDF
                      </Button>
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => generatePDF(orden, true)}
                        disabled={loading || !orden.total || orden.total <= 0}
                      >
                        <i className="bi bi-printer me-1"></i>Imprimir Baucher
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Tarjetas para pantallas pequeñas (menores a md) */}
            <div className="d-block d-md-none">
              <Row>
                {ordenesActuales.map((orden) => (
                  <Col xs={12} key={orden.id} className="mb-3">
                    <Card className="orden-card">
                      <Card.Body>
                        <Card.Title className="orden-card-title">
                          Orden {orden.codigo || "N/A"}
                        </Card.Title>
                        <Card.Text>
                          <strong>Fecha:</strong> {orden.fecha || "N/A"} <br />
                          <strong>Estado:</strong>{" "}
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
                          </span> <br />
                          <strong>Cantidad Total:</strong> {orden.cantidadTotal || 0} <br />
                          <strong>Total:</strong>{" "}
                          {orden.total != null && orden.total >= 0
                            ? `$${orden.total.toFixed(2)}`
                            : <span className="text-warning">Sin total</span>}
                        </Card.Text>
                        <div className="orden-card-actions">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleOpenModal(orden)}
                            className="me-2"
                            disabled={loading}
                          >
                            <i className="bi bi-cash me-1"></i>Procesar Pago
                          </Button>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => generatePDF(orden, false)}
                            className="me-2"
                            disabled={loading || !orden.total || orden.total <= 0}
                          >
                            <i className="bi bi-file-earmark-pdf me-1"></i>PDF
                          </Button>
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => generatePDF(orden, true)}
                            disabled={loading || !orden.total || orden.total <= 0}
                          >
                            <i className="bi bi-printer me-1"></i>Imprimir
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </>
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

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-cash-stack me-2"></i>Procesar Pago - Orden {selectedOrden?.codigo || "N/A"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading && <div className="text-center">Cargando...</div>}
          {error && <Alert variant="danger">{error}</Alert>}
          {warning && <Alert variant="warning">{warning}</Alert>}
          {selectedOrden && (
            <Form onSubmit={handleProcesarPago}>
              <div className="mb-3">
                <h6>Productos:</h6>
                <ul>
                  {(selectedOrden.productos || []).map((producto, index) => (
                    <li key={index}>
                      {producto.nombreProducto || "Sin nombre"} - Cantidad: {producto.cantidad || 0} - Precio: ${(producto.precio || 0).toFixed(2)} - Subtotal: ${((producto.cantidad || 0) * (producto.precio || 0)).toFixed(2)}
                    </li>
                  ))}
                </ul>
                <p>
                  <strong>
                    Total: {selectedOrden.total != null && selectedOrden.total >= 0
                      ? `$${selectedOrden.total.toFixed(2)}`
                      : <span className="text-warning">Sin total</span>}
                  </strong>
                </p>
              </div>

              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="bi bi-currency-dollar me-2"></i>Monto Pagado
                </Form.Label>
                <Form.Control
                  type="number"
                  value={montoPagado}
                  onChange={(e) => setMontoPagado(e.target.value)}
                  placeholder="Ingresa el monto pagado"
                  min="0"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="bi bi-arrow-repeat me-2"></i>Estado
                </Form.Label>
                <Form.Select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Selecciona un estado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Pagada">Pagada</option>
                  <option value="Entregada">Entregada</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>
                  <i className="bi bi-wallet me-2"></i>Cambio
                </Form.Label>
                <Form.Control
                  type="text"
                  value={cambio >= 0 ? `$${cambio.toFixed(2)}` : "N/A"}
                  readOnly
                  disabled
                />
              </Form.Group>

              <div className="modal-actions">
                <Button type="submit" variant="primary" disabled={loading}>
                  <i className="bi bi-save me-2"></i>{loading ? "Procesando..." : "Confirmar Pago"}
                </Button>
                <Button
                  variant="outline-primary"
                  onClick={() => generatePDF(selectedOrden, false)}
                  disabled={loading || !selectedOrden?.total || selectedOrden.total <= 0}
                >
                  <i className="bi bi-file-earmark-pdf me-2"></i>Generar PDF
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  <i className="bi bi-x-circle me-2"></i>Cancelar
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GestionCaja;