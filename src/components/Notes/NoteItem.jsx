import React, { useState, useRef, useEffect } from "react";
import "./NoteItem.css";
import { RxDotsHorizontal } from "react-icons/rx";
import { RxOpenInNewWindow } from "react-icons/rx";
import { RiDeleteBin6Line } from "react-icons/ri";

const NoteItem = ({ note, onEdit, onDelete, isOpenNotes }) => {
  const [isHovered, setIsHovered] = useState(false); // Track hover state
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Track menu visibility
  const [showConfirmDelete, setShowConfirmDelete] = useState(false); // Track confirmation popup visibility
  const menuRef = useRef(null); // Reference to the popup menu

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

  return (
    <div
      className={isOpenNotes ? "Lander-NoteItem" : "NoteItem"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onEdit(note)} // Open note on click
      // style={{
      //   cursor: "pointer",
      //   borderRadius: "10px",
      //   position: "relative", // To position the popup menu
      //   padding: "10px",
      //   boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
      //   marginBottom: "10px",
      //   backgroundColor: "#fff", // Background color for better visibility
      //   transition: "background-color 0.3s ease",
      // }}
    >
      <div
        className="title-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p id="title" style={{ fontWeight: "bold", margin: 0 }}>
          {note.title.length > 15
            ? note.title.substring(0, 20) + "..."
            : note.title}
        </p>
        {/* Display date or "..." button based on hover state */}
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
            {note.created_at}
          </p>
        )}
      </div>
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

      {/* Popup Menu */}
      {isMenuOpen && (
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
              // onMouseEnter={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
              // onMouseLeave={(e) => (e.target.style.backgroundColor = "#fff")}
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
              // onMouseEnter={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
              // onMouseLeave={(e) => (e.target.style.backgroundColor = "#fff")}
            >
              <RiDeleteBin6Line size={15} color="#1A82FF" />
              <span style={{ marginLeft: "10px", fontSize: "14px" }}>
                Delete Note
              </span>
            </li>
          </ul>
        </div>
      )}
      {showConfirmDelete && (
        <div className="confirm-overlay">
          <div className="confirm-popup">
            <p>Are you sure you want to delete this note?</p>
            <div className="confirm-buttons">
              <button className="confirm-delete-button" onClick={confirmDelete}>
                Delete
              </button>
              <button className="confirm-keep-button" onClick={cancelDelete}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteItem;
