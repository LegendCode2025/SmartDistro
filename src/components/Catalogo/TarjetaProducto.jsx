import { Card, Col, Button } from "react-bootstrap";

const TarjetaProducto = ({ producto, openEditModal }) => {
  const handleEditClick = () => {
    if (typeof openEditModal === 'function') {
      openEditModal(producto);
    } else {
      console.error('openEditModal no es una función');
    }
  };

  return (
    <Col lg={3} md={4} sm={12} className="mb-4">
      <Card className="h-100">
        {producto.imagen && (
          <Card.Img 
            variant="top" 
            src={producto.imagen} 
            alt={producto.nombreProducto}
            style={{ height: '200px', objectFit: 'cover' }}
          />
        )}
        <Card.Body className="d-flex flex-column">
          <Card.Title className="text-truncate">{producto.nombreProducto}</Card.Title>
          <Card.Text className="mt-auto">
            <strong>Precio:</strong> C${producto.precio} <br />
            <strong>Categoría:</strong> {producto.categoria}
          </Card.Text>
          <Button 
            variant="outline-primary" 
            onClick={handleEditClick}
            className="mt-2"
          >
            <i className="bi bi-pencil-square me-2"></i>
            Editar
          </Button>
        </Card.Body>
      </Card>
    </Col>
  );
};

export default TarjetaProducto; 