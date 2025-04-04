import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Enum from "./../../../asset/enum.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDocker } from "@fortawesome/free-brands-svg-icons";
import { faServer, faTasks, faSpinner, faCircle, faExclamationTriangle, faSyncAlt } from "@fortawesome/free-solid-svg-icons";

const Karrabo = () => {
    const [statusData, setStatusData] = useState({ ECS: [], EC2: [], AmazonMQ: [] });
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

            const response = await fetch("https://ilnlr2p810.execute-api.us-east-1.amazonaws.com/prod/ecs-status", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);

            const data = await response.json();
            console.log("API Response:", data);

            const dockerImagesWithFlag = {};
            data.EC2.forEach(instance => {
                dockerImagesWithFlag[instance.instanceId] = {
                    isOpen: false,
                    images: instance.dockerImages.dockerImages
                };
            });

            setStatusData(data);
            setDockerImages(dockerImagesWithFlag);
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

    const toggleDockerImages = (instanceId) => {
        setDockerImages(prev => ({
            ...prev,
            [instanceId]: {
                ...prev[instanceId],
                isOpen: !prev[instanceId]?.isOpen,
            },
        }));
    };

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    const getECSUptime = (service) => {
        return service.runningDetails.length > 0
            ? service.runningDetails[0].uptime
            : "N/A";
    };

    const getECSDowntime = (service) => {
        return service.stoppedDetails.map(task => task.downtime).join(", ") || "N/A";
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "RUNNING":
                return "#4caf50";
            case "CREATION_FAILED":
            case "DELETION_FAILED":
                return "#ff3b3b";
            case "REBOOT_IN_PROGRESS":
            case "CREATION_IN_PROGRESS":
                return "#ffc107";
            default:
                return "#9e9e9e";
        }
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
                                            {dockerImages[instance.instanceId].isOpen ? "Hide Docker Containers" : "Show Docker Containers"}
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

                    {/* RabbitMQ Section */}
                    <h2 style={{ margin: "30px 0 20px", display: "flex", alignItems: "center" }}>
                        <FontAwesomeIcon icon={faServer} style={{ marginRight: "10px" }} />
                        AmazonMQ Status
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                        {statusData.AmazonMQ && statusData.AmazonMQ.length > 0 ? (
                            statusData.AmazonMQ.map((broker, index) => (
                                <div
                                    key={`mq-${index}`}
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
                                        {broker.BrokerName || "Unnamed Broker"}
                                    </div>
                                    <div style={{ marginBottom: "10px" }}>
                                        <FontAwesomeIcon
                                            icon={faCircle}
                                            style={{
                                                color: getStatusColor(broker.Status),
                                                marginRight: "10px",
                                            }}
                                        />
                                        Status: {broker.Status}
                                        {broker.Status === "RUNNING" && " - Healthy"}
                                        {broker.Status === "CREATION_FAILED" && " - Failed"}
                                        {broker.Status === "REBOOT_IN_PROGRESS" && " - Rebooting"}
                                    </div>
                                    {broker.BrokerId && (
                                        <div style={{ marginBottom: "10px" }}>Broker ID: {broker.BrokerId}</div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div
                                style={{
                                    padding: "20px",
                                    borderRadius: "12px",
                                    backgroundColor: darkMode ? "#333" : "#fff",
                                    border: "1px solid #e0e0e0",
                                }}
                            >
                                {loading ? "Loading RabbitMQ status..." : "No AmazonMQ brokers found"}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default Karrabo;