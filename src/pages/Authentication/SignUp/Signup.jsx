import React, { useState } from "react";
import "./Signup.css"
// Step 1: Basic Details Component
const BasicDetails = ({ formData, setFormData, nextStep }) => {
  return (
    <div>
      <h2>Sign Up as Super Admin</h2>
      <button className="upload-btn">Upload profile picture</button>
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
      <div className="navigation-buttons">
        <button onClick={nextStep}>Next</button>
      </div>
    </div>
  );
};

// Step 2: Professional Information Component
const ProfessionalInfo = ({ formData, setFormData, nextStep, prevStep }) => {
  return (
    <div>
      <h2>Sign Up as Super Admin</h2>
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
      <div className="navigation-buttons">
        <button onClick={prevStep}>Previous</button>
        <button onClick={nextStep}>Next</button>
      </div>
    </div>
  );
};

// Step 3: Account Setup Component
const AccountSetup = ({ formData, setFormData, prevStep, submitForm }) => {
  return (
    <div>
      <h2>Sign Up as Super Admin</h2>
      <input
        type="text"
        placeholder="Enter Username"
        value={formData.username}
        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
      />
      <input
        type="password"
        placeholder="Enter Password"
        value={formData.password}
        onChange={(e) =>
          setFormData({ ...formData, password: e.target.value })
        }
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={formData.confirmPassword}
        onChange={(e) =>
          setFormData({ ...formData, confirmPassword: e.target.value })
        }
      />
      <div className="navigation-buttons">
        <button onClick={prevStep}>Previous</button>
        <button onClick={submitForm}>Create Profile</button>
      </div>
    </div>
  );
};

// Main Multi-Step Form Component
const SignUpForm = () => {
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
    confirmPassword: ""
  });

  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  const submitForm = () => {
    console.log("Form Submitted", formData);
    // Add form submission logic here
  };

  return (
    <div className="signup-form-container">
      <div className="progress-indicator">
        <ul>
          <li className={currentStep >= 1 ? "active" : ""}>Basic Details</li>
          <li className={currentStep >= 2 ? "active" : ""}>
            Professional Information
          </li>
          <li className={currentStep >= 3 ? "active" : ""}>Account Setup</li>
        </ul>
      </div>
      <div className="form-content">
        {currentStep === 1 && (
          <BasicDetails formData={formData} setFormData={setFormData} nextStep={nextStep} />
        )}
        {currentStep === 2 && (
          <ProfessionalInfo formData={formData} setFormData={setFormData} nextStep={nextStep} prevStep={prevStep} />
        )}
        {currentStep === 3 && (
          <AccountSetup formData={formData} setFormData={setFormData} prevStep={prevStep} submitForm={submitForm} />
        )}
      </div>
    </div>
  );
};

export default SignUpForm;
