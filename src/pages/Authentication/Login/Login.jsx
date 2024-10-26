import React, { useState } from 'react';
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from 'axios';
import { login } from "../../../redux/reducers/LoginAuth"; // Import login action

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
    setEmailError(regex.test(email) ? '' : 'Please enter a valid email');
    checkIfButtonCanBeEnabled(email, password);
  };

  const validatePassword = (email, password) => {
    setPasswordError(password.length >= 8 ? '' : 'Password must be at least 8 characters long');
    checkIfButtonCanBeEnabled(email, password);
  };

  const checkIfButtonCanBeEnabled = (email, password) => {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordValid = password.length >= 8;
    setIsButtonDisabled(!(emailValid && passwordValid));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!emailError && !passwordError && email && password) {
      try {
        const response = await axios.post('http://13.127.207.184/auth/login', {
          email,
          password,
        });
  
        // Check the login response and ensure token, userId, and other fields are received
        console.log('Login API response:', response.data);
  
        if (response.status === 200) {
          const token = response.data.access_token;
          const userId = response.data.user_id;
          console.log(response) 
          // Fetch user profile with token
          const profileResponse = await axios.get(`http://13.127.207.184:80/user/profile/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          console.log('Profile API response:', profileResponse.data);
  
          const userProfile = profileResponse.data.user_profile;
  
          // Dispatch the login action with complete data
          dispatch(login({
            access_token: token,
            refresh_token: response.data.refresh_token, // if available
            token_type: response.data.token_type,       // if available
            user_id: userId,
            role: userProfile.role,
            name: userProfile.name,
            email: userProfile.email,
            department: userProfile.department,
            organization_name:userProfile.organization_name,
          }));
  
          // Redirect based on role
          if (userProfile.role === "Admin") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }
      } catch (error) {
        console.error('Login or profile fetch failed:', error);
        setEmailError('Login failed. Please check your credentials.');
      }
    }
  };

  return (
    <div className='Login-Form'>
      <form className="form" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <div className="flex-column">
          <label>Username</label>
          <div className={`inputForm ${emailError ? 'error-outline' : ''}`}>
            <input
              type="text"
              className="input"
              placeholder="Enter username"
              value={email}
              onChange={handleEmailChange}
            />
            {emailError && <p className="error-message">{emailError}</p>}
          </div>
        </div>

        <div className="flex-column">
          <label>Password</label>
          <div className={`inputForm ${passwordError ? 'error-outline' : ''}`}>
            <input
              type="password"
              className="input"
              placeholder="Enter your Password"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>
          {passwordError && <p className="error-message">{passwordError}</p>}
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
            backgroundColor: isButtonDisabled ? "#ddd" : "#151717",
            cursor: isButtonDisabled ? "not-allowed" : "pointer",
          }}
        >
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Login;
