import React, { useEffect, useState } from "react";
import Enum from "./../../../asset/enum.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTasks, faSpinner, faCircle, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

const Karrabo = () => {
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const fetchStatuses = async () => {
            try {
                const response = await fetch("https://ilnlr2p810.execute-api.us-east-1.amazonaws.com/prod/ecs-status", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (!response.ok) throw new Error(`Error: ${response.status}`);

                const data = await response.json();
                console.log("API Response:", data);

                const ecsStatuses = data.ECS.map((service) => ({
                    name: service.serviceName,
                    uptime: service.runningDetails.length > 0 ? service.runningDetails[0].uptime : "N/A",
                    performance: service.runningTasks > 0 ? "Operational" : "Down",
                    runningTasks: service.runningTasks,
                    stoppedTasks: service.stoppedTasks,
                    runningDetails: service.runningDetails,
                    stoppedDetails: service.stoppedDetails,
                    downtime: service.stoppedDetails.map((task) => task.downtime).join(", ") || "N/A",
                }));

                setStatuses(ecsStatuses);
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
                    ECS Service Status
                </h1>
                <img src={Enum} alt="Enum Logo" style={{ width: "50px", height: "50px" }} />
                <button
                    onClick={toggleDarkMode}
                    style={{
                        backgroundColor: darkMode ? "#4caf50" : "#333",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        marginLeft: "auto",
                        transition: "background-color 0.3s",
                    }}
                >
                    {darkMode ? "Light Mode" : "Dark Mode"}
                </button>
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
                    <p>Loading ECS statuses...</p>
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
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "20px",
                    }}
                >
                    {statuses.map((status, index) => (
                        <div
                            key={index}
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
                                {status.name}
                            </div>
                            <div style={{ marginBottom: "10px" }}>
                                <FontAwesomeIcon
                                    icon={faCircle}
                                    style={{
                                        color: status.performance === "Operational" ? "#4caf50" : "#ff3b3b",
                                        marginRight: "10px",
                                    }}
                                />
                                {status.performance}
                            </div>
                            <div style={{ marginBottom: "10px" }}>Uptime: {status.uptime}</div>
                            <div style={{ marginBottom: "10px" }}>Downtime: {status.downtime || "N/A"}</div>
                            <div style={{ marginBottom: "10px" }}>
                                Running Tasks: <span style={{ color: "green", fontWeight: "bold" }}>{status.runningTasks}</span>
                            </div>
                            <div style={{ marginBottom: "10px" }}>
                                Stopped Tasks: <span style={{ color: "red", fontWeight: "bold" }}>{status.stoppedTasks}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Karrabo;
