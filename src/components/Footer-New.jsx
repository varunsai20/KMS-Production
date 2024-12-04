import React from "react";

import "./Footer-New.css";

const Footer = () => {
  return (
    <div
      className="footer"
      style={{
        marginTop: "auto",
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
