import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./index.module.css";

import karraboLogo from "./../../../asset/karrabo.png";
import meedlLogo from "./../../../asset/meddle.png";
import enumLogo from "./../../../asset/enum.png";

const fetchContainerStatus = async () => {
    // Simulate an API call
    const containers = [
        { name: "Enum", status: "operational" },
        { name: "Karrabo", status: "operational" },
        { name: "Meedl", status: "operational" },
    ];
    return Promise.resolve(containers);
};

const ContainerCard = ({ container, onClick }) => {
    const getLogo = (name) => {
        switch (name) {
            case "Enum":
                return enumLogo;
            case "Karrabo":
                return karraboLogo;
            case "Meedl":
                return meedlLogo;
            default:
                return null;
        }
    };

    return (
        <div
            className={styles.containerCard}
            onClick={onClick}
            role="button"
            tabIndex={0}
            aria-label={`View ${container.name} status`}
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
                ":hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                },
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
                {container.status}
            </div>
        </div>
    );
};

const Section2 = () => {
    const [containers, setContainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const updateContainers = async () => {
            try {
                const data = await fetchContainerStatus();
                setContainers(data);
                setError(null);
            } catch (error) {
                console.error("Error fetching container status:", error);
                setError("Failed to fetch container status. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        updateContainers();
        const interval = setInterval(updateContainers, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.Section2App}>
            <p className={styles.text} style={{ fontSize: "20px", marginBottom: "20px" }}>
                Environment Status
            </p>
            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100px" }}>
                    <p>Loading...</p>
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
                            onClick={() => {
                                if (container.name === "Karrabo") {
                                    navigate("/status");
                                } else if (container.name === "Enum") {
                                    navigate("/enum");
                                }
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Section2;
