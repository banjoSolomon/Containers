import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const metricsData = [
    {

        data: [0, 0, 0, 0, 0, 0],
        timeLabels: ['16:00', '20:00', '00:00', '04:00', '08:00', '12:00'],
        percentage: "0.0%"
    },
    {

        data: [0, 0, 0, 0, 0, 0],
        timeLabels: ['16:00', '20:00', '00:00', '04:00', '08:00', '12:00'],
        percentage: "0.0%"
    },
    {

        data: [553],
        timeLabels: ['16:00'],
        percentage: "553 ms"
    }
];


const Enum = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <h2>System Metrics</h2>
            {metricsData.map((metric, index) => (
                <div key={index} style={{ marginBottom: '20px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '80%', maxWidth: '1000px', height: '200px' }}>
                        <h3>{metric.title} - {metric.percentage}</h3>
                        <Line
                            data={{
                                labels: metric.timeLabels,
                                datasets: [
                                    {
                                        label: 'Error Rate',
                                        data: metric.data,
                                        borderColor: '#3B82F6',
                                        fill: false,
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        suggestedMax: 100,
                                    },
                                },
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Enum;
