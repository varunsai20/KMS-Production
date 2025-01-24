import React from "react";

import "./Footer-New.css";
import { FaXTwitter } from "react-icons/fa6";
import { FaFacebookF, FaLinkedinIn } from "react-icons/fa";
import { FaInstagramSquare } from "react-icons/fa";
import { SlGlobe } from "react-icons/sl";
const Footer = () => {
  return (
    <>
    <div className="socials" style={{marginTop:"auto"}}>
        <div className="social-icons">
          <a href="https://x.com/IncInfer" target="_blank" rel="noreferrer">
            <FaXTwitter size={30} color="black" />
          </a>

          <a
            href="https://www.facebook.com/infersol"
            target="_blank"
            rel="noreferrer"
          >
            <FaFacebookF size={30} color="black" />
          </a>
          <a
            href="https://www.linkedin.com/company/infer-solutions/"
            target="_blank"
            rel="noreferrer"
          >
            <FaLinkedinIn size={30} color="black" />
          </a>
          <a
            href="https://www.instagram.com/infersol/"
            target="_blank"
            rel="noreferrer"
          >
            <FaInstagramSquare size={32} color="black" />
          </a>
          <a href="https://www.infersol.com/" target="_blank" rel="noreferrer">
            <SlGlobe size={27} color="black" />
          </a>
        </div>
      </div>
    <div
      className="footer"
      style={{
        // marginTop: "auto",
        width: "100%", // Ensure the footer takes up the full width
        textAlign: "center", // Center the content
      }}
    >
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
