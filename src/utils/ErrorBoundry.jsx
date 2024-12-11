import React from "react";
import { MdOutlineWifiOff } from "react-icons/md";
//import { IoWifiSharp } from "react-icons/io5";

const ErrorBoundary = ({ showError, onClose }) => {
  if (!showError) return null;

  return (
    <div style={styles.offlineBanner} onClick={onClose}>
      <MdOutlineWifiOff style={styles.icon} />
      <span style={styles.text}>
        Network connection lost. Please check your connection.
      </span>
    </div>
  );
};

const styles = {
  offlineBanner: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "#f44336",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 0",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    fontFamily: "manrope",
    cursor: "pointer",
  },
  icon: {
    marginRight: "10px",
    fontSize: "24px",
  },
  text: {
    fontSize: "16px",
  },
};

export default ErrorBoundary;
