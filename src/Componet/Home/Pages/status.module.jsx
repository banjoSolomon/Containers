import React from 'react';
import styles from "./index.module.css";

const Status = () => {
    const statuses = [
        { name: "HTTP Pages", uptime: "100.0 %", performance: "Degraded Performance", age: "90 days ago" },
        { name: "HTTPS Pages", uptime: "100.0 %", performance: "Degraded Performance", age: "90 days ago" },
        { name: "Status Embed Widget", uptime: "100.0 %", performance: "Operational", age: "90 days ago" },
        { name: "Public API", uptime: "100.0 %", performance: "Degraded Performance", age: "90 days ago" },
        { name: "Shortlinks", uptime: "100.0 %", performance: "Operational", age: "90 days ago" }
    ];

    return (
        <div className={styles.statusContainer}>
            <h1>Hosted Pages</h1>
            {statuses.map((status, index) => (
                <div className={styles.statusItem} key={index}>
                    <div className={styles.statusName}>{status.name}</div>
                    <div className={styles.statusUptime}>{status.uptime}</div>
                    <div className={styles.statusPerformance} style={{ color: status.performance === "Operational" ? "green" : "orange" }}>
                        {status.performance}
                    </div>
                    <div className={styles.statusAge}>{status.age}</div>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progress}
                            style={{ width: status.uptime.replace('%', '') + '%' }} // Set width based on uptime percentage
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Status;