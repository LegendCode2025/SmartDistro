import React from "react";
import { Row, Col, Form, Button, Card, Alert, InputGroup } from "react-bootstrap";

import "../components/Styles/Login.css";

const LoginForm = ({ email, password, error, setEmail, setPassword, handleSubmit }) => {
  return (
    <Row style={{marginTop: "-2 0%"}} className="">
      <Col>

        <Card className="targetLogin" style={{marginTop: "0%"}}>
          <Card.Body>
            <h3 className="TituloSecion"><i>Iniciar Sesión</i></h3>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Col className="color">
                <Form.Group className="inputEmail mb-3" controlId="emailUsuario">
                  <InputGroup>
                    <InputGroup.Text style={{borderTopLeftRadius: "20px", borderBottomLeftRadius: "20px"}}>
                      <i className=" bi-envelope-fill"></i>
                    </InputGroup.Text>
                    <Form.Control
                    style={{borderTopRightRadius: "20px", borderBottomRightRadius: "20px"}}
                      type="email"
                      placeholder="Ingresa tu correo"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="inputPass mb-3" controlId="contraseñaUsuario">
                  <InputGroup>
                    <InputGroup.Text style={{borderTopLeftRadius: "20px", borderBottomLeftRadius: "20px"}} >
                      <i className=" bi-key-fill"></i>
                    </InputGroup.Text>
                    <Form.Control
                     style={{borderTopRightRadius: "20px", borderBottomRightRadius: "20px"}}
                      type="password"
                      placeholder="Ingresa tu contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </InputGroup>

                </Form.Group>
                <Button variant="primary" type="submit" className="btn-login">
                <i className=" bi-box-arrow-in-right me-2"></i>
                Iniciar Sesión
              </Button>
              </Col>
              
            </Form>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default LoginForm; 