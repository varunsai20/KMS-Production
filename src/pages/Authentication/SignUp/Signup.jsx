import React, { useState } from "react";
import "./Signup.css";
import upload from "../../../assets/images/Upload.svg";
import personal from "../../../assets/images/PersonalDetailsLogin.svg";
import professional from "../../../assets/images/ProfessionalDetailsLogin.svg";
import account from "../../../assets/images/AccountDetailsLogin.svg";
import { useNavigate } from "react-router-dom";

// Step 1: Basic Details Component
const BasicDetails = ({ formData, setFormData, nextStep }) => {
  return (
    <>
      <button className="upload-btn">
        {" "}
        <img src={upload} alt="upload-img" />
        Upload profile picture
      </button>

      <input
        type="text"
        placeholder="Full Name"
        value={formData.fullName}
        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email ID"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      />
      <input type="text" value="Super Admin" disabled />
      <select
        onChange={(e) =>
          setFormData({ ...formData, department: e.target.value })
        }
      >
        <option>Select Department</option>
        <option>HR</option>
        <option>Development</option>
        <option>Marketing</option>
      </select>
      <div className="navigation-control">
        <button className="navigation-button" onClick={nextStep}>
          Next
        </button>
      </div>
    </>
  );
};

// Step 2: Professional Information Component
const ProfessionalInfo = ({ formData, setFormData, nextStep, prevStep }) => {
  return (
    <>
      <input
        type="text"
        placeholder="Job Title"
        value={formData.jobTitle}
        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
      />
      <input
        type="text"
        placeholder="Organisation"
        value={formData.organization}
        onChange={(e) =>
          setFormData({ ...formData, organization: e.target.value })
        }
      />
      <select
        onChange={(e) =>
          setFormData({ ...formData, researchArea: e.target.value })
        }
      >
        <option>Select Research Area</option>
        <option>Biology</option>
        <option>Chemistry</option>
        <option>Physics</option>
      </select>
      <input
        type="text"
        placeholder="Technical Skills"
        value={formData.skills}
        onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
      />
      <div className="navigation-control">
        <button className="navigation-button" onClick={prevStep}>
          Previous
        </button>
        <button className="navigation-button" onClick={nextStep}>
          Next
        </button>
      </div>
    </>
  );
};

// Step 3: Account Setup Component
const AccountSetup = ({ formData, setFormData, prevStep, submitForm }) => {
  return (
    <>
      <div className="input-container">
        <input
          type="text"
          placeholder="Enter Username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
        />
      </div>

      <div className="input-container">
        <input
          type="password"
          placeholder="Enter Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
        <svg
          viewBox="0 0 576 512"
          height="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"></path>
        </svg>
      </div>

      <div className="input-container">
        <input
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
        />
        <svg
          viewBox="0 0 576 512"
          height="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"></path>
        </svg>
      </div>
      <div className="navigation-control">
        <button className="navigation-button" onClick={prevStep}>
          Previous
        </button>
        <button className="navigation-button" onClick={submitForm}>
          Create Profile
        </button>
      </div>
    </>
  );
};

const ProgressBar = ({ currentStep }) => {
  return (
    <div className="progress-bar">
      <div className={`step ${currentStep >= 1 ? "active" : ""}`}></div>
      <div className={`step ${currentStep >= 2 ? "active" : ""}`}></div>
      <div className={`step ${currentStep >= 3 ? "active" : ""}`}></div>
    </div>
  );
};
// Main Multi-Step Form Component
const SignUpForm = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    department: "",
    jobTitle: "",
    organization: "",
    researchArea: "",
    skills: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  const submitForm = () => {
    console.log("Form Submitted", formData);
    navigate("/");
    // Add form submission logic here
  };

  return (
    <div className="signup-form-container">
      <div className="progress-indicator">
        <div className="vertical-progress">
          <div
            className={`vertical-step ${currentStep >= 1 ? "active" : ""}`}
          ></div>
          <div
            className={`vertical-line ${currentStep >= 2 ? "active" : ""}`}
          ></div>
          <div
            className={`vertical-step ${currentStep >= 2 ? "active" : ""}`}
          ></div>
          <div
            className={`vertical-line ${currentStep >= 3 ? "active" : ""}`}
          ></div>
          <div
            className={`vertical-step ${currentStep >= 3 ? "active" : ""}`}
          ></div>
        </div>
        <ul>
          <li className={currentStep === 1 ? "active" : ""}>
            <img src={personal} alt="personal-icon" />
            <span>Basic Details</span>
          </li>
          <li className={currentStep === 2 ? "active" : ""}>
            <img src={professional} alt="profesional-icon" />
            <span>Professional Information</span>
          </li>
          <li className={currentStep === 3 ? "active" : ""}>
            <img src={account} alt="account-icon" />
            <span>Account Setup</span>
          </li>
        </ul>
      </div>
      <div className="form-content">
        <div className="form-content-welcome">
          <h2 style={{ display: "flex" }}>Sign Up as Super Admin</h2>
          <ProgressBar currentStep={currentStep} />
        </div>

        <div className="form-content-center">
          {currentStep === 1 && (
            <BasicDetails
              formData={formData}
              setFormData={setFormData}
              nextStep={nextStep}
            />
          )}
          {currentStep === 2 && (
            <ProfessionalInfo
              formData={formData}
              setFormData={setFormData}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          )}
          {currentStep === 3 && (
            <AccountSetup
              formData={formData}
              setFormData={setFormData}
              prevStep={prevStep}
              submitForm={submitForm}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUpForm;
