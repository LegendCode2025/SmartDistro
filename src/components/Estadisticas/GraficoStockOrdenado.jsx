import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GraficoStockOrdenado = ({ products, distribuidoraId }) => {
  // Filtrar productos por distribuidoraId
  const filteredProducts = products.filter(product => product.distribuidoraId === distribuidoraId);
  const validProducts = filteredProducts.filter(p => p.stock > 0);
  const sortedProducts = [...validProducts].sort((a, b) => b.stock - a.stock);

  const data = {
    labels: sortedProducts.map(product => product.nombre || 'Sin nombre'),
    datasets: [
      {
        label: 'Stock',
        data: sortedProducts.map(product => product.stock || 0),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Productos Ordenados por Stock (Distribuidora ${distribuidoraId})` },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Stock' } },
    },
  };

  const exportToPDF = () => {
    const input = document.getElementById('chart-container-bar');
    html2canvas(input, { scale: 1 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = 190;
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, width, height > 270 ? 270 : height);
      pdf.save(`stock_ordenado_${distribuidoraId}.pdf`);
    });
  };

  return (
    <div>
      <div id="chart-container-bar" style={{ width: '400px', height: '300px' }}>
        <Bar data={data} options={options} />
      </div>
      <button onClick={exportToPDF} style={{ marginTop: '20px' }}>
        Exportar a PDF
      </button>
    </div>
  );
};

export default GraficoStockOrdenado;