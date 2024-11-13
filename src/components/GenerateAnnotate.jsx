import React, { useState } from "react";
import "./GenerateAnnotate.css";
import uploadLogo from "../assets/images/uploadDocx.svg";
import { IoCloseOutline } from "react-icons/io5";

const GenerateAnnotate = ({ handleCloseAnnotate }) => {
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const triggerFileUpload = () => {
    document.getElementById("file-upload").click();
  };

  return (
    <>
      <div className="annotate-container">
        <div className="annotate-file-upload">
          <h3>Generate Annotations</h3>
          <div className="upload-file" onClick={triggerFileUpload}>
            <img src={uploadLogo} alt="upload-logo" />
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              style={{ display: "none" }} // Hide the input
            />
            <span>Upload File</span>
          </div>
          <div className="annotates-buttons">
            <button className="start-new">Start New</button>
            <button className="generate-button">Generate</button>
          </div>
        </div>
        <div className="annotate-annotations"></div>
      </div>
      <button className="close-collection" onClick={handleCloseAnnotate}>
        <IoCloseOutline size={30} color="black" />
      </button>
    </>
  );
};

export default GenerateAnnotate;
