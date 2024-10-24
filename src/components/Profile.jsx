import React from 'react'
import "./Profile.css"
import profile from "../assets/images/Profile-start.svg"
import upload from "../assets/images/Upload.svg"
const Profile = () => {
    return (
        <div className="profile-container">
    
          <div className="profile-body">
    
            {/* Form Section */}
            <form className="profile-form">
              {/* Basic Details */}
              <div className="form-section">
                <h3>Basic Details</h3>
                <div className="form-row">
                  <div className="form-row-item">
                    <label>Full Name</label>
                    <input type="text" placeholder="Enter full name" />
                  </div>
                  <div className="form-row-item">
                    <label>Email ID</label>
                    <input type="email" placeholder="Enter email ID" />
                  </div>
                </div>
              </div>
    
              {/* Role & Department */}
              <div className="form-section">
                <h3>Role & Department</h3>
                <div className="form-row">
                  <div className="form-row-item">
                    <label>Role</label>
                    <input type="text" value="Admin" disabled />
                  </div>
                  <div className="form-row-item">
                    <label>Department</label>
                    <select>
                      <option>Select Department</option>
                      <option>IT</option>
                      <option>HR</option>
                    </select>
                  </div>
                </div>
              </div>
    
              {/* Professional Details */}
              <div className="form-section">
                <h3>Professional Details</h3>
                <div className='form-section-multiplerow'>
                <div className="form-row">
                  <div className="form-row-item">
                    <label>Job Title</label>
                    <input type="text" placeholder="Enter Job Title" />
                  </div>
                  <div className="form-row-item">
                  <label>Primary Research Area</label>
                    <select>
                      <option>Select Research Area</option>
                      <option>DNA</option>
                      <option>Cancer</option>
                    </select>
                    
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-row-item">
                  <label>Organization</label>
                  <input type="text" className="org" placeholder="Enter organization name" />
                  </div>
                </div>
                </div>
              </div>
    
              {/* Skills & Research Interests */}
              <div className="form-section">
                <h3>Skills & Research Interests</h3>
                <div className="form-row">
                  <div className="form-row-item">
                    <label>Technical Skills</label>
                    <input type="text" placeholder="Enter relevant software, lab techniques, etc." />
                  </div>
                  <div className="form-row-item">
                    <label>Research Interests</label>
                    <select>
                      <option>Select Research Interests</option>
                      <option>Gene</option>
                      <option>Cell Biology</option>
                    </select>
                  </div>
                </div>
              </div>
    
              {/* Action Buttons */}
              <div className="form-actions">
                {/* <button type="button" className="cancel-button" onClick={handleBackClick}>
                  Cancel
                </button> */}
                <button type="submit" className="create-button">
                  Continue
                </button>
              </div>
            </form>
            <div className="profile-section">
              <div className="profile-picture">
                {/* Placeholder for profile image */}
                <img src={profile} alt="Profile" />
              </div>
              <div style={{position:"relative"}}>

              <img className="profile-section-img" src={upload}/>
              <button className="upload-button">Upload picture</button>
              </div>
            </div>
          </div>
        </div>
      );
}

export default Profile