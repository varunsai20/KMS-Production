import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import './EditResearcher.css';
import departments from "../../assets/Data/Departments.json"
import primaryResearchAreas from "../../assets/Data/PrimaryResearchAreas.json";
import researchInterests from "../../assets/Data/ResearchInterests.json";
import Arrow from "../../assets/images/back-arrow.svg";
const EditResearcher = () => {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const token = useSelector((state) => state.auth.access_token);

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    role: '',
    department: '',
    job_title: '',
    organization_name:user?.organization_name,
    primary_research_area: '',
    technical_skills: '',
    research_interests: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Fetch user details on mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`http://13.127.207.184:80/user/profile/${user_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response)
        setFormData(response.data.user_profile);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    if (user_id) {
      fetchUserDetails();
    }
  }, [user_id, token]);

  // Update form data state on input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Validate form before submission
  // const validateForm = () => {
  //   const newErrors = {};
  //   if (!formData.fullname) newErrors.fullname = 'Full Name is required';
  //   if (!formData.email) newErrors.email = 'Email is required';
  //   if (!formData.role) newErrors.role = 'Role is required';
  //   if (!formData.department) newErrors.department = 'Department is required';
  //   if (!formData.job_title) newErrors.job_title = 'Job Title is required';
  //   if (!formData.organization_name) newErrors.organization_name = 'Organization is required';
  //   if (!formData.primary_research_area || formData.primary_research_area === 'Select Expertise') {
  //     newErrors.primary_research_area = 'Research Area is required';
  //   }
  //   if (!formData.technical_skills) newErrors.technical_skills = 'Technical Skills are required';
  //   if (!formData.research_interests || formData.research_interests === 'Select Research Interests') {
  //     newErrors.research_interests = 'Research Interests are required';
  //   }

  //   const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  //   if (formData.email && !emailPattern.test(formData.email)) {
  //     newErrors.email = 'Invalid email format';
  //   }

  //   setErrors(newErrors);
  //   return Object.keys(newErrors).length === 0;
  // };

  // Handle form submission for editing
  // Handle form submission for editing
  const handleSubmit = async (e) => {
    e.preventDefault();
      try {
        const requestBody = {
          user_id: user_id,
          fullname: formData.fullname,
          department: formData.department,
          new_email: formData.email,
          new_status: "",  // Populate if you have a status field or leave empty
          new_role: formData.role,
          new_job_title: formData.job_title,
          new_primary_research_area: formData.primary_research_area,
          new_organization_name: formData.organization_name,
          new_technical_skills: Array.isArray(formData.technical_skills)
            ? formData.technical_skills
            : formData.technical_skills.split(',').map(skill => skill.trim()),
          new_research_interests: Array.isArray(formData.research_interests)
            ? formData.research_interests
            : formData.research_interests.split(',').map(interest => interest.trim())
        };
  
        const response = await axios.put(
          `http://13.127.207.184:80/admin/edit_user`,
          requestBody,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        // Check for response status and navigate if successful
        if (response.status === 200) {
          navigate('/admin/users');
        }
      } catch (error) {
        console.error('Error updating user:', error);
      }
    
  };
  
  const handleBackClick = () => {
    navigate('/admin/users');
  };

  return (
    <div style={{ margin: '0 2%' }}>
      <div className="edit-researcher-header">
        <button className="back-button" onClick={handleBackClick}>
        <img
                      src={Arrow}
                      style={{ width: "14px" }}
                      alt="arrow-icon"
                    ></img>        </button>
        <h2 style={{ margin: 0 }}>Edit User</h2>
      </div>

      <form className="edit-researcher-form" onSubmit={handleSubmit}>
        {/* Row 1 */}
        <div className='User-Form-Row'>
          <div className='User-Form-Row-Items'>
            <label>Full Name</label>
            <input 
              type="text" 
              name="fullname" 
              value={formData.fullname} 
              onChange={handleInputChange} 
              placeholder="Enter full name" 
              style={{ borderColor: errors.fullname ? 'red' : '' }}
            />
          </div>

          <div className='User-Form-Row-Items'>
            <label>Email ID</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              placeholder="Enter email ID" 
              style={{ borderColor: errors.email ? 'red' : '' }}
            />
          </div>
        </div>

        {/* Row 2 */}
        <div className='User-Form-Row'>
          <div className='User-Form-Row-Items'>
            <label>Role</label>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleInputChange} 
              style={{ borderColor: errors.role ? 'red' : '' }}
            >
              <option>Select Role</option>
              <option>Admin</option>
              <option>User</option>
            </select>
          </div>

          <div className='User-Form-Row-Items'>
            <label>Set Password</label>
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                disabled
                style={{ borderColor: errors.password ? 'red' : '' }}
              />
              <button
                type="button"
                className="show-password-btn"
                
                disabled
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        </div>

        {/* Row 3 */}
        <div className='User-Form-Row'>
        <div className='User-Form-Row-Items'>
            <label>Department</label>
            <select 
              name="department" 
              value={formData.department} 
              onChange={handleInputChange} 
              className="select-box"
              style={{ borderColor: errors.department ? 'red' : '' }}
            >
              <option>Select Department</option>
              {departments.map((dept, index) => (
                <option key={index} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className='User-Form-Row-Items'>
            <label>Job Title</label>
            <input 
              type="text" 
              name="job_title" 
              value={formData.job_title} 
              onChange={handleInputChange} 
              placeholder="Enter Job Title" 
              style={{ borderColor: errors.job_title ? 'red' : '' }}
            />
          </div>
        </div>

        {/* Row 4 */}
        <div className='User-Form-Row'>
        <div className='User-Form-Row-Items'>
  <label>Organization</label>
  <select 
    name="organization_name" 
    value={formData.organization_name} 
    onChange={handleInputChange} 
    style={{ borderColor: errors.organization_name ? 'red' : '' }}
    disabled
  >
    <option>Select Organization</option>
    <option value="Infer">Infer</option>
    <option value="NIH">NIH</option>
    <option value="Johnson & Johnson">Johnson & Johnson</option>
    {/* Add more options here if needed */}
  </select>
</div>


          <div className='User-Form-Row-Items'>
          <label>Primary Research Area</label>
          <select 
            name="primary_research_area" 
            value={formData.primary_research_area} 
            onChange={handleInputChange} 
            style={{ borderColor: errors.primary_research_area ? 'red' : '' }}
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

        {/* Row 5 */}
        <div className='User-Form-Row'>
          <div className='User-Form-Row-Items'>
            <label>Technical Skills</label>
            <input 
              type="text" 
              name="technical_skills" 
              value={formData.technical_skills} 
              onChange={handleInputChange} 
              placeholder="Enter relevant software, lab techniques etc" 
              style={{ borderColor: errors.technical_skills ? 'red' : '' }}
            />
          </div>

          <div className='User-Form-Row-Items'>
          <label>Research Interests</label>
          <select 
            name="research_interests" 
            value={formData.research_interests} 
            onChange={handleInputChange} 
            style={{ borderColor: errors.research_interests ? 'red' : '' }}
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

        {/* Action Buttons */}
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={handleBackClick}>
            Cancel
          </button>
          <button type="submit" className="edit-button">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditResearcher;
