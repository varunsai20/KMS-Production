
// src/pages/Notes/Createnotes.js
import React, { useState, useEffect, useRef, useContext } from "react";
import { v4 as uuid } from "uuid";
import useCreateDate from "./UseCreateDate";
// import Colors from "../../components/Colors";
import { CiMenuFries } from "react-icons/ci";
import { IoCloseOutline } from "react-icons/io5";
import { RiDeleteBin6Line } from "react-icons/ri";
import Button from "../Buttons";
import "./CreateNote.css";
import { TextContext } from "./TextProvider";
//import "./CreateNotes.css"; // Import CSS for styling

const Createnotes = ({ setNotes, onClose }) => {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const date = useCreateDate();
  const headerRef = useRef(null); // Ref to detect clicks outside
  const { selectedText } = useContext(TextContext);
  const handleToggleDropdown = () => {
    setIsOpenDropdown(!isOpenDropdown);
  };

  const handleClickOutside = (event) => {
    if (headerRef.current && !headerRef.current.contains(event.target)) {
      setIsOpenDropdown(false); // Close the dropdown if clicked outside
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (title && details) {
      const note = { id: uuid(), title, details, date };
      // Add this to the notes array
      setNotes((prevNotes) => [note, ...prevNotes]);
      console.log(note);
      onClose(); // Return to Notes list
    }
  };

  const handleDeleteNotes = () => {
    // Confirm before deleting all notes

    const confirmDelete = window.confirm(
      "Are you sure you want to delete all notes?"
    );
    if (confirmDelete) {
      setNotes([]); // Clear all notes
      onClose(); // Return to Notes list
    }
  };

  const handleOpenNotesList = () => {
    onClose(); // Return to Notes list
  };

  return (
    <section className="notes">
      <header
        className="note-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          backgroundColor: "black",
        }}
        ref={headerRef}
      >
        {isOpenDropdown && (
          <div
            className="dropdown"
            style={{ position: "absolute", width: "26.1%", zIndex: 1000 }}
          >
            <div className="open-header-dropdown">
              {/* Include your dropdown content here, such as other buttons or options */}
              <div className="colors-section">
                {/* <Colors /> */}
              </div>
              <div className="dropdown-button-group">
                <button
                  onClick={handleOpenNotesList}
                  className="dropdown-button"
                >
                  <CiMenuFries style={{ marginRight: "7px" }} /> Notes List
                </button>
                <button onClick={handleDeleteNotes} className="dropdown-button">
                  <RiDeleteBin6Line style={{ marginRight: "8px" }} /> Delete
                  Notes
                </button>
              </div>
            </div>
          </div>
        )}
        <button
          className="dropdown-toggle"
          onClick={handleToggleDropdown}
          title="Options"
        >
          <CiMenuFries size={20} color="black" />
        </button>
        <div className="create-note__actions">
          <Button className="save-button" text="Save" onClick={handleSubmit} />
          <Button
            text={<IoCloseOutline color="#1a82ff" />}
            className="cancel-button"
            onClick={onClose}
          >
            {/* <IoCloseOutline /> */}
          </Button>
        </div>
      </header>
      <form className="create-note__form" onSubmit={handleSubmit}>
        <input
          className="note-input"
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        {/* {selectedText ? ( */}
        <textarea
          className="note-taking"
          rows="10"
          placeholder="Note details..."
          value={details || selectedText}
          onChange={(e) => setDetails(e.target.value)}
        ></textarea>
        {/* ) : (
          " "
        )} */}
      </form>
    </section>
  );
};

export default Createnotes;
