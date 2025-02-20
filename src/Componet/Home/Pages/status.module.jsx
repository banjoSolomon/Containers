import React, { useEffect, useState } from "react";


const Status = () => {
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                const response = await fetch("https://9qyga7xn2j.execute-api.us-west-2.amazonaws.com/dev/status", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (!response.ok) throw new Error(`Error: ${response.status}`);

                const data = await response.json();
                console.log("API Response:", data);

                const ec2Statuses = data.EC2.map(item => ({
                    name: item.name,
                    uptime: item.uptime,
                    performance: item.status === "running" ? "Operational" : "Down",
                }));

                const ecsStatuses = data.ECS.map(service => ({
                    name: service.serviceName,
                    uptime: service.runningDetails.length > 0 ? service.runningDetails[0].uptime : "N/A", // Display uptime for the first running task or 'N/A'
                    performance: service.runningTasks > 0 ? "Operational" : "Down",
                    runningTasks: service.runningTasks,
                    stoppedTasks: service.stoppedTasks,
                    runningDetails: service.runningDetails,
                    stoppedDetails: service.stoppedDetails,
                    downtime: service.stoppedDetails.map(task => task.downtime).join(", ") || "N/A" // Collect downtime for stopped tasks
                }));

                setStatuses([...ec2Statuses, ...ecsStatuses]);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStatuses();
        const intervalId = setInterval(fetchStatuses, 20 * 60 * 1000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div style={{
            fontFamily: 'sans-serif',
            padding: '40px',
            margin: '30px',
            background: 'linear-gradient(to right, #f9f9f9, #e0e0e0)'
        }}>
            <h1 style={{
                fontWeight: 'bold',
                fontSize: '2.5em',
                color: '#333',
                textShadow: '2px 2px 4px #aaa',
                borderBottom: '2px solid #ccc',
                marginBottom: '30px'
            }}>Dev Status</h1>
            {loading && <p>Loading statuses...</p>}
            {error && <p style={{ color: "red" }}>Error: {error}</p>}

            {!loading && !error && (
                <>
                    {statuses.map((status, index) => (
                        <div key={index} style={{
                            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
                            padding: '20px',
                            borderRadius: '12px',
                            marginBottom: '25px',
                            backgroundColor: '#fff',
                            border: '1px solid white',
                            transition: 'transform 0.3s, box-shadow 0.3s'
                        }}>
                            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{status.name}</div>
                            <div style={{ marginBottom: '5px' }}>Uptime: {status.uptime}</div>
                            <div style={{
                                color: status.performance === "Operational" ? "green" : "red",
                                marginBottom: '5px'
                            }}>
                                Performance: {status.performance}
                            </div>
                            <div style={{ marginBottom: '5px' }}>Downtime: {status.downtime || "N/A"}</div> {/* Display downtime for ECS services */}
                            <div style={{ height: '10px', backgroundColor: '#eee', borderRadius: '5px', overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.2)' }}>
                                <div style={{
                                    width: status.performance === "Operational" ? "100%" : "0%",
                                    backgroundColor: status.performance === "Operational" ? "#4caf50" : "#ff3b3b",
                                    height: '100%',
                                    transition: 'width 0.5s ease'
                                }} />
                            </div>
                        </div>
                    ))}
                    <div style={{ marginTop: '30px', border: '4px solid white', padding: '20px', borderRadius: '10px', backgroundColor: '#f0f0f0' }}>
                        <h2 style={{ fontWeight: 'bold', fontSize: '1.5em', borderBottom: '1px solid #ccc', marginBottom: '15px', color: '#333', textTransform: 'uppercase' }}>ECS Tasks</h2>
                        {statuses.filter(status => status.runningTasks !== undefined).map((service, index) => (
                            <div key={index} style={{
                                marginBottom: '30px',
                                boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
                                padding: '20px',
                                borderRadius: '12px',
                                backgroundColor: '#fff',
                                border: '1px solid white',
                                transition: 'transform 0.3s, box-shadow 0.3s'
                            }}>
                                <h3 style={{ fontWeight: 'bold', marginBottom: '10px', color: '#333', textTransform: 'uppercase' }}>{service.name}</h3>
                                <p>Running Tasks: <span style={{ color: "green", fontWeight: 'bold', fontSize: '1.1em' }}>{service.runningTasks} 🔄</span></p>
                                <p>Stopped Tasks: <span style={{ color: "red", fontWeight: 'bold', fontSize: '1.1em' }}>{service.stoppedTasks} ⛔</span></p>
                                {service.stoppedDetails.length > 0 && (
                                    <div style={{ marginTop: '10px' }}>
                                        <h4 style={{ fontWeight: 'bold', marginBottom: '5px' }}>Stopped Task Details:</h4>
                                        {service.stoppedDetails.map((task, idx) => (
                                            <div key={idx} style={{ marginBottom: '8px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #ccc' }}>
                                                <p>Task ARN: {task.taskArn}</p>
                                                <p>Status: <span style={{ color: "red" }}>{task.status}</span></p>
                                                <p>Downtime: {task.downtime || "N/A"}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Status;