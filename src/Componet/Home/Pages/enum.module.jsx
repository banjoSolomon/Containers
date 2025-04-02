import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Enum = () => {
    const [ec2Metrics, setEc2Metrics] = useState([]);
    const [loading, setLoading] = useState(true);
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
                            const randomMultiplier = Math.random() * 2;
                            return baseUptime * randomMultiplier;
                        });

                        return {
                            name: instance.name,
                            uptime: instance.uptime,
                            id: instance.id,
                            data: dataWithSpikes,
                            timeLabels: ['16:00', '20:00', '00:00', '04:00', '08:00', '12:00'],
                        };
                    });

                    setEc2Metrics(formattedMetrics);
                } else {
                    setError("No EC2 metrics data available.");
                }
            } catch (error) {
                console.error("Error fetching EC2 metrics:", error);
                setError("Failed to fetch EC2 metrics. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    const chartOptions = (maxValue) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#333',
                    font: {
                        size: 14,
                    },
                },
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#fff',
                borderWidth: 1,
                cornerRadius: 5,
            },
        },
        scales: {
            x: {
                grid: {
                    color: '#e0e0e0',
                },
                ticks: {
                    color: '#333',
                },
            },
            y: {
                beginAtZero: true,
                max: maxValue + 10,
                grid: {
                    color: '#e0e0e0',
                },
                ticks: {
                    color: '#333',
                },
            },
        },
    });

    const chartData = (metric) => ({
        labels: metric.timeLabels,
        datasets: [
            {
                label: `${metric.name} Uptime (hrs)`,
                data: metric.data,
                borderColor: '#4caf50',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                fill: true,
                pointBackgroundColor: '#4caf50',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#4caf50',
                tension: 0.4,
            },
        ],
    });

    return (
        <div style={{ padding: '20px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333', fontSize: '2em', fontWeight: 'bold' }}>
                EC2 Metrics
            </h2>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                    <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: '2em', color: '#4caf50' }} />
                    <p style={{ marginLeft: '10px', color: '#333' }}>Loading metrics...</p>
                </div>
            ) : error ? (
                <div style={{ textAlign: 'center', color: 'red', marginBottom: '20px' }}>
                    <p>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            backgroundColor: '#4caf50',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            marginTop: '10px',
                        }}
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {ec2Metrics.map((metric, index) => (
                        <div
                            key={index}
                            style={{
                                backgroundColor: '#fff',
                                padding: '20px',
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                transition: 'transform 0.3s, box-shadow 0.3s',
                                ':hover': {
                                    transform: 'translateY(-5px)',
                                    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                                },
                            }}
                        >
                            <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333', fontSize: '1.5em' }}>
                                {metric.name} - Uptime: {metric.uptime}
                            </h3>
                            <div style={{ height: '300px' }}>
                                <Line data={chartData(metric)} options={chartOptions(Math.max(...metric.data))} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Enum;