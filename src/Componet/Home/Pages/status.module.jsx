import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import karraboLogo from "./../../../asset/karrabo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDocker } from "@fortawesome/free-brands-svg-icons";
import {
    faServer,
    faTasks,
    faSpinner,
    faCircle,
    faExclamationTriangle,
    faSyncAlt,
    faChevronDown,
    faChevronRight,
    faBars,
    faTimes,
    faSearch,
    faSort,
    faSortUp,
    faSortDown,
    faQuestionCircle
} from "@fortawesome/free-solid-svg-icons";

const Status = () => {
    const [statuses, setStatuses] = useState([]);
    const [dockerImages, setDockerImages] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [darkMode, setDarkMode] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [expandedSections, setExpandedSections] = useState({
        ec2: true,
        ecs: true,
        docker: {}
    });
    const [showHelp, setShowHelp] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const navigate = useNavigate();

    // Handle window resize
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchStatuses = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("https://9qyga7xn2j.execute-api.us-west-2.amazonaws.com/dev/status", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) throw new Error(`Error: ${response.status}`);

            const data = await response.json();
            console.log("API Response:", data);

            const ec2Statuses = data.EC2.map((item) => ({
                id: item.id,
                name: item.name,
                uptime: item.uptime,
                performance: item.status === "running" ? "Operational" : "Down",
                type: 'EC2'
            }));

            const ecsStatuses = data.ECS.map((service) => ({
                name: service.serviceName,
                uptime: service.runningDetails.length > 0 ? service.runningDetails[0].uptime : "N/A",
                performance: service.runningTasks > 0 ? "Operational" : "Down",
                runningTasks: service.runningTasks,
                stoppedTasks: service.stoppedTasks,
                runningDetails: service.runningDetails,
                stoppedDetails: service.stoppedDetails,
                downtime: service.stoppedDetails.map((task) => task.downtime).join(", ") || "N/A",
                type: 'ECS'
            }));

            setStatuses([...ec2Statuses, ...ecsStatuses]);
            setLastUpdated(new Date());

            const dockerImagesWithFlag = {};
            const dockerImagesData = data.DockerImages || {};
            for (const [instanceId, images] of Object.entries(dockerImagesData)) {
                dockerImagesWithFlag[instanceId] = {
                    isOpen: false,
                    images: images,
                };
            }
            setDockerImages(dockerImagesWithFlag);
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

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+F for search focus
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                document.querySelector('input[type="text"]')?.focus();
            }
            // Ctrl+R for refresh
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                fetchStatuses();
            }
            // Ctrl+D for dark mode toggle
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                toggleDarkMode();
            }
            // Escape to close modals
            if (e.key === 'Escape') {
                setShowHelp(false);
                setMobileMenuOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [fetchStatuses]);

    const toggleDockerImages = (instanceId) => {
        setDockerImages((prev) => ({
            ...prev,
            [instanceId]: {
                ...prev[instanceId],
                isOpen: !prev[instanceId]?.isOpen,
            },
        }));
    };

    const toggleDarkMode = () => {
        setDarkMode((prev) => !prev);
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedStatuses = useMemo(() => {
        let sortableItems = [...statuses];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [statuses, sortConfig]);

    const filteredStatuses = useMemo(() => {
        return sortedStatuses.filter(status =>
            status.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (status.type && status.type.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [sortedStatuses, searchTerm]);

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return faSort;
        return sortConfig.direction === 'ascending' ? faSortUp : faSortDown;
    };

    const containerStyle = {
        fontFamily: "'Inter', sans-serif",
        padding: windowWidth < 768 ? "20px" : "40px",
        maxWidth: "1200px",
        margin: "0 auto",
        backgroundColor: darkMode ? "#1a1a1a" : "#f9fafb",
        minHeight: "100vh",
        color: darkMode ? "#ffffff" : "#333",
        transition: "background-color 0.3s, color 0.3s",
    };

    const headerStyle = {
        display: "flex",
        flexDirection: windowWidth < 768 ? "column" : "row",
        alignItems: windowWidth < 768 ? "flex-start" : "center",
        marginBottom: "30px",
        gap: windowWidth < 768 ? "15px" : "0"
    };

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h1 style={{
                        fontWeight: "bold",
                        fontSize: windowWidth < 768 ? "1.8em" : "2.5em",
                        color: darkMode ? "#ffffff" : "#333",
                        textShadow: "2px 2px 4px #aaa",
                        margin: 0,
                    }}>
                        Dev Server Status
                    </h1>
                    <img src={karraboLogo} alt="Karrabo Logo" style={{ width: "50px", height: "50px" }} />
                </div>

                <div style={{
                    marginLeft: windowWidth < 768 ? "0" : "auto",
                    display: "flex",
                    alignItems: "center",
                    flexDirection: windowWidth < 768 ? "column" : "row",
                    gap: "10px",
                    width: windowWidth < 768 ? "100%" : "auto",
                    marginTop: windowWidth < 768 ? "15px" : "0"
                }}>
                    {lastUpdated && (
                        <div style={{
                            color: darkMode ? "#aaa" : "#666",
                            marginRight: windowWidth < 768 ? "0" : "20px",
                            marginBottom: windowWidth < 768 ? "10px" : "0"
                        }}>
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </div>
                    )}

                    {windowWidth < 768 && (
                        <div style={{
                            position: 'relative',
                            width: '100%',
                            marginBottom: '10px'
                        }}>
                            <FontAwesomeIcon
                                icon={faSearch}
                                style={{
                                    position: 'absolute',
                                    left: '15px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: darkMode ? '#aaa' : '#666'
                                }}
                            />
                            <input
                                type="text"
                                placeholder="Search services..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    padding: '10px 15px 10px 40px',
                                    borderRadius: '5px',
                                    border: '1px solid #ccc',
                                    width: '100%',
                                    backgroundColor: darkMode ? "#333" : "#fff",
                                    color: darkMode ? "#fff" : "#333"
                                }}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    style={{
                                        position: 'absolute',
                                        right: '10px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: darkMode ? '#aaa' : '#666',
                                        cursor: 'pointer'
                                    }}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    )}

                    {windowWidth < 768 ? (
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            style={{
                                backgroundColor: darkMode ? "#333" : "#e0e0e0",
                                color: darkMode ? "#fff" : "#333",
                                border: "none",
                                padding: "10px 15px",
                                borderRadius: "5px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                width: '100%',
                                justifyContent: 'center'
                            }}
                        >
                            <FontAwesomeIcon
                                icon={mobileMenuOpen ? faTimes : faBars}
                                style={{ marginRight: "5px" }}
                            />
                            Menu
                        </button>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            </div>

            {mobileMenuOpen && windowWidth < 768 && (
                <div style={{
                    backgroundColor: darkMode ? "#333" : "#fff",
                    borderRadius: '5px',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
                    marginBottom: '20px',
                    padding: '15px'
                }}>
                    <button
                        onClick={fetchStatuses}
                        style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'left',
                            padding: '10px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: darkMode ? '#fff' : '#333',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '5px'
                        }}
                    >
                        <FontAwesomeIcon icon={faSyncAlt} style={{ marginRight: "5px" }} />
                        Refresh
                    </button>
                    <button
                        onClick={toggleDarkMode}
                        style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'left',
                            padding: '10px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: darkMode ? '#fff' : '#333',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '5px'
                        }}
                    >
                        {darkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <button
                        onClick={() => setShowHelp(true)}
                        style={{
                            display: 'block',
                            width: '100%',
                            textAlign: 'left',
                            padding: '10px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: darkMode ? '#fff' : '#333',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <FontAwesomeIcon icon={faQuestionCircle} style={{ marginRight: "5px" }} />
                        Keyboard Shortcuts
                    </button>
                </div>
            )}

            {!windowWidth < 768 && (
                <div style={{
                    display: 'flex',
                    gap: '10px',
                    marginBottom: '20px',
                    alignItems: 'center'
                }}>
                    <div style={{ position: 'relative', flexGrow: 1 }}>
                        <FontAwesomeIcon
                            icon={faSearch}
                            style={{
                                position: 'absolute',
                                left: '15px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: darkMode ? '#aaa' : '#666'
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '10px 15px 10px 40px',
                                borderRadius: '5px',
                                border: '1px solid #ccc',
                                width: '100%',
                                maxWidth: '400px',
                                backgroundColor: darkMode ? "#333" : "#fff",
                                color: darkMode ? "#fff" : "#333"
                            }}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: darkMode ? '#aaa' : '#666',
                                    cursor: 'pointer'
                                }}
                            >
                                ×
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setShowHelp(true)}
                        style={{
                            backgroundColor: darkMode ? '#333' : '#e0e0e0',
                            color: darkMode ? '#fff' : '#333',
                            border: 'none',
                            padding: '10px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <FontAwesomeIcon icon={faQuestionCircle} style={{ marginRight: "5px" }} />
                        Help
                    </button>
                </div>
            )}

            {loading && (
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "50px",
                    animation: "fadeIn 0.5s ease-in",
                }}>
                    <FontAwesomeIcon icon={faSpinner} spin style={{ fontSize: "2em", marginRight: "10px" }} />
                    <p>Loading statuses...</p>
                </div>
            )}

            {error && (
                <div style={{
                    color: "red",
                    display: "flex",
                    alignItems: "center",
                    marginTop: "20px",
                    animation: "fadeIn 0.5s ease-in",
                }}>
                    <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: "10px" }} />
                    <p>Error: {error}</p>
                </div>
            )}

            {!loading && !error && (
                <>
                    <div
                        style={{
                            marginBottom: '20px',
                            backgroundColor: darkMode ? '#333' : '#fff',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            overflow: 'hidden'
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '15px',
                                cursor: 'pointer',
                                backgroundColor: darkMode ? '#444' : '#f0f0f0'
                            }}
                            onClick={() => toggleSection('ec2')}
                        >
                            <h2 style={{ flex: 1, margin: 0 }}>
                                <FontAwesomeIcon icon={faServer} style={{ marginRight: '10px' }} />
                                EC2 Instances
                            </h2>
                            <FontAwesomeIcon icon={expandedSections.ec2 ? faChevronDown : faChevronRight} />
                        </div>
                        {expandedSections.ec2 && (
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: windowWidth < 768 ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))",
                                gap: "20px",
                                padding: '20px'
                            }}>
                                {filteredStatuses
                                    .filter(status => status.type === 'EC2')
                                    .map((status, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
                                                padding: "20px",
                                                borderRadius: "12px",
                                                backgroundColor: darkMode ? "#444" : "#fff",
                                                border: "1px solid #e0e0e0",
                                                transition: "transform 0.3s, box-shadow 0.3s",
                                                cursor: "pointer",
                                                animation: "fadeIn 0.5s ease-in",
                                            }}
                                            onClick={() => toggleDockerImages(status.id)}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '10px'
                                            }}>
                                                <div style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                                                    <FontAwesomeIcon icon={faServer} style={{ marginRight: "10px" }} />
                                                    {status.name}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        requestSort('name');
                                                    }}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: darkMode ? '#fff' : '#333'
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={getSortIcon('name')} />
                                                </button>
                                            </div>
                                            <div style={{ marginBottom: "10px" }}>
                                                <FontAwesomeIcon
                                                    icon={faCircle}
                                                    style={{
                                                        color: status.performance === "Operational" ? "#4caf50" : "#ff3b3b",
                                                        marginRight: "10px",
                                                    }}
                                                />
                                                {status.performance}
                                            </div>
                                            <div style={{ marginBottom: "10px" }}>Uptime: {status.uptime}</div>
                                            <div style={{ marginBottom: "10px" }}>Downtime: {status.downtime || "N/A"}</div>

                                            {status.id && dockerImages[status.id] && (
                                                <div style={{ marginTop: "15px" }}>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleDockerImages(status.id);
                                                        }}
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
                                                        {dockerImages[status.id].isOpen ? "Hide Docker Containers" : "Show Docker Containers"}
                                                    </button>
                                                    {dockerImages[status.id].isOpen && (
                                                        <div
                                                            style={{
                                                                padding: "15px",
                                                                backgroundColor: darkMode ? "#555" : "#f9f9f9",
                                                                borderRadius: "12px",
                                                                border: "1px solid #e0e0e0",
                                                            }}
                                                        >
                                                            <h4 style={{ fontWeight: "bold", marginBottom: "10px" }}>
                                                                Running Docker Images:
                                                            </h4>
                                                            {dockerImages[status.id].images.length > 0 ? (
                                                                dockerImages[status.id].images.map((image, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        style={{
                                                                            marginBottom: "5px",
                                                                            padding: "8px",
                                                                            backgroundColor: darkMode ? "#666" : "#fff",
                                                                            borderRadius: "8px",
                                                                            border: "1px solid #e0e0e0",
                                                                        }}
                                                                    >
                                                                        {image}
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div style={{ color: "red", fontWeight: "bold" }}>Image not running</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>

                    <div style={{
                        backgroundColor: darkMode ? '#333' : '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        overflow: 'hidden'
                    }}>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '15px',
                                cursor: 'pointer',
                                backgroundColor: darkMode ? '#444' : '#f0f0f0'
                            }}
                            onClick={() => toggleSection('ecs')}
                        >
                            <h2 style={{ flex: 1, margin: 0 }}>
                                <FontAwesomeIcon icon={faTasks} style={{ marginRight: '10px' }} />
                                ECS Services
                            </h2>
                            <FontAwesomeIcon icon={expandedSections.ecs ? faChevronDown : faChevronRight} />
                        </div>
                        {expandedSections.ecs && (
                            <div style={{ padding: '20px' }}>
                                {filteredStatuses
                                    .filter(status => status.type === 'ECS')
                                    .map((service, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                marginBottom: "20px",
                                                padding: "20px",
                                                borderRadius: "12px",
                                                backgroundColor: darkMode ? "#444" : "#f9f9f9",
                                                border: "1px solid #e0e0e0",
                                            }}
                                        >
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                marginBottom: '10px'
                                            }}>
                                                <h3 style={{ fontWeight: "bold", fontSize: "1.2em" }}>
                                                    {service.name}
                                                </h3>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        requestSort('name');
                                                    }}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        color: darkMode ? '#fff' : '#333'
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={getSortIcon('name')} />
                                                </button>
                                            </div>
                                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                                <div>
                                                    <p>
                                                        Running Tasks:{" "}
                                                        <span style={{ color: "green", fontWeight: "bold" }}>{service.runningTasks} 🔄</span>
                                                    </p>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            requestSort('runningTasks');
                                                        }}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            color: darkMode ? '#fff' : '#333',
                                                            padding: 0,
                                                            fontSize: 'inherit'
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={getSortIcon('runningTasks')} />
                                                    </button>
                                                </div>
                                                <div>
                                                    <p>
                                                        Stopped Tasks:{" "}
                                                        <span style={{ color: "red", fontWeight: "bold" }}>{service.stoppedTasks} ⛔</span>
                                                    </p>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            requestSort('stoppedTasks');
                                                        }}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            color: darkMode ? '#fff' : '#333',
                                                            padding: 0,
                                                            fontSize: 'inherit'
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={getSortIcon('stoppedTasks')} />
                                                    </button>
                                                </div>
                                            </div>
                                            {service.stoppedDetails.length > 0 && (
                                                <div style={{ marginTop: "10px" }}>
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            cursor: 'pointer',
                                                            marginBottom: '10px'
                                                        }}
                                                        onClick={() => toggleSection(`ecs-details-${index}`)}
                                                    >
                                                        <h4 style={{ fontWeight: "bold", margin: 0 }}>
                                                            Stopped Task Details
                                                        </h4>
                                                        <FontAwesomeIcon
                                                            icon={expandedSections[`ecs-details-${index}`] ? faChevronDown : faChevronRight}
                                                            style={{ marginLeft: '10px' }}
                                                        />
                                                    </div>
                                                    {expandedSections[`ecs-details-${index}`] && (
                                                        <div>
                                                            {service.stoppedDetails.map((task, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    style={{
                                                                        marginBottom: "8px",
                                                                        padding: "10px",
                                                                        backgroundColor: darkMode ? "#555" : "#fff",
                                                                        borderRadius: "8px",
                                                                        border: "1px solid #e0e0e0",
                                                                    }}
                                                                >
                                                                    <p>Task ARN: {task.taskArn}</p>
                                                                    <p>
                                                                        Status: <span style={{ color: "red" }}>{task.status}</span>
                                                                    </p>
                                                                    <p>Downtime: {task.downtime || "N/A"}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Help Modal */}
            {showHelp && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: darkMode ? '#333' : '#fff',
                        padding: '30px',
                        borderRadius: '10px',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <h2 style={{ marginTop: 0 }}>Keyboard Shortcuts</h2>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ margin: '15px 0' }}>
                                <strong>Ctrl+F</strong> - Focus search input
                            </li>
                            <li style={{ margin: '15px 0' }}>
                                <strong>Ctrl+R</strong> - Refresh data
                            </li>
                            <li style={{ margin: '15px 0' }}>
                                <strong>Ctrl+D</strong> - Toggle dark mode
                            </li>
                            <li style={{ margin: '15px 0' }}>
                                <strong>Escape</strong> - Close modals/menus
                            </li>
                        </ul>
                        <h3>UI Features</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ margin: '15px 0' }}>
                                <strong>Click headers</strong> - Sort by that column
                            </li>
                            <li style={{ margin: '15px 0' }}>
                                <strong>Click section headers</strong> - Expand/collapse sections
                            </li>
                            <li style={{ margin: '15px 0' }}>
                                <strong>Search</strong> - Filter by service name or type (EC2/ECS)
                            </li>
                        </ul>
                        <button
                            onClick={() => setShowHelp(false)}
                            style={{
                                marginTop: '20px',
                                padding: '10px 20px',
                                backgroundColor: '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                width: '100%'
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Help Button */}
            <button
                onClick={() => setShowHelp(true)}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    fontSize: '20px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 100
                }}
            >
                ?
            </button>
        </div>
    );
};

export default Status;