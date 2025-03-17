// Importaciones
import React, { useState, useEffect } from "react";
import { Container, Button } from "react-bootstrap";
import { db } from "../assets/database/firebaseconfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

// Importaciones de componentes personalizados
import TablaCategorias from "../components/Categorias/TablaCategorias";
import ModalRegistroCategoria from "../components/Categorias/ModalRegistroCategoria";
import ModalEdicionCategoria from "../components/Categorias/ModalEdicionCategoria";
import ModalEliminacionCategoria from "../components/Categorias/ModalEliminacionCategoria";

const Categorias = () => {
  // Estados para manejo de datos
  const [categorias, setCategorias] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState({
    nombreCategoria: "",
    descripcionCategoria: "",
  });
  const [categoriaEditada, setCategoriaEditada] = useState(null);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);

  // Referencia a la colección de categorías en Firestore
  const categoriasCollection = collection(db, "categorias");

  // Función para obtener todas las categorías de Firestore
  const fetchCategorias = async () => {
    try {
      console.log("Obteniendo categorías...");
      const data = await getDocs(categoriasCollection);
      const fetchedCategorias = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      console.log("Categorías obtenidas:", fetchedCategorias);
      setCategorias(fetchedCategorias);
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
      alert("Error al cargar las categorías: " + error.message);
    }
  };

  // Hook useEffect para carga inicial de datos
  useEffect(() => {
    console.log("Componente montado, cargando categorías...");
    fetchCategorias();
  }, []);

  // Manejador de cambios en inputs del formulario de nueva categoría
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log("Cambio en input:", name, value);
    setNuevaCategoria((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manejador de cambios en inputs del formulario de edición
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    console.log("Cambio en input de edición:", name, value);
    setCategoriaEditada((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Función para agregar una nueva categoría (CREATE)
  const handleAddCategoria = async () => {
    console.log("Intentando agregar categoría:", nuevaCategoria);
    if (!nuevaCategoria.nombreCategoria || !nuevaCategoria.descripcionCategoria) {
      alert("Por favor, completa todos los campos antes de guardar.");
      return;
    }
    try {
      const docRef = await addDoc(categoriasCollection, {
        nombreCategoria: nuevaCategoria.nombreCategoria,
        descripcionCategoria: nuevaCategoria.descripcionCategoria
      });
      console.log("Categoría agregada con ID:", docRef.id);
      setShowModal(false);
      setNuevaCategoria({ nombreCategoria: "", descripcionCategoria: "" });
      await fetchCategorias();
      alert("Categoría agregada exitosamente");
    } catch (error) {
      console.error("Error al agregar la categoría:", error);
      alert("Error al agregar la categoría: " + error.message);
    }
  };

  // Función para actualizar una categoría existente (UPDATE)
  const handleEditCategoria = async () => {
    console.log("Intentando actualizar categoría:", categoriaEditada);
    if (!categoriaEditada.nombreCategoria || !categoriaEditada.descripcionCategoria) {
      alert("Por favor, completa todos los campos antes de actualizar.");
      return;
    }
    try {
      const categoriaRef = doc(db, "categorias", categoriaEditada.id);
      await updateDoc(categoriaRef, {
        nombreCategoria: categoriaEditada.nombreCategoria,
        descripcionCategoria: categoriaEditada.descripcionCategoria
      });
      console.log("Categoría actualizada");
      setShowEditModal(false);
      await fetchCategorias();
      alert("Categoría actualizada exitosamente");
    } catch (error) {
      console.error("Error al actualizar la categoría:", error);
      alert("Error al actualizar la categoría: " + error.message);
    }
  };

  // Función para eliminar una categoría (DELETE)
  const handleDeleteCategoria = async () => {
    console.log("Intentando eliminar categoría:", categoriaAEliminar);
    if (categoriaAEliminar) {
      try {
        const categoriaRef = doc(db, "categorias", categoriaAEliminar.id);
        await deleteDoc(categoriaRef);
        console.log("Categoría eliminada");
        setShowDeleteModal(false);
        await fetchCategorias();
        alert("Categoría eliminada exitosamente");
      } catch (error) {
        console.error("Error al eliminar la categoría:", error);
        alert("Error al eliminar la categoría: " + error.message);
      }
    }
  };

  // Función para abrir el modal de edición con datos prellenados
  const openEditModal = (categoria) => {
    console.log("Abriendo modal de edición con categoría:", categoria);
    setCategoriaEditada({ ...categoria });
    setShowEditModal(true);
  };

  // Función para abrir el modal de eliminación
  const openDeleteModal = (categoria) => {
    console.log("Abriendo modal de eliminación con categoría:", categoria);
    setCategoriaAEliminar(categoria);
    setShowDeleteModal(true);
  };

  // Renderizado del componente
  return (
    <Container className="mt-5">
      <br />
      <h4>Gestión de Categorías</h4>
      <Button className="mb-3" onClick={() => setShowModal(true)}>
        Agregar categoría
      </Button>
      <TablaCategorias
        categorias={categorias}
        openEditModal={openEditModal}
        openDeleteModal={openDeleteModal}
      />
      <ModalRegistroCategoria
        showModal={showModal}
        setShowModal={setShowModal}
        nuevaCategoria={nuevaCategoria}
        handleInputChange={handleInputChange}
        handleAddCategoria={handleAddCategoria}
      />
      <ModalEdicionCategoria
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        categoriaEditada={categoriaEditada}
        handleEditInputChange={handleEditInputChange}
        handleEditCategoria={handleEditCategoria}
      />
      <ModalEliminacionCategoria
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        handleDeleteCategoria={handleDeleteCategoria}
      />
    </Container>
  );
};

export default Categorias;