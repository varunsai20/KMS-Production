import React, { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/reducers/LoginAuth";
import Button from "./Buttons";
import "../styles/variables.css";
import "./Header-New.css";
//import Logo from "../assets/images/Logo_New.svg";
import Logo from "../assets/images/InferFinalLogo.png";
import ProfileIcon from "../assets/images/Profile-start.svg";
import { toast } from "react-toastify";
import ErrorBoundry from "../utils/ErrorBoundry";

import axios from "axios";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const { user, profileUpdated } = useSelector((state) => state.auth);
  const [errorCode, setErrorCode] = useState();

  const [currentProfileImage, setCurrentProfileImage] = useState(ProfileIcon);

  useEffect(() => {
    setCurrentProfileImage(user?.profile_picture_url || ProfileIcon);
  }, [user.profile_picture_url, profileUpdated]); // Re-run when profileUpdated changes

  const userId = user?.user_id;
  const userRole = user?.role;

  // Function to check if the current path matches the link's href
  const isActive = (path) => location.pathname === path;

  // Handle login click
  const handleLogin = () => {
    navigate("/Login");
  };

  // Handle logout click
  const handleLogout = async () => {
    try {
      await axios.post(
        `http://13.127.207.184:80/auth/logout/?user_id=${userId}`
      );
      dispatch(logout());
      navigate("/");
    } catch (error) {
      setErrorCode(error.response.status);
      console.error("Error logging out:", error);
      toast.error("Error logging out:", error);
    }
  };
  if (errorCode) {
    return (
      <ErrorBoundry errorCode={errorCode} onRetry={() => setErrorCode(null)} />
    );
  }

  // Handle profile click
  const handleProfileClick = () => {
    if (userId) {
      if (userRole === "Admin") {
        navigate(`/admin/users/profile/${userId}`);
      } else if (userRole === "User") {
        navigate(`/users/profile/${userId}`);
      }
    } else {
      console.warn("User ID not found in Redux state");
    }
  };

  return (
    <div
      className="Navbar-Header"
      style={{
        width: location.pathname.startsWith("/article") ? "100%" : "100%",
      }} // Set width conditionally
    >
      <div className="Navbar-Header-Items">
        <Link to="/">
          <img className="Search-nav-logo" src={Logo} alt="Infer logo" />
        </Link>
        <div className="line-between">
          <span className="line-in-between"></span>
        </div>
        <Link
          to="/"
          className={`Navbar-Header-Link ${isActive("/") ? "active-link" : ""}`}
          style={{fontWeight:"bold"}}
        >
          Home
        </Link>
      </div>

      <section className="Search-nav-login">
        {isLoggedIn ? (
          <>
            <div
              onClick={handleProfileClick}
              style={{ cursor: "pointer", height: "35px" }}
            >
              <img
                src={currentProfileImage}
                style={{ width: "35px", height: "35px", borderRadius: "50%" }}
                alt="Profile"
                className="profile-icon"
              />
            </div>
            <Button
              text="Logout"
              className="logout-btn"
              onClick={handleLogout}
            />
          </>
        ) : (
          <Button text="Login" className="login-btn" onClick={handleLogin} />
        )}
      </section>
    </div>
  );
};

export default Header;
