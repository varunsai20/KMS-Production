import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateResearcher.css'; // Add CSS for your design

const CreateResearcher = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/admin/researchers'); // Go back to the researchers list
  };

  return (
    <div style={{ margin: '2%' }}>
      <div className="create-researcher-header">
        <button className="back-button" onClick={handleBackClick}>
          ←
        </button>
        <h2>Create Researcher</h2>
      </div>
      <form className="create-researcher-form">
        <label>Full Name</label>
        <input type="text" placeholder="Enter full name" />

        <label>Email ID</label>
        <input type="email" placeholder="Enter email ID" />

        <label>Contact</label>
        <input type="text" placeholder="Enter contact" />

        <label>Role</label>
        <input type="text" value="Researcher" disabled />

        <label>Department</label>
        <select>
          <option>Select Department</option>
          <option>IT</option>
          <option>HR</option>
        </select>

        <label>Area of Expertise</label>
        <select>
          <option>Select Expertise</option>
          <option>Software Development</option>
          <option>Data Science</option>
        </select>

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
