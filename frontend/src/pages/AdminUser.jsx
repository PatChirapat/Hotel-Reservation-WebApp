import React, { useEffect, useState } from "react";
import axios from "axios";
import "../ui/AdminUser.css";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

function AdminUser() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // base url from frontend/.env
    const apiBase = import.meta.env.VITE_API_URL;

    const EditIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
    );

    const DeleteIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"/>
        </svg>
    );

    useEffect(() => {
        const fetchUsers = async () => {
        try {
            const res = await axios.get(`${apiBase}/Admin/viewUser.php`);
            if (Array.isArray(res.data)) {
            setUsers(res.data);
            } else {
            setUsers([]);
            }
        } catch (err) {
            console.error("Error fetching users:", err);
            setError("Failed to fetch users");
        } finally {
            setLoading(false);
        }
        };
        fetchUsers();
    }, [apiBase]);

    return (
        <div className="adminUser">
        <Navbar />
        <div className="adminUser-content">
            <div className="adminUser-header">
            <h1>Hotel User Dashboard</h1>
            <p>Keep track of your hotel's users with simple and powerful management tools.</p>
            </div>

            <div className="adminUser-body">
            {loading && <p>Loading users...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {!loading && !error && (
                Array.isArray(users) && users.length > 0 ? (
                <table className="user-table">
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Tier</th>
                        <th>Join Date</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr key={user.member_id}>
                        <td>{user.member_id}</td>
                        <td>{user.first_name}</td>
                        <td>{user.last_name}</td>
                        <td>{user.phone}</td>
                        <td>{user.email}</td>
                        <td>{user.tier}</td>
                        <td>{user.join_date}</td>
                        <td className="actions">
                            <button className="edit-btn">{EditIcon}</button>
                            <button className="delete-btn">{DeleteIcon}</button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                ) : (
                <p>No users found.</p>
                )
            )}
            </div>
        </div>
        <Footer />
        </div>
    );
}

export default AdminUser;
