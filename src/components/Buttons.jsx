import React from "react";
import "../styles/variables.css";
import "./Button.css"; // Import the CSS specific to this button

const Button = ({ text, onClick, className, loading }) => {
  return (
    <button
      className={`custom-button ${className}`}
      onClick={onClick}
      disabled={loading}
    >
      {loading ? <div class="searchbar-loader"></div> : text}
    </button>
  );
};

export default Button;
