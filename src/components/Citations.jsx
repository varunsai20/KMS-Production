import React, { useState, useRef } from "react";
import "./Citations.css";
import uploadLogo from "../assets/images/uploadDocx.svg";
import { IoCloseOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import Loading from "./Loading";
import ReactMarkdown from "react-markdown";
import Copy from "../assets/images/Copy.svg";
import Download from "../assets/images/Download.svg";
import pdfICon from "../assets/images/pdf.png";
import docxIcon from "../assets/images/docx-file.png";   
import txtIcon from "../assets/images/txt-file.png";  

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
      const response = await fetch("https://inferai.ai/api/core_search/citations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Replace YOUR_TOKEN_HERE with actual token
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setCitationData(result.citations); // Assuming the API returns { "citations": {...} }
      } else {
        console.error("Failed to generate citations:", response.statusText);
      }
    } catch (error) {
      console.error("Error generating citations:", error);
    } finally {
      setCitationLoading(false);
    }
  };
  const getFileIcon = (filename) => {
    const fileExtension = filename.split(".").pop().toLowerCase();
    switch (fileExtension) {
      case "pdf":
        return <img src={pdfICon} alt-="pdf-icon" style={{ width: "25px", height: "25px" }} />;
      case "docx":
        return <img src={docxIcon} alt-="pdf-icon" style={{ width: "25px", height: "25px" }} />;
      case "txt":
        return <img src={txtIcon} alt-="pdf-icon" style={{ width: "25px", height: "25px" }} />;
      default:
        return <span style={{ fontSize: "20px" }}>📄</span>;
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
            <button className="generate-button" disabled={!uploadedFile} style={{background:!uploadedFile?"rgba(234, 234, 236, 1)":"",color:!uploadedFile?"rgba(78, 78, 86, 1)":"",cursor:!uploadedFile?"not-allowed":"pointer"}}onClick={handleGenerate}>
  Generate
</button>
          </div>
        </div>
        <div className="citation-annotations">
      {Object.entries(citationData).map(([type, value]) => (
        <div key={type} className="citation-section">
          <div className="citations-head-buttons">
          <h3>{type}:</h3>
          <div className="action-icons">
            <img
            src={Copy}
            title="Copy"
            alt="Copy-icon"
            style={{width:"20px",cursor:"pointer"}}
              className="copy-button"
              onClick={() => navigator.clipboard.writeText(value)}
            >

            </img>
            <img
            src={Download}
            alt="DownloadIcon"
            title="Download Citation"
              className="download-button"
              style={{width:"20px",cursor:"pointer"}}
              onClick={() => {
                const blob = new Blob([value], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${type}-citation.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >

            </img>
          </div>
          </div>
<ReactMarkdown>{value}</ReactMarkdown>          
        </div>
      ))}
    </div>        </div>

      <button className="citation-close-collection" title="Close" onClick={handleCloseCitations}>
        <IoCloseOutline size={30} color="black" />
      </button>
    </>
  );
};

export default Citations;