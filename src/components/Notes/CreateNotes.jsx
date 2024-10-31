import React, { useState, useEffect, useRef } from "react";

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
import DOMPurify from "dompurify";
import axios from "axios";
import { useSelector } from "react-redux";
import { MdEmail } from "react-icons/md";
import { IoCopyOutline } from "react-icons/io5";

import "./CreateNote.css";

const Createnotes = ({
  setNotes,
  onClose,
  selectedText,
  notesHeight,
  onDelete,
  note,
  isOpenNotes,
  height,
}) => {
  console.log(selectedText);
  const [title, setTitle] = useState("");
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const date = useCreateDate();
  const headerRef = useRef(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    orderedList: false,
    unorderedList: false,
  });
  const editorRef = useRef(null);
  const [noteContent, setNoteContent] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const user_id = user?.user_id;
  const token = user?.access_token;
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");

  const handleEmailClick = () => {
    setIsEmailModalOpen(true); // Open the email popup modal
  };

  const handleCloseEmailModal = () => {
    setIsEmailModalOpen(false); // Close the email popup modal
    setEmail("");
    setSubject("");
  };

  const handleSendEmail = () => {
    // Handle sending email logic here, e.g., make an API call
    console.log("Sending email to:", email, "with subject:", subject);
    handleCloseEmailModal(); // Close the modal after sending
  };

  console.log("Selected Text:", selectedText);
  console.log("note content", noteContent);
  //console.log("noteid", note.id);

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
      editorRef.current.innerHTML = sanitizedText;
      setNoteContent(sanitizedText);

      // Prevent duplication on the first render or if the same text is selected again
      // const currentContent = editorRef.current.innerText.trim();
      // if (!currentContent.includes(sanitizedText)) {
      //   editorRef.current.innerHTML = currentContent
      //     ? currentContent + " " + sanitizedText
      //     : sanitizedText; // Add text only if it's not already present
      //   console.log(selectedText);
      //   setNoteContent(editorRef.current.innerHTML.trim());
      // }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const noteContent = editorRef.current.innerHTML;

    if (title && noteContent && noteContent !== "Take your note...") {
      const note = { title, content: noteContent }; // Use 'content' instead of 'details'

      try {
        // Post the note to the server
        await axios.post(
          "http://13.127.207.184:80/notes/createnote",
          {
            user_id, // Ensure `user_id` is defined and available in your component
            title: note.title,
            content: note.content,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`, // Ensure `token` is defined
            },
          }
        );

        // Add this note to the notes array
        setNotes((prevNotes) => [note, ...prevNotes]);

        onClose(); // Return to Notes list

        // Clear inputs
        setNoteContent("");
        setTitle("");
        editorRef.current.innerHTML = "";
        // // Add this note to the notes array
        // setNotes((prevNotes) => [note, ...prevNotes]);
        // console.log("Note saved:", note);
        // onClose(); // Return to Notes list

        // // Clear inputs
        // setNoteContent("");
        // setTitle("");
        // editorRef.current.innerHTML = "";
      } catch (error) {
        console.error("Error saving note:", error);
      }
    }
  };
  console.log("text is saved");
  const initiateDelete = (e) => {
    e.stopPropagation(); // Prevent triggering onEdit
    //setIsMenuOpen(false); // Close the menu
    setShowConfirmDelete(true); // Show confirmation popup
  };

  const confirmDelete = (e) => {
    if (note && note.id) {
      // Check if the note and its ID are valid
      onDelete(note.id); // Call the onDelete handler with the note ID
    }
    setShowConfirmDelete(false); // Close confirmation popup
  };

  const cancelDelete = (e) => {
    e.stopPropagation();
    setShowConfirmDelete(false);
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
            style={{ position: "absolute", zIndex: 1000 }}
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
                  // onClick={handleDeleteNotes}
                  onClick={initiateDelete}
                  className="dropdown-button-deletenotes"
                >
                  <RiDeleteBin6Line style={{ marginRight: "5px" }} /> Delete
                  Notes
                </button>
                {showConfirmDelete && (
                  <div className="confirm-overlay">
                    <div className="confirm-popup">
                      <p>Are you sure you want to delete this note?</p>
                      <div className="confirm-buttons">
                        <button
                          className="confirm-delete-button"
                          onClick={confirmDelete}
                        >
                          Delete
                        </button>
                        <button
                          className="confirm-keep-button"
                          onClick={cancelDelete}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <button
          className={
            isOpenNotes ? "lander-note-save-button" : "note-save-button"
          }
          text="Save"
          onClick={handleSubmit}
        >
          save
        </button>
        <div
          className={
            isOpenNotes ? "lander-create-note__actions" : "create-note__actions"
          }
        >
          <button
            className={
              isOpenNotes ? "lander-dropdown-toggle" : "dropdown-toggle"
            }
            onClick={handleToggleDropdown}
            title="Options"
          >
            <RxDotsHorizontal
              color={isOpenNotes ? "white" : "#1a82ff"}
              size={25}
            />
          </button>
          <Button
            text={
              <IoCloseOutline
                color={isOpenNotes ? "white" : "#1a82ff"}
                size={25}
              />
            }
            className="notes-cancel-button"
            onClick={onClose}
          />
        </div>
      </header>
      <form
        className="create-note__form"
        onSubmit={handleSubmit}
        style={
          isOpenNotes
            ? { height: `${height - 86}px` }
            : { height: `${notesHeight - 11.85}vh` }
        }
      >
        <input
          className={isOpenNotes ? "lander-note-input" : "note-input"}
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
        />
        <div
          className={isOpenNotes ? "lander-note-taking" : "note-taking"}
          ref={editorRef}
          contentEditable={true}
          suppressContentEditableWarning={true}
          onClick={handleEditorClick}
          onInput={handleInput}
          placeholder="Note details..."
          style={{
            padding: "10px",
            marginBottom: "4px",
            borderRadius: "5px",
            fontSize: "14px",
            textAlign: "start",
            overflowY: "auto",
            //color: "white",
          }}
        >
          {/* Placeholder logic can be enhanced if needed */}
          {/* Note details */}
        </div>
      </form>

      {/* Feedback Message */}
      {shareMessage && <div className="share-message">{shareMessage}</div>}

      <div className={isOpenNotes ? "lander-toolbar" : "toolbar"}>
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
        <div className="createNotes-modal-overlay" onClick={handleCloseModal}>
          <div
            className="createNotes-modal-content"
            onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
          >
            <div className="createNotes-modal-header">
              <h3>Share Note</h3>
              <button
                className="createNotes-modal-close-button"
                onClick={handleCloseModal}
              >
                <IoCloseOutline size={20} />
              </button>
            </div>
            <div className="createNotes-modal-body">
              <div className="createNotes-email">
                <button className="createNotes-Email">
                  <div
                    style={{
                      backgroundColor: "#A5A5A5",
                      padding: "5px 10px",
                      borderRadius: "10px",
                    }}
                    onClick={handleEmailClick}
                  >
                    <MdEmail size={40} color="white" />
                  </div>
                  <span
                    style={{ fontSize: "16px", color: "black", padding: "3px" }}
                  >
                    Email
                  </span>
                </button>
              </div>
              <button onClick={handleCopy} className="createNotes-copy">
                {/* <RxCopy size={50} /> */}
                <div
                  style={{
                    backgroundColor: "#A5A5A5",
                    padding: "5px 10px",
                    borderRadius: "10px",
                  }}
                >
                  <IoCopyOutline size={40} color="white" />
                </div>
                <span
                  style={{ fontSize: "16px", color: "black", padding: "3px" }}
                >
                  Copy
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="email-modal-overlay" onClick={handleCloseEmailModal}>
          <div
            className="email-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="email-modal-header">
              <h3>Send to</h3>
              <button
                className="email-modal-close-button"
                onClick={handleCloseEmailModal}
              >
                <IoCloseOutline size={20} />
              </button>
            </div>
            <div className="email-modal-body" style={{ width: "80%" }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="email-input"
              />

              <button onClick={handleSendEmail} className="send-button">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Createnotes;
