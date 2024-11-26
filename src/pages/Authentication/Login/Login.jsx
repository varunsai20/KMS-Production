import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { login } from "../../../redux/reducers/LoginAuth"; // Import login action
import { toast } from "react-toastify";
import Logo from "../../../assets/images/InfersolD17aR04aP01ZL-Polk4a 1.svg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  //const [loginError, setloginError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  //const [errorCode, setErrorCode] = useState(null);
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
              profile_picture_url: userProfile.profile_picture_url,
            })
          );
          toast.success("Loged in Successfully", {
            position: "top-center",
            autoClose: 2000,

            style: {
              backgroundColor: "rgba(237, 254, 235, 1)",
              borderLeft: "5px solid rgba(15, 145, 4, 1)",
              color: "rgba(15, 145, 4, 1)",
            },
            progressStyle: {
              backgroundColor: "rgba(15, 145, 4, 1)",
            },
          });

          // Redirect based on role
          if (userProfile.role === "Admin") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }
      } catch (error) {
        if (error.response) {
          const statusCode = error.response.status;

          if (statusCode === 401 || statusCode === 403) {
            toast.error("Login failed. Please check your credentials.", {
              position: "top-center",
              autoClose: 2000,
              style: {
                backgroundColor: "rgba(254, 235, 235, 1)",
                borderLeft: "5px solid rgba(145, 4, 4, 1)",
                color: "rgba(145, 4, 4, 1)",
              },
              progressStyle: {
                backgroundColor: "rgba(145, 4, 4, 1)",
              },
            });
          } else {
            navigate("/server-error");
          }
        } else {
          console.error("Unknown error occurred:", error);
          navigate("/server-error");
        }
      }
    }
  };

  return (
    <>
      <div className="Login-Form">
        <img src={Logo} alt="logo" className="logo-in-login" />
        <form className="form" onSubmit={handleSubmit}>
          <h2 style={{ margin: "0" }}>Login</h2>

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
            <div
              className={`inputForm ${passwordError ? "error-outline" : ""}`}
            >
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
            Login
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
              {/* <SiFacebook /> */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="800"
                width="1200"
                viewBox="-204.79995 -341.33325 1774.9329 2047.9995"
              >
                <path
                  d="M1365.333 682.667C1365.333 305.64 1059.693 0 682.667 0 305.64 0 0 305.64 0 682.667c0 340.738 249.641 623.16 576 674.373V880H402.667V682.667H576v-150.4c0-171.094 101.917-265.6 257.853-265.6 74.69 0 152.814 13.333 152.814 13.333v168h-86.083c-84.804 0-111.25 52.623-111.25 106.61v128.057h189.333L948.4 880H789.333v477.04c326.359-51.213 576-333.635 576-674.373"
                  fill="#1877f2"
                />
                <path
                  d="M948.4 880l30.267-197.333H789.333V554.609C789.333 500.623 815.78 448 900.584 448h86.083V280s-78.124-13.333-152.814-13.333c-155.936 0-257.853 94.506-257.853 265.6v150.4H402.667V880H576v477.04a687.805 687.805 0 00106.667 8.293c36.288 0 71.91-2.84 106.666-8.293V880H948.4"
                  fill="#fff"
                />
              </svg>
              Continue with Facebook
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default Login;
