import React, { useState } from "react";

import styles from "./index.module.css";


const initialContainers = [
    { name: "Enum (Frontend)", status: "up" },
    { name: "Enum (Backend)", status: "up" },
    { name: "Enum (Dev)", status: "up" },
    { name: "Enum (Systest)", status: "down" },
    { name: "Enum (UAT)", status: "up" },
    { name: "Enum (Prod)", status: "down" },

    { name: "Karrabo (Frontend)", status: "up" },
    { name: "Karrabo (Backend)", status: "down" },
    { name: "Karrabo (Dev)", status: "up" },
    { name: "Karrabo (Systest)", status: "down" },
    { name: "Karrabo (UAT)", status: "up" },
    { name: "Karrabo (Prod)", status: "down" },

    { name: "Meedl (Frontend)", status: "up" },
    { name: "Meedl (Backend)", status: "down" },
    { name: "Meedl (Dev)", status: "up" },
    { name: "Meedl (Systest)", status: "down" },
    { name: "Meedl (UAT)", status: "up" },
    { name: "Meedl (Prod)", status: "down" },

    { name: "Meca (Frontend)", status: "up" },
    { name: "Meca (Backend)", status: "down" },
    { name: "Meca (Dev)", status: "up" },
    { name: "Meca (Systest)", status: "down" },
    { name: "Meca (UAT)", status: "up" },
    { name: "Meca (Prod)", status: "down" },
];

const Section2 = () => {
    const [containers, setContainers] = useState(initialContainers);

    const updateContainerStatus = (containerName, newStatus) => {
        setContainers(prevContainers =>
            prevContainers.map(container =>
                container.name === containerName
                    ? { ...container, status: newStatus }
                    : container
            )
        );
    };

    return (
        <div className={styles.Section2App}>
            <p className={styles.text}>Environment Status</p>
            <div className={styles.containerStatus}>
                {containers.map(container => (
                    <div key={container.name} className={styles.containerCard}>
                        <div
                            style={{
                                color:
                                    container.status === "up"
                                        ? "green"
                                        : container.status === "down"
                                            ? "red"
                                            : "gray",
                                padding: "10px",
                                border: "1px solid black",
                                display: "inline-block",
                            }}
                        >
                            {container.name} is {container.status}
                        </div>
                        <div style={{ marginTop: "5px" }}>
                            <button
                                onClick={() => updateContainerStatus(container.name, "up")}
                            >
                                Mark as Up
                            </button>
                            <button
                                onClick={() => updateContainerStatus(container.name, "down")}
                            >
                                Mark as Down
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Section2;
