import React, { useState } from "react";
import "./Citations.css";
import uploadLogo from "../assets/images/uploadDocx.svg";
import { IoCloseOutline } from "react-icons/io5";

const Citations = ({ handleCloseCitations }) => {
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
      <div className="citation-container">
        <div className="citation-file-upload">
          <h3>Generate Citation</h3>
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
          <div className="citations-buttons">
            <button className="start-new">Start New</button>
            <button className="generate-button">Generate</button>
          </div>
        </div>
        <div className="citation-annotations"></div>
      </div>
      <button className="close-collection" onClick={handleCloseCitations}>
        <IoCloseOutline size={30} color="black" />
      </button>
    </>
  );
};

export default Citations;
