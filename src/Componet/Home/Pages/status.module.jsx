import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import karraboLogo from "./../../../asset/karrabo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDocker } from "@fortawesome/free-brands-svg-icons";
import { faServer, faTasks, faSpinner, faCircle, faExclamationTriangle, faSyncAlt } from "@fortawesome/free-solid-svg-icons";

const Status = () => {
    const [statuses, setStatuses] = useState([]);
    const [dockerImages, setDockerImages] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const navigate = useNavigate();

    const fetchStatuses = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("https://9qyga7xn2j.execute-api.us-west-2.amazonaws.com/dev/status", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);

            const data = await response.json();
            console.log("API Response:", data);

            const ec2Statuses = data.EC2.map((item) => ({
                id: item.id,
                name: item.name,
                uptime: item.uptime,
                performance: item.status === "running" ? "Operational" : "Down",
            }));

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

            setStatuses([...ec2Statuses, ...ecsStatuses]);
            setLastUpdated(new Date());

            const dockerImagesWithFlag = {};
            const dockerImagesData = data.DockerImages || {};
            for (const [instanceId, images] of Object.entries(dockerImagesData)) {
                dockerImagesWithFlag[instanceId] = {
                    isOpen: false,
                    images: images,
                };
            }
            setDockerImages(dockerImagesWithFlag);
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

    const toggleDockerImages = (instanceId) => {
        setDockerImages((prev) => ({
            ...prev,
            [instanceId]: {
                ...prev[instanceId],
                isOpen: !prev[instanceId]?.isOpen,
            },
        }));
    };

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
                    Dev Server Status
                </h1>
                <img src={karraboLogo} alt="Karrabo Logo" style={{ width: "50px", height: "50px" }} />
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
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
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
                                    cursor: "pointer",
                                    animation: "fadeIn 0.5s ease-in",
                                    ":hover": {
                                        transform: "translateY(-5px)",
                                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                                    },
                                }}
                            >
                                <div style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "1.2em" }}>
                                    <FontAwesomeIcon icon={faServer} style={{ marginRight: "10px" }} />
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

                                {status.id && dockerImages[status.id] && (
                                    <div style={{ marginTop: "15px" }}>
                                        <button
                                            onClick={() => toggleDockerImages(status.id)}
                                            style={{
                                                backgroundColor: "#4caf50",
                                                color: "#fff",
                                                border: "none",
                                                padding: "8px 12px",
                                                borderRadius: "5px",
                                                cursor: "pointer",
                                                marginBottom: "10px",
                                                display: "flex",
                                                alignItems: "center",
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faDocker} style={{ marginRight: "10px" }} />
                                            {dockerImages[status.id].isOpen ? "Hide Docker Containers" : "Show Docker Containers"}
                                        </button>
                                        {dockerImages[status.id].isOpen && (
                                            <div
                                                style={{
                                                    padding: "15px",
                                                    backgroundColor: darkMode ? "#444" : "#f9f9f9",
                                                    borderRadius: "12px",
                                                    border: "1px solid #e0e0e0",
                                                }}
                                            >
                                                <h4 style={{ fontWeight: "bold", marginBottom: "10px" }}>
                                                    Running Docker Images:
                                                </h4>
                                                {dockerImages[status.id].images.length > 0 ? (
                                                    dockerImages[status.id].images.map((image, idx) => (
                                                        <div
                                                            key={idx}
                                                            style={{
                                                                marginBottom: "5px",
                                                                padding: "8px",
                                                                backgroundColor: darkMode ? "#555" : "#fff",
                                                                borderRadius: "8px",
                                                                border: "1px solid #e0e0e0",
                                                            }}
                                                        >
                                                            {image}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div style={{ color: "red", fontWeight: "bold" }}>Image not running</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div
                        style={{
                            marginTop: "30px",
                            padding: "20px",
                            borderRadius: "12px",
                            backgroundColor: darkMode ? "#333" : "#fff",
                            boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
                            animation: "fadeIn 0.5s ease-in",
                        }}
                    >
                        <h2
                            style={{
                                fontWeight: "bold",
                                fontSize: "1.5em",
                                marginBottom: "20px",
                                color: darkMode ? "#ffffff" : "#333",
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <FontAwesomeIcon icon={faTasks} style={{ marginRight: "10px" }} />
                            ECS Tasks
                        </h2>
                        {statuses
                            .filter((status) => status.runningTasks !== undefined)
                            .map((service, index) => (
                                <div
                                    key={index}
                                    style={{
                                        marginBottom: "20px",
                                        padding: "20px",
                                        borderRadius: "12px",
                                        backgroundColor: darkMode ? "#444" : "#f9f9f9",
                                        border: "1px solid #e0e0e0",
                                    }}
                                >
                                    <h3 style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "1.2em" }}>
                                        {service.name}
                                    </h3>
                                    <p>
                                        Running Tasks:{" "}
                                        <span style={{ color: "green", fontWeight: "bold" }}>{service.runningTasks} 🔄</span>
                                    </p>
                                    <p>
                                        Stopped Tasks:{" "}
                                        <span style={{ color: "red", fontWeight: "bold" }}>{service.stoppedTasks} ⛔</span>
                                    </p>
                                    {service.stoppedDetails.length > 0 && (
                                        <div style={{ marginTop: "10px" }}>
                                            <h4 style={{ fontWeight: "bold", marginBottom: "10px" }}>Stopped Task Details:</h4>
                                            {service.stoppedDetails.map((task, idx) => (
                                                <div
                                                    key={idx}
                                                    style={{
                                                        marginBottom: "8px",
                                                        padding: "10px",
                                                        backgroundColor: darkMode ? "#555" : "#fff",
                                                        borderRadius: "8px",
                                                        border: "1px solid #e0e0e0",
                                                    }}
                                                >
                                                    <p>Task ARN: {task.taskArn}</p>
                                                    <p>
                                                        Status: <span style={{ color: "red" }}>{task.status}</span>
                                                    </p>
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