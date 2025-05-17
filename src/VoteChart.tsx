// src/VoteChart.jsx
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Option {
  text: string;
  votes: number;
}

export default function VoteChart({ options }: { options: Option[] }) {
  const data = {
    labels: options.map((opt: { text: unknown; }) => opt.text),
    datasets: [
      {
        label: "Votes",
        data: options.map((opt: { votes: unknown; }) => opt.votes),
        backgroundColor: [
          "#3B82F6",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
        ],
        borderRadius: 6,
        animation: {
          duration: 1000,
          easing: 'easeInOutQuad' as const
        }
      },
    ],
  };

  const config = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 14
        }
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow w-full">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">📊 Live Results</h2>
      <div className="h-[400px]">
        <Bar data={data} options={config} />
      </div>
    </div>
  );
}
