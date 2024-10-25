  import React, { useState, useEffect } from 'react';
  import { Link, useLocation } from 'react-router-dom'; // Use Link and useLocation for route handling
  import "./Admin-Nav.css";
  import Logo from "../../assets/images/Logo_New.svg";
  import Dashboard from "../../assets/images/Dashboard.svg";
  import Researcher from "../../assets/images/Researcher-Icon.svg";
  import Admin from "../../assets/images/Admin-Icon.svg";
  import Profile from "../../assets/images/Profile-dummy.svg";

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
            
              {/* <Link to="/admin/dashboard" onClick={() => setActiveItem('Dashboard')}>
              <li className={`nav-item ${activeItem === 'Dashboard' ? 'active' : ''}`}>
            <img src={Dashboard} alt="Dashboard" className="nav-icon" />
                <span>Dashboard</span>
                </li>
              </Link> */}
            

              <Link to="/admin/users" >
              <li className={`nav-item ${activeItem === 'Researchers' ? 'active' : ''}`} onClick={() => setActiveItem('Researchers')}>
              <img src={Researcher} alt="Researchers" className="nav-icon" />
                <span>Researchers</span>
                </li>
              </Link>

              {/* <Link to="/admin/users/profile" onClick={() => setActiveItem('My Profile')}>
            <li className={`nav-item ${activeItem === 'My Profile' ? 'active' : ''}`}>
            <img src={Profile} alt="Profile" className="nav-icon" />
                <span>My Profile</span>
            </li>
              </Link> */}
          </ul>
        </div>
      </div>
    );
  };

  export default AdminNav;
