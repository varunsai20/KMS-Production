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
//import { SiGmail } from "react-icons/si";
import { RxCopy } from "react-icons/rx";
import { CiMail } from "react-icons/ci";

import "./CreateNote.css"; // Ensure you have the necessary CSS

const Createnotes = ({ setNotes, onClose, selectedText }) => {
  console.log(selectedText);
  const [title, setTitle] = useState("");
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const date = useCreateDate();
  const headerRef = useRef(null); // Ref to detect clicks outside

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    orderedList: false,
    unorderedList: false,
  });
  const editorRef = useRef(null);
  const [noteContent, setNoteContent] = useState(selectedText || ""); // Initialize with selectedText
  const [shareMessage, setShareMessage] = useState(""); // State for feedback message

  // New States for Modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  //const [shareEmail, setShareEmail] = useState("");

  console.log("Selected Text:", selectedText);
  console.log("note content", noteContent);

  useEffect(() => {
    const handleSelectionChange = () => {
      if (!editorRef.current) return;

      const selection = window.getSelection();
      if (selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      if (!editorRef.current.contains(range.commonAncestorContainer)) return;

      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikeThrough: document.queryCommandState("strikeThrough"),
        orderedList: document.queryCommandState("insertOrderedList"),
        unorderedList: document.queryCommandState("insertUnorderedList"),
      });
    };

    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

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

  const handleEditorClick = () => {
    editorRef.current.focus(); // Set focus on the editor
  };

  const handleFormat = (command) => {
    document.execCommand(command, false, null);

    // After executing the command, update the activeFormats state
    setActiveFormats((prevFormats) => ({
      ...prevFormats,
      [command]: !prevFormats[command],
    }));

    // Special handling for lists to toggle between ordered and unordered
    if (command === "insertOrderedList") {
      setActiveFormats((prevFormats) => ({
        ...prevFormats,
        orderedList: !prevFormats.orderedList,
        unorderedList: false, // Ensure only one list type is active
      }));
    }

    if (command === "insertUnorderedList") {
      setActiveFormats((prevFormats) => ({
        ...prevFormats,
        unorderedList: !prevFormats.unorderedList,
        orderedList: false, // Ensure only one list type is active
      }));
    }
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

      setNoteContent(""); // Clear the note content
      setTitle(""); // Clear the title
      editorRef.current.innerHTML = ""; // Clear the editor content
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

  // Modified handleShare to open the modal
  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  // Handle the copy action inside the modal
  const handleCopy = () => {
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

    // Optionally, close the modal after copying
    setIsShareModalOpen(false);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsShareModalOpen(false);
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
                  className="dropdown-button-noteslist"
                >
                  <CiMenuFries style={{ marginRight: "10px" }} />
                  <span>Notes List</span>
                </button>
                <button
                  onClick={handleDeleteNotes}
                  className="dropdown-button-deletenotes"
                >
                  <RiDeleteBin6Line style={{ marginRight: "5px" }} /> Delete
                  Notes
                </button>
              </div>
            </div>
          </div>
        )}
        <button className="note-save-button" text="Save" onClick={handleSubmit}>
          save
        </button>
        <div className="create-note__actions">
          <button
            className="dropdown-toggle"
            onClick={handleToggleDropdown}
            title="Options"
          >
            <RxDotsHorizontal color="#1a82ff" size={25} />
          </button>
          <Button
            text={<IoCloseOutline color="#1a82ff" size={25} />}
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
            //border: "1px solid #ccc", // Added border for better visibility
          }}
        >
          {/* Placeholder logic can be enhanced if needed */}
        </div>
      </form>

      {/* Feedback Message */}
      {shareMessage && <div className="share-message">{shareMessage}</div>}

      <div className="toolbar">
        <button
          onClick={() => handleFormat("bold")}
          title="Bold"
          className={`toolbar-button ${activeFormats.bold ? "active" : ""}`}
          aria-label="Bold"
        >
          <FiBold size={17} />
        </button>
        <button
          onClick={() => handleFormat("italic")}
          title="Italic"
          className={`toolbar-button ${activeFormats.italic ? "active" : ""}`}
          aria-label="Italic"
        >
          <GoItalic size={17} />
        </button>
        <button
          onClick={() => handleFormat("underline")}
          title="Underline"
          className={`toolbar-button ${
            activeFormats.underline ? "active" : ""
          }`}
          aria-label="Underline"
        >
          <FiUnderline size={17} />
        </button>
        <button
          onClick={() => handleFormat("strikeThrough")}
          title="Strikethrough"
          className={`toolbar-button ${
            activeFormats.strikeThrough ? "active" : ""
          }`}
          aria-label="Strikethrough"
        >
          <GoStrikethrough size={20} />
        </button>
        <button
          onClick={() => handleFormat("insertUnorderedList")}
          title="Bullets"
          className={`toolbar-button ${
            activeFormats.unorderedList ? "active" : ""
          }`}
          aria-label="Bulleted List"
        >
          <PiListBullets size={20} />
        </button>
        <button
          onClick={() => handleFormat("insertOrderedList")}
          title="Numbered List"
          className={`toolbar-button ${
            activeFormats.orderedList ? "active" : ""
          }`}
          aria-label="Numbered List"
        >
          <BsListOl size={20} />
        </button>
        {/* Share Button */}
        <button
          onClick={handleShare}
          title="Share"
          className="share-button"
          aria-label="Share Note"
        >
          <IoShareSocial size={20} />
        </button>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
          >
            <div className="modal-header">
              <h3>Share Note</h3>
              <button className="modal-close-button" onClick={handleCloseModal}>
                <IoCloseOutline size={20} />
              </button>
            </div>
            <div className="modal-body">
              {/* <label htmlFor="share-email">Email:</label> */}
              <div className="email">
                {/* <input
                  type="email"
                  id="share-email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                  className="modal-email-input"
                /> */}
                <button>
                  {/* ?<SiGmail size={50} /> */}
                  <CiMail size={50} />
                </button>
                {/* <button className="modal-send-butt">
                </button> */}
              </div>
              <button onClick={handleCopy}>
                <RxCopy size={50} />
              </button>
              {/* <button onClick={handleCopy} className="modal-copy-button">
                Copy
              </button> */}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Createnotes;
