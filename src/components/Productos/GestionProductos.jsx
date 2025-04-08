import React, { useState, useEffect } from "react";
import { Nav, Button, Modal, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { db } from "../../assets/database/firebaseconfig"; // Ajusta la ruta según tu estructura
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "../../assets/database/authcontext";
import "../Styles/GestionProductos.css";

const GestionProductos = () => {
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState("");
  const productosPorPagina = 5;
  const navigate = useNavigate();
  const { distribuidoraId } = useAuth();

  // Cargar productos al montar el componente
  useEffect(() => {
    const fetchProductos = async () => {
      if (!distribuidoraId) {
        setError("No se encontró el ID de la distribuidora. Inicia sesión de nuevo.");
        return;
      }

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
      } catch (error) {
        setError("Error al cargar los productos. Intenta de nuevo.");
        console.error("Error al cargar los productos:", error);
      }
    };

    fetchProductos();
  }, [distribuidoraId]);

  const handleAddProducto = async (nuevoProducto) => {
    if (!distribuidoraId) {
      setError("No se encontró el ID de la distribuidora. Inicia sesión de nuevo.");
      return;
    }

    try {
      const productoRef = await addDoc(collection(db, "productos"), {
        ...nuevoProducto,
        distribuidoraId,
      });

      setProductos([...productos, { ...nuevoProducto, id: productoRef.id }]);
      setShowModal(false);
    } catch (error) {
      setError("Error al guardar el producto. Intenta de nuevo.");
      console.error("Error al guardar el producto:", error);
    }
  };

  const handleDeleteProducto = async (index) => {
    const producto = productos[index];
    if (!producto.id) return;

    try {
      await deleteDoc(doc(db, "productos", producto.id));
      setProductos(productos.filter((_, i) => i !== index));
    } catch (error) {
      setError("Error al eliminar el producto. Intenta de nuevo.");
      console.error("Error al eliminar el producto:", error);
    }
  };

  const handleEditProducto = (index) => {
    console.log("Editar producto:", productos[index]);
    // Aquí puedes implementar la lógica para editar un producto
  };

  const indexOfLastProducto = currentPage * productosPorPagina;
  const indexOfFirstProducto = indexOfLastProducto - productosPorPagina;
  const productosActuales = productos.slice(
    indexOfFirstProducto,
    indexOfLastProducto
  );
  const totalPaginas = Math.ceil(productos.length / productosPorPagina);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="gestion-productos-container">
      <Nav className="secondary-nav">
        <Nav.Item>
          <Nav.Link
            active
            onClick={() => navigate("/gestion-productos")}
            className="nav-link-custom"
          >
            Productos
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            onClick={() => navigate("/caja")}
            className="nav-link-custom"
          >
            Caja
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            onClick={() => navigate("/ordenes")}
            className="nav-link-custom"
          >
            Órdenes
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            onClick={() => navigate("/estadisticas")}
            className="nav-link-custom"
          >
            Estadísticas
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            onClick={() => navigate("/menu")}
            className="nav-link-custom"
          >
            Menú
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <div className="gestion-productos-content">
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="header-section">
          <div>
            <h1 className="gestion-productos-title">Gestión de Productos</h1>
            <p className="gestion-productos-subtitle">
              Administra el inventario de productos de tu tienda
            </p>
          </div>
          <Button
            className="nuevos-productos-button"
            onClick={() => setShowModal(true)}
          >
            Nuevos Productos
          </Button>
        </div>

        <Table className="productos-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Categoría</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosActuales.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center">
                  No hay productos registrados.
                </td>
              </tr>
            ) : (
              productosActuales.map((producto, index) => (
                <tr key={producto.id}>
                  <td>
                    {producto.imagen ? (
                      <img
                        src={producto.imagen}
                        alt={producto.nombre}
                        className="producto-imagen"
                      />
                    ) : (
                      "Sin imagen"
                    )}
                  </td>
                  <td>{producto.nombre}</td>
                  <td>{producto.precio}</td>
                  <td>{producto.categoria}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleEditProducto(index)}
                    >
                      Editar
                    </Button>{" "}
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteProducto(index)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {totalPaginas > 1 && (
          <div className="pagination-container">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(
              (page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "primary" : "outline-primary"}
                  onClick={() => handlePageChange(page)}
                  className="pagination-button"
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
          <Modal.Title>Agregar Nuevo Producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const nuevoProducto = {
                imagen: e.target.imagen.value,
                nombre: e.target.nombre.value,
                precio: Number(e.target.precio.value),
                categoria: e.target.categoria.value,
              };
              handleAddProducto(nuevoProducto);
            }}
          >
            <div className="mb-3">
              <label htmlFor="imagen" className="form-label">
                Imagen (URL)
              </label>
              <input
                type="text"
                className="form-control"
                id="imagen"
                placeholder="URL de la imagen"
              />
            </div>
            <div className="mb-3">
              <label htmlFor="nombre" className="form-label">
                Nombre
              </label>
              <input
                type="text"
                className="form-control"
                id="nombre"
                placeholder="Nombre del producto"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="precio" className="form-label">
                Precio
              </label>
              <input
                type="number"
                className="form-control"
                id="precio"
                placeholder="Precio del producto"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="categoria" className="form-label">
                Categoría
              </label>
              <input
                type="text"
                className="form-control"
                id="categoria"
                placeholder="Categoría del producto"
                required
              />
            </div>
            <Button type="submit" variant="primary">
              Agregar
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default GestionProductos;