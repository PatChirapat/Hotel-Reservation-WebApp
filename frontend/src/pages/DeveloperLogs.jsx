import React, { useEffect, useState } from "react";
import "../ui/DeveloperLogs.css";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";
import { apiUrl } from "../utils/api";

function DeveloperLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        try {
            setLoading(true);

            const res = await axios.get(apiUrl("api/logs/viewLogs.php"))

            // Correct response format
            if (res.data?.success && Array.isArray(res.data.logs)) {
                setLogs(res.data.logs);
            } else {
                setLogs([]);
                console.warn("Invalid logs format:", res.data);
            }

        } catch (error) {
            console.error("Failed to fetch logs:", error);
            alert("Error loading logs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const typeColor = (type) => {
        if (!type) return "";
        if (type.includes("ADMIN")) return "log-admin";
        if (type.includes("USER")) return "log-user";
        return "log-general";
    };

    return (
        <div className="developer">
            <Navbar />

            <div className="developer-container">
                <h1>System Activity Logs</h1>

                <div className="logs-header">
                    <button onClick={fetchLogs} className="reload-btn">
                        Reload Logs
                    </button>
                </div>

                {loading ? (
                    <p className="loading">Loading logs...</p>
                ) : logs.length === 0 ? (
                    <p className="no-logs">No logs found.</p>
                ) : (
                    <div className="logs-table-container">
                        <table className="logs-table">
                            <thead>
                                <tr>
                                    <th>Log ID</th>
                                    <th>Actor</th>
                                    <th>Type</th>
                                    <th>Details</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.log_id}>
                                        <td>{log.log_id}</td>
                                        <td>{log.actor_id}</td>
                                        <td className={typeColor(log.action_type)}>
                                            {log.action_type}
                                        </td>
                                        <td>{log.details}</td>
                                        <td>{log.created_at}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}

export default DeveloperLogs;
