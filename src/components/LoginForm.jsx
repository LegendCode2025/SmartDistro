import React from "react";
import { Row, Col, Form, Button, Card, Alert, InputGroup } from "react-bootstrap";
import "../App.css";

const LoginForm = ({ email, password, error, setEmail, setPassword, handleSubmit }) => {
  return (
    <Row className="w-100 justify-content-center">
      <Col md={6} lg={5} xl={4}>
        <Card className="p-4 shadow-lg">
          <Card.Body>
            <h3 className="text-center mb-4 fw-bold color-texto-marca">Iniciar Sesión</h3>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="emailUsuario">
                <Form.Label className="text-start w-100">Correo Electrónico</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-envelope-fill"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    placeholder="Ingresa tu correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-3" controlId="contraseñaUsuario">
                <Form.Label className="text-start w-100">Contraseña</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-key-fill"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </InputGroup>
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100 btn-login">
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Iniciar Sesión
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default LoginForm; 