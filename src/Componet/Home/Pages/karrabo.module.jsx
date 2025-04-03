import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Enum from "./../../../asset/enum.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDocker } from "@fortawesome/free-brands-svg-icons";
import { faServer, faTasks, faSpinner, faCircle, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

const Karrabo = () => {
    const [statusData, setStatusData] = useState({ ECS: [], EC2: [] });
    const [dockerImages, setDockerImages] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const navigate = useNavigate();

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

                // Process Docker images
                const dockerImagesWithFlag = {};
                data.EC2.forEach(instance => {
                    dockerImagesWithFlag[instance.instanceId] = {
                        isOpen: false,
                        images: instance.dockerImages.dockerImages
                    };
                });

                setStatusData(data);
                setDockerImages(dockerImagesWithFlag);
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

    const toggleDockerImages = (instanceId) => {
        setDockerImages(prev => ({
            ...prev,
            [instanceId]: {
                ...prev[instanceId],
                isOpen: !prev[instanceId]?.isOpen,
            },
        }));
    };

    const handleImageClick = (images) => {
        navigate("/metrics", { state: { images } });
    };

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    // Calculate uptime for ECS services
    const getECSUptime = (service) => {
        return service.runningDetails.length > 0
            ? service.runningDetails[0].uptime
            : "N/A";
    };

    // Calculate downtime for ECS services
    const getECSDowntime = (service) => {
        return service.stoppedDetails.map(task => task.downtime).join(", ") || "N/A";
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
                    {/* EC2 Instances Section */}
                    <h2 style={{ margin: "30px 0 20px", display: "flex", alignItems: "center" }}>
                        <FontAwesomeIcon icon={faServer} style={{ marginRight: "10px" }} />
                        EC2 Instances
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                        {statusData.EC2.map((instance) => (
                            <div
                                key={instance.instanceId}
                                style={{
                                    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
                                    padding: "20px",
                                    borderRadius: "12px",
                                    backgroundColor: darkMode ? "#333" : "#fff",
                                    border: "1px solid #e0e0e0",
                                    transition: "transform 0.3s, box-shadow 0.3s",
                                    cursor: "pointer",
                                    ":hover": {
                                        transform: "translateY(-5px)",
                                        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                                    },
                                }}
                            >
                                <div style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "1.2em" }}>
                                    <FontAwesomeIcon icon={faServer} style={{ marginRight: "10px" }} />
                                    {instance.instanceName || "Unnamed Instance"}
                                </div>
                                <div style={{ marginBottom: "10px" }}>
                                    <FontAwesomeIcon
                                        icon={faCircle}
                                        style={{
                                            color: "#4caf50",
                                            marginRight: "10px",
                                        }}
                                    />
                                    Operational
                                </div>
                                <div style={{ marginBottom: "10px" }}>Instance ID: {instance.instanceId}</div>
                                <div style={{ marginBottom: "10px" }}>Public IP: {instance.publicIp}</div>

                                {dockerImages[instance.instanceId] && (
                                    <div style={{ marginTop: "15px" }}>
                                        <button
                                            onClick={() => toggleDockerImages(instance.instanceId)}
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
                                            {dockerImages[instance.instanceId].isOpen ? "Hide Docker Images" : "Show Docker Images"}
                                        </button>
                                        {dockerImages[instance.instanceId].isOpen && (
                                            <div
                                                style={{
                                                    padding: "15px",
                                                    backgroundColor: darkMode ? "#444" : "#f9f9f9",
                                                    borderRadius: "12px",
                                                    border: "1px solid #e0e0e0",
                                                }}
                                            >
                                                <h4 style={{ fontWeight: "bold", marginBottom: "10px" }}>
                                                    Docker Images:
                                                </h4>
                                                {dockerImages[instance.instanceId].images.length > 0 ? (
                                                    dockerImages[instance.instanceId].images.map((image, idx) => (
                                                        <div
                                                            key={idx}
                                                            style={{
                                                                marginBottom: "5px",
                                                                cursor: "pointer",
                                                                padding: "8px",
                                                                backgroundColor: darkMode ? "#555" : "#fff",
                                                                borderRadius: "8px",
                                                                border: "1px solid #e0e0e0",
                                                                ":hover": {
                                                                    backgroundColor: darkMode ? "#666" : "#f0f0f0",
                                                                },
                                                            }}
                                                            onClick={() => handleImageClick(dockerImages[instance.instanceId].images)}
                                                        >
                                                            {image}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div style={{ color: "red", fontWeight: "bold" }}>No images found</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* ECS Services Section */}
                    <h2 style={{ margin: "30px 0 20px", display: "flex", alignItems: "center" }}>
                        <FontAwesomeIcon icon={faTasks} style={{ marginRight: "10px" }} />
                        ECS Services
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                        {statusData.ECS.map((service, index) => (
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
                                    {service.serviceName}
                                </div>
                                <div style={{ marginBottom: "10px" }}>
                                    <FontAwesomeIcon
                                        icon={faCircle}
                                        style={{
                                            color: service.runningTasks > 0 ? "#4caf50" : "#ff3b3b",
                                            marginRight: "10px",
                                        }}
                                    />
                                    {service.runningTasks > 0 ? "Operational" : "Down"}
                                </div>
                                <div style={{ marginBottom: "10px" }}>Uptime: {getECSUptime(service)}</div>
                                <div style={{ marginBottom: "10px" }}>Downtime: {getECSDowntime(service)}</div>
                                <div style={{ marginBottom: "10px" }}>
                                    Running Tasks: <span style={{ color: "green", fontWeight: "bold" }}>{service.runningTasks}</span>
                                </div>
                                <div style={{ marginBottom: "10px" }}>
                                    Stopped Tasks: <span style={{ color: "red", fontWeight: "bold" }}>{service.stoppedTasks}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Karrabo;