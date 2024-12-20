import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";
import "./Annotations.css";

const Annotation = ({ openAnnotate, annotateData, source: passedSource }) => {
  const [expandedPmids, setExpandedPmids] = useState({});
  const [expandedTexts, setExpandedTexts] = useState({});
  const [source, setSource] = useState(passedSource || []);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the source is available in sessionStorage if not passed as props
    if (!passedSource) {
      const storedSource = sessionStorage.getItem("source");
      if (storedSource) {
        setSource(JSON.parse(storedSource));
      } else {
        console.error("Source not found in sessionStorage or passed as props.");
      }
    } else {
      // Store the passed source in sessionStorage
      sessionStorage.setItem("source", JSON.stringify(passedSource));
    }
  }, [passedSource]);
  useEffect(() => {
    if (openAnnotate) {
      setExpandedTexts({});
    }
  }, [openAnnotate]);

  const toggleExpandPmid = (pmid) => {
    setExpandedPmids((prev) => ({
      ...prev,
      [pmid]: !prev[pmid],
    }));

    if (expandedPmids[pmid]) {
      const updatedTexts = { ...expandedTexts };
      Object.keys(updatedTexts).forEach((key) => {
        if (key.startsWith(`${pmid}-`)) delete updatedTexts[key];
      });
      setExpandedTexts(updatedTexts);
    }
  };
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  const toggleExpandText = (key) => {
    setExpandedTexts((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleNavigate = (articleId) => {
    const article = source.find((entry) => entry.idType === articleId);

    if (article) {
      const type =
        article.source === "BioRxiv"
          ? "bioRxiv_id"
          : article.source === "Public Library of Science (PLOS)"
          ? "plos_id"
          : "pmid";

      navigate(`/article/content/${type}:${articleId}`, {
        state: { annotateData },
      });
    } else {
      console.error(`Article with ID ${articleId} not found in the source.`);
    }
  };

  const renderAnnotations = () => {
    const annotationEntries =
      annotateData && typeof annotateData === "object"
        ? Object.entries(annotateData)
        : [];

    return annotationEntries.map(([pmid, categories]) => {
      const isExpanded = expandedPmids[pmid] || false; // Track expanded state for each PMID

      const rows = [
        // Header Row for the PMID
        <tr key={`${pmid}-header`} className="search-table-header">
          <td colSpan={4} style={{ backgroundColor: "#f5f5f5" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <button onClick={() => toggleExpandPmid(pmid)}>
                {isExpanded ? (
                  <FontAwesomeIcon
                    icon={faCaretDown}
                    style={{ color: "grey", width: "16px" }}
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faCaretRight}
                    style={{ color: "grey", fontSize: "16px" }}
                  />
                )}
              </button>
              <span
                style={{
                  color: "#1a82ff",
                  fontWeight: 600,
                  cursor: "pointer",
                  marginLeft: "10px",
                }}
                onClick={() => handleNavigate(pmid)}
              >
                {pmid}
              </span>
            </div>
          </td>
        </tr>,
      ];

      if (isExpanded) {
        // Display data rows for the expanded PMID
        const sortedCategories = Object.entries(categories).sort(
          ([, a], [, b]) =>
            (b.annotation_score || 0) - (a.annotation_score || 0)
        );

        sortedCategories.forEach(([category, values]) => {
          if (category === "annotation_score") return; // Skip annotation score field

          const categoryKey = `${pmid}-${category}`;
          const isTextExpanded = expandedTexts[categoryKey];

          const annotationScore = values.annotation_score
            ? `${values.annotation_score.toFixed(2)}%`
            : "N/A";

          const categoryTexts = Object.entries(values)
            .filter(([key]) => key !== "annotation_score")
            .map(([key]) => key)
            .join(", ");

          const displayText = isTextExpanded
            ? categoryTexts
            : categoryTexts.slice(0, 50);

          rows.push(
            <tr key={categoryKey} className="search-table-body">
              <td style={{ paddingLeft: "30px" }}>
                {capitalizeFirstLetter(category)}
              </td>
              <td>{annotationScore}</td>
              <td>{displayText}</td>
              <td>
                {categoryTexts.length > 50 && (
                  <span
                    style={{
                      color: "blue",
                      cursor: "pointer",
                      marginLeft: "5px",
                    }}
                    onClick={() => toggleExpandText(categoryKey)}
                  >
                    {isTextExpanded ? "Less" : "... More"}
                  </span>
                )}
              </td>
            </tr>
          );
        });
      }

      return rows;
    });
  };

  return (
    <div className="search-tables">
      <div
        style={{
          background:
            "linear-gradient(90deg,rgba(254, 118, 117, 0.7) -21.07%,rgba(204, 129, 185, 0.7) 37.85%,rgba(26, 168, 210, 0.7) 97.5%,rgba(76, 210, 217, 0.7) 151.24%)",
          borderRadius: "16px 16px 0 0",
          padding: "5px",
        }}
      >
        <p style={{ textAlign: "start" }}>Annotations</p>
      </div>
      {annotateData &&
      Object.keys(annotateData).some(
        (key) => annotateData[key] && Object.keys(annotateData[key]).length > 0
      ) ? (
        <div
          className="search-Annotate-tables"
          style={{
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          <table>
            <thead>
              <tr className="search-table-head">
                <th style={{ width: "23%" }}>ID</th>
                <th style={{ width: "12%" }}>Score</th>
                <th style={{ width: "20%" }}>Type</th>
                <th style={{ width: "40%" }}>Text</th>
              </tr>
            </thead>
            <tbody>{renderAnnotations()}</tbody>
          </table>
        </div>
      ) : (
        <div
          style={{ textAlign: "center", fontSize: "15px", marginTop: "20px" }}
        >
          No data to display
        </div>
      )}
    </div>
  );
};

export default Annotation;
