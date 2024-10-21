import React,{useState} from 'react'
import "./Login.css"
import { useLocation, Link, useNavigate } from "react-router-dom";

import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../../../redux/reducers/LoginAuth"; // Import login and logout actions
import { Navigate } from 'react-router-dom';
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
    validateEmail(inputEmail, password); // Validate email and check if button can be enabled
  };

  const handlePasswordChange = (e) => {
    const inputPassword = e.target.value;
    setPassword(inputPassword);
    validatePassword(email, inputPassword); // Validate password and check if button can be enabled
  };

  const validateEmail = (email, password) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (regex.test(email)) {
      setEmailError(''); // Clear error if valid
    } else {
      setEmailError('Please enter a valid email'); // Set error if invalid
    }
    checkIfButtonCanBeEnabled(email, password); // Check if both inputs are valid
  };

  const validatePassword = (email, password) => {
    if (password.length >= 8) {
      setPasswordError(''); // Clear error if valid
    } else {
      setPasswordError('Password must be at least 8 characters long'); // Set error if invalid
    }
    checkIfButtonCanBeEnabled(email, password); // Check if both inputs are valid
  };


  const checkIfButtonCanBeEnabled = (email, password) => {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordValid = password.length >= 8;
    if (emailValid && passwordValid) {
      setIsButtonDisabled(false); // Enable button if both inputs are valid
    } else {
      setIsButtonDisabled(true); // Disable button if either input is invalid
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Final check before submitting
    if (!emailError && !passwordError && email && password) {
      console.log('Form submitted successfully');
      dispatch(login({ username: "dummyUser" })); // Dispatch login action with a dummy username
      navigate("/")
      // Add your form submission logic here
    }
  };
  return (
<div className='Login-Form'>

<form class="form" >
<div class="flex-row">
      <button class="btn google">
      <svg version="1.1" width="20" id="Layer_1" viewBox="0 0 512 512">
  <path style={{ fill: '#FBBB00' }} d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456C103.821,274.792,107.225,292.797,113.47,309.408z"></path>
  <path style={{ fill: '#518EF8' }} d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176L507.527,208.176z"></path>
  <path style={{ fill: '#28B446' }} d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z"></path>
  <path style={{ fill: '#F14336' }} d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0C318.115,0,375.068,22.126,419.404,58.936z"></path>
</svg>

   
        Continue with Google 
        
      </button><button class="btn apple">
      <svg version="1.1" height="20" width="20" id="Capa_1" viewBox="0 0 22.773 22.773">
  <g>
    <g>
      <path d="M15.769,0c0.053,0,0.106,0,0.162,0c0.13,1.606-0.483,2.806-1.228,3.675c-0.731,0.863-1.732,1.7-3.351,1.573 c-0.108-1.583,0.506-2.694,1.25-3.561C13.292,0.879,14.557,0.16,15.769,0z"></path>
      <path d="M20.67,16.716c0,0.016,0,0.03,0,0.045c-0.455,1.378-1.104,2.559-1.896,3.655c-0.723,0.995-1.609,2.334-3.191,2.334 c-1.367,0-2.275-0.879-3.676-0.903c-1.482-0.024-2.297,0.735-3.652,0.926c-0.155,0-0.31,0-0.462,0 c-0.995-0.144-1.798-0.932-2.383-1.642c-1.725-2.098-3.058-4.808-3.306-8.276c0-0.34,0-0.679,0-1.019 c0.105-2.482,1.311-4.5,2.914-5.478c0.846-0.52,2.009-0.963,3.304-0.765c0.555,0.086,1.122,0.276,1.619,0.464 c0.471,0.181,1.06,0.502,1.618,0.485c0.378-0.011,0.754-0.208,1.135-0.347c1.116-0.403,2.21-0.865,3.652-0.648 c1.733,0.262,2.963,1.032,3.723,2.22c-1.466,0.933-2.625,2.339-2.427,4.74C17.818,14.688,19.086,15.964,20.67,16.716z"></path>
    </g>
  </g>
</svg>

Continue with Apple 
        
</button></div>
<p class="p line">Or </p>
<div className="flex-column">
          <label>Email</label>
          <div className="inputForm">
            <input
              type="text"
              className="input"
              placeholder="Enter your Email"
              value={email}
              onChange={handleEmailChange}
            />
          </div>
          {emailError && <p className="error">{emailError}</p>}
        </div>

        <div className="flex-column">
          <label>Password</label>
          <div className="inputForm">
            <input
              type="password"
              className="input"
              placeholder="Enter your Password"
              value={password}
              onChange={handlePasswordChange}
            />
            <svg viewBox="0 0 576 512" height="1em" xmlns="http://www.w3.org/2000/svg"><path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"></path></svg>
          </div>
          {passwordError && <p className="error">{passwordError}</p>}
        </div>
    
    <div class="flex-row">
      <div style={{display:"flex"}}>
      <input type="checkbox" style={{marginBottom:"0"}}/>
      <label>Remember me </label>
      </div>
      <span class="span">Forgot password?</span>
    </div>
    <button
          type="submit"
          className="button-submit"
          disabled={isButtonDisabled} // Disable the button based on state
          style={{
            backgroundColor: isButtonDisabled ? "#ddd" : "#151717", // Grayed out style when disabled
            cursor: isButtonDisabled ? "not-allowed" : "pointer",   // Change cursor when disabled
          }}
          onClick={handleSubmit}
        >
          Sign In
        </button>    
        {/* <p class="p">Don't have an account? <span class="span">Sign Up</span>

    </p> */}

    </form>
  
</div>
  )
}

export default Login