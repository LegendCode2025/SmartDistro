import { useNavigate } from "react-router-dom";

const Inicio = () => {
    const navigate = useNavigate();

    // Función de navegación
    const handleNavigate = (path) => {
      navigate(path);
    };

  return (
    <div>
      <h1>Inicio</h1>
      <button style={{ margin: "10px" }} onClick={() => handleNavigate("/categorias")} >Ir a Categorías</button>
      <button style={{ margin: "10px" }} onClick={() => handleNavigate("/productos")} >Ir a Productos</button>
      <button style={{ margin: "10px" }} onClick={() => handleNavigate("/libros")} >Ir a Libros</button>
    </div>
  )
}

export default Inicio;