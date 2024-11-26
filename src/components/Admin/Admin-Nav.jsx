  import React, { useState, useEffect } from 'react';
  import { Link, useLocation } from 'react-router-dom'; // Use Link and useLocation for route handling
  import "./Admin-Nav.css";
  import Researcher from "../../assets/images/Researcher-Icon.svg";
  
  const AdminNav = () => {
    const location = useLocation(); // Get the current route
    const [activeItem, setActiveItem] = useState('Dashboard');

    // Sync activeItem with the current path from the URL
    useEffect(() => {
      if (location.pathname === '/admin/users') {
        setActiveItem('Researchers');
      } else if (location.pathname === '/admin/admins') {
        setActiveItem('Admins');
      } else if (location.pathname === '/admin/profile') {
        setActiveItem('My Profile');
      }
    }, [location.pathname]);

    return (
      <div className="sidebar">
        <div className='sidebar-components'>
          
          <ul className="sidebar-nav">
                    
              <Link to="/admin/users" >
              <li className={`nav-item ${activeItem === 'Researchers' ? 'active' : ''}`} onClick={() => setActiveItem('Researchers')}>
              <img src={Researcher} alt="Researchers" className="nav-icon" />
                <span>Users</span>
                </li>
              </Link>
          </ul>
        </div>
      </div>
    );
  };

  export default AdminNav;
