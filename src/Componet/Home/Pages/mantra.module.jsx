import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MantraLogo from "./../../../asset/mantra.png"; // Make sure to add this import
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTasks, faSpinner, faCircle, faExclamationTriangle, faSyncAlt } from "@fortawesome/free-solid-svg-icons";

const Mant = () => {
    const [ecsServices, setEcsServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const navigate = useNavigate();

    const fetchStatuses = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("https://5t2rt7za07.execute-api.us-east-1.amazonaws.com/prod/mantra-status", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);

            const data = await response.json();
            console.log("API Response:", data);

            // Process ECS services from Lambda response
            const processedEcs = data.ECS.map(service => ({
                name: service.serviceName,
                runningTasks: service.runningTasks,
                stoppedTasks: service.stoppedTasks,
                runningDetails: service.runningDetails,
                stoppedDetails: service.stoppedDetails,
                uptime: service.runningDetails.length > 0 ? service.runningDetails[0].uptime : "N/A",
                downtime: service.stoppedDetails.map(task => task.downtime).join(", ") || "N/A",
                performance: service.runningTasks > 0 ? "Operational" : "Down"
            }));

            setEcsServices(processedEcs);
            setLastUpdated(new Date());
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatuses();
        const intervalId = setInterval(fetchStatuses, 20 * 60 * 1000);
        return () => clearInterval(intervalId);
    }, [fetchStatuses]);

    const toggleDarkMode = () => {
        setDarkMode((prev) => !prev);
    };

    return (
        <div
            style={{
                fontFamily: "'Inter', sans-serif",
                padding: "40px",
                maxWidth: "1200px",
                margin: "0 auto",
                backgroundColor: darkMode ? "#1a1a1a" : "#f9fafb",
                minHeight: "100vh",
                color: darkMode ? "#ffffff" : "#333",
                transition: "background-color 0.3s, color 0.3s",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", marginBottom: "30px" }}>
                <h1
                    style={{
                        fontWeight: "bold",
                        fontSize: "2.5em",
                        color: darkMode ? "#ffffff" : "#333",
                        textShadow: "2px 2px 4px #aaa",
                        marginRight: "15px",
                        marginBottom: "0",
                    }}
                >
                    Mantra Status
                </h1>
                <img src={MantraLogo} alt="Mantra Logo" style={{ width: "50px", height: "50px" }} />
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
                    {lastUpdated && (
                        <div style={{ marginRight: "20px", color: darkMode ? "#aaa" : "#666" }}>
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </div>
                    )}
                    <button
                        onClick={fetchStatuses}
                        style={{
                            backgroundColor: darkMode ? "#333" : "#e0e0e0",
                            color: darkMode ? "#fff" : "#333",
                            border: "none",
                            padding: "10px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            marginRight: "10px",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <FontAwesomeIcon icon={faSyncAlt} style={{ marginRight: "5px" }} />
                        Refresh
                    </button>
                    <button
                        onClick={toggleDarkMode}
                        style={{
                            backgroundColor: darkMode ? "#4caf50" : "#333",
                            color: "white",
                            border: "none",
                            padding: "10px 20px",
                            borderRadius: "5px",
                            cursor: "pointer",
                        }}
                    >
                        {darkMode ? "Light Mode" : "Dark Mode"}
                    </button>
                </div>
            </div>

            {loading && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: "50px",
                        animation: "fadeIn 0.5s ease-in",
                    }}
                >
                    <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: "2em", marginRight: "10px" }} />
                    <p>Loading statuses...</p>
                </div>
            )}

            {error && (
                <div
                    style={{
                        color: "red",
                        display: "flex",
                        alignItems: "center",
                        marginTop: "20px",
                        animation: "fadeIn 0.5s ease-in",
                    }}
                >
                    <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: "10px" }} />
                    <p>Error: {error}</p>
                </div>
            )}

            {!loading && !error && (
                <>
                    {/* ECS Services Section - Only showing this since Lambda only returns ECS data */}
                    <h2 style={{ margin: "30px 0 20px", display: "flex", alignItems: "center" }}>
                        <FontAwesomeIcon icon={faTasks} style={{ marginRight: "10px" }} />
                        ECS Services
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                        {ecsServices.map((service, index) => (
                            <div
                                key={`ecs-${index}`}
                                style={{
                                    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
                                    padding: "20px",
                                    borderRadius: "12px",
                                    backgroundColor: darkMode ? "#333" : "#fff",
                                    border: "1px solid #e0e0e0",
                                    transition: "transform 0.3s, box-shadow 0.3s",
                                    ":hover": {
                                        transform: "translateY(-5px)",
                                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                                    },
                                }}
                            >
                                <div style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "1.2em" }}>
                                    {service.name}
                                </div>
                                <div style={{ marginBottom: "10px" }}>
                                    <FontAwesomeIcon
                                        icon={faCircle}
                                        style={{
                                            color: service.performance === "Operational" ? "#4caf50" : "#ff3b3b",
                                            marginRight: "10px",
                                        }}
                                    />
                                    {service.performance}
                                </div>
                                <div style={{ marginBottom: "10px" }}>Uptime: {service.uptime}</div>
                                <div style={{ marginBottom: "10px" }}>Downtime: {service.downtime}</div>
                                <div style={{ marginBottom: "10px" }}>
                                    Running Tasks: <span style={{ color: "green", fontWeight: "bold" }}>{service.runningTasks}</span>
                                </div>
                                <div style={{ marginBottom: "10px" }}>
                                    Stopped Tasks: <span style={{ color: "red", fontWeight: "bold" }}>{service.stoppedTasks}</span>
                                </div>

                                {/* Show running task details if available */}
                                {service.runningDetails.length > 0 && (
                                    <div style={{ marginTop: "15px" }}>
                                        <h4 style={{ fontWeight: "bold", marginBottom: "10px" }}>Running Task:</h4>
                                        <div style={{
                                            padding: "10px",
                                            backgroundColor: darkMode ? "#444" : "#f9f9f9",
                                            borderRadius: "8px",
                                            border: "1px solid #e0e0e0"
                                        }}>
                                            <p>Task ARN: {service.runningDetails[0].taskArn}</p>
                                            <p>Status: {service.runningDetails[0].status}</p>
                                            <p>Uptime: {service.runningDetails[0].uptime}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Show stopped task details if available */}
                                {service.stoppedDetails.length > 0 && (
                                    <div style={{ marginTop: "15px" }}>
                                        <h4 style={{ fontWeight: "bold", marginBottom: "10px" }}>Stopped Tasks:</h4>
                                        {service.stoppedDetails.map((task, idx) => (
                                            <div
                                                key={idx}
                                                style={{
                                                    padding: "10px",
                                                    marginBottom: "8px",
                                                    backgroundColor: darkMode ? "#444" : "#f9f9f9",
                                                    borderRadius: "8px",
                                                    border: "1px solid #e0e0e0"
                                                }}
                                            >
                                                <p>Task ARN: {task.taskArn}</p>
                                                <p>Status: {task.status}</p>
                                                <p>Downtime: {task.downtime}</p>
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

export default Mant;