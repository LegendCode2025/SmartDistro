import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { collection, doc, getDoc, updateDoc, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../../assets/database/firebaseconfig'; // Ajusta la ruta
import { useAuth } from '../../assets/database/authcontext'; // Para verificar usuario
import '../Styles/GestionConfiguracion.css';

const Configuracion = () => {
  const { isLoggedIn, currentUser, distribuidoraId } = useAuth();
  const [distribuidora, setDistribuidora] = useState(null);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para modales de edición y creación
  const [showModalDistribuidora, setShowModalDistribuidora] = useState(false);
  const [showModalEmpleado, setShowModalEmpleado] = useState(false);
  const [showModalAgregarEmpleado, setShowModalAgregarEmpleado] = useState(false); // Nuevo estado para el modal de agregar
  const [editDistribuidora, setEditDistribuidora] = useState({ nombre: '', direccion: '' });
  const [editEmpleado, setEditEmpleado] = useState(null);
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    telefonoFamiliar: '',
    cedula: '',
    fechaNacimiento: '',
    rol: 'Atención al cliente', // Valor por defecto
    uid: '', // Para vincular al usuario autenticado si es necesario
  });

  // Cargar datos de la distribuidora y empleados
  useEffect(() => {
    if (!isLoggedIn) {
      setError('Debes iniciar sesión para acceder a esta sección.');
      setLoading(false);
      return;
    }

    if (!distribuidoraId) {
      setError('No se encontró el ID de la distribuidora. Asegúrate de que esté configurado.');
      setLoading(false);
      return;
    }

    // Cargar datos de la distribuidora usando el distribuidoraId dinámico
    const distribuidoraRef = doc(db, 'distribuidoras', distribuidoraId);
    getDoc(distribuidoraRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          setDistribuidora({ id: docSnap.id, ...docSnap.data() });
          setEditDistribuidora({ nombre: docSnap.data().nombre, direccion: docSnap.data().direccion });
        } else {
          setError('No se encontraron datos de la distribuidora.');
        }
      })
      .catch((err) => {
        setError('Error al cargar datos de la distribuidora: ' + err.message);
      });

    // Cargar empleados en tiempo real desde la subcolección de la distribuidora
    const empleadosCollection = collection(db, 'distribuidoras', distribuidoraId, 'empleados');
    const unsubscribe = onSnapshot(
      empleadosCollection,
      (snapshot) => {
        const fetchedEmpleados = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEmpleados(fetchedEmpleados);
        setLoading(false);
      },
      (err) => {
        setError('Error al cargar empleados: ' + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isLoggedIn, distribuidoraId]);

  // Actualizar rol de un empleado
  const handleRolChange = async (empleadoId, nuevoRol) => {
    try {
      const empleadoRef = doc(db, 'distribuidoras', distribuidoraId, 'empleados', empleadoId);
      await updateDoc(empleadoRef, { rol: nuevoRol });
    } catch (err) {
      setError('Error al actualizar el rol: ' + err.message);
    }
  };

  // Guardar cambios de la distribuidora
  const handleSaveDistribuidora = async () => {
    try {
      const distribuidoraRef = doc(db, 'distribuidoras', distribuidoraId);
      await updateDoc(distribuidoraRef, {
        nombre: editDistribuidora.nombre,
        direccion: editDistribuidora.direccion,
      });
      setDistribuidora({ ...distribuidora, ...editDistribuidora });
      setShowModalDistribuidora(false);
    } catch (err) {
      setError('Error al actualizar la distribuidora: ' + err.message);
    }
  };

  // Guardar cambios de un empleado
  const handleSaveEmpleado = async () => {
    try {
      const empleadoRef = doc(db, 'distribuidoras', distribuidoraId, 'empleados', editEmpleado.id);
      await updateDoc(empleadoRef, {
        nombres: editEmpleado.nombres,
        apellidos: editEmpleado.apellidos,
        email: editEmpleado.email,
        telefono: editEmpleado.telefono,
        telefonoFamiliar: editEmpleado.telefonoFamiliar,
        cedula: editEmpleado.cedula,
        fechaNacimiento: editEmpleado.fechaNacimiento,
      });
      setShowModalEmpleado(false);
    } catch (err) {
      setError('Error al actualizar el empleado: ' + err.message);
    }
  };

  // Agregar un nuevo empleado
  const handleAddEmpleado = async () => {
    try {
      const empleadosCollection = collection(db, 'distribuidoras', distribuidoraId, 'empleados');
      await addDoc(empleadosCollection, {
        nombres: nuevoEmpleado.nombres,
        apellidos: nuevoEmpleado.apellidos,
        email: nuevoEmpleado.email,
        telefono: nuevoEmpleado.telefono,
        telefonoFamiliar: nuevoEmpleado.telefonoFamiliar,
        cedula: nuevoEmpleado.cedula,
        fechaNacimiento: nuevoEmpleado.fechaNacimiento,
        rol: nuevoEmpleado.rol,
        uid: nuevoEmpleado.uid || '', // Puede ser útil para vincular al usuario autenticado
      });
      setShowModalAgregarEmpleado(false);
      // Reiniciar el formulario
      setNuevoEmpleado({
        nombres: '',
        apellidos: '',
        email: '',
        telefono: '',
        telefonoFamiliar: '',
        cedula: '',
        fechaNacimiento: '',
        rol: 'Atención al cliente',
        uid: '',
      });
    } catch (err) {
      setError('Error al agregar el empleado: ' + err.message);
    }
  };

  if (!isLoggedIn) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">Debes iniciar sesión para acceder a esta sección.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-5 configuracion-container">
      {/* Encabezado estilizado similar a LoginForm */}
      <div className="encabezado-configuracion">
  <h2 className="TituloSecion">
    <i>Configuración</i>
  </h2>
  <h5 className="subtitulo">Administra datos de distribuidora y usuarios</h5>
</div>

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p>Cargando datos...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          {/* Cuadro de datos de la distribuidora */}
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Card.Title>Datos de la Distribuidora</Card.Title>
              <Row>
                <Col xs={12} md={6}>
                  <p><strong>Nombre:</strong> {distribuidora?.nombre}</p>
                </Col>
                <Col xs={12} md={6}>
                  <p><strong>Dirección:</strong> {distribuidora?.direccion}</p>
                </Col>
              </Row>
              <Button
                variant="primary"
                onClick={() => setShowModalDistribuidora(true)}
                className="mt-2"
              >
                Editar Distribuidora
              </Button>
            </Card.Body>
          </Card>

          {/* Lista de empleados con botón para agregar */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>Empleados</h4>
            <Button
              variant="success"
              onClick={() => setShowModalAgregarEmpleado(true)}
            >
              Agregar Empleado
            </Button>
          </div>
          {empleados.length === 0 ? (
            <Alert variant="info">No hay empleados registrados.</Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empleados.map((empleado) => (
                  <tr key={empleado.id}>
                    <td>{empleado.nombres}</td>
                    <td>{empleado.apellidos}</td>
                    <td>{empleado.email}</td>
                    <td>
                      <Form.Select
                        value={empleado.rol || "Atención al cliente"}
                        onChange={(e) => handleRolChange(empleado.id, e.target.value)}
                        aria-label={`Rol de ${empleado.nombres}`}
                      >
                        <option value="Atención al cliente">Atención al cliente</option>
                        <option value="Caja">Caja</option>
                      </Form.Select>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          setEditEmpleado(empleado);
                          setShowModalEmpleado(true);
                        }}
                      >
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}

      {/* Modal para editar distribuidora */}
      <Modal show={showModalDistribuidora} onHide={() => setShowModalDistribuidora(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Distribuidora</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formNombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={editDistribuidora.nombre}
                onChange={(e) =>
                  setEditDistribuidora({ ...editDistribuidora, nombre: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formDireccion">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                value={editDistribuidora.direccion}
                onChange={(e) =>
                  setEditDistribuidora({ ...editDistribuidora, direccion: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalDistribuidora(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveDistribuidora}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para editar empleado */}
      <Modal show={showModalEmpleado} onHide={() => setShowModalEmpleado(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Empleado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editEmpleado && (
            <Form>
              <Form.Group className="mb-3" controlId="formNombres">
                <Form.Label>Nombres</Form.Label>
                <Form.Control
                  type="text"
                  value={editEmpleado.nombres}
                  onChange={(e) =>
                    setEditEmpleado({ ...editEmpleado, nombres: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formApellidos">
                <Form.Label>Apellidos</Form.Label>
                <Form.Control
                  type="text"
                  value={editEmpleado.apellidos}
                  onChange={(e) =>
                    setEditEmpleado({ ...editEmpleado, apellidos: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={editEmpleado.email}
                  onChange={(e) =>
                    setEditEmpleado({ ...editEmpleado, email: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formTelefono">
                <Form.Label>Teléfono</Form.Label>
                <Form.Control
                  type="text"
                  value={editEmpleado.telefono}
                  onChange={(e) =>
                    setEditEmpleado({ ...editEmpleado, telefono: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formTelefonoFamiliar">
                <Form.Label>Teléfono Familiar</Form.Label>
                <Form.Control
                  type="text"
                  value={editEmpleado.telefonoFamiliar}
                  onChange={(e) =>
                    setEditEmpleado({ ...editEmpleado, telefonoFamiliar: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formCedula">
                <Form.Label>Cédula</Form.Label>
                <Form.Control
                  type="text"
                  value={editEmpleado.cedula}
                  onChange={(e) =>
                    setEditEmpleado({ ...editEmpleado, cedula: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formFechaNacimiento">
                <Form.Label>Fecha de Nacimiento</Form.Label>
                <Form.Control
                  type="date"
                  value={editEmpleado.fechaNacimiento}
                  onChange={(e) =>
                    setEditEmpleado({ ...editEmpleado, fechaNacimiento: e.target.value })
                  }
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalEmpleado(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveEmpleado}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para agregar empleado */}
      <Modal show={showModalAgregarEmpleado} onHide={() => setShowModalAgregarEmpleado(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Empleado</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formNombres">
              <Form.Label>Nombres</Form.Label>
              <Form.Control
                type="text"
                value={nuevoEmpleado.nombres}
                onChange={(e) =>
                  setNuevoEmpleado({ ...nuevoEmpleado, nombres: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formApellidos">
              <Form.Label>Apellidos</Form.Label>
              <Form.Control
                type="text"
                value={nuevoEmpleado.apellidos}
                onChange={(e) =>
                  setNuevoEmpleado({ ...nuevoEmpleado, apellidos: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={nuevoEmpleado.email}
                onChange={(e) =>
                  setNuevoEmpleado({ ...nuevoEmpleado, email: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formTelefono">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                value={nuevoEmpleado.telefono}
                onChange={(e) =>
                  setNuevoEmpleado({ ...nuevoEmpleado, telefono: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formTelefonoFamiliar">
              <Form.Label>Teléfono Familiar</Form.Label>
              <Form.Control
                type="text"
                value={nuevoEmpleado.telefonoFamiliar}
                onChange={(e) =>
                  setNuevoEmpleado({ ...nuevoEmpleado, telefonoFamiliar: e.target.value })
                }
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formCedula">
              <Form.Label>Cédula</Form.Label>
              <Form.Control
                type="text"
                value={nuevoEmpleado.cedula}
                onChange={(e) =>
                  setNuevoEmpleado({ ...nuevoEmpleado, cedula: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formFechaNacimiento">
              <Form.Label>Fecha de Nacimiento</Form.Label>
              <Form.Control
                type="date"
                value={nuevoEmpleado.fechaNacimiento}
                onChange={(e) =>
                  setNuevoEmpleado({ ...nuevoEmpleado, fechaNacimiento: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formRol">
              <Form.Label>Rol</Form.Label>
              <Form.Select
                value={nuevoEmpleado.rol}
                onChange={(e) =>
                  setNuevoEmpleado({ ...nuevoEmpleado, rol: e.target.value })
                }
              >
                <option value="Atención al cliente">Atención al cliente</option>
                <option value="Caja">Caja</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalAgregarEmpleado(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleAddEmpleado}>
            Agregar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Configuracion;