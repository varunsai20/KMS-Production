import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './Researcher.css';
import SearchIcon from '../../assets/images/Search.svg';

const Researchers = () => {
  const [isOpen, setIsOpen] = useState(null);
  const [userData, setUserData] = useState([]);
  const navigate = useNavigate();

  // Access admin data from Redux
  const { user } = useSelector((state) => state.auth);
  const adminId = user?.user_id;
  const organizationName = user?.organization_name;
  const userRole = user?.role;
  const token=user?.access_token;

  // Log Redux data to verify

  // Redirect if not an Admin
  useEffect(() => {
    if (userRole !== 'Admin') {
      navigate('/');
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
        console.log(response)
        setUserData(response.data.users); // Assuming API returns a `users` array
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (adminId && organizationName) fetchUsers();
  }, [adminId, organizationName, token]);

  const toggleDropdown = (email) => {
    setIsOpen(isOpen === email ? null : email);
  };

  const handleCreateClick = () => {
    navigate('/admin/users/create');
  };

  const handleEditClick = (userId) => {
    navigate(`/admin/users/edit/${userId}`);
  };

  return (
    <div style={{ margin: '0 2%' }}>
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
                    <div className="action-icon" onClick={() => toggleDropdown(user.email)}>⋮</div>
                    {isOpen === user.email && (
                      <ul className="dropdown-menu">
                        <li className="dropdown-item" onClick={() => handleEditClick(user.user_id)}>Edit</li>
                        <li className="dropdown-item delete">Suspend</li>
                        <li className="dropdown-item delete">Delete</li>
                      </ul>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Researchers;
