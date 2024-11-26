import React, { useState, useEffect } from "react";
import { Offline, Online } from "react-detect-offline";
import { MdOutlineWifiOff } from "react-icons/md";
import { IoWifiSharp } from "react-icons/io5";

const ErrorBoundary = () => {
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setShowOnlineMessage(true);
      setTimeout(() => setShowOnlineMessage(false), 3000);
    };

    // Listen for the 'online' event
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <>
      <Online>
        {showOnlineMessage && (
          <div style={styles.onlineBanner}>
            <IoWifiSharp style={styles.icon} />
            <span style={styles.text}>You're back online!</span>
          </div>
        )}
      </Online>
      <Offline>
        <div style={styles.offlineBanner}>
          <MdOutlineWifiOff style={styles.icon} />
          <span style={styles.text}>
            Internet connection lost. Please check your connection.
          </span>
        </div>
      </Offline>
    </>
  );
};

const styles = {
  onlineBanner: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: "#4caf50",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 0",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    fontFamily: "manrope",
    transition: "opacity 0.5s ease-in-out",
  },
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
    transition: "opacity 0.5s ease-in-out",
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
