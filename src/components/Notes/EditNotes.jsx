import React, { useState, useRef, useEffect } from "react";
import { IoIosArrowBack } from "react-icons/io";
import axios from "axios";
import { FiBold } from "react-icons/fi";
import { GoItalic } from "react-icons/go";
import { FiUnderline } from "react-icons/fi";
import { GoStrikethrough } from "react-icons/go";
import { PiListBullets } from "react-icons/pi";
import { BsListOl } from "react-icons/bs";
import { IoCloseOutline, IoShareSocial } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { IoCopyOutline } from "react-icons/io5";
//import { IoSaveOutline } from "react-icons/io5";
import { BiSave } from "react-icons/bi";
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
  //const [recipient_name, setRecipientName] = useState("");
  //const [subject, setSubject] = useState("");
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const initialText = useRef("");
  //const [subject, setSubject] = useState("");
  useEffect(() => {
    const localUnsavedChanges = localStorage.getItem("unsavedChanges");
    if (localUnsavedChanges === "true") {
      setUnsavedChanges(true);
    }
  }, []);

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
        if (newContent !== initialText.current) {
          localStorage.setItem("unsavedChanges", "true");
          setUnsavedChanges(true);
        }
      }
    }
  }, [textToSave]);
  useEffect(() => {
    if (note.content) {
      setNoteContent(note.content);
      initialText.current = note.content; // Store initial content for comparison
    }
  }, [note.content]);

  const handleInput = (e) => {
    setNoteContent(e.target.innerText);
    setUnsavedChanges(true);
    localStorage.setItem("unsavedChanges", "true");
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
      user_id: user_id,
      note_id: note_id,
      email: email,
      // recipient_name: recipient_name,
      //subject: subject,
    };

    try {
      const response = await axios.post(
        "http://13.127.207.184:3000/notes/sharenotes",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // make sure token is available in component's state
          },
        }
      );

      if (response.status === 200) {
        toast.success("Email sent successfully", {
          position: "top-center",
          autoClose: 2000,

          style: {
            backgroundColor: "rgba(237, 254, 235, 1)",
            borderLeft: "5px solid rgba(15, 145, 4, 1)",
            color: "rgba(15, 145, 4, 1)",
          },
          progressStyle: {
            backgroundColor: "rgba(15, 145, 4, 1)",
          },
        });
        console.log("Email sent successfully to:", email);
        handleCloseEmailModal(); // Close the modal after sending
      } else {
        toast.error("Failed to send email:", {
          position: "top-center",
          autoClose: 2000,
          style: {
            backgroundColor: "rgba(254, 235, 235, 1)",
            borderLeft: "5px solid rgba(145, 4, 4, 1)",
            color: "background: rgba(145, 4, 4, 1)",
          },
        });
        console.error("Failed to send email:", response);
      }
    } catch (error) {
      toast.error("Error sending email:", {
        position: "top-center",
        autoClose: 2000,
        style: {
          backgroundColor: "rgba(254, 235, 235, 1)",
          borderLeft: "5px solid rgba(145, 4, 4, 1)",
          color: "background: rgba(145, 4, 4, 1)",
        },
        progressStyle: {
          backgroundColor: "rgba(145, 4, 4, 1)",
        },
      });
      console.error("Error sending email:", error);
    }
  };

  const handleEmailClick = () => setIsEmailModalOpen(true);
  const handleCloseModal = () => setIsShareModalOpen(false);
  const handleCloseEmailModal = () => setIsEmailModalOpen(false);
  const handleCancel = () => {
    setShowConfirmSave(false);
  };

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
          "http://13.127.207.184:3000/notes/updatenote",
          {
            user_id, // Ensure `user_id` is defined and available in your component
            title: updatedNote.title,
            content: updatedNote.content,
            note_id: updatedNote.note_id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
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
            position: "top-center",
            autoClose: 1000,

            style: {
              backgroundColor: "rgba(237, 254, 235, 1)",
              borderLeft: "5px solid rgba(15, 145, 4, 1)",
              color: "rgba(15, 145, 4, 1)",
            },
            progressStyle: {
              backgroundColor: "rgba(15, 145, 4, 1)",
            },
          });
          setUnsavedChanges(false); // Reset unsaved changes after saving
          initialText.current = updatedNote.content;
          console.log("Note updated:", updatedNote);
        } else {
          toast.error("Failed to update note:", {
            position: "top-center",
            autoClose: 2000,
            style: {
              backgroundColor: "rgba(254, 235, 235, 1)",
              borderLeft: "5px solid rgba(145, 4, 4, 1)",
              color: "background: rgba(145, 4, 4, 1)",
            },
            progressStyle: {
              backgroundColor: "rgba(145, 4, 4, 1)",
            },
          });
          console.error("Failed to update note:", response);
        }
        onClose();

        // Clear inputs
        setTitle("");
        editorRef.current.innerHTML = "";
        setUnsavedChanges(false);
        localStorage.removeItem("unsavedChanges");
      } catch (error) {
        console.error("Error saving note:", error);
      }
    }
  };
  const handleCloseClick = () => {
    const localUnsavedChanges = localStorage.getItem("unsavedChanges");
    if (unsavedChanges || localUnsavedChanges === "true") {
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

  // const handleBlur = () => {
  //   if (editorRef.current.innerText.trim() === "") {
  //     setIsPlaceholderVisible(true);
  //     editorRef.current.innerHTML = "Take your note...";
  //   }
  // };

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
  console.log(notesHeight);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendEmail();
    }
  };

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
          <IoIosArrowBack size={20} color="white" />
        </button>
        {showConfirmSave && (
          <ConfirmSave
            message="Leave without saving?"
            onSave={handleForm}
            onDiscard={() => {
              setShowConfirmSave(false);
              localStorage.removeItem("unsavedChanges");
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
          <div
            className="save-in-edit"
            style={{ display: "flex", gap: "3px", alignItems: "center" }}
          >
            <BiSave size={25} color="white" />
            {/* <span>save</span> */}
          </div>
        </button>
      </header>
      <form
        className="edit-note__form"
        onSubmit={handleForm}
        style={{ height: `${notesHeight - 13}vh` }}
      >
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setUnsavedChanges(true);
          }}
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
          // onBlur={handleBlur}
          onInput={handleInput}
        >
          {/* {isPlaceholderVisible && "Take your note..."} */}
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
              : "editNotes-modal-overlay"
          }
          onClick={handleCloseModal}
        >
          <div
            className="editNotes-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="editNotes-modal-header">
              <p className="share-note">Share Note</p>
              <button
                className="editNotes-modal-close-button"
                onClick={handleCloseModal}
              >
                <IoCloseOutline size={20} />
              </button>
            </div>
            <div className="editNotes-modal-body">
              <div className="editNotes-email">
                <button className="editNotes-Email">
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
              <button onClick={handleCopy} className="editNotes-copy">
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
              <p
                style={{
                  color: "black",
                  textAlign: "start",
                  fontWeight: "600",
                  padding: "0px 0px 0px 0px",
                }}
              >
                Send with
              </p>
            </div>
            <div className="email-modal-body" style={{ gap: "10px" }}>
              <div className="email-label">
                <label
                  htmlFor="email"
                  style={{
                    color: "black",
                    paddingBottom: "5px",
                  }}
                >
                  To *
                </label>
              </div>
              {/* <label htmlFor="email" aria-required="true">
                To*
              </label> */}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email ID"
                className="email-input"
                required
                onKeyDown={handleKeyDown}
              />
              {/* <input
                type="text"
                value={recipient_name}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Recipient Name"
                className="recipient-input"
                onKeyDown={handleKeyDown}
              />
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject"
                className="subject-input"
                onKeyDown={handleKeyDown}
              /> */}

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
    </section>
  );
};

export default Editnotes;
