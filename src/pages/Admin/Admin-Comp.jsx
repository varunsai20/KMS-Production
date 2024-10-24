import React, { useState } from 'react';
import './Admin-Comp.css';
import Button from '../../components/Buttons';
import SearchIcon from '../../assets/images/Search.svg';
import { useNavigate } from 'react-router-dom';

const sampleData = [
    { name: 'Arshad', email: 'gavhac@gmail.com', department: 'IT', status: 'Active' },
    { name: 'John', email: 'john@gmail.com', department: 'HR', status: 'Inactive' },
    { name: 'David', email: 'david@gmail.com', department: 'Finance', status: 'Active' },
    { name: 'Nelson', email: 'nelson@gmail.com', department: 'Marketing', status: 'Inactive' },
];

const AdminComp = () => {
    const [isOpen, setIsOpen] = useState(null);
    const navigate = useNavigate();
    // Toggle dropdown visibility based on row email
    const toggleDropdown = (email) => {
        setIsOpen(isOpen === email ? null : email);
    };
    const handleCreateClick = () => {
        navigate('/admin/admins/create'); // Navigate to Create Researcher page
      };
    return (
        <div style={{margin:"2%"}}>
            <h2 className="AdminsHeading">Manage Admins</h2>
            <div className="Manage-Admins">
                <div className="Manage-Admins-Input">
                    <input placeholder='Search by name or ID' />
                    <img src={SearchIcon} alt="search-icon"/>
                </div>

                <Button text="Create Admins" onClick={handleCreateClick} className="Admin-create"></Button>
            </div>
            <div className="Admins-List">
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
                                                <li className="dropdown-item">Make Admin</li>
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

export default AdminComp;
