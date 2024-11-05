import React, { useState, useRef, useEffect } from "react";
import { IoIosArrowBack } from "react-icons/io";
import axios from "axios";
//import useCreateDate from "./UseCreateDate";
import { FiBold } from "react-icons/fi";
import { GoItalic } from "react-icons/go";
import { FiUnderline } from "react-icons/fi";
import { GoStrikethrough } from "react-icons/go";
import { PiListBullets } from "react-icons/pi";
import { BsListOl } from "react-icons/bs";
import { IoCloseOutline, IoShareSocial } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { IoCopyOutline } from "react-icons/io5";
import { CgNotes } from "react-icons/cg";
import DOMPurify from "dompurify";
import "./EditNotes.css"; // Import CSS for styling
import ConfirmSave from "../../utils/ConfirmSave";
import { toast } from "react-toastify";

import { useSelector } from "react-redux";
const Editnotes = ({
  note,
  setNotes,
  onClose,
  notesHeight,
  isOpenNotes,
  height,
  textToSave,
}) => {
  const { user } = useSelector((state) => state.auth);

  const user_id = user?.user_id;
  const token = useSelector((state) => state.auth.access_token);
  const [noteContent, setNoteContent] = useState("");
  const [title, setTitle] = useState(note.title);
  const [note_id, setNote_id] = useState(note.note_id);
  const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(false);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    orderedList: false,
    unorderedList: false,
  });
  const [shareMessage, setShareMessage] = useState(""); // State for feedback message
  const editorRef = useRef(null);
  //const date = useCreateDate();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  //const [subject, setSubject] = useState("");

  const handleShare = () => {
    setIsShareModalOpen(true);
  };
  useEffect(() => {
    if (textToSave && editorRef.current) {
      const sanitizedTexts = textToSave.map((text) =>
        DOMPurify.sanitize(text.trim())
      );
      const currentContent = editorRef.current.innerHTML.trim();

      const textsToAdd = sanitizedTexts.filter(
        (text) => !currentContent.includes(text)
      );

      if (textsToAdd.length > 0) {
        const newContent = [currentContent, ...textsToAdd]
          .filter(Boolean)
          .join("<br> ");
        //.trim();

        editorRef.current.innerHTML = newContent;
        setNoteContent(newContent);
      }
    }
  }, [textToSave]);

  const handleInput = (e) => {
    setNoteContent(e.target.innerText);
    setUnsavedChanges(true);
  };

  const handleCopy = () => {
    const noteDetails = editorRef.current.innerHTML;
    const noteTitle = title || "Untitled Note";
    const shareText = `${noteTitle}\n\n${noteDetails.replace(/<[^>]+>/g, "")}`; // Remove HTML tags

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          setShareMessage("Note copied to clipboard!");
        })
        .catch((err) => {
          console.error("Could not copy text: ", err);
          fallbackCopyToClipboard(shareText);
        });
    } else {
      fallbackCopyToClipboard(shareText);
    }

    setTimeout(() => setShareMessage(""), 3000);
    setIsShareModalOpen(false);
  };

  const fallbackCopyToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed"; // Prevents scrolling to the bottom of the page in some browsers
    textArea.style.opacity = "0"; // Hide the textarea
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand("copy");
      setShareMessage("Note copied to clipboard!");
    } catch (err) {
      console.error("Fallback: Could not copy text", err);
      setShareMessage("Failed to copy note.");
    }

    document.body.removeChild(textArea);
  };

  const handleSendEmail = async () => {
    const requestData = {
      user_id: user_id, // make sure user_id is accessible from your component's state or props
      note_id: note_id, // replace noteId with the actual note ID you want to share
      email: email, // assuming `email` is the recipient's email in your component's state
    };

    try {
      const response = await axios.post(
        "http://13.127.207.184:80/notes/sharenotes",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // make sure token is available in component's state
          },
        }
      );

      if (response.status === 200) {
        toast.success("Email sent successfully");
        console.log("Email sent successfully to:", email);
        handleCloseEmailModal(); // Close the modal after sending
      } else {
        toast.error("Failed to send email:");
        console.error("Failed to send email:", response);
      }
    } catch (error) {
      toast.error("Error sending email:");
      console.error("Error sending email:", error);
    }
  };

  const handleEmailClick = () => setIsEmailModalOpen(true);
  const handleCloseModal = () => setIsShareModalOpen(false);
  const handleCloseEmailModal = () => setIsEmailModalOpen(false);
  const handleCancel = () => {
    setShowConfirmSave(false);
  };

  // useEffect(() => {
  //   // Populate editor with note details and handle placeholder visibility
  //   if (note.content?.trim() === "") {
  //     setIsPlaceholderVisible(true);
  //     setTitle("");
  //   } else {
  //     setIsPlaceholderVisible(false);
  //     if (editorRef.current) {
  //       editorRef.current.innerHTML = note.content;
  //     }
  //   }
  // }, [note.content]);
  useEffect(() => {
    if (note.content?.trim() === "") {
      setIsPlaceholderVisible(true);
      setTitle("");
    } else {
      setIsPlaceholderVisible(false);
      if (editorRef.current) {
        editorRef.current.innerHTML = note.content;
      }
    }
  }, [note.content]);

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

  const handleForm = async (e) => {
    e.preventDefault();
    const noteDetails = editorRef.current.innerHTML;

    if (title && noteDetails && noteDetails !== "Take your note...") {
      const updatedNote = {
        ...note,
        title: title.trim() || "Untitled Note",
        content: noteDetails,
      };

      try {
        // Post the note to the server
        const response = await axios.put(
          "http://13.127.207.184:80/notes/updatenote",
          {
            user_id, // Ensure `user_id` is defined and available in your component
            title: updatedNote.title,
            content: updatedNote.content,
            note_id: updatedNote.note_id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`, // Ensure `token` is defined
            },
          }
        );

        if (response.status === 200) {
          // Update the note in the notes array
          setNotes((prevNotes) =>
            prevNotes.map((n) =>
              n.note_id === updatedNote.note_id ? updatedNote : n
            )
          );
          toast.success("Notes Saved Successfully", {
            autoClose: 1000,
          });
          console.log("Note updated:", updatedNote);
        } else {
          toast.error("Failed to update note:", {
            autoClose: 1000,
          });
          console.error("Failed to update note:", response);
        }
        onClose();

        // Clear inputs
        setTitle("");
        editorRef.current.innerHTML = "";
        setUnsavedChanges(false);
      } catch (error) {
        console.error("Error saving note:", error);
      }
    }
  };
  const handleCloseClick = () => {
    if (unsavedChanges) {
      setShowConfirmSave(true);
    } else {
      onClose();
    }
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

  // const handleShare = () => {
  //   const noteDetails = editorRef.current.innerHTML;
  //   const noteTitle = title || "Untitled Note";

  //   // Create a shareable text (you can customize this as needed)
  //   const shareText = `${noteTitle}\n\n${noteDetails.replace(/<[^>]+>/g, "")}`; // Stripping HTML tags

  //   // Copy to clipboard
  //   navigator.clipboard.writeText(shareText).then(
  //     () => {
  //       setShareMessage("Note copied to clipboard!");
  //       // Remove the message after 3 seconds
  //       setTimeout(() => setShareMessage(""), 3000);
  //     },
  //     (err) => {
  //       console.error("Could not copy text: ", err);
  //       setShareMessage("Failed to copy note.");
  //       setTimeout(() => setShareMessage(""), 3000);
  //     }
  //   );
  // };
  console.log(notesHeight);

  return (
    <section className="edit-note">
      <header className="edit-note__header">
        <button
          className={
            isOpenNotes ? "lander-edit-back-button" : "edit-back-button"
          }
          onClick={handleCloseClick}
          aria-label="Go Back"
        >
          <IoIosArrowBack />
        </button>
        {showConfirmSave && (
          <ConfirmSave
            message="Are you sure you want to leave without saving?"
            onSave={handleForm}
            onDiscard={() => {
              setShowConfirmSave(false);
              onClose();
            }}
            onCancel={handleCancel}
          />
        )}
        <button
          className={
            isOpenNotes ? "lander-edit-save-button" : "edit-save-button"
          }
          onClick={handleForm}
          aria-label="Save Note"
        >
          <div className="save-in-edit" style={{ display: "flex", gap: "3px" }}>
            <CgNotes size={16} />
            <span>save</span>
          </div>
        </button>
        {/* <button className="edit-delete-button" onClick={handleDelete}>
          <RiDeleteBin6Line />
        </button> */}
      </header>
      <form
        className="edit-note__form"
        onSubmit={handleForm}
        style={{ height: `${notesHeight - 11.6}vh` }}
      >
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          className={
            isOpenNotes ? "lander-edit-note__title" : "edit-note__title"
          }
        />
        <div
          className={
            isOpenNotes ? "lander-edit-note__details" : "edit-note__details"
          }
          style={isOpenNotes ? { height: `${height - 135}px` } : {}}
          ref={editorRef}
          contentEditable={true}
          suppressContentEditableWarning={true}
          onClick={handleEditorClick}
          onBlur={handleBlur}
          onInput={handleInput}
        >
          {isPlaceholderVisible && "Take your note..."}
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
      {isShareModalOpen && (
        <div
          className={
            isOpenNotes
              ? "lander-createNotes-modal-overlay"
              : "createNotes-modal-overlay"
          }
          onClick={handleCloseModal}
        >
          <div
            className="createNotes-modal-content"
            onClick={(e) => e.stopPropagation()}
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

      {isEmailModalOpen && (
        <div
          className={
            isOpenNotes ? "lander-email-modal-overlay" : "email-modal-overlay"
          }
          onClick={handleCloseEmailModal}
        >
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
            <div
              className="email-modal-body"
              style={{ display: "flex", gap: "10px" }}
            >
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

export default Editnotes;
