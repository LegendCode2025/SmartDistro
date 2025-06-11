import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/Styles/Inicio.css";

const Inicio = () => {
  const navigate = useNavigate();

  // Estados para gestionar instalación PWA
  const [solicitudInstalacion, setSolicitudInstalacion] = useState(null);
  const [mostrarBotonInstalacion, setMostrarBotonInstalacion] = useState(false);
  const [esDispositivoIOS, setEsDispositivoIOS] = useState(false);
  const [mostrarModalInstrucciones, setMostrarModalInstrucciones] = useState(false);

  // Detectar dispositivo iOS
  useEffect(() => {
    const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setEsDispositivoIOS(esIOS);
  }, []);

  // Manejar evento beforeinstallprompt
  useEffect(() => {
    const manejarSolicitudInstalacion = (evento) => {
      evento.preventDefault();
      setSolicitudInstalacion(evento);
      setMostrarBotonInstalacion(true);
    };

    window.addEventListener("beforeinstallprompt", manejarSolicitudInstalacion);

    return () => {
      window.removeEventListener("beforeinstallprompt", manejarSolicitudInstalacion);
    };
  }, []);

  // Función para disparar el prompt de instalación
  const instalarApp = async () => {
    if (!solicitudInstalacion) return;
    try {
      await solicitudInstalacion.prompt();
      const { outcome } = await solicitudInstalacion.userChoice;
      console.log(outcome === 'accepted' ? 'Instalación aceptada' : 'Instalación rechazada');
    } catch (error) {
      console.error('Error al intentar instalar la PWA', error);
    } finally {
      setSolicitudInstalacion(null);
      setMostrarBotonInstalacion(false);
    }
  };

  // Funciones para mostrar / ocultar modal de instrucciones en iOS
  const abrirModalInstrucciones = () => setMostrarModalInstrucciones(true);
  const cerrarModalInstrucciones = () => setMostrarModalInstrucciones(false);

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
      {/* Botón instalar PWA */}
      {mostrarBotonInstalacion && !esDispositivoIOS && (
        <button className="install-button" onClick={instalarApp}>
          Instalar aplicación
        </button>
      )}
      {/* Botón y modal para iOS */}
      {esDispositivoIOS && (
        <>
          <button className="install-button" onClick={abrirModalInstrucciones}>
            Cómo instalar en iOS
          </button>
          {mostrarModalInstrucciones && (
            <div className="ios-modal" onClick={cerrarModalInstrucciones}>
              <div className="ios-modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>Instalar en iOS</h3>
                <p>Presiona el botón <strong>Compartir</strong> y luego "Agregar a pantalla de inicio".</p>
                <button onClick={cerrarModalInstrucciones}>Cerrar</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Inicio;