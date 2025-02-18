import React from "react";
import styles from "./index.module.css";

const Status = () => {
    const statuses = [
        { name: "identity_management", uptime: "95.0%", performance: "Operational", age: "30 days ago" },
        { name: "wallet_management_backend_dev", uptime: "99.0%", performance: "Server Down", age: "5 days ago" },
        { name: "notification-service-dev", uptime: "98.0%", performance: "Operational", age: "15 days ago" },
        { name: "payment_management_dev", uptime: "97.0%", performance: "Operational", age: "20 days ago" },
        { name: "terminal-management-dev", uptime: "96.0%", performance: "Server Down", age: "10 days ago" },
        {name: "karrabo-pulser", uptime: "95.0%", performance: "Operational", age: "25 days ago" },
        {name: "Gatekeeper", uptime: "96.0%", performance: "Operational", age: "10 days ago" },
        {name: "cardinstance", uptime: "98.0%", performance: "Server Down", age: "5 days ago"}
    ];

    return (
        <div className={styles.statusContainer}>
            <h1>Dev</h1>
            {statuses.map((status, index) => (
                <div className={styles.statusItem} key={index}>
                    <div className={styles.statusName}>{status.name}</div>
                    <div className={styles.statusUptime}>{status.uptime}</div>
                    <div
                        className={styles.statusPerformance}
                        style={{ color: status.performance === "Operational" ? "green" : "red" }}
                    >
                        {status.performance}
                    </div>
                    <div className={styles.statusAge}>{status.age}</div>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progress}
                            style={{
                                width: status.uptime.replace("%", "") + "%",
                                backgroundColor: status.performance === "Operational" ? "#4caf50" : "#ff3b3b", // Green for Operational, Red for Server Down
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Status;
