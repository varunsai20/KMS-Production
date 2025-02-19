import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { updateProfilePicture } from "../redux/reducers/LoginAuth";
import "./Profile.css";
import { RxHome } from "react-icons/rx";
import profile from "../assets/images/Profile-start.svg";
import upload from "../assets/images/Upload.svg";
import Header from "./Header-New";
import departments from "../assets/Data/Departments.json";
import primaryResearchAreas from "../assets/Data/PrimaryResearchAreas.json";
import researchInterests from "../assets/Data/ResearchInterests.json";
import { apiService } from "../assets/api/apiService";
const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const user_id = user?.user_id;
  const token = useSelector((state) => state.auth.access_token);
  const userRole = user?.role;
  const navigate = useNavigate();
   const location = useLocation();
  const [profileImage, setProfileImage] = useState(profile);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    role: "",
    department: "",
    job_title: "",
    organization_name: user?.organization_name,
    primary_research_area: "",
    technical_skills: "",
    research_interests: "",
  });
  //const [userData, setUserData] = useState({});
  const isUser = userRole === "User"; // Check if the role is 'User'
  const disableIfUserRole = userRole === "User";
  // Fetch user details on component mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await apiService.fetchUserDetails(user_id, token);
        const userProfile = response.data.user_profile;

        setFormData(userProfile);
        
        // Check if profile_picture_url is available and set profileImage accordingly
        if (userProfile.profile_picture_url) {
          setProfileImage(userProfile.profile_picture_url);
        } else {
          setProfileImage(profile);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    if (user_id) {
      fetchUserDetails();
    }
  }, [user_id, token]);
  
  // Handle image upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await apiService.imageUpdate(user_id, token, formData);
        
        // Dispatch the updateProfilePicture action to update Redux state
        if (response.data.url) {
          dispatch(updateProfilePicture(response.data.url));
        }
      } catch (error) {
        console.error("Error uploading profile picture:", error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const requestBody = {
        user_id: user_id,
        fullname: formData.fullname,
        department: formData.department,
        new_email: formData.email,
        new_status: "", // Populate if you have a status field or leave empty
        new_role: formData.role,
        new_job_title: formData.job_title,
        new_primary_research_area: formData.primary_research_area,
        new_organization_name: formData.organization_name,
        new_technical_skills: Array.isArray(formData.technical_skills)
          ? formData.technical_skills
          : formData.technical_skills.split(",").map((skill) => skill.trim()),
        new_research_interests: Array.isArray(formData.research_interests)
          ? formData.research_interests
          : formData.research_interests
              .split(",")
              .map((interest) => interest.trim()),
      };

      const response = await apiService.saveDetails(token, requestBody);

      // Check for response status and navigate if successful
      if (response.status === 200) {
        navigate("/admin/users");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };
  const handleNavigateHome = () => {
    navigate("/");
  };

  return (
    <>
      {isUser && <Header />}
      <div className="home-nav" >
      <div className="home-path" style={isUser ? {} : { display: "none" }}>

      {location.pathname.startsWith(`/users/profile/${user_id}`) && (
              <span
                onClick={handleNavigateHome}
                style={{
                  display:"flex",
                  marginLeft: "10px",
                  textDecoration: "none",
                  fontWeight: "bold",
                  cursor: "pointer",
                  color: "#007bff",
                }}
              >
                 <RxHome size={20} color="#007bff;" className="nav-icon" />
                
                Home
              </span>
            )}
      </div>
        </div>
      <div className="profile-container">
        {/* Render Header if the user role is User */}

        <div className="profile-body">
          {/* Form Section */}
          <form className="profile-form" onSubmit={handleSave}>
            {/* Basic Details */}
            <div className="form-section">
              <h3>Basic Details</h3>
              <div className="form-row">
                <div className="form-row-item">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullname"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    disabled={disableIfUserRole}
                    // style={{ borderColor: errors.fullname ? 'red' : '' }}
                  />
                </div>
                <div className="form-row-item">
                  <label>Email ID</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email ID"
                    disabled={disableIfUserRole}
                    // style={{ borderColor: errors.email ? 'red' : '' }}
                  />
                </div>
              </div>
            </div>

            {/* Role & Department */}
            <div className="form-section">
              <h3>Role & Department</h3>
              <div className="form-row">
                <div className="form-row-item">
                  <label>Role</label>
                  <input type="text" value={formData.role} disabled />
                </div>
                <div className="form-row-item">
                  <label>Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="select-box"
                    disabled={disableIfUserRole}
                    // style={{ borderColor: errors.department ? 'red' : '' }}
                  >
                    <option>Select Department</option>
                    {departments.map((dept, index) => (
                      <option key={index} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div className="form-section">
              <h3>Professional Details</h3>
              <div className="form-section-multiplerow">
                <div className="form-row">
                  <div className="form-row-item">
                    <label>Job Title</label>
                    <input
                      type="text"
                      name="job_title"
                      value={formData.job_title}
                      onChange={handleInputChange}
                      placeholder="Enter Job Title"
                      disabled={disableIfUserRole}
                      // style={{ borderColor: errors.job_title ? 'red' : '' }}
                    />
                  </div>
                  <div className="form-row-item">
                    <label>Primary Research Area</label>
                    <select
                      name="primary_research_area"
                      value={formData.primary_research_area}
                      onChange={handleInputChange}
                      disabled={disableIfUserRole}
                      // style={{ borderColor: errors.primary_research_area ? 'red' : '' }}
                    >
                      <option>Select Expertise</option>
                      {primaryResearchAreas.map((area, index) => (
                        <option key={index} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-row-item">
                    <label>Organization</label>
                    <select
                      className="org"
                      name="organization_name"
                      value={formData.organization_name}
                      onChange={handleInputChange}
                      // style={{ borderColor: errors.organization_name ? 'red' : '' }}
                      disabled
                    >
                      <option>Select Organization</option>
                      <option value="Infer">Infer</option>
                      <option value="NIH">NIH</option>
                      <option value="Johnson & Johnson">
                        Johnson & Johnson
                      </option>
                      {/* Add more options here if needed */}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills & Research Interests */}
            <div className="form-section">
              <h3>Skills & User Interests</h3>
              <div className="form-row">
                <div className="form-row-item">
                  <label>Technical Skills</label>
                  <input
                    type="text"
                    name="technical_skills"
                    value={formData.technical_skills}
                    onChange={handleInputChange}
                    placeholder="Enter relevant software, lab techniques etc"
                    disabled={disableIfUserRole}
                    // style={{ borderColor: errors.technical_skills ? 'red' : '' }}
                  />
                </div>
                <div className="form-row-item">
                  <label>Research Interests</label>
                  <select
                    name="research_interests"
                    value={formData.research_interests}
                    onChange={handleInputChange}
                    disabled={disableIfUserRole}
                    // style={{ borderColor: errors.research_interests ? 'red' : '' }}
                  >
                    <option>Select Research Interests</option>
                    {researchInterests.map((interest, index) => (
                      <option key={index} value={interest}>
                        {interest}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="submit"
                className="create-button"
                disabled={disableIfUserRole}
                style={{
                  opacity: disableIfUserRole ? 0.5 : 1,
                  cursor: disableIfUserRole ? "not-allowed" : "pointer",
                  display: disableIfUserRole ? "none" : "undefined",
                }}
              >
                Save
              </button>
            </div>
          </form>

          {/* Profile Picture Section */}
          <div className="profile-section">
            <div className="profile-picture">
              <img src={profileImage} alt="Profile" />
            </div>

            <div className="profile-upload-button">
              <img
                className="profile-section-img"
                src={upload}
                alt="Upload Icon"
              />
              <label className="upload-button">
                Upload picture
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }} // Hidden file input
                  onChange={handleImageChange} // Handle the image selection
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
