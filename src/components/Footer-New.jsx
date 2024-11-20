import React from "react";
import { useSelector } from "react-redux"; // To check logged-in status
import { useLocation } from "react-router-dom"; // To get the current path
import "./Footer-New.css";

const Footer = () => {
  const isLoggedIn = useSelector((state) => state.auth?.isLoggedIn); // Assuming auth reducer has isLoggedIn
  const location = useLocation(); // Get the current location

  return (
    <div
      className="footer"
      style={{
        // position: location.pathname === "/" ? "absolute" : "static",
        marginTop:"auto",
        // bottom: isLoggedIn && location.pathname === "/" ? 0 : 0,
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
