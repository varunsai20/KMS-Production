import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateResearcher.css'; // Add CSS for your design

const CreateResearcher = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/admin/users'); // Go back to the researchers list
  };

  return (
    <div style={{ margin: '0 2%' }}>
      <div className="create-researcher-header">
        <button className="back-button" onClick={handleBackClick}>
          ←
        </button>
        <h2 style={{ margin: 0 }}>Create User</h2>
      </div>

      <form className="create-researcher-form">
        {/* Row 1 */}
        <div className='User-Form-Row'>
          <div className='User-Form-Row-Items'>
            <label>Full Name</label>
            <input type="text" placeholder="Enter full name" />
          </div>

          <div className='User-Form-Row-Items'>
            <label>Email ID</label>
            <input type="email" placeholder="Enter email ID" />
          </div>
        </div>

        {/* Row 2 */}
        <div className='User-Form-Row'>
          <div className='User-Form-Row-Items'>
          <label>Department</label>
            <select>
              <option>Select Department</option>
              <option>IT</option>
              <option>HR</option>
            </select>
          </div>

          <div className='User-Form-Row-Items'>
            <label>Job Title</label>
            <input type="text" placeholder="Enter Job Title"  />
          </div>
        </div>

        {/* Row 3 */}
        <div className='User-Form-Row'>
          <div className='User-Form-Row-Items'>
            <label>Organization</label>
            <input type="text" placeholder="Enter organization name"  />
          </div>

          <div className='User-Form-Row-Items'>
            <label>Primary Research Area</label>
            <select>
              <option>Select Expertise</option>
              <option>DNA</option>
              <option>Cancer</option>
            </select>
          </div>
        </div>
        {/* Row 4 */}
        <div className='User-Form-Row'>
          <div className='User-Form-Row-Items'>
            <label>Technical Skills</label>
            <input type="text" placeholder="Enter relevant software, lab techniques etc"  />
          </div>

          <div className='User-Form-Row-Items'>
            <label>Research Interests</label>
            <select>
              <option>Select Research Interests</option>
              <option>Gene</option>
              <option>Cell Biology</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={handleBackClick}>
            Cancel
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
