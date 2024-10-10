import React, { useState, useRef, useEffect } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { RiDeleteBin6Line } from "react-icons/ri";
import useCreateDate from "./UseCreateDate";
import { FiBold } from "react-icons/fi";
import { GoItalic } from "react-icons/go";
import { FiUnderline } from "react-icons/fi";
import { GoStrikethrough } from "react-icons/go";
import { PiListBullets } from "react-icons/pi";
import { BsListOl } from "react-icons/bs";
import { IoShareSocial } from "react-icons/io5";
import "./EditNotes.css"; // Import CSS for styling

const Editnotes = ({ note, setNotes, onClose }) => {
  const [title, setTitle] = useState(note.title);
  const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(false);
  const [activeFormats, setActiveFormats] = useState([]);
  const [shareMessage, setShareMessage] = useState(""); // State for feedback message
  const editorRef = useRef(null);
  const date = useCreateDate();

  useEffect(() => {
    // Populate editor with note details and handle placeholder visibility
    if (note.details.trim() === "") {
      setIsPlaceholderVisible(true);
    } else {
      editorRef.current.innerHTML = note.details;
    }
  }, [note.details]);

  const handleForm = (e) => {
    e.preventDefault();
    const updatedDetails = editorRef.current.innerHTML;
    if (title && updatedDetails) {
      const updatedNote = { ...note, title, details: updatedDetails, date };
      setNotes((prevNotes) =>
        prevNotes.map((item) => (item.id === note.id ? updatedNote : item))
      );
      onClose();
    }
  };

  const handleDelete = () => {
    const newNotesList = (prevNotes) =>
      prevNotes.filter((item) => item.id !== note.id);
    setNotes(newNotesList);
    onClose();
  };

  const handleEditorClick = () => {
    if (isPlaceholderVisible) {
      setIsPlaceholderVisible(false);
      editorRef.current.innerHTML = "";
      editorRef.current.focus();
    }
  };

  const handleBlur = () => {
    if (editorRef.current.innerText.trim() === "") {
      setIsPlaceholderVisible(true);
      editorRef.current.innerHTML = "Take your note...";
    }
  };

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

  const toggleActiveFormat = (command) => {
    setActiveFormats((prev) =>
      prev.includes(command)
        ? prev.filter((format) => format !== command)
        : [...prev, command]
    );
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
    <section className="edit-note">
      <header className="edit-note__header">
        <button className="edit-back-button" onClick={onClose}>
          <IoIosArrowBack />
        </button>
        <button className="edit-save-button" onClick={handleForm}>
          save
        </button>
        <button className="edit-delete-button" onClick={handleDelete}>
          <RiDeleteBin6Line />
        </button>
      </header>
      <form className="edit-note__form" onSubmit={handleForm}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          className="edit-note__title"
        />
        <div
          className="edit-note__details"
          ref={editorRef}
          contentEditable={true}
          suppressContentEditableWarning={true}
          onClick={handleEditorClick}
          onBlur={handleBlur}
          style={{
            // border: "1px solid #ccc",
            padding: "10px",
            minHeight: "150px",
            marginBottom: "10px",
            borderRadius: "5px",
            fontSize: "14px",
            textAlign: "start",
          }}
        >
          {isPlaceholderVisible && "Take your note..."}
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
          {/* You'll need to import this icon */}
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

export default Editnotes;