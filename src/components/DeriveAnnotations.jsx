import React, { useState, useEffect } from "react";
//import { useLocation } from "react-router-dom";
import "./Annotations.css";
const Annotation = ({
  openAnnotate,
  annotateData,
  searchTerm,
  source: passedSource,
  annotateHeight,
}) => {
  console.log(annotateData);
  //const location = useLocation();
  const [source, setSource] = useState(passedSource || []);

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

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  const renderAnnotations = () => {
    const annotationEntries =
      annotateData && typeof annotateData === "object"
        ? Object.entries(annotateData)
        : [];

    // Sort entries by annotation_score in descending order
    const sortedAnnotationEntries = annotationEntries.sort(
      ([, aValues], [, bValues]) =>
        (bValues.annotation_score || 0) - (aValues.annotation_score || 0)
    );

    return sortedAnnotationEntries.flatMap(([type, values]) => {
      const rows = [];
      const annotationScore = values.annotation_score
        ? `${values.annotation_score.toFixed(2)}%`
        : "N/A";

      // Extract other keys except `annotation_score`
      const otherKeys = Object.entries(values)
        .filter(([key]) => key !== "annotation_score")
        .map(([key, value]) => `${key}: ${value}`)
        .join(", ");

      rows.push(
        <tr className="search-table-body" key={type}>
          <td style={{ width: "25%" }}>{capitalizeFirstLetter(type)}</td>
          <td style={{ width: "20%" }}>{annotationScore}</td>
          <td style={{ width: "65%" }}>{otherKeys}</td>
        </tr>
      );

      return rows;
    });
  };

  return (
    <div
      className="search-tables"
      style={{ height: `${annotateHeight}vh`, border: "none" }}
    >
      {annotateData && Object.keys(annotateData).length > 0 ? (
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
      ) : (
        ""
      )}
      {annotateData && Object.keys(annotateData).length > 0 ? (
        <div className="search-Annotate-tables">
          <table>
            <thead>
              <tr className="search-table-head">
                <th style={{ width: "25%" }}>Values</th>
                <th style={{ width: "20%" }}>Score</th>
                <th style={{ width: "65%" }}>Type</th>
              </tr>
            </thead>
            <tbody>{renderAnnotations()}</tbody>
          </table>
        </div>
      ) : openAnnotate && !annotateData ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          No data to display
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Annotation;
