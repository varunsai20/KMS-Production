import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import './CreateResearcher.css';
import { useSelector } from 'react-redux';
import axios from 'axios';
import departments from "../../assets/Data/Departments.json"
import primaryResearchAreas from "../../assets/Data/PrimaryResearchAreas.json";
import researchInterests from "../../assets/Data/ResearchInterests.json";
import Arrow from "../../assets/images/back-arrow.svg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAsterisk } from '@fortawesome/free-solid-svg-icons';
const CreateResearcher = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const user_id = user?.user_id;
  const token = useSelector((state) => state.auth.access_token);

  // Define initial form state
  const initialFormData = {
    fullname: '',
    email: '',
    role: '',
    password: '',
    department: '',
    job_title: '',
    organization_name: user?.organization_name,
    primary_research_area: '',
    technical_skills: '',
    research_interests: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleBackClick = () => {
    navigate('/admin/users');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullname) newErrors.fullname = 'Full Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.password || formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    if (!formData.department) newErrors.department = 'Department is required';
    // if (!formData.job_title) newErrors.job_title = 'Job Title is required';
    if (!formData.organization_name) newErrors.organization_name = 'Organization is required';
    if (!formData.primary_research_area || formData.primary_research_area === 'Select Expertise') {
      newErrors.primary_research_area = 'Research Area is required';
    }
    // if (!formData.technical_skills) newErrors.technical_skills = 'Technical Skills are required';
    if (!formData.research_interests || formData.research_interests === 'Select Research Interests') {
      newErrors.research_interests = 'Research Interests are required';
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (formData.email && !emailPattern.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const apiData = {
        ...formData,
        technical_skills: formData.technical_skills.split(',').map(skill => skill.trim()),
        research_interests: formData.research_interests.split(',').map(interest => interest.trim()),
      };

      try {
        const response = await axios.post(
          `http://13.127.207.184:8081/admin/create-user/${user_id}`,
          apiData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 201) {
          navigate('/admin/users');
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          setErrors({
            ...errors,
            form: error.response.data.msg,
          });
        } else {
          console.error('Error creating user:', error);
        }
      }
    }
  };

  // Reset form to initial state
  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
  };
    
  return (
    <div style={{ margin: '0 2%' }}>
      <div className="create-researcher-header">
        <div className="back-button" onClick={handleBackClick}>
        <img
                      src={Arrow}
                      style={{ width: "14px" }}
                      alt="arrow-icon"
                    ></img>
        </div>
        <h2 style={{ margin: 0 }}>Add User</h2>
      </div>

      <form className="create-researcher-form" onSubmit={handleSubmit}>
        {/* Row 1 */}
        <div className='User-Form-Row'>
          <div className='User-Form-Row-Items'>
            <div style={{display:"flex",gap:"5px"}}>

            <label>Full Name</label>
            <FontAwesomeIcon icon={faAsterisk} style={{fontSize:"10px",color:" red"}}/>
            </div>
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
            <div style={{display:"flex",gap:"5px"}}><label>Email ID</label>
            <FontAwesomeIcon icon={faAsterisk} style={{fontSize:"10px",color:" red"}}/>

              </div>
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

        {/* Row 2 (New Role and Password Row) */}
        <div className='User-Form-Row'>
          <div className='User-Form-Row-Items'>
          <div style={{display:"flex",gap:"5px"}}>
            <label>Role</label>
            <FontAwesomeIcon icon={faAsterisk} style={{fontSize:"10px",color:" red"}}/>
            </div>
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
          <div style={{display:"flex",gap:"5px"}}>
            <label>Set Password</label>
            <FontAwesomeIcon icon={faAsterisk} style={{fontSize:"10px",color:" red"}}/>
    </div>
            <div className="password-field" style={{ borderColor: errors.password ? 'red' : '' }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                
              />
              <button
                type="button"
                className="show-password-btn"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        </div>

        {/* Row 3 */}
        <div className='User-Form-Row'>
        <div className='User-Form-Row-Items'>
        <div style={{display:"flex",gap:"5px"}}>
            <label>Department</label>
            <FontAwesomeIcon icon={faAsterisk} style={{fontSize:"10px",color:" red"}}/>
</div>
            <select 
              name="department" 
              value={formData.department} 
              onChange={handleInputChange} 
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
        <div style={{display:"flex",gap:"5px"}}>
  <label>Organization</label>
  <FontAwesomeIcon icon={faAsterisk} style={{fontSize:"10px",color:" red"}}/>
</div>
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
  </select>
</div>


          <div className='User-Form-Row-Items'>
          <div style={{display:"flex",gap:"5px"}}>
          <label>Primary Research Area</label>
          <FontAwesomeIcon icon={faAsterisk} style={{fontSize:"10px",color:" red"}}/>
</div>
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
          <div style={{display:"flex",gap:"5px"}}>
          <label>Research Interests</label>
          <FontAwesomeIcon icon={faAsterisk} style={{fontSize:"10px",color:" red"}}/>
            </div>
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
        {errors.form && <p className="error-message" style={{color:"red",margin:"0",gap:"0"}}>{errors.form}</p>}

        {/* Action Buttons */}
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={handleReset}>
            Reset
          </button>
          <button type="submit" className="create-button">
            Create
          </button>
        </div>
      </form>

    </div>
  );
};

export default CreateResearcher;
