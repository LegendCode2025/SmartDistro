import React, { useState, useEffect } from 'react'; 
import { db } from '../../assets/database/firebaseconfig';
import { collection, getDocs } from 'firebase/firestore';
import GraficoStockOrdenado from './GraficoStockOrdenado';
import GraficoCambiosPrecios from './GraficoCambiosPrecios';
import GraficoProductosVendidos from './GraficoProductosVendidos';
import '../Styles/Estadisticas.css';

const Estadisticas = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const distribuidoraId = 'MALFtS6f2VJCZmqKAYsn'; // Hardcodeado para pruebas

  useEffect(() => {
    const fetchData = async () => {
      console.log('Filtrando datos para distribuidoraId:', distribuidoraId);

      try {
        // Obtener datos de la colección 'productos' filtrados por distribuidoraId
        const productsSnapshot = await getDocs(collection(db, 'productos'));
        const productsData = productsSnapshot.docs
          .map(doc => ({
            id: doc.id,
            nombre: doc.data().nombre,
            stock: doc.data().stock || 0,
            precioHistorial: doc.data().precioHistorial?.precioUnitario || 0,
            precioUnitarioConIVA: doc.data().precioUnitarioConIVA || 0,
            unitSize: doc.data().unitSize || 0,
            distribuidoraId: doc.data().distribuidoraId,
          }))
          .filter(product => product.distribuidoraId === distribuidoraId);
        console.log('Productos cargados (filtrados):', productsData);
        setProducts(productsData);

        // Obtener datos de la colección 'ordenes' filtrados por distribuidoraId
        const ordersSnapshot = await getDocs(collection(db, 'ordenes'));
        const ordersData = ordersSnapshot.docs
          .map(doc => ({
            id: doc.id,
            cantidadTotal: doc.data().cantidadTotal || 0,
            productos: doc.data().productos || [],
            distribuidoraId: doc.data().distribuidoraId,
          }))
          .filter(order => order.distribuidoraId === distribuidoraId);
        console.log('Órdenes cargadas (filtradas):', ordersData);
        setOrders(ordersData);
      } catch (error) {
        console.error('Error al obtener datos de Firebase:', error);
        setError('Error al cargar los datos. Revisa la consola para más detalles.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Cargando datos...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  if (products.length === 0 || orders.length === 0) {
    return <div>No hay datos disponibles para mostrar para esta distribuidora.</div>;
  }

  return (
    <div className="estadisticas-container">
      <h2>Estadísticas de Productos (Distribuidora {distribuidoraId})</h2>
      <div className="graficos-grid">
        <div className="grafico-section">
          <h3>Stock Ordenado</h3>
          <GraficoStockOrdenado products={products} distribuidoraId={distribuidoraId} />
        </div>
        <div className="grafico-section">
          <h3>Cambios en Precios</h3>
          <GraficoCambiosPrecios products={products} distribuidoraId={distribuidoraId} />
        </div>
        <div className="grafico-section">
          <h3>Productos Más Vendidos</h3>
          <GraficoProductosVendidos
            orders={orders}
            products={products}
            distribuidoraId={distribuidoraId}
          />
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;