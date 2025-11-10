import React, { useEffect, useState } from "react";
import axios from "axios";
import "../ui/AdminUser.css";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import { apiUrl } from "../utils/api";

function AdminUser() {
    const EditIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
        </svg>
    );

    const DeleteIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
        </svg>
    );

    const AddIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    );

    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toastMessage, setToastMessage] = useState("");

    //VIEW

    const fetchUsers = async () => {
        try {
        const res = await axios.get(apiUrl("Admin/viewUser.php"));
        if (Array.isArray(res.data)) {
            setUsers(res.data);
            setFilteredUsers(res.data);
        } 
        else {
            setUsers([]);
            setFilteredUsers([]);
        }

        await new Promise((resolve) => setTimeout(resolve, 800));
        } 
        catch (err) {
            console.error("Error fetching users:", err);
            setError("Failed to fetch users");
        } 
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);
        const filtered = users.filter((u) =>
            u.first_name.toLowerCase().includes(value) ||
            u.last_name.toLowerCase().includes(value) ||
            u.phone.includes(value) ||
            (u.username && u.username.toLowerCase().includes(value)) ||
            (u.email && u.email.toLowerCase().includes(value)) ||
            u.tier.toLowerCase().includes(value)
        );
        setFilteredUsers(filtered);
    };

    // ADD
    const [showAddPUD, setShowAddPUD] = useState(false);
    const [newUser, setNewUser] = useState({
        first_name: "",
        last_name: "",
        phone: "",
        username: "",
        email: "",
        tier: "SILVER",
    });

    const handleAddUser = () => setShowAddPUD(true);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewUser({ ...newUser, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(apiUrl("Admin/addUser.php"), newUser);
            if (res.data.success) {
                setToastMessage("User added successfully!");
                setTimeout(() => setToastMessage(""), 2500);
                setShowAddPUD(false);
                setNewUser({
                    first_name: "",
                    last_name: "",
                    phone: "",
                    username: "",
                    email: "",
                    tier: "SILVER",
                });
                fetchUsers();
            } else {
                setToastMessage("Failed: " + res.data.message);
                setTimeout(() => setToastMessage(""), 2500);
            }
        } catch (err) {
            setToastMessage("Error adding user: " + err.message);
            setTimeout(() => setToastMessage(""), 3000);
        }
    };

    // EDIT
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editField, setEditField] = useState("");
    const [newValue, setNewValue] = useState("");

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setEditField("");
        setNewValue("");
        setShowEditModal(true);
    };

    const handleFieldChange = (e) => {
        const field = e.target.value;
        setEditField(field);
        setNewValue(selectedUser ? selectedUser[field] || "" : "");
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editField) {
            setToastMessage("Please select a field to edit.");
            setTimeout(() => setToastMessage(""), 2000);
            return;
        }

        try {
            const res = await axios.post(apiUrl("Admin/editUser.php"), {
                member_id: selectedUser.member_id,
                field: editField,
                value: newValue,
            });
            if (res.data.success) {
                setToastMessage("User updated successfully!");
                setTimeout(() => setToastMessage(""), 2500);
                setShowEditModal(false);
                fetchUsers();
            } else {
                setToastMessage("Failed: " + res.data.message);
                setTimeout(() => setToastMessage(""), 2500);
            }
        } catch (err) {
            setToastMessage("Error updating user: " + err.message);
            setTimeout(() => setToastMessage(""), 3000);
        }
    };

    // DELETE
    const [showDelModal, setShowDelModal] = useState(false);
    const [delUser, setDelUser] = useState(null);

    const handleDelClick = (user) => {
        setShowDelModal(true);
        setDelUser(user);
    };

    const handleConfirmDelete = async () => {
        try {
            const res = await axios.post(apiUrl("Admin/deleteUser.php"), {
                member_id: delUser.member_id,
            });
            if (res.data.success) {
                setToastMessage("User deleted successfully!");
                setTimeout(() => setToastMessage(""), 2500);
                setShowDelModal(false);
                setDelUser(null);
                fetchUsers();
            } 
            else {
                setToastMessage("Failed: " + res.data.message);
                setTimeout(() => setToastMessage(""), 2500);
            }
        } 
        catch (err) {
            setToastMessage("Error deleting user: " + err.message);
            setTimeout(() => setToastMessage(""), 3000);
        }
    };

    return (
        <div className="adminUser">
            <Navbar />
            {loading && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Loading users...</p>
                </div>
            )}
            {toastMessage && <div className="toast-message">{toastMessage}</div>}

            <div className="adminUser-content">
                <div className="adminUser-header">
                    <h1>Hotel User Dashboard</h1>
                    <p>Keep track of your hotel's users with simple and powerful management tools.</p>
                </div>

                <div className="adminUser-controls">
                    <div className="search-container">
                        <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                        />
                    </div>
                    <button className="add-btn" onClick={handleAddUser}>
                        {AddIcon}
                        <span>Add User</span>
                    </button>
                </div>

                <div className="adminUser-body">
                    {!loading && !error && (
                        Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
                            <table className="user-table">
                                <thead>
                                    <tr>
                                        {/* <th>ID</th> */}
                                        <th>Username</th>
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
                                    {filteredUsers.map((user) => (
                                        <tr key={user.member_id}>
                                            {/* <td>{user.member_id}</td> */}
                                            <td>{user.username}</td>
                                            <td>{user.first_name}</td>
                                            <td>{user.last_name}</td>
                                            <td>{user.phone}</td>
                                            <td>{user.email}</td>
                                            <td>{user.tier}</td>
                                            <td>{user.join_date}</td>
                                            <td className="actions">
                                                <button className="edit-btn" onClick={() => handleEditClick(user)}>{EditIcon}</button>
                                                <button className="delete-btn" onClick={() => handleDelClick(user)}>{DeleteIcon}</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>Users Not found.</p>
                        )
                    )}
                </div>
            </div>
            <Footer />

            {showAddPUD && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add New User</h2>
                        <form onSubmit={handleSubmit} className="add-user-form">
                            <input name="username" placeholder="Username" value={newUser.username} onChange={handleInputChange} required />
                            <input name="first_name" placeholder="First Name" value={newUser.first_name} onChange={handleInputChange} required />
                            <input name="last_name" placeholder="Last Name" value={newUser.last_name} onChange={handleInputChange} required />
                            <input name="phone" placeholder="Phone Number" value={newUser.phone} onChange={handleInputChange} required />
                            <input type="email" name="email" placeholder="Email" value={newUser.email} onChange={handleInputChange} />
                            <select name="tier" value={newUser.tier} onChange={handleInputChange}>
                                <option value="SILVER">SILVER</option>
                                <option value="GOLD">GOLD</option>
                                <option value="PLATINUM">PLATINUM</option>
                            </select>

                            <div className="modal-buttons">
                                <button type="submit" className="save-btn">Submit</button>
                                <button type="button" className="cancel-btn" onClick={() => setShowAddPUD(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showEditModal && selectedUser && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Edit User (ID: {selectedUser.member_id})</h2>
                        <form onSubmit={handleEditSubmit} className="add-user-form">
                            <label>Select field to edit</label>
                            <select value={editField} onChange={handleFieldChange} required>
                                <option value="">-- Select field --</option>
                                <option value="username">Username</option>
                                <option value="first_name">First Name</option>
                                <option value="last_name">Last Name</option>
                                <option value="phone">Phone</option>
                                <option value="email">Email</option>
                                <option value="tier">Tier</option>
                            </select>

                            {editField && (
                                <>
                                    <label>Old Value</label>
                                    <input
                                        type="text"
                                        value={selectedUser[editField] || ""}
                                        readOnly
                                    />

                                    <label>New Value</label>
                                    {editField === "tier" ? (
                                    <select
                                        value={newValue}
                                        onChange={(e) => setNewValue(e.target.value)}
                                        required
                                    >
                                        <option value="SILVER">SILVER</option>
                                        <option value="GOLD">GOLD</option>
                                        <option value="PLATINUM">PLATINUM</option>
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value={newValue}
                                        onChange={(e) => setNewValue(e.target.value)}
                                        required
                                    />
                                )}
                                </>
                            )}

                            <div className="modal-buttons">
                                <button type="submit" className="save-btn" >Save</button>
                                <button type="button" className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showDelModal && delUser &&(
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Confirm Delete</h2>
                        <p className="del-p">
                            Are you sure you want to delete user <br />
                            <strong>{delUser.username}</strong>?
                        </p>
                        <div className="modal-buttons del">
                            <button className="del-save-btn" onClick={handleConfirmDelete}>Confirm, Delete</button>
                            <button className="del-cancel-btn" onClick={() => setShowDelModal(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminUser;
