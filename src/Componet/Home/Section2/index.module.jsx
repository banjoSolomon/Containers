import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import karraboLogo from "./../../../asset/karrabo.png";
import meedlLogo from "./../../../asset/meddle.png";
import enumLogo from "./../../../asset/enum.png";
import mantraLogo from "./../../../asset/mantra.png";
import styles from "./index.module.css";

// Function to get logo based on container name
const getLogo = (name) => {
    switch (name) {
        case "Enum":
            return enumLogo;
        case "Karrabo":
            return karraboLogo;
        case "Meedl":
            return meedlLogo;
        case "Mantra":
            return mantraLogo;
        default:
            return null;
    }
};

// ContainerCard Component
const ContainerCard = ({ container, onClick }) => {
    const statusEmoji = container.status === "operational" ? "🟢" : "🔴";

    return (
        <motion.div
            className={styles.containerCard}
            onClick={onClick}
            role="button"
            tabIndex={0}
            aria-label={`View ${container.name} status`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
                margin: "10px",
                padding: "20px",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                maxWidth: "600px",
                boxSizing: "border-box",
                cursor: "pointer",
                transition: "transform 0.3s, box-shadow 0.3s",
            }}
        >
            <div style={{ display: "flex", alignItems: "center" }}>
                <img
                    src={getLogo(container.name)}
                    alt={`${container.name} Logo`}
                    style={{ width: "30px", height: "30px", marginRight: "10px" }}
                />
                <div className={styles.containerName}>{container.name}</div>
            </div>
            <div
                style={{
                    backgroundColor: container.status === "operational" ? "#4caf50" : "#ff3b3b",
                    color: "white",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    fontSize: "12px",
                    textTransform: "uppercase",
                }}
            >
                {statusEmoji} {container.status}
            </div>
        </motion.div>
    );
};

// Section2 Component (Main Container for Status Cards)
const Section2 = () => {
    const [containers, setContainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(Date.now());
    const navigate = useNavigate();

    // Fetching container status (dummy data for now)
    useEffect(() => {
        const updateContainers = async () => {
            try {
                const data = [
                    { name: "Enum", status: "operational" },
                    { name: "Karrabo", status: "operational" },
                    { name: "Meedl", status: "operational" },
                    { name: "Mantra", status: "operational" },
                ];
                setContainers(data);
                setError(null);
            } catch (error) {
                console.error("Error fetching container status:", error);
                setError("Failed to fetch container status. Please try again later.");
            } finally {
                setLoading(false);
                setLastUpdated(Date.now());
            }
        };

        updateContainers();
        const interval = setInterval(updateContainers, 5000);

        return () => clearInterval(interval);
    }, []);

    // Handle clicking on a container card
    const handleContainerClick = (containerName) => {
        switch (containerName) {
            case "Karrabo":
                navigate("/status");
                break;
            case "Enum":
                navigate("/enum");
                break;
            case "Meedl":
                navigate("/meedle");
                break;
            case "Mantra":
                navigate("/mantra");
                break;
            default:
                break;
        }
    };

    // Function to show last update time
    const timeSinceLastUpdate = () => {
        const seconds = Math.floor((Date.now() - lastUpdated) / 1000);
        if (seconds < 60) return `${seconds} seconds ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minutes ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours} hours ago`;
    };

    return (
        <div className={styles.Section2App}>
            <p className={styles.text} style={{ fontSize: "20px", marginBottom: "20px" }}>
                Environment Status
            </p>
            {loading ? (
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100px",
                    }}
                >
                    <motion.div
                        className="spinner"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        style={{
                            width: "50px",
                            height: "50px",
                            border: "5px solid #f3f3f3",
                            borderTop: "5px solid #4caf50",
                            borderRadius: "50%",
                        }}
                    />
                </div>
            ) : error ? (
                <div style={{ color: "red", textAlign: "center" }}>
                    <p>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            backgroundColor: "#4caf50",
                            color: "white",
                            border: "none",
                            padding: "10px 20px",
                            borderRadius: "5px",
                            cursor: "pointer",
                            marginTop: "10px",
                        }}
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <div className={styles.containerStatus}>
                    {containers.map((container) => (
                        <ContainerCard
                            key={container.name}
                            container={container}
                            onClick={() => handleContainerClick(container.name)}
                        />
                    ))}
                    <div style={{ marginTop: "20px", fontSize: "12px", color: "#999" }}>
                        Last updated: {timeSinceLastUpdate()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Section2;
