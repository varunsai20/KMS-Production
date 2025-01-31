import React, { useState, useEffect } from "react";
import "./Footer-New.css";
import { FaXTwitter } from "react-icons/fa6";
import { FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { FaInstagramSquare } from "react-icons/fa";
import { SlGlobe } from "react-icons/sl";

const Footer = () => {
  const [isTabletView, setIsTabletView] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      setIsMobileView(width < 600); // Mobile view: < 600px
      setIsTabletView(width >= 600 && width < 769); // Tablet view: 600px - 768px
    };

    handleResize(); // Initial setup
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Define sizes dynamically
  const iconSize = isMobileView ? 20 : 30;
  const globeSize = isMobileView ? 17 : 27;
  const anchorHeight = isMobileView?`${iconSize}px`:""; // Set height dynamically

  return (
    <>
      <div className="socials" style={{ marginTop: "auto" }}>
        <div className="social-icons">
          <a href="https://x.com/IncInfer" target="_blank" rel="noreferrer" style={{ height: anchorHeight }}>
            <FaXTwitter size={iconSize} color="black" />
          </a>

          <a href="https://www.facebook.com/infersol" target="_blank" rel="noreferrer" style={{ height: anchorHeight }}>
            <FaFacebookF size={iconSize} color="black" />
          </a>

          <a href="https://www.linkedin.com/company/infer-solutions/" target="_blank" rel="noreferrer" style={{ height: anchorHeight }}>
            <FaLinkedinIn size={iconSize} color="black" />
          </a>

          <a href="https://www.instagram.com/infersol/" target="_blank" rel="noreferrer" style={{ height: anchorHeight }}>
            <FaInstagramSquare size={iconSize} color="black" />
          </a>

          <a href="https://www.infersol.com/" target="_blank" rel="noreferrer" style={{ height: anchorHeight }}>
            <SlGlobe size={globeSize} color="black" />
          </a>
        </div>
      </div>

      <div className="footer" style={{ width: "100%", textAlign: "center" }}>
        <p className="footer-trademark-content">
          Copyright © 2024,{" "}
          <a href="https://www.infersol.com/" target="_blank" rel="noreferrer">
            Infer Solutions, Inc.
          </a>{" "}
          All Rights Reserved.
        </p>
      </div>
    </>
  );
};

export default Footer;
