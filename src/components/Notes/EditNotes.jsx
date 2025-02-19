import React, { useState, useRef, useEffect } from "react";
import { IoIosArrowBack } from "react-icons/io";

import { FiBold } from "react-icons/fi";
import { GoItalic } from "react-icons/go";
import { FiUnderline } from "react-icons/fi";
import { GoStrikethrough } from "react-icons/go";
import { PiListBullets } from "react-icons/pi";
import { BsListOl } from "react-icons/bs";
import { IoCloseOutline, IoShareSocial } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { IoCopyOutline } from "react-icons/io5";
import { BiSave } from "react-icons/bi";
import DOMPurify from "dompurify";
import "./EditNotes.css"; // Import CSS for styling
import ConfirmSave from "../../utils/ConfirmSave";
import { toast } from "react-toastify";
import { apiService } from "../../assets/api/apiService";
import { showSuccessToast, showErrorToast } from "../../utils/toastHelper";

import { useSelector } from "react-redux";
const Editnotes = ({
  note,
  notes,
  setNotes,
  onClose,
  notesHeight,
  isOpenNotes,
  height,
  textToSave,
  annotateHeight,
  isModalOverlay,
  setIsModalOverlay
}) => {

  const { user } = useSelector((state) => state.auth);

  const user_id = user?.user_id;
  const token = useSelector((state) => state.auth.access_token);
  const [noteContent, setNoteContent] = useState("");
  const [title, setTitle] = useState(note.title);
  //const [titleError, setTitleError] = useState("");
  const [note_id, setNote_id] = useState(note.note_id);
  const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState(""); 
  const [tooltipTimeout, setTooltipTimeout] = useState(null);
  const [updatedTextToSave, setUpdatedTextToSave] = useState(textToSave || []);
  const [removedText, setRemovedText] = useState([]);
  const inputRef = useRef(null);
  
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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const initialText = useRef("");

const calculateTooltipPosition = () => {
  if (!inputRef.current) return { x: 0, y: 0 };
  const inputBox = inputRef.current.getBoundingClientRect();
  return {
    x: inputBox.left + window.scrollX, // Adjust for page scroll
    y: inputBox.bottom + window.scrollY + 45, // Position 5px below input
  };
};

useEffect(() => {
  if (showTooltip) {
    const timeout = setTimeout(() => {
      setShowTooltip(false);
    },100000); // Tooltip remains for 3 seconds
    setTooltipTimeout(timeout);

    return () => clearTimeout(timeout); // Clear on component unmount or tooltip change
  }
}, [showTooltip]);


  // useEffect(() => {
  //   const localUnsavedChanges = localStorage.getItem("unsavedChanges");
  //   if (localUnsavedChanges === "true") {
  //     setUnsavedChanges(true);
  //   }
  // }, []);

  const handleShare = () => {
    setIsModalOverlay(true);
    setIsShareModalOpen(true)
  };
  // useEffect(() => {
  //   if (textToSave && editorRef.current) {
  //     const sanitizedTexts = textToSave.map((text) =>
  //       DOMPurify.sanitize(text.trim())
  //     );
  //     const currentContent = editorRef.current.innerHTML.trim();

  //     const textsToAdd = sanitizedTexts.filter(
  //       (text) => !currentContent.includes(text)
  //     );

  //     if (textsToAdd.length > 0) {
  //       const newContent = [currentContent, ...textsToAdd]
  //         .filter(Boolean)
  //         .join("<br> ");
  //       //.trim();

  //       editorRef.current.innerHTML = newContent;
  //       setNoteContent(newContent);
  //       if (!newContent.trim() && !title.trim()) {
  //         setUnsavedChanges(false);
  //         localStorage.removeItem("unsavedChanges");
  //       } else if (newContent !== initialText.current) {
  //         setUnsavedChanges(true);
  //         localStorage.setItem("unsavedChanges", "true");
  //       }
  //     }
  //   }
  // }, [textToSave]);
  useEffect(() => {
    if (note.content) {
      setNoteContent(note.content);
      initialText.current = note.content; // Store initial content for comparison
    }
  }, [note.content]);
  useEffect(() => {
    if (!textToSave?.length || !editorRef.current) return;

    setUpdatedTextToSave((prevText) => {
      const newTexts = textToSave.filter(
        (text) => !prevText.includes(text) && !removedText.includes(text)
      );

      if (newTexts.length > 0) {
        setUnsavedChanges(true);
        localStorage.setItem("unsavedChanges", "true");
      }

      return [...prevText, ...newTexts];
    });
  }, [textToSave]);


  useEffect(() => {
    if (!editorRef.current) return;

    let existingContent = editorRef.current.innerHTML.trim();
    const sanitizedTexts = updatedTextToSave.map((text) =>
      DOMPurify.sanitize(text.trim())
    );

    sanitizedTexts.forEach((newText) => {
      if (!existingContent.includes(newText)) {
        existingContent += `<br>${newText}`; // Append new text instead of replacing
      }
    });

    if (editorRef.current.innerHTML !== existingContent) {
      editorRef.current.innerHTML = existingContent;
    }
  }, [updatedTextToSave]);

  const handleInput = (e) => {
    const content = e.target.innerHTML
      .trim()
      .replace(/<span class=['"]placeholder['"]>.*?<\/span>/g, ""); 

    setNoteContent(content);

    setUpdatedTextToSave((prevText) => {
      const contentArray = content.split("<br>").filter(Boolean);
      const removedItems = prevText.filter((text) => !contentArray.includes(text));
      setRemovedText((prevRemoved) => [...prevRemoved, ...removedItems]);

      return [...new Set([...contentArray, ...prevText.filter((text) => !removedItems.includes(text))])];
    });

    if (!title.trim() && !content.trim()) {
      setUnsavedChanges(false);
      localStorage.removeItem("unsavedChanges");
    } else {
      setUnsavedChanges(true);
      localStorage.setItem("unsavedChanges", "true");
    }
  };
  // const handleInput = (e) => {
  //   const content = e.target.innerText;
  // setNoteContent(content);

  // if (!title.trim() && !content.trim()) {
  //   setUnsavedChanges(false);
  //   localStorage.removeItem("unsavedChanges");
  // } else {
  //   setUnsavedChanges(true);
  //   localStorage.setItem("unsavedChanges", "true");
  // }
  // };

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
    setIsModalOverlay(false);
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
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(email)) {
          showErrorToast("Please enter a valid email address");
          return
        }
    const requestData = {
      user_id: user_id,
      note_id: note_id,
      email: email,
    };

    try {
      const response = await apiService.sendEmail(requestData, token);

      if (response.status === 200) {
        showSuccessToast("Email sent successfully");
        handleCloseEmailModal(); // Close the modal after sending
      } else {
        showErrorToast("Failed to send email:");
        console.error("Failed to send email:", response);
      }
    } catch (error) {
      showErrorToast("Error sending email:");
      console.error("Error sending email:", error);
    }
  };

  const handleEmailClick = () => {
    setIsModalOverlay(true);
    setIsEmailModalOpen(true)
  }
  const handleCloseModal = () => setIsModalOverlay(false);
  const handleCloseEmailModal = () =>{
     setIsModalOverlay(false);
     setIsEmailModalOpen(false);
  }
  const handleCancel = () => {
    setShowConfirmSave(false);
  };

  useEffect(() => {
    if (note.content?.trim() === "") {
      setIsPlaceholderVisible(true);
      //setTitle("");
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
    if (!title.trim()) {
      setTooltipMessage("⚠ Please add a title.");
      setShowTooltip(true);
      return;
    }

    if (title && noteDetails && noteDetails !== "Take your note...") {
      const updatedNote = {
        ...note,
        title: title.trim() || "Untitled Note",
        content: noteDetails,
      };

      try {
        // Post the note to the server
        const response = await apiService.updateNote(
          user_id,
          updatedNote.title,
          updatedNote.content,
          updatedNote.note_id,
          token
        );

        if (response.status === 200) {
          // Update the note in the notes array
          setNotes((prevNotes) =>
            prevNotes.map((n) =>
              n.note_id === updatedNote.note_id ? updatedNote : n
            )
          );
          const isDuplicateTitle = notes.some(
            (n) => n.title === title.trim() && n.note_id !== note_id
          );
          if (isDuplicateTitle) {
            setTooltipMessage("⚠ Title already exists. Try another one.");
            setShowTooltip(true);
            return;
          }
          showSuccessToast("Notes Saved Successfully");
          setUnsavedChanges(false); // Reset unsaved changes after saving
          initialText.current = updatedNote.content;
        } else {
          toast.error("Failed to update note:");
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
    
    // Check if both title and noteContent are empty
    if (!title.trim() && !noteContent.trim()) {
      setUnsavedChanges(false);
      localStorage.removeItem("unsavedChanges");
      onClose();
      return;
    }
  
    // If there are unsaved changes, show the confirmation modal
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
        // style={{ height: `${notesHeight - 13}vh` }}
      >
        <div className="input-container">

        <input
  type="text"
  placeholder="Title"
  onFocus={()=>setShowTooltip(false)}
  value={title}
  ref={inputRef}
  onChange={(e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setShowTooltip(false);
    if (!newTitle.trim() && !noteContent.trim()) {
      setUnsavedChanges(false);
      localStorage.removeItem("unsavedChanges");
    } else {
      setUnsavedChanges(true);
      localStorage.setItem("unsavedChanges", "true");
    }

    //setTitleError("");
  }}
  autoFocus
  // style={{
  //   borderColor: titleError ? "red" : undefined,
  // }}
  className={
    isOpenNotes ? "lander-edit-note__title" : "edit-note__title"
  }
/>
        </div>
        {showTooltip && (
    <div
      className="tooltip"
      style={{
        left: calculateTooltipPosition().x - inputRef.current.getBoundingClientRect().left,
        top: calculateTooltipPosition().y - inputRef.current.getBoundingClientRect().top, 
      }}
    >
      {tooltipMessage}
    </div>
  )}        <div
          className={
            isOpenNotes ? "lander-edit-note__details" : "edit-note__details"
          }
          style={isOpenNotes ? { height: `${height - 135}px` } : {maxHeight: annotateHeight ===0?"35vh":`${annotateHeight+5}vh`}}
          ref={editorRef}
          contentEditable={true}
          suppressContentEditableWarning={true}
          onClick={handleEditorClick}
          onInput={handleInput}
        ></div>
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
      {isModalOverlay &&isShareModalOpen && (
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
                <IoCloseOutline size={22} color="black" />
              </button>
            </div>
            <div className="editNotes-modal-body">
              <div className="editNotes-email">
                <button className="editNotes-Email">
                  <div
                    style={{
                      // backgroundColor: "#A5A5A5",
                      padding: "5px 10px",
                      borderRadius: "10px",
                    }}
                    onClick={handleEmailClick}
                  >
                    <MdEmail size={40} color="rgb(27, 54, 93)" />
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
                    // backgroundColor: "#A5A5A5",
                    padding: "5px 10px",
                    borderRadius: "10px",
                  }}
                >
                  <IoCopyOutline size={40} color="rgb(27, 54, 93)" />
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

      {isModalOverlay && isEmailModalOpen&& (
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
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email ID"
                className="email-input"
                required
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
    </section>
  );
};

export default Editnotes;
