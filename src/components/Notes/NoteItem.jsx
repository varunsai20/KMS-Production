import React, { useState, useRef, useEffect } from "react";
import "./NoteItem.css";
import { RxDotsHorizontal } from "react-icons/rx";
import { RxOpenInNewWindow } from "react-icons/rx";
import { RiDeleteBin6Line } from "react-icons/ri";
import { GoMail } from "react-icons/go";
import { useSelector } from "react-redux";
import axios from "axios";
import { showSuccessToast, showErrorToast } from "../../utils/toastHelper";

const NoteItem = ({
  note,
  onEdit,
  onDelete,
  isOpenNotes,
  minimalView,
  customStyles,
  fiterText,
  isMobileView,
  setFilterText,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false); // Track confirmation popup visibility
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const menuRef = useRef(null); // Reference to the popup menu
  const { user } = useSelector((state) => state.auth);
  const user_id = user?.user_id;
  const token = useSelector((state) => state.auth.access_token);

  const handleEmailClick = (e) => {
    e.stopPropagation(); // Prevent triggering onEdit
    setIsEmailModalOpen(true);
  };

  const handleCloseEmailModal = () => {
    setIsEmailModalOpen(false);
    setEmail(""); // Reset email input when modal is closed
  };

  // Email sending logic
  const handleSendEmail = async () => {
    const requestData = {
      user_id: user_id,
      note_id: note.note_id,
      email: email,
    };

    try {
      const response = await axios.post(
        "https://inferai.ai/api/notes/sharenotes",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // "ngrok-skip-browser-warning": true,
          },
        }
      );
      // apiService.sendEmail(requestData, token);

      if (response.status === 200) {
        showSuccessToast("Email sent successfully");
        handleCloseEmailModal();
      } else {
        showErrorToast("Failed to send email:");
        console.error("Failed to send email:", response);
      }
    } catch (error) {
      showErrorToast("Error sending email:");
      console.error("Error sending email:", error);
    }
  };

  // Handle clicks outside the popup menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Handle opening the confirmation popup
  const initiateDelete = (e) => {
    e.stopPropagation(); // Prevent triggering onEdit
    setIsMenuOpen(false); // Close the menu
    setShowConfirmDelete(true); // Show confirmation popup
  };

  // Handle confirming the deletion
  const confirmDelete = (e) => {
    e.stopPropagation();
    onDelete(note.note_id);
    setShowConfirmDelete(false);
  };
  // Handle cancelling the deletion
  const cancelDelete = (e) => {
    e.stopPropagation();
    setShowConfirmDelete(false);
  };
  // Handle opening the note
  const handleOpen = () => {
    onEdit(note);
    setIsMenuOpen(false);
  };
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevents default form submission
      handleSendEmail();
    }
  };

  return (
    <div
      className="NoteItem"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => !minimalView && onEdit(note)}
      style={{ ...customStyles }}
    >
      <div
        className="title-header"
        style={{
          display: "flex",
          flexDirection:isMobileView&&"column",
          justifyContent: "space-between",
          alignItems:isMobileView?"left": "center",
        }}
      >
        <p id="title" style={{ fontWeight: "bold", margin: 0 }}>
          {note.title.length > 15
            ? note.title.substring(0, 20) + "..."
            : note.title}
        </p>
        {isHovered ? (
          <button
            className="menu-button"
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering onEdit
              setIsMenuOpen(!isMenuOpen);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0",
            }}
            aria-label="Options"
          >
            <RxDotsHorizontal size={20} />
          </button>
        ) : (
          <p id="date" style={{ fontSize: "0.9em", color: "#555", margin: 0 }}>
            {note.last_updated_at}
          </p>
        )}
      </div>
      {!minimalView && (
        <div
          className="detail-box"
          style={{ overflow: "hidden", marginTop: "0px" }}
        >
          <p
            id="details"
            dangerouslySetInnerHTML={{
              __html:
                note.content && note.content.length > 40
                  ? note.content.substring(0, 100) + "..."
                  : note.content || "",
            }}
            style={{ color: "#333", margin: 0 }}
          />
        </div>
      )}

      {/* Popup Menu */}

      {isMenuOpen && !minimalView && (
        <div
          className="popup-menu"
          ref={menuRef}
          style={{
            position: "absolute",
            gap: "5px",
            top: "30px",
            right: "10px",
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "5px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            zIndex: 1000,
            width: "130px",
          }}
        >
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: "5px 0",
              textAlign: "start",
            }}
          >
            <li
              className="popup-menu-item"
              onClick={handleOpen}
              style={{
                padding: "5px 10px",
                cursor: "pointer",
                color: "#1A82FF",
                transition: "background-color 0.2s ease",
              }}
            >
              <RxOpenInNewWindow size={15} color="#1A82FF" />
              <span style={{ marginLeft: "10px", fontSize: "14px" }}>
                Open Note
              </span>
            </li>
            <li
              className="popup-menu-item"
              onClick={initiateDelete}
              style={{
                color: "#1A82FF",
                padding: "5px 10px",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
                gap: "10px",
              }}
            >
              <RiDeleteBin6Line size={15} color="#1A82FF" />
              <span style={{ marginLeft: "10px", fontSize: "14px" }}>
                Delete Note
              </span>
            </li>
            <li
              className="popup-menu-item"
              onClick={handleEmailClick} // This now stops propagation
              style={{
                color: "#1A82FF",
                padding: "5px 10px",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
                gap: "10px",
              }}
            >
              <div className="send-email" style={{ display: "flex" }}>
                <div className="email-icon" style={{ paddingTop: "3px" }}>
                  <GoMail size={17} color="#1A82FF" />
                </div>
                <div className="email-span">
                  <span
                    style={{
                      marginLeft: "10px",
                      fontSize: "14px",
                      paddingTop: "5px",
                    }}
                  >
                    Send Email
                  </span>
                </div>
              </div>
            </li>
          </ul>
        </div>
      )}
      {showConfirmDelete && (
        <div className="confirm-overlay">
          <div className="confirm-popup">
            <p className="Saving-note">Delete Notes</p>
            <p id="confirming">Are you sure to delete this note?</p>
            <div className="confirm-buttons">
              <button className="confirm-keep-button" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="confirm-delete-button" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {isEmailModalOpen && (
        <div
          className={
            isOpenNotes
              ? "noteItem-email-modal-overlay"
              : "noteItem-modal-overlay"
          }
          onClick={handleCloseEmailModal}
        >
          <div
            className={
              isOpenNotes
                ? "noteItem-email-modal-content"
                : "noteItem-modal-content"
            }
            onClick={(e) => e.stopPropagation()}
          >
            <div className="noteItem-modal-header">
              <p
                style={{
                  color: "black",
                  borderBottom: "1px solid rgba(0,0,0,0.1)",
                  textAlign: "start",
                  fontWeight: "600",
                  padding: "10px 0px 10px 0px",
                }}
              >
                Share with
              </p>
            </div>
            <div className="noteItem-modal-body" style={{ gap: "10px" }}>
              <div className="email-label">
                <label
                  htmlFor="email"
                  style={{
                    color: "black",
                    fontWeight: "600",
                    paddingBottom: "5px",
                  }}
                >
                  To*
                </label>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" Email ID"
                className="email-input"
                onKeyDown={handleKeyDown}
              />
              <div className="email-button-group">
                <button
                  className="email-cancel-button"
                  onClick={handleCloseEmailModal}
                >
                  Cancel
                </button>
                <button onClick={handleSendEmail} className="email-send-button">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteItem;
