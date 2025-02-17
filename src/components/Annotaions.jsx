import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { useLocation, useNavigate } from "react-router-dom";
import "./Annotations.css";

const Annotation = ({
  openAnnotate,
  openNotes,
  annotateData,
  source: passedSource,
  annotateHeight,
  isTabletView
}) => {
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

    return annotationEntries.flatMap(([pmid, categories]) => {
      const isExpanded = expandedPmids[pmid] || false; // Track expanded state for each PMID

      const rows = [];

      // Render the first row before expanding
      const sortedCategories = Object.entries(categories).sort(
        ([, a], [, b]) => (b.annotation_score || 0) - (a.annotation_score || 0)
      );

      sortedCategories.forEach(([category, values], index) => {
        if (category === "annotation_score") return;

        const categoryKey = `${pmid}-${category}`;
        const annotationScore = values.annotation_score
          ? `${values.annotation_score.toFixed(2)}%`
          : "";
        const categoryTexts = Object.entries(values)
          .filter(([key]) => key !== "annotation_score")
          .map(([key]) => key)
          .join(", ");

        const isTextExpanded = expandedTexts[categoryKey];
        const displayText = isTextExpanded
          ? categoryTexts
          : categoryTexts.slice(0, 50); // Show up to 50 characters when collapsed

        // Show the first row before expanding or all rows when expanded
        if (index === 0 || isExpanded) {
          rows.push(
            <tr
              className="search-table-body"
              key={categoryKey}
              style={{
                display: index === 0 || isExpanded ? "table-row" : "none",
              }}
            >
              <td style={{ paddingLeft: index === 0 ? 0 : 30,}} >
                <div style={{ display: "flex", alignItems: "center" }}>
                  {index === 0 && (
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
                  )}
                  {index === 0 && (
                    <a
                      style={{
                        color: "#1a82ff",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                      onClick={() => handleNavigate(pmid)}
                    >
                      {pmid}
                    </a>
                  )}
                </div>
              </td>
              <td>{annotationScore}</td>
              <td>{capitalizeFirstLetter(category)}</td>
              <td>
                {displayText}
                {categoryTexts.length > 50 && (
                  <span
                    style={{
                      color: "blue",
                      cursor: "pointer",
                      marginLeft: "5px",
                    }}
                    onClick={() => toggleExpandText(categoryKey)}
                  >
                    {isTextExpanded ? "" : "..."}
                  </span>
                )}
              </td>
            </tr>
          );
        }
      });

      return rows;
    });
  };

  return (
    <div className="search-tables" style={{}}>
      <div
      className="search-tables-header">
        <p style={{ textAlign: "start" }}>Annotations</p>
      </div>
      {annotateData &&
      Object.keys(annotateData).some(
        (key) => annotateData[key] && Object.keys(annotateData[key]).length > 0
      ) ? (
        <div
          className="search-Annotate-tables"
          style={{
            height: openNotes && openAnnotate ? `${annotateHeight - 7}vh` : "",
            maxHeight: openAnnotate && openNotes ? "33vh" : "48vh",
            overflowY: "auto",
            overflowX: "auto",
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
