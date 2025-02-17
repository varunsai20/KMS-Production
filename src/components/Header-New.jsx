import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/reducers/LoginAuth";
import Button from "./Buttons";
import { apiService } from "../assets/api/apiService";
import "../styles/variables.css";
import "./Header-New.css";
import Logo from "../assets/images/logo.svg";
import ProfileIcon from "../assets/images/Profile-start.svg";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const { user, profileUpdated } = useSelector((state) => state.auth);
  const [currentProfileImage, setCurrentProfileImage] = useState(ProfileIcon);
  const[confirmLogout,setConfirmLogout] = useState(false);

  useEffect(() => {
    setCurrentProfileImage(user?.profile_picture_url || ProfileIcon);
  }, [user.profile_picture_url, profileUpdated]);

  const userId = user?.user_id;
  const userRole = user?.role;

  const handleLogin = () => {
    navigate("/Login");
  };

  const handleLogout = async () => {
    try {
      await apiService.logout(userId);
      dispatch(logout());
      navigate("/");
    } catch (error) {
      navigate("/server-error");
      console.error("Error logging out:", error);
    }
  };

  const handleProfileClick = () => {
    if (userId) {
      if (userRole === "Admin") {
        if (location.pathname.startsWith("/admin/users")) {
          navigate(`/admin/users/profile/${userId}`);
        } else {
          navigate(`/admin/users`);
        }
       } else if (userRole === "User") {
        navigate(`/users/profile/${userId}`);
      }
    } else {
      console.warn("User ID not found in Redux state");
    }
  };

const handleCancelLogout = (e)=>{
  e.stopPropagation();
  setConfirmLogout(false);
}
const initialLogout =()=>{
  setConfirmLogout(true);

}
const finalLogout =()=>{
  handleLogout();
setConfirmLogout(false);
}
  return (
    <div
      className="Navbar-Header"
      style={{
        width: location.pathname.startsWith("/article") ? "100%" : "100%",
      }}
    >
      <div className="Navbar-Header-Items">
        <a href="https://www.infersol.com/" target="_blank" rel="noreferrer">
          <img className="Search-nav-logo" src={Logo} alt="Infer logo" />
        </a>
        <div className="line-between">
          <span className="line-in-between"></span>
        </div>
        <div className="logo-descreption">
          <p>Information For Excellence in Research</p>
          <span>using Artificial Intelligence</span>
        </div>
      </div>

      <section className="Search-nav-login">
        {isLoggedIn ? (
          <>
            <div
              onClick={handleProfileClick}
              style={{ cursor: "pointer", height: "25px" }}
            >
              <img
                src={currentProfileImage}
                style={{ width: "25px", height: "25px", borderRadius: "50%" }}
                alt="Profile"
                className="profile-icon"
              />
            </div>

            <Button
              text="Logout"
              className="logout-btn"
              //onClick={handleLogout}
              onClick={initialLogout}
            />
          </>
        ) : (
          <Button text="Login" className="login-btn" onClick={handleLogin} />
        )}
        {confirmLogout &&(
          <div className="confirmlogout-overlay">
            <div className="confirmlogout-popup">
              <p>Are you sure to logout?</p>
              <div className="confirmlogout-buttons">

              <button className="cancel-logout" onClick={handleCancelLogout}>cancel</button>
              <button className="confirm-logout" onClick={finalLogout}>Logout</button>
              </div>
            </div>
          </div>
        ) } 
      </section>
    </div>
  );
};

export default Header;
