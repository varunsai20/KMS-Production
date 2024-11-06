import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import "./Researcher.css";
import SearchIcon from "../../assets/images/Search.svg";

const Researchers = () => {
  const [isOpen, setIsOpen] = useState(null);
  const [userData, setUserData] = useState([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Access admin data from Redux
  const { user } = useSelector((state) => state.auth);
  const adminId = user?.user_id;
  const organizationName = user?.organization_name;
  const userRole = user?.role;
  const token = useSelector((state) => state.auth.access_token);
  console.log(user);
  console.log(useSelector((state) => state.auth));
  console.log(token);
  // Log Redux data to verify

  // Redirect if not an Admin
  useEffect(() => {
    if (userRole !== "Admin") {
      navigate("/");
    }
  }, [userRole, navigate]);

  useEffect(() => {
    // Fetch users on component mount
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `http://13.127.207.184:80/admin/all_users/${adminId}/${organizationName}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the Bearer token
            },
          }
        );
        setUserData(response.data.users); // Assuming API returns a `users` array
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (adminId && organizationName) fetchUsers();
  }, [adminId, organizationName, token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(null); // Close dropdown if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = (email) => {
    setIsOpen(isOpen === email ? null : email);
  };

  const handleCreateClick = () => {
    navigate("/admin/users/create");
  };

  const handleEditClick = (userId) => {
    navigate(`/admin/users/edit/${userId}`);
  };
  const handleSuspendClick = async (userId, currentStatus) => {
    const normalizedStatus = currentStatus.toLowerCase();
    const newStatus = normalizedStatus === "active" ? "Inactive" : "active";

    try {
      const response = await axios.put(
        `http://13.127.207.184:80/admin/update_user_status`,
        {
          admin_id: adminId,
          user_id: userId,
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Update userData to reflect the new status
        setIsOpen(false)
        setUserData((prevData) =>
          prevData.map((user) =>
            user.user_id === userId ? { ...user, user_status: newStatus } : user
          )
        );
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };
  const initialDelete = (userId) => {
    setIsOpen(false);
    setShowConfirmDelete(true);
    setUserIdToDelete(userId);
  };

  const confirmDelete = () => {
    if (userIdToDelete) {
      handleDeleteClick(userIdToDelete);
      setShowConfirmDelete(false);
    }
  };
  const cancelDelete = (e) => {
    e.stopPropagation();
    setShowConfirmDelete(false);
  };

  const handleDeleteClick = async (userId) => {
    // if (window.confirm("Are you sure you want to delete this user?")) {
    //e.stopPropagation();
    try {
      await axios.delete(
        `http://13.127.207.184:80/admin/delete_user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsOpen(false)
      setUserData(userData.filter((user) => user.user_id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
    // }
  };
  return (
    <div style={{ margin: "0 2%" }}>
      <h2 className="ResearcherHeading">Manage Users</h2>
      <div className="Manage-Researchers">
        <div className="Manage-Researcher-Input">
          <input placeholder="Search by name or ID" />
          <img src={SearchIcon} alt="search-icon" />
        </div>
        <button onClick={handleCreateClick} className="Admin-create">
          Add User
        </button>
      </div>
      <div className="Researcher-List">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email ID</th>
              <th>Department</th>
              <th>Status</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {userData.map((user) => (
              <tr key={user.email}>
                <td>
                  <a
                    style={{ cursor: "pointer" }}
                    onClick={() => handleEditClick(user.user_id)}
                  >
                    {user.fullname}
                  </a>
                </td>
                <td>{user.email}</td>
                <td>{user.department}</td>
                <td>
                  <span className={`status-indicator ${user.user_status}`}>
                    {user.user_status}
                  </span>
                </td>
                <td>{user.role}</td>
                <td>
                  <div className="action-dropdown">
                    <div
                      className="action-icon"
                      onClick={() => toggleDropdown(user.email)}
                    >
                      ⋮
                    </div>
                    {isOpen === user.email && (
                      <ul className="dropdown-menu">
                        <li
                          className="dropdown-item"
                          onClick={() => handleEditClick(user.user_id)}
                        >
                          Edit
                        </li>
                        <li
                          className="dropdown-item delete"
                          onClick={() =>
                            handleSuspendClick(user.user_id, user.user_status)
                          }
                        >
                          {user.user_status.toLowerCase() === "active"
                            ? "Suspend"
                            : "Activate"}
                        </li>
                        <li
                          className="dropdown-item delete"
                          // onClick={() => handleDeleteClick(user.user_id)}
                          onClick={() => {
                            initialDelete(user.user_id);
                          }}
                        >
                          Delete
                        </li>
                      </ul>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {showConfirmDelete && (
              <div className="confirm-overlay">
                <div className="confirm-popup">
                  <p>Are you sure you want to delete this note?</p>
                  <div className="confirm-buttons">
                    <button
                      className="confirm-delete-button"
                      //onClick={handleDeleteClick(user.user.id)}
                      onClick={confirmDelete}
                    >
                      Delete
                    </button>
                    <button
                      className="confirm-keep-button"
                      onClick={cancelDelete}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Researchers;
