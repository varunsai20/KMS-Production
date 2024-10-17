import React from "react";
import { useSelector } from 'react-redux'; // To check logged-in status
import "./Footer-New.css";

const Footer = () => {
  const isLoggedIn = useSelector(state => state.auth?.isLoggedIn); // Assuming auth reducer has isLoggedIn

  return (
    <div
      className="footer"
      style={{
        position: isLoggedIn ? "absolute" : "static",
        bottom: isLoggedIn ? 0 : "auto",
        width: "100%", // Ensure the footer takes up the full width
        textAlign: "center", // Center the content
      }}
    >
      <p className="footer-trademark-content">
        Copyright © 2024, Infer Solutions, Inc. All Rights Reserved.
      </p>
    </div>
  );
};

export default Footer;
