import React from "react";
import { useNavigate } from "react-router-dom";
import "../components/Styles/Inicio.css";

const Inicio = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="inicio-container">
      <div className="inicio-imagen">Imagen</div>
      <button
        className="inicio-title boton-titulo"
        onClick={() => handleNavigate("/gestion-productos")}
        style={{
          border: '2px solid #1a3557',
          borderRadius: '10px',
          padding: '16px',
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#1a3557',
          background: 'white',
          cursor: 'pointer',
          margin: '24px auto',
          display: 'block',
          width: 'fit-content',
          transition: 'background 0.2s, color 0.2s',
        }}
        onMouseOver={e => e.currentTarget.style.background = '#e6f0ff'}
        onMouseOut={e => e.currentTarget.style.background = 'white'}
      >
        Gestiona tu Distribuidora de forma Inteligente
      </button>
      <div className="card-container">
        <div className="card">
          <h3>Gestión de Inventario</h3>
          <p>Controla tu stock en tiempo real y optimiza tus recursos.</p>
          <button onClick={() => handleNavigate("/inventario")}>Explorar</button>
        </div>
        <div className="card">
          <h3>Análisis de Ventas</h3>
          <p>Visualiza el rendimiento de tu negocio con reportes detallados.</p>
          <button onClick={() => handleNavigate("/ventas")}>Explorar</button>
        </div>
        <div className="card">
          <h3>Configuración del Negocio</h3>
          <p>Configura la asignación de roles a los trabajadores.</p>
          <button onClick={() => handleNavigate("/configuracion")}>Explorar</button>
        </div>
      </div>
      <div className="button-container">
        <button className="premium-button" onClick={() => handleNavigate("/premium")}>
          Conoce los Beneficios Premium
        </button>
        <button className="start-button" onClick={() => handleNavigate("/empezar")}>
          Comenzar
        </button>
      </div>
    </div>
  );
};

export default Inicio;