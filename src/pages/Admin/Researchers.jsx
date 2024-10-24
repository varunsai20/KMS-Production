import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Researcher.css';
import Button from '../../components/Buttons';
import SearchIcon from '../../assets/images/Search.svg';

const sampleData = [
    { name: 'Arshad', email: 'gavhac@gmail.com', department: 'IT', status: 'Active' },
    { name: 'John', email: 'john@gmail.com', department: 'HR', status: 'Inactive' },
    { name: 'David', email: 'david@gmail.com', department: 'Finance', status: 'Active' },
    { name: 'Nelson', email: 'nelson@gmail.com', department: 'Marketing', status: 'Inactive' },
];

const Researchers = () => {
  const [isOpen, setIsOpen] = useState(null);
  const navigate = useNavigate();

  const toggleDropdown = (email) => {
    setIsOpen(isOpen === email ? null : email);
  };

  const handleCreateClick = () => {
    navigate('/admin/users/create'); // Navigate to Create Researcher page
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sampleData.map((row) => (
              <tr key={row.email}>
                <td>{row.name}</td>
                <td>{row.email}</td>
                <td>{row.department}</td>
                <td>
                  <span className={`status-indicator ${row.status.toLowerCase()}`}>
                    {row.status}
                  </span>
                </td>
                <td>
                  <div className="action-dropdown">
                    <div className="action-icon" onClick={() => toggleDropdown(row.email)}>⋮</div>
                    {isOpen === row.email && (
                      <ul className="dropdown-menu">
                        <li className="dropdown-item">Edit</li>
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
