import React, { useEffect, useState, useRef } from "react";
import "./Citations.css";
import { IoCloseOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import Loading from "./Loading";
import Copy from "../assets/images/Copy.svg";
import Download from "../assets/images/Download.svg";
import { apiService } from "../assets/api/apiService";

const Citations = ({ handleCloseCitations, uploadedFile, handleCitations }) => {
  const [citationData, setCitationData] = useState({});
  const token = useSelector((state) => state.auth.access_token);
  const [citationLoading, setCitationLoading] = useState(false);

  const hasGenerated = useRef(false);

  const handleGenerate = async () => {
    if (!uploadedFile || !handleCitations || hasGenerated.current) return;

    setCitationLoading(true);
    const formData = new FormData();
    formData.append("file", uploadedFile);

    try {
      const response = await apiService.generateCitations(formData, token);
      if (response.status === 200) {
        const result = response.data;
        if (result && typeof result === "object") {
          setCitationData(result); // Directly store the returned object
        } else {
          console.error("Invalid response format");
        }
      } else {
        console.error("Failed to generate citations:", response.statusText);
      }
    } catch (error) {
      console.error("Error generating citations:", error);
    } finally {
      setCitationLoading(false);
      hasGenerated.current = true;
    }
  };

  useEffect(() => {
    if (uploadedFile && handleCitations) {
      handleGenerate();
    }
  }, [uploadedFile, handleCitations]);

  return (
    <>
      <div className="citation-container">
        {citationLoading && <Loading />}
        <div className="citation-annotations">
          {Object.entries(citationData).map(([style, citation]) => (
            <div key={style} className="citation-section">
              <div className="citations-head-buttons">
                <h3>{style}:</h3>
                <div className="action-icons">
                  <img
                    src={Copy}
                    title="Copy"
                    alt="Copy-icon"
                    style={{ width: "20px", cursor: "pointer" }}
                    className="copy-button"
                    onClick={() => navigator.clipboard.writeText(citation)}
                  />
                  <img
                    src={Download}
                    alt="DownloadIcon"
                    title={`Download ${style} Citation`}
                    className="download-button"
                    style={{ width: "20px", cursor: "pointer" }}
                    onClick={() => {
                      const blob = new Blob([citation], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${style}-citation.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  />
                </div>
              </div>
              <p>{citation}</p>
            </div>
          ))}
        </div>
      </div>

      <button
        className="citation-close-collection"
        title="Close"
        onClick={handleCloseCitations}
      >
        <IoCloseOutline size={30} color="black" />
      </button>
    </>
  );
};

export default Citations;
