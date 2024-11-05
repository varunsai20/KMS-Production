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
            <svg
              version="1.1"
              height="20"
              width="20"
              id="Capa_1"
              viewBox="0 0 22.773 22.773"
            >
              <g>
                <g>
                  <path d="M15.769,0c0.053,0,0.106,0,0.162,0c0.13,1.606-0.483,2.806-1.228,3.675c-0.731,0.863-1.732,1.7-3.351,1.573 c-0.108-1.583,0.506-2.694,1.25-3.561C13.292,0.879,14.557,0.16,15.769,0z"></path>
                  <path d="M20.67,16.716c0,0.016,0,0.03,0,0.045c-0.455,1.378-1.104,2.559-1.896,3.655c-0.723,0.995-1.609,2.334-3.191,2.334 c-1.367,0-2.275-0.879-3.676-0.903c-1.482-0.024-2.297,0.735-3.652,0.926c-0.155,0-0.31,0-0.462,0 c-0.995-0.144-1.798-0.932-2.383-1.642c-1.725-2.098-3.058-4.808-3.306-8.276c0-0.34,0-0.679,0-1.019 c0.105-2.482,1.311-4.5,2.914-5.478c0.846-0.52,2.009-0.963,3.304-0.765c0.555,0.086,1.122,0.276,1.619,0.464 c0.471,0.181,1.06,0.502,1.618,0.485c0.378-0.011,0.754-0.208,1.135-0.347c1.116-0.403,2.21-0.865,3.652-0.648 c1.733,0.262,2.963,1.032,3.723,2.22c-1.466,0.933-2.625,2.339-2.427,4.74C17.818,14.688,19.086,15.964,20.67,16.716z"></path>
                </g>
              </g>
            </svg>
            Continue with Apple
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
