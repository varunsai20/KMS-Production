import React, { useState, useRef } from "react";
import "./Citations.css";
import uploadLogo from "../assets/images/uploadDocx.svg";
import { IoCloseOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import Loading from "./Loading";

const Citations = ({ handleCloseCitations }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [citationData, setCitationData] = useState([]);
  const token = useSelector((state) => state.auth.access_token);
  const [citationLoading, setCitationLoading] = useState(false);

  // Ref for the file input element
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click(); // Trigger file input click
  };

  const handleGenerate = async () => {
    if (!uploadedFile) {
      alert("Please upload a file before generating citations.");
      return;
    }
    setCitationLoading(true);
    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      const response = await fetch("http://13.127.207.184:80/core_search/citations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result);
        setCitationData(result);
        setCitationLoading(false);
        console.log("Citation result:", result);
      } else {
        setCitationLoading(false);
        console.error("Failed to generate citations:", response.statusText);
      }
    } catch (error) {
      setCitationLoading(false);
      console.error("Error generating citations:", error);
    }
  };

  return (
    <>
      <div className="citation-container">
        {citationLoading ? <Loading /> : ""}
        <div className="citation-file-upload">
          <h3>Generate Citation</h3>
          <div className="upload-file" onClick={triggerFileUpload}>
            {uploadedFile ? (
              <div className="uploaded-file-info">
                <p>{uploadedFile.name}</p> {/* Display uploaded file name */}
              </div>
            ) : (
              <>
                <img src={uploadLogo} alt="upload-logo" />
                <span>Upload File</span>
              </>
            )}
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              ref={fileInputRef} // Attach ref to input
              style={{ display: "none" }} // Hide the input
            />
          </div>
          <div className="citations-buttons">
            <button
              className="start-new"
              onClick={() => {
                setUploadedFile(null);
                setCitationData([]);
                if (fileInputRef.current) {
                  fileInputRef.current.value = ""; // Reset input value
                }
              }}
            >
              Start New
            </button>
            <button className="generate-button" onClick={handleGenerate}>
              Generate
            </button>
          </div>
        </div>
        <div className="citation-annotations">
          {citationData ? <span>{citationData.citations}</span> : ""}
        </div>
      </div>
      <button className="close-collection" onClick={handleCloseCitations}>
        <IoCloseOutline size={30} color="black" />
      </button>
    </>
  );
};

export default Citations;
