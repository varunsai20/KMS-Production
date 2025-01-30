import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import "./Researcher.css";
import SearchIcon from "../../assets/images/Search.svg";
import { toast } from "react-toastify";
import { IoIosArrowBack,IoIosArrowForward } from "react-icons/io";



const columns = [
  { label: "Name", key: "fullname" },
  { label: "Email ID", key: "email" },
  { label: "Department", key: "department" },
  { label: "Role", key: "role" },
];

const Researchers = () => {
  const [isOpen, setIsOpen] = useState(null);
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [currentColumnIndex, setCurrentColumnIndex] = useState(0);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  // Access admin data from Redux
  const { user } = useSelector((state) => state.auth);
  const adminId = user?.user_id;
  const organizationName = user?.organization_name;
  const userRole = user?.role;
  const token = useSelector((state) => state.auth.access_token);

  const handlePrevious = () => {
    setCurrentColumnIndex((prevIndex) =>
      prevIndex === 0 ? columns.length - 1 : prevIndex - 1
    );
  };
  
  const handleNext = () => {
    setCurrentColumnIndex((prevIndex) =>
      prevIndex === columns.length - 1 ? 0 : prevIndex + 1
    );
  };
  
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
          `https://inferai.ai/api/admin/all_users/${adminId}/${organizationName}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserData(response.data.users);
        setFilteredData(response.data.users);
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

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Filter user data based on search term
    const filtered = userData.filter((user) =>
      user.fullname.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredData(filtered);
  };

  const toggleDropdown = (email, event) => {
    setIsOpen(isOpen === email ? null : email);
    const menuDotsRect = event.target.getBoundingClientRect();

    // Calculate the position for the popup
    const popupX = menuDotsRect.right + 10; // Offset slightly to the right
    const popupY = menuDotsRect.top;

    // Store the position dynamically
    setPopupPosition({ x: popupX, y: popupY });
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
        `https://inferai.ai/api/admin/update_user_status`,
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
        setIsOpen(false);
        setUserData((prevData) =>
          prevData.map((user) =>
            user.user_id === userId ? { ...user, user_status: newStatus } : user
          )
        );
        setFilteredData((prevData) =>
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
    try {
      await axios.delete(`https://inferai.ai/api/admin/delete_user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("User Deleted successfully", {
        position: "top-center",
        autoClose: 2000,

        style: {
          backgroundColor: "rgba(237, 254, 235, 1)",
          borderLeft: "5px solid rgba(15, 145, 4, 1)",
          color: "rgba(15, 145, 4, 1)",
        },
        progressStyle: {
          backgroundColor: "rgba(15, 145, 4, 1)",
        },
      });
      setIsOpen(false);
      setUserData(userData.filter((user) => user.user_id !== userId));
      setFilteredData(filteredData.filter((user) => user.user_id !== userId));
    } catch (error) {
      toast.error("Error deleting user:", {
        position: "top-center",
        autoClose: 2000,
        style: {
          backgroundColor: "rgba(254, 235, 235, 1)",
          borderLeft: "5px solid rgba(145, 4, 4, 1)",
          color: "background: rgba(145, 4, 4, 1)",
        },
        progressStyle: {
          backgroundColor: "rgba(145, 4, 4, 1)",
        },
      });
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="users-list">
      <h2 className="ResearcherHeading">Manage Users</h2>
      <div className="Manage-Researchers">
        <div className="Manage-Researcher-Input">
          <input
            placeholder="Search by name or ID"
            value={searchTerm}
            onChange={handleSearchChange}
          />
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
        {window.innerWidth > 576 ? (
          <>
            <th>Name</th>
            <th>Email ID</th>
            <th>Department</th>
            <th>Status</th>
            <th>Role</th>
            <th>Actions</th>
          </>
        ) : (
          <>
            <th style={{borderRadius:"10px"}}>
              <button onClick={handlePrevious}>
                <IoIosArrowBack style={{marginTop:"1%"}}/>

              </button>
              <span className="scroll-heading">{columns[currentColumnIndex].label}</span>
              <button onClick={handleNext}>
              <IoIosArrowForward />
              </button>
            </th>
            <th>Status</th>
            <th>Actions</th>
          </>
        )}
      </tr>
    </thead>
    <tbody>
      {filteredData.map((user) => (
        <tr key={user.email}>
          {window.innerWidth > 576 ? (
            <>
              <td>{user.fullname}</td>
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
                    onClick={(e) => toggleDropdown(user.email, e)}
                  >
                    ⋮
                  </div>
                  {isOpen === user.email && (
                    <ul
                      ref={dropdownRef}
                      className="dropdown-menu"
                      style={{
                        transform: `translate(${popupPosition.x-10}px, ${popupPosition.y-50}px)`,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
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
                        onClick={() => initialDelete(user.user_id)}
                      >
                        Delete
                      </li>
                    </ul>
                  )}
                </div>
              </td>
            </>
          ) : (
            <>
              <td>{user[columns[currentColumnIndex].key]}</td>
              <td>
                <span className={`status-indicator ${user.user_status}`}>
                  {user.user_status}
                </span>
              </td>
              <td>
                <div className="action-dropdown">
                  <div
                    className="action-icon"
                    onClick={(e) => toggleDropdown(user.email, e)}
                  >
                    ⋮
                  </div>
                  {isOpen === user.email && (
                    <ul
                      ref={dropdownRef}
                      className="dropdown-menu"
                      style={{
                        transform: `translate(${popupPosition.x-140}px, ${popupPosition.y}px)`,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
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
                        onClick={() => initialDelete(user.user_id)}
                      >
                        Delete
                      </li>
                    </ul>
                  )}
                </div>
              </td>
            </>
          )}
        </tr>
      ))}
       {showConfirmDelete && (
              <div className="confirm-overlay">
                <div className="confirm-popup">
                  <p>Are you sure to delete this user?</p>
                  <div className="confirm-buttons">
                    <button
                      className="confirm-keep-button"
                      onClick={cancelDelete}
                    >
                      Cancel
                    </button>
                    <button
                      className="confirm-delete-button"
                      onClick={confirmDelete}
                    >
                      Delete
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
