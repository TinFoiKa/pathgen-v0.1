import * as React from 'react';
import './Sidebar.scss';

import { usePathPlanner } from '../../contexts/PathPlannerContext';
import { Line } from 'react-chartjs-2';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface VelocitySidebarProps {
  // Add props as needed
}

const VelocitySidebar: React.FC<VelocitySidebarProps> = (props) => {
  const { segments } = usePathPlanner();

  const velocities = segments.flatMap((segment) => 
    segment.path.map((coordinate) => coordinate.vel)
  )

  // Prepare data for the graph
  const data = {
    labels: velocities.map((_, index) => index), // X-axis: Index of velocity
    datasets: [
      {
        label: 'Velocity',
        data: velocities, // Y-axis: Velocity values
        borderColor: 'rgba(75, 192, 192, 1)', // Line color
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Fill color under the line
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.3, // Smooth curve
      },
    ],
  };

  // Graph options
  const options = {
    interaction: {
      mode: "x" as const,
      intersect: false
    },
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Path Index',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Velocity',
        },
        min: Math.min(...velocities, 0) - 10, 
        max: Math.max(...velocities) + 10,
      },
    },
  };

  return (
    <div className="sidebar velocity-sidebar">
      <h2>Velocity Profile</h2>

      <div className = "chart-container">
        <Line data={data} options={options}/>
      </div>
      
      
    </div>
  );
};

export default VelocitySidebar; 