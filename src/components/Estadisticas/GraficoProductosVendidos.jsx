import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GraficoProductosVendidos = ({ orders, products, distribuidoraId }) => {
  // Filtrar órdenes por distribuidoraId
  const filteredOrders = orders.filter(order => order.distribuidoraId === distribuidoraId);

  // Filtrar productos por distribuidoraId
  const filteredProducts = products.filter(product => product.distribuidoraId === distribuidoraId);
  const productNames = filteredProducts.map(product => product.nombre);

  // Calcular ventas totales por producto para la distribuidora
  const salesByProduct = {};
  filteredOrders.forEach(order => {
    const productosArray = Array.isArray(order.productos) ? order.productos : [];
    productosArray.forEach(item => {
      // Solo incluir productos que pertenezcan a la distribuidora
      if (productNames.includes(item.nombreProducto)) {
        salesByProduct[item.nombreProducto] = (salesByProduct[item.nombreProducto] || 0) + item.cantidad;
      }
    });
  });

  const data = {
    labels: Object.keys(salesByProduct),
    datasets: [
      {
        label: 'Unidades Vendidas',
        data: Object.values(salesByProduct),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Productos Más Vendidos (Distribuidora ${distribuidoraId})` },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Unidades Vendidas' } },
    },
  };

  const exportToPDF = () => {
    const input = document.getElementById('chart-container-bar-sales');
    html2canvas(input, { scale: 1 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = 190;
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, width, height > 270 ? 270 : height);
      pdf.save(`productos_vendidos_${distribuidoraId}.pdf`);
    });
  };

  return (
    <div>
      <div id="chart-container-bar-sales" style={{ width: '400px', height: '300px' }}>
        <Bar data={data} options={options} />
      </div>
      <button onClick={exportToPDF} style={{ marginTop: '20px' }}>
        Exportar a PDF
      </button>
    </div>
  );
};

export default GraficoProductosVendidos;