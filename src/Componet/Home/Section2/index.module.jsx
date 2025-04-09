import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiRefreshCw, FiExternalLink, FiClock } from "react-icons/fi";
import karraboLogo from "./../../../asset/karrabo.png";
import meedlLogo from "./../../../asset/meddle.png";
import enumLogo from "./../../../asset/enum.png";
import mantraLogo from "./../../../asset/mantra.png";
import styles from "./index.module.css";


const getLogo = (name) => {
    const logos = {
        Enum: enumLogo,
        Karrabo: karraboLogo,
        Meedl: meedlLogo,
        Mantra: mantraLogo,
    };
    return logos[name] || null;
};

// Status indicator component
const StatusIndicator = ({ status }) => {
    const statusConfig = {
        operational: { color: "#10B981", label: "Operational", emoji: "🟢" },
        degraded: { color: "#F59E0B", label: "Degraded", emoji: "🟡" },
        outage: { color: "#EF4444", label: "Outage", emoji: "🔴" },
        maintenance: { color: "#6366F1", label: "Maintenance", emoji: "🟠" },
    };

    const config = statusConfig[status] || statusConfig.outage;

    return (
        <div className={styles.statusIndicator} style={{ backgroundColor: config.color }}>
            <span className={styles.statusEmoji}>{config.emoji}</span>
            <span className={styles.statusLabel}>{config.label}</span>
        </div>
    );
};

// ContainerCard Component
const ContainerCard = ({ container, onClick }) => {
    return (
        <motion.div
            className={styles.containerCard}
            onClick={onClick}
            role="button"
            tabIndex={0}
            aria-label={`View ${container.name} status`}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className={styles.cardHeader}>
                <div className={styles.logoContainer}>
                    <img
                        src={getLogo(container.name)}
                        alt={`${container.name} Logo`}
                        className={styles.logo}
                    />
                </div>
                <div className={styles.containerName}>{container.name}</div>
                <FiExternalLink className={styles.externalLinkIcon} />
            </div>

            <div className={styles.cardBody}>
                <StatusIndicator status={container.status} />

                {container.responseTime && (
                    <div className={styles.responseTime}>
                        <span className={styles.timeValue}>{container.responseTime}ms</span>
                        <span className={styles.timeLabel}>avg response</span>
                    </div>
                )}

                {container.uptime && (
                    <div className={styles.uptime}>
                        <div className={styles.uptimeBar}>
                            <div
                                className={styles.uptimeFill}
                                style={{ width: `${container.uptime}%` }}
                            />
                        </div>
                        <span className={styles.uptimeValue}>{container.uptime}% uptime</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

// Section2 Component (Main Container for Status Cards)
const Section2 = () => {
    const [containers, setContainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const navigate = useNavigate();


    const fetchContainerStatus = async () => {
        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));

            // Mock data with more details
            const data = [
                {
                    name: "Enum",
                    status: "operational",
                    responseTime: 124,
                    uptime: 99.98,
                    lastIncident: "2023-05-15T08:23:00Z"
                },
                {
                    name: "Karrabo",
                    status: "operational",
                    responseTime: 89,
                    uptime: 99.99,
                    lastIncident: null
                },
                {
                    name: "Meedl",
                    status: "operational",
                    responseTime: 342,
                    uptime: 99.87,
                    lastIncident: "2023-05-20T14:45:00Z"
                },
                {
                    name: "Mantra",
                    status: "operational",
                    responseTime: 156,
                    uptime: 99.95,
                    lastIncident: "2023-04-30T11:12:00Z"
                },
            ];

            setContainers(data);
            setError(null);
            setLastUpdated(new Date());
        } catch (error) {
            console.error("Error fetching container status:", error);
            setError("Failed to fetch container status. Please try again later.");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchContainerStatus();
        const interval = setInterval(fetchContainerStatus, 30000);

        return () => clearInterval(interval);
    }, []);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchContainerStatus();
    };

    const handleContainerClick = (containerName) => {
        const routes = {
            Karrabo: "/status",
            Enum: "/enum",
            Meedl: "/meedle",
            Mantra: "/mantra",
        };

        if (routes[containerName]) {
            navigate(routes[containerName]);
        }
    };

    const formatLastUpdated = () => {
        if (!lastUpdated) return "Never updated";

        const now = new Date();
        const diffInSeconds = Math.floor((now - lastUpdated) / 1000);

        if (diffInSeconds < 60) return `Updated ${diffInSeconds} seconds ago`;
        if (diffInSeconds < 3600) return `Updated ${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `Updated ${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `Updated ${lastUpdated.toLocaleString()}`;
    };

    return (
        <div className={styles.Section2App}>
            <div className={styles.header}>
                <h1 className={styles.title}>Environment Status</h1>
                <p className={styles.subtitle}>Real-time monitoring of all services</p>

                <div className={styles.controls}>
                    <button
                        className={styles.refreshButton}
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        <FiRefreshCw className={`${styles.refreshIcon} ${isRefreshing ? styles.spinning : ''}`} />
                        Refresh
                    </button>

                    <div className={styles.lastUpdated}>
                        <FiClock className={styles.clockIcon} />
                        <span>{formatLastUpdated()}</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className={styles.loadingContainer}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className={styles.spinner}
                    />
                    <p>Loading service status...</p>
                </div>
            ) : error ? (
                <div className={styles.errorContainer}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <h3>Unable to load status</h3>
                    <p>{error}</p>
                    <button
                        onClick={handleRefresh}
                        className={styles.retryButton}
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <motion.div
                    className={styles.containerGrid}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {containers.map((container) => (
                        <ContainerCard
                            key={container.name}
                            container={container}
                            onClick={() => handleContainerClick(container.name)}
                        />
                    ))}
                </motion.div>
            )}

            <div className={styles.footer}>
                <p>Need help? Contact our support team</p>
                <div className={styles.systemStatus}>
                    <span className={styles.dot}></span>
                    <span>All systems operational</span>
                </div>
            </div>
        </div>
    );
};

export default Section2;