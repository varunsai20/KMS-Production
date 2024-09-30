// Button.jsx
import React from "react";
import "../styles/variables.css";
import "./Button.css"; // Import the CSS specific to this button
import { CircularProgress } from "@mui/material";

const Button = ({ text, onClick, className, loading }) => {
  return (
    <button
      className={`custom-button ${className}`}
      onClick={onClick}
      disabled={loading}
    >
      {loading ? (
        <CircularProgress color="inherit" size={24} />
      ) : (
        text // Show the text when not loading
      )}
    </button>
  );
};

export default Button;
