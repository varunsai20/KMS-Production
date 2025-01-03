import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Admin-Nav.css";
import Researcher from "../../assets/images/Researcher-Icon.svg";
import { RxHome } from "react-icons/rx";
const AdminNav = () => {
  const location = useLocation(); // Get the current route
  const [activeItem, setActiveItem] = useState("Dashboard");

  useEffect(() => {
    if (location.pathname === "/admin/users") {
      setActiveItem("Researchers");
    } else if (location.pathname === "/admin/admins") {
      setActiveItem("Admins");
    } else if (location.pathname === "/admin/profile") {
      setActiveItem("My Profile");
    }
  }, [location.pathname]);

  return (
    <div className="sidebar">
      <div className="sidebar-components">
        <ul className="sidebar-nav">
          <Link to="/">
            <li className={`nav-item ${activeItem === "" ? "active" : ""}`}>
              <RxHome size={20} className="nav-icon" />

              <span>Home</span>
            </li>
          </Link>
          <Link to="/admin/users">
            <li
              className={`nav-item ${
                activeItem === "Researchers" ? "active" : ""
              }`}
              onClick={() => setActiveItem("Researchers")}
            >
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
