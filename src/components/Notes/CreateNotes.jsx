import React, { useState, useEffect, useRef } from "react";
import { v4 as uuid } from "uuid";
import useCreateDate from "./UseCreateDate";
import { CiMenuFries } from "react-icons/ci";
import { IoCloseOutline, IoShareSocial } from "react-icons/io5";
import { RiDeleteBin6Line } from "react-icons/ri";
import { RxDotsHorizontal } from "react-icons/rx";
import Button from "../Buttons";
import { FiBold, FiUnderline } from "react-icons/fi";
import { GoItalic, GoStrikethrough } from "react-icons/go";
import { PiListBullets } from "react-icons/pi";
import { BsListOl } from "react-icons/bs";
import DOMPurify from "dompurify"; // Import DOMPurify

import "./CreateNote.css";
//import { TextContext } from "./TextProvider";

const Createnotes = ({ setNotes, onClose, selectedText }) => {
  console.log(selectedText);
  const [title, setTitle] = useState("");
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const date = useCreateDate();
  const headerRef = useRef(null); // Ref to detect clicks outside
  //const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(true);
  const [activeFormats, setActiveFormats] = useState([]); // Track active toolbar formats
  const editorRef = useRef(null);
  const [noteContent, setNoteContent] = useState(selectedText || ""); // Initialize with selectedText
  const [shareMessage, setShareMessage] = useState(""); // State for feedback message
  console.log("Selected Text:", selectedText);
  console.log("note content", noteContent);

  // Effect to handle incoming selectedText
  useEffect(() => {
    if (selectedText && editorRef.current) {
      const sanitizedText = DOMPurify.sanitize(selectedText.trim()); // Sanitize input

      // Prevent duplication on the first render or if the same text is selected again
      const currentContent = editorRef.current.innerText.trim();
      if (!currentContent.includes(sanitizedText)) {
        editorRef.current.innerHTML = currentContent
          ? currentContent + " " + sanitizedText
          : sanitizedText; // Add text only if it's not already present
        console.log(selectedText);
        setNoteContent(editorRef.current.innerHTML.trim());
      }
    }
  }, [selectedText]);

  const handleInput = (e) => {
    setNoteContent(e.target.innerText); // Set the content as plain text (ignoring HTML)
  };

  // console.log("CreateNote page: ", selectedText);

  const handleEditorClick = () => {
    editorRef.current.focus(); // Set focus on the editor
  };

  // const handleBlur = () => {
  //   // If the editor becomes empty again after losing focus, show the placeholder again
  //   if (editorRef.current.innerText.trim() === "") {
  //     setIsPlaceholderVisible(true);
  //     editorRef.current.innerHTML = "Take your note..."; // Placeholder text
  //   }
  // };

  const handleFormat = (command) => {
    document.execCommand(command, false, null);
    toggleActiveFormat(command);

    // Add class for numbered list styling
    if (command === "insertOrderedList") {
      const orderedLists = editorRef.current.getElementsByTagName("ol");
      for (let ol of orderedLists) {
        ol.classList.add("custom-ordered-list");
      }
    }
  };

  // Toggle the active state of the toolbar buttons
  const toggleActiveFormat = (command) => {
    setActiveFormats((prev) => {
      if (prev.includes(command)) {
        return prev.filter((format) => format !== command);
      } else {
        return [...prev, command];
      }
    });
  };

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
    const noteDetails = editorRef.current.innerHTML;

    if (title && noteDetails && noteDetails !== "Take your note...") {
      const note = { id: uuid(), title, details: noteDetails, date };
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

  const handleShare = () => {
    const noteDetails = editorRef.current.innerHTML;
    const noteTitle = title || "Untitled Note";

    // Create a shareable text (you can customize this as needed)
    const shareText = `${noteTitle}\n\n${noteDetails.replace(/<[^>]+>/g, "")}`; // Stripping HTML tags

    // Copy to clipboard
    navigator.clipboard.writeText(shareText).then(
      () => {
        setShareMessage("Note copied to clipboard!");
        // Remove the message after 3 seconds
        setTimeout(() => setShareMessage(""), 3000);
      },
      (err) => {
        console.error("Could not copy text: ", err);
        setShareMessage("Failed to copy note.");
        setTimeout(() => setShareMessage(""), 3000);
      }
    );
  };

  return (
    <section className="notes">
      <header
        className="note-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
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
              <div className="colors-section">{/* <Colors /> */}</div>
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
        <Button
          className="note-save-button"
          text="Save"
          onClick={handleSubmit}
        />
        <div className="create-note__actions">
          <button
            className="dropdown-toggle"
            onClick={handleToggleDropdown}
            title="Options"
          >
            <RxDotsHorizontal color="#1a82ff" size={20} />
          </button>
          <Button
            text={<IoCloseOutline color="#1a82ff" size={20} />}
            className="cancel-button"
            onClick={onClose}
          />
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
        <div
          className="note-taking"
          ref={editorRef}
          contentEditable={true}
          suppressContentEditableWarning={true}
          onClick={handleEditorClick}
          onInput={handleInput}
          //onInput={(e) => setNoteContent(e.target.innerHTML)} // Updated to onInput
          placeholder="Note details..."
          style={{
            padding: "10px",
            minHeight: "150px",
            marginBottom: "4px",
            borderRadius: "5px",
            fontSize: "14px",
            textAlign: "start",
          }}
        >
          {/* {isPlaceholderVisible && "Take your note..."} */}
          {/* {noteContent} */}
          {/* {selectedText} */}
        </div>
      </form>

      {/* Feedback Message */}
      {shareMessage && <div className="share-message">{shareMessage}</div>}

      <div className="toolbar">
        <button
          onClick={() => handleFormat("bold")}
          title="Bold"
          style={{
            color: activeFormats.includes("bold") ? "blue" : "black",
          }}
        >
          <FiBold size={17} />
        </button>
        <button
          onClick={() => handleFormat("italic")}
          title="Italic"
          style={{
            color: activeFormats.includes("italic") ? "blue" : "black",
          }}
        >
          <GoItalic size={17} />
        </button>
        <button
          onClick={() => handleFormat("underline")}
          title="Underline"
          style={{
            color: activeFormats.includes("underline") ? "blue" : "black",
          }}
        >
          <FiUnderline size={17} />
        </button>
        <button
          onClick={() => handleFormat("strikeThrough")}
          title="Strikethrough"
          style={{
            color: activeFormats.includes("strikeThrough") ? "blue" : "black",
          }}
        >
          <GoStrikethrough size={20} />
        </button>
        <button
          onClick={() => handleFormat("insertUnorderedList")}
          title="Bullets"
          style={{
            color: activeFormats.includes("insertUnorderedList")
              ? "blue"
              : "black",
          }}
        >
          <PiListBullets size={20} />
        </button>
        <button
          onClick={() => handleFormat("insertOrderedList")}
          title="Numbered List"
          style={{
            color: activeFormats.includes("insertOrderedList")
              ? "blue"
              : "black",
          }}
        >
          <BsListOl size={20} />
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          title="Share"
          style={{
            color: shareMessage ? "green" : "black",
          }}
        >
          <IoShareSocial size={20} />
        </button>
      </div>
    </section>
  );
};

export default Createnotes;
