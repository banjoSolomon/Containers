import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./index.module.css";

import karraboLogo from "./../../../asset/karrabo.png";
import meedlLogo from "./../../../asset/meddle.png";
import enumLogo from "./../../../asset/enum.png";

const fetchContainerStatus = async () => {
    const containers = [
        { name: "Enum", status: "operational" },
        { name: "Karrabo", status: "operational" },
        { name: "Meedl", status: "operational" },
    ];
    return Promise.resolve(containers);
};

const Section2 = () => {
    const [containers, setContainers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const updateContainers = async () => {
            const data = await fetchContainerStatus();
            setContainers(data);
        };

        updateContainers();
        const interval = setInterval(updateContainers, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.Section2App}>
            <p className={styles.text} style={{ fontSize: "20px" }}>
                Environment Status
            </p>
            <div className={styles.containerStatus}>
                {containers.map((container) => (
                    <div
                        key={container.name}
                        className={styles.containerCard}
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
                        }}
                        onClick={() => {
                            if (container.name === "Karrabo") {
                                navigate("/status"); // Only Karrabo redirects
                            }
                        }}
                    >
                        <div style={{ display: "flex", alignItems: "center" }}>
                            {container.name.includes("Enum") && (
                                <div style={{ marginRight: "8px" }}>
                                    <img
                                        src={enumLogo}
                                        alt="Enum Logo"
                                        style={{ width: "30px", height: "30px", marginTop: "-4px" }}
                                    />
                                </div>
                            )}
                            {container.name.includes("Karrabo") && (
                                <div style={{ marginRight: "8px" }}>
                                    <img
                                        src={karraboLogo}
                                        alt="Karrabo Logo"
                                        style={{ width: "30px", height: "30px", marginTop: "-4px" }}
                                    />
                                </div>
                            )}
                            {container.name.includes("Meedl") && (
                                <div style={{ marginRight: "8px" }}>
                                    <img
                                        src={meedlLogo}
                                        alt="Meedl Logo"
                                        style={{ width: "30px", height: "30px", marginTop: "-4px" }}
                                    />
                                </div>
                            )}
                            <div className={styles.containerName}>{container.name}</div>
                        </div>
                        <div
                            style={{
                                backgroundColor: "green",
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
