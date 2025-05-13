import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const GraficoCambiosPrecios = ({ products, distribuidoraId }) => {
  // Filtrar productos por distribuidoraId
  const filteredProducts = products.filter(product => product.distribuidoraId === distribuidoraId);
  const validProducts = filteredProducts.filter(p => (p.precioHistorial || 0) > 0 || (p.precioUnitarioConIVA || 0) > 0);

  const data = {
    labels: validProducts.map(product => product.nombre || 'Sin nombre'),
    datasets: [
      {
        label: 'Precio Historial',
        data: validProducts.map(product => product.precioHistorial || 0),
        borderColor: 'rgba(255, 99, 132, 1)',
        fill: false,
        tension: 0.1,
      },
      {
        label: 'Precio Actual con IVA',
        data: validProducts.map(product => product.precioUnitarioConIVA || 0),
        borderColor: 'rgba(54, 162, 235, 1)',
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Variación de Precios Historial vs Actual (Distribuidora ${distribuidoraId})` },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Precio (en moneda)' } },
    },
  };

  const exportToPDF = () => {
    const input = document.getElementById('chart-container-line');
    html2canvas(input, { scale: 1 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const width = 190;
      const height = (canvas.height * width) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, width, height > 270 ? 270 : height);
      pdf.save(`cambios_precios_${distribuidoraId}.pdf`);
    });
  };

  return (
    <div>
      <div id="chart-container-line" style={{ width: '400px', height: '300px' }}>
        <Line data={data} options={options} />
      </div>
      <button onClick={exportToPDF} style={{ marginTop: '20px' }}>
        Exportar a PDF
      </button>
    </div>
  );
};

export default GraficoCambiosPrecios;