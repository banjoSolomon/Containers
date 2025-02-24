import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Enum = () => {
    const [ec2Metrics, setEc2Metrics] = useState([]);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await fetch("https://9qyga7xn2j.execute-api.us-west-2.amazonaws.com/dev/status");
                const data = await response.json();

                if (data && data.EC2) {
                    const formattedMetrics = data.EC2.map(instance => ({
                        name: instance.name,
                        uptime: instance.uptime,
                        id: instance.id,
                        data: Array(6).fill(parseFloat(instance.uptime)), // Mocking data for visualization
                        timeLabels: ['16:00', '20:00', '00:00', '04:00', '08:00', '12:00']
                    }));

                    setEc2Metrics(formattedMetrics);
                }
            } catch (error) {
                console.error("Error fetching EC2 metrics:", error);
            }
        };

        fetchMetrics();
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
            <h2>EC2 Metrics</h2>
            {ec2Metrics.map((metric, index) => (
                <div key={index} style={{ marginBottom: '20px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '80%', maxWidth: '1000px', height: '200px' }}>
                        <h3>{metric.name} - Uptime: {metric.uptime}</h3>
                        <Line
                            data={{
                                labels: metric.timeLabels,
                                datasets: [
                                    {
                                        label: `${metric.name} Uptime (hrs)`,
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
