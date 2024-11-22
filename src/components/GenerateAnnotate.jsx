import React, { useState, useEffect, useRef } from "react";
import "./GenerateAnnotate.css";
import uploadLogo from "../assets/images/uploadDocx.svg";
import { IoCloseOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import Annotation from "./DeriveAnnotations";
import Loading from "./Loading";
import { BsFiletypePdf } from "react-icons/bs";
import { BsFiletypeDocx } from "react-icons/bs";   
import { BsFiletypeTxt } from "react-icons/bs";  
const GenerateAnnotate = ({ handleCloseAnnotate }) => {
  const { user } = useSelector((state) => state.auth);
  const token = useSelector((state) => state.auth.access_token);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [annotateData, setAnnotateData] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [annotateLoading, setAnnotateLoading] = useState(false);
  
  // Ref for the file input element
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (annotateLoading) {
      document.body.style.overflow = "hidden"; // Prevent scrolling
    } else {
      document.body.style.overflow = "auto"; // Enable scrolling
    }

    return () => {
      document.body.style.overflow = "auto"; // Cleanup on unmount
    };
  }, [annotateLoading]);

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
      alert("Please upload a file before generating annotations.");
      return;
    }
    setAnnotateLoading(true);
    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      const response = await fetch("http://13.127.207.184:80/core_search/annotate_file", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        setAnnotateData(result);
        setAnnotateLoading(false);
      } else {
        setAnnotateLoading(false);
        console.error("Failed to generate annotations:", response.statusText);
      }
    } catch (error) {
      setAnnotateLoading(false);
      console.error("Error generating annotations:", error);
    }
  };
  const getFileIcon = (filename) => {
    const fileExtension = filename.split(".").pop().toLowerCase();
    switch (fileExtension) {
      case "pdf":
        return <BsFiletypePdf style={{ width: "25px", height: "25px" }} />;
      case "docx":
        return <BsFiletypeDocx style={{ width: "25px", height: "25px" }} />;
      case "txt":
        return <BsFiletypeTxt style={{ width: "25px", height: "25px" }} />;
      default:
        return <span style={{ fontSize: "20px" }}>📄</span>;
    }
  };
  return (
    <>

      <div className="generate-annotate-container">
        {annotateLoading ? <Loading /> : ""}
        <div className="generate-annotate-file-upload">

          <h3>Generate Annotations</h3>
          <div className="upload-file" onClick={triggerFileUpload}>
            {uploadedFile ? (
              <div className="uploaded-file-info">
                {getFileIcon(uploadedFile.name)}
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
          <div className="annotates-buttons">
            <button 
              className="start-new" 
              onClick={() => {
                setUploadedFile(null);
                setAnnotateData([]);
                if (fileInputRef.current) {
                  fileInputRef.current.value = ""; // Reset input value
                }
              }}
            >
              Start New
            </button>
            <button className="generate-button" disabled={!uploadedFile} style={{background:!uploadedFile?"rgba(234, 234, 236, 1)":"",color:!uploadedFile?"rgba(78, 78, 86, 1)":"",cursor:!uploadedFile?"not-allowed":"pointer"}}onClick={handleGenerate}>
  Generate
</button>
          </div>
        </div>
        
        {/* Conditional Rendering for Annotations */}
        <div className="annotate-annotations">
          
            <Annotation annotateData={annotateData} />
          
        </div>
      </div>
      
      <button className="generate-close-collection" onClick={handleCloseAnnotate}>
        <IoCloseOutline size={30} color="black" />
      </button>
    </>
  );
};

export default GenerateAnnotate;
