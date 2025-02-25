import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Enum = () => {
    const [ec2Metrics, setEc2Metrics] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await fetch("https://9qyga7xn2j.execute-api.us-west-2.amazonaws.com/dev/status");
                const data = await response.json();

                if (data && data.EC2) {
                    const formattedMetrics = data.EC2.map(instance => {
                        const baseUptime = parseFloat(instance.uptime);
                        const dataWithSpikes = Array(6).fill(0).map(() => {
                            const randomMultiplier = Math.random() * 2;  // Random multiplier between 0 and 2
                            return baseUptime * randomMultiplier;
                        });

                        return {
                            name: instance.name,
                            uptime: instance.uptime,
                            id: instance.id,
                            data: dataWithSpikes,
                            timeLabels: ['16:00', '20:00', '00:00', '04:00', '08:00', '12:00']
                        };
                    });

                    setEc2Metrics(formattedMetrics);
                } else {
                    setError("No EC2 data available.");
                }
            } catch (error) {
                console.error("Error fetching EC2 metrics:", error);
                setError("Failed to fetch EC2 metrics.");
            }
        };

        fetchMetrics();
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
            <h2 style={{ textAlign: 'center' }}>EC2 Metrics</h2>
            {error ? (
                <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>
            ) : (
                ec2Metrics.map((metric, index) => (
                    <div key={index} style={{ marginBottom: '20px', width: '100%', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ width: '80%', maxWidth: '1000px', height: '300px' }}>
                            <h3 style={{ textAlign: 'center' }}>{metric.name} - Uptime: {metric.uptime}</h3>
                            <Line
                                data={{
                                    labels: metric.timeLabels,
                                    datasets: [
                                        {
                                            label: `${metric.name} Uptime (hrs)`,
                                            data: metric.data,
                                            borderColor: '#FF5733', // Changed line color for better contrast
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
                                            max: Math.max(...metric.data) + 10, // Extend the y-axis to display spikes clearly
                                        },
                                    },
                                }}
                            />
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default Enum;