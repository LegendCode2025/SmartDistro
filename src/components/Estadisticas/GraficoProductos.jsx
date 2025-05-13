import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const GraficoProductos = ({ products }) => {
  const data = {
    labels: products.map(product => product.name),
    datasets: [
      {
        label: 'Stock',
        data: products.map(product => product.stock),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Unit Size',
        data: products.map(product => product.unitSize),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Comparación de Stock y Tamaño de Unidad por Producto' },
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
      pdf.save('comparacion_stock_unidad.pdf');
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

export default GraficoProductos;