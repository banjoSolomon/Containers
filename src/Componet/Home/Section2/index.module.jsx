import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./index.module.css";

const fetchContainerStatus = async () => {
    const containers = [
        { name: "Enum (Frontend)", status: Math.random() > 0.5 ? "operational" : "server down" },
        { name: "Enum (Backend)", status: Math.random() > 0.5 ? "operational" : "server down" },
        { name: "Enum (Dev)", status: Math.random() > 0.5 ? "operational" : "server down" },
        { name: "Enum (Systest)", status: Math.random() > 0.5 ? "operational" : "server down" },
        { name: "Enum (UAT)", status: Math.random() > 0.5 ? "operational" : "server down" },
        { name: "Enum (Prod)", status: Math.random() > 0.5 ? "operational" : "server down" },
        { name: "Karrabo (Frontend)", status: Math.random() > 0.5 ? "operational" : "server down" },
        { name: "Karrabo (Backend)", status: Math.random() > 0.5 ? "operational" : "server down" },
        { name: "Karrabo (Dev)", status: Math.random() > 0.5 ? "operational" : "server down" },
        { name: "Karrabo (Systest)", status: Math.random() > 0.5 ? "operational" : "server down" },
        { name: "Karrabo (UAT)", status: Math.random() > 0.5 ? "operational" : "server down" },
        { name: "Karrabo (Prod)", status: Math.random() > 0.5 ? "operational" : "server down" },
        { name: "Meedl (Frontend)", status: Math.random() > 0.5 ? "operational" : "server down" },
        { name: "Meedl (Backend)", status: Math.random() > 0.5 ? "operational" : "server down" },
        { name: "Meedl (Dev)", status: Math.random() > 0.5 ? "operational" : "server down" },
        { name: "Meedl (Systest)", status: Math.random() > 0.5 ? "operational" : "server down" },
        { name: "Meedl (UAT)", status: Math.random() > 0.5 ? "operational" : "server down" },
        { name: "Meedl (Prod)", status: Math.random() > 0.5 ? "operational" : "server down" },
        { name: "StatusPage", status: "active incident" }
    ];
    return Promise.resolve(containers);
};

const Section2 = () => {
    const [containers, setContainers] = useState([]);
    const navigate = useNavigate(); // Initialize navigate

    useEffect(() => {
        const updateContainers = async () => {
            const data = await fetchContainerStatus();
            setContainers(data);
        };

        updateContainers();
        const interval = setInterval(updateContainers, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleStatusClick = (status) => {
        if (status === "active incident") {
            navigate("/status");
        }
    };

    return (
        <div className={styles.Section2App}>
            <p className={styles.text} style={{ fontSize: '20px' }}>Environment Status</p>
            <div className={styles.containerStatus}>
                {containers.map(container => (
                    <div
                        key={container.name}
                        className={styles.containerCard}
                        style={{
                            margin: "10px",
                            padding: "20px",
                            // border: container.status === "active incident" ? "1px solid yellow" : "1px solid #ddd",
                            borderRadius: "8px",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                            maxWidth: "600px",
                            boxSizing: "border-box",
                            cursor: 'pointer',
                        }}
                        onClick={() => handleStatusClick(container.status)}
                    >
                        <div className={styles.containerName}>{container.name}</div>
                        <div
                            style={{
                                backgroundColor: container.status === "operational" ? "green" :
                                    container.status === "active incident" ? "orange" :
                                        "red",
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
                ))}
            </div>
        </div>
    );
};

export default Section2;