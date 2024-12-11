// LogoutHandler.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "./redux/reducers/LoginAuth";
import { apiService } from "./assets/api/apiService";
const LogoutHandler = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { access_token, refresh_token, exp } = useSelector(
    (state) => state.auth
  );
  const userId = useSelector((state) => state.auth.user.user_id);
  const handleLogout = async () => {
    try {
      await apiService.logout(userId);
      dispatch(logout());
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);
    const expirationTime = exp - 60;

    if (now >= expirationTime) {
      handleLogout();
    }
  }, [access_token, refresh_token, exp]);

  return children;
};

export default LogoutHandler;
