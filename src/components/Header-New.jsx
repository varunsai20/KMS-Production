import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../redux/reducers/LoginAuth"; // Import login and logout actions
import Button from "./Buttons";
import "../styles/variables.css";
import "./Header-New.css";
import Logo from "../assets/images/Logo_New.svg";
import ProfileIcon from "../assets/images/Profile-dummy.svg"; // Profile icon for logged-in users

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn); // Access login status from Redux
  const userId = useSelector((state) => state.auth.user?.user_id); // Fetch user_id from Redux

  // Function to check if the current path matches the link's href
  const isActive = (path) => location.pathname === path;

  // Handle login click
  const handleLogin = () => {
    navigate("/Login");
  };

  // Handle logout click
  const handleLogout = () => {
    dispatch(logout());
    navigate("/"); // Redirect to home after logout
  };

  // Handle profile click
  const handleProfileClick = () => {
    if (userId) {
      navigate(`/admin/users/profile/${userId}`); // Navigate to /profile with user_id as a parameter
    } else {
      console.warn("User ID not found in Redux state"); // Log if userId is not available
    }
  };

  return (
    <div className="Navbar-Header">
      <div className="Navbar-Header-Items">
        <Link to="/">
          <img className="Search-nav-logo" src={Logo} alt="Infer logo" />
        </Link>

        <Link
          to="/"
          className={`Navbar-Header-Link ${isActive("/") ? "active-link" : ""}`}
        >
          Home
        </Link>
      </div>

      <section className="Search-nav-login">
        {isLoggedIn ? (
          // If user is logged in, show profile icon and logout button
          <>
            <div onClick={handleProfileClick} style={{ cursor: "pointer" }}>
              <img src={ProfileIcon} style={{ width: "35px" }} alt="Profile" className="profile-icon" />
            </div>
            <Button text="Logout" className="logout-btn" onClick={handleLogout} />
          </>
        ) : (
          // If not logged in, show login button
          <Button
            text="Login"
            className="login-btn"
            onClick={handleLogin}
          />
        )}
      </section>
    </div>
  );
};

export default Header;
