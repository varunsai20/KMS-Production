import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../redux/reducers/LoginAuth"; // Import login and logout actions
import Button from "./Buttons";
import "../styles/variables.css";
import "./Header-New.css";
import Logo from "../assets/images/Logo_New.svg";
import ProfileIcon from "../assets/images/profile-circle.svg"; // Profile icon for logged-in users

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn); // Access login status from Redux

  // Function to check if the current path matches the link's href
  const isActive = (path) => location.pathname === path;

  // Handle login click (dummy login button)
  const handleLogin = () => {
    dispatch(login({ username: "dummyUser" })); // Dispatch login action with a dummy username
  };

  // Handle logout click
  const handleLogout = () => {
    dispatch(logout());
    navigate("/"); // Redirect to home after logout
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
            <Link to="/profile">
              <img src={ProfileIcon} alt="Profile" className="profile-icon" />
            </Link>
            <Button text="Logout" className="logout-btn" onClick={handleLogout} />
          </>
        ) : (
          // If not logged in, show login and signup buttons
          <>
            <Button text="SignUp" className="signup-btn" />
            <Button
              text="Login"
              className="login-btn"
              onClick={handleLogin} // Call dummy login on click
            />
          </>
        )}
      </section>
    </div>
  );
};

export default Header;
