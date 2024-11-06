import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { login } from "../../../redux/reducers/LoginAuth"; // Import login action

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loginError, setloginError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailChange = (e) => {
    const inputEmail = e.target.value;
    setEmail(inputEmail);
    validateEmail(inputEmail, password);
  };

  const handlePasswordChange = (e) => {
    const inputPassword = e.target.value;
    setPassword(inputPassword);
    validatePassword(email, inputPassword);
  };

  const validateEmail = (email, password) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailError(regex.test(email) ? "" : "Please enter a valid email");
    checkIfButtonCanBeEnabled(email, password);
  };

  const validatePassword = (email, password) => {
    setPasswordError(
      password.length >= 8 ? "" : "Password must be at least 8 characters long"
    );
    checkIfButtonCanBeEnabled(email, password);
  };

  const checkIfButtonCanBeEnabled = (email, password) => {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordValid = password.length >= 8;
    setIsButtonDisabled(!(emailValid && passwordValid));
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailError && !passwordError && email && password) {
      try {
        const response = await axios.post("http://13.127.207.184/auth/login", {
          email,
          password,
        });

        // Check the login response and ensure token, userId, and other fields are received

        if (response.status === 200) {
          const token = response.data.access_token;
          const userId = response.data.user_id;
          // Fetch user profile with token
          const profileResponse = await axios.get(
            `http://13.127.207.184:80/user/profile/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const userProfile = profileResponse.data.user_profile;

          // Dispatch the login action with complete data
          dispatch(
            login({
              access_token: token,
              refresh_token: response.data.refresh_token, // if available
              token_type: response.data.token_type, // if available
              user_id: userId,
              role: userProfile.role,
              name: userProfile.name,
              email: userProfile.email,
              department: userProfile.department,
              organization_name: userProfile.organization_name,
              iat: response.data.iat,
              exp: response.data.exp,
              profile_picture_url:userProfile.profile_picture_url,
            })
          );

          // Redirect based on role
          if (userProfile.role === "Admin") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }
      } catch (error) {
        console.error("Login or profile fetch failed:", error);
        setloginError("Login failed. Please check your credentials.");
      }
    }
  };

  return (
    <div className="Login-Form">
      <form className="form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <div className="flex-column">
          <label>Username</label>
          <div className={`inputForm ${emailError ? "error-outline" : ""}`}>
            <input
              type="text"
              className="input"
              placeholder="Enter username"
              value={email}
              onChange={handleEmailChange}
            />
          </div>
        </div>

        <div className="flex-column">
          <label>Password</label>
          <div className={`inputForm ${passwordError ? "error-outline" : ""}`}>
            <input
              type={showPassword ? "text" : "password"}
              className="input"
              placeholder="Enter your Password"
              value={password}
              onChange={handlePasswordChange}
            />
            <button
              type="button"
              className="show-password-btn"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? "Hide" : "Show"}
            </button>{" "}
          </div>
        </div>

        <div className="flex-row">
          <div style={{ display: "flex" }}>
            <input type="checkbox" style={{ marginBottom: "0" }} />
            <label>Remember me</label>
          </div>
          <span className="span">Forgot password?</span>
        </div>

        <button
          type="submit"
          className="button-submit"
          disabled={isButtonDisabled}
          style={{
            backgroundColor: isButtonDisabled
              ? "#ddd"
              : "var(--color-btn-blue)",
            cursor: isButtonDisabled ? "not-allowed" : "pointer",
          }}
        >
          Sign In
        </button>
        <p class="p line">Or </p>
        <div class="flex-row">
          <button class="btn google">
            <svg version="1.1" width="20" id="Layer_1" viewBox="0 0 512 512">
              <path
                style={{ fill: "#FBBB00" }}
                d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456C103.821,274.792,107.225,292.797,113.47,309.408z"
              ></path>
              <path
                style={{ fill: "#518EF8" }}
                d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176L507.527,208.176z"
              ></path>
              <path
                style={{ fill: "#28B446" }}
                d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z"
              ></path>
              <path
                style={{ fill: "#F14336" }}
                d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0C318.115,0,375.068,22.126,419.404,58.936z"
              ></path>
            </svg>
            Continue with Google
          </button>
          <button class="btn apple">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M16.3333 10.85V14.2333H19.3667C19.6 14.2333 19.7167 14.4667 19.7167 14.7L19.25 16.9167C19.25 17.0333 19.0167 17.15 18.9 17.15H16.3333V25.6667H12.8333V17.2667H10.85C10.6167 17.2667 10.5 17.15 10.5 16.9167V14.7C10.5 14.4667 10.6167 14.35 10.85 14.35H12.8333V10.5C12.8333 8.51667 14.35 7 16.3333 7H19.4833C19.7167 7 19.8333 7.11667 19.8333 7.35V10.15C19.8333 10.3833 19.7167 10.5 19.4833 10.5H16.6833C16.45 10.5 16.3333 10.6167 16.3333 10.85Z" stroke="white" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round"/>
<path d="M17.5003 25.6668H10.5003C4.66695 25.6668 2.33362 23.3335 2.33362 17.5002V10.5002C2.33362 4.66683 4.66695 2.3335 10.5003 2.3335H17.5003C23.3336 2.3335 25.667 4.66683 25.667 10.5002V17.5002C25.667 23.3335 23.3336 25.6668 17.5003 25.6668Z" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

            Continue with Facebook
          </button>
        </div>
        {loginError && (
          <p className="error-message" style={{ color: "red" }}>
            {loginError}
          </p>
        )}
      </form>
    </div>
  );
};

export default Login;
