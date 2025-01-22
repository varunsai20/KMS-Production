import React, { useState, useEffect, useRef } from "react";
import { apiService } from "../../assets/api/apiService";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import { IoCloseOutline } from "react-icons/io5";
import { RxDotsHorizontal } from "react-icons/rx";
import Button from "../Buttons";
import { FiBold, FiUnderline } from "react-icons/fi";
import { GoItalic, GoStrikethrough } from "react-icons/go";
import { PiListBullets } from "react-icons/pi";
import { BsListOl } from "react-icons/bs";
import DOMPurify from "dompurify";
import { showSuccessToast, showErrorToast } from "../../utils/toastHelper";
import { useSelector } from "react-redux";
import { MdEmail } from "react-icons/md";
import "./CreateNote.css";
import ConfirmSave from "../../utils/ConfirmSave";
import { BiSave } from "react-icons/bi";
import { contextType } from "react-quill";
const Createnotes = ({
  setNotes,
  onClose,
  textToSave,
  notesHeight,
  onDelete,
  notes,
  note,
  isOpenNotes,
  isOpenAnnotate,
  height,
  fetchNotes,
  annotateHeight
}) => {
  const [title, setTitle] = useState("");
  const [isOpenDropdown, setIsOpenDropdown] = useState(false);
  const headerRef = useRef(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false); // Track unsaved changes
  const [showConfirm, setShowConfirm] = useState(false);

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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const user_id = user?.user_id;
  const token = useSelector((state) => state.auth.access_token);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
const [tooltipMessage, setTooltipMessage] = useState(""); 
const [tooltipTimeout, setTooltipTimeout] = useState(null);

  //const [titleError, setTitleError] = useState("");
  const initialContent = useRef("");
  const inputRef = useRef(null);

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


  useEffect(() => {
    const localUnsavedChanges = localStorage.getItem("unsavedChanges");
    if (localUnsavedChanges === "true") {
      setUnsavedChanges(true);
    }
  }, []);

  const handleEmailClick = () => {
    setIsEmailModalOpen(true);
  };

  const handleCloseEmailModal = () => {
    setIsEmailModalOpen(false);
    setEmail("");
    setSubject("");
  };

  const handleSendEmail = () => {

    setEmail("");
    setSubject("");
    handleCloseEmailModal();
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

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
          .join(" <br>");
        // .trim();
        editorRef.current.innerHTML = newContent;
        setNoteContent(newContent);

        if (!newContent.trim() && !title.trim()) {
          setUnsavedChanges(false);
          localStorage.removeItem("unsavedChanges");
        } else if (newContent !== initialContent.current) {
          setUnsavedChanges(true);
          localStorage.setItem("unsavedChanges", "true");
        }
      }
    }
  }, [textToSave]);
  useEffect(() => {
    // Store initial content for comparison
    initialContent.current = editorRef.current?.innerHTML || "";
  }, []);

  const handleInput = (e) => {
    const content = e.target.innerText;
  setNoteContent(content);

  if (!title.trim() && !content.trim()) {
    setUnsavedChanges(false);
    localStorage.removeItem("unsavedChanges");
  } else {
    setUnsavedChanges(true);
    localStorage.setItem("unsavedChanges", "true");
  }
  };

  const handleEditorClick = () => {
    editorRef.current.focus();
  };

  const handleFormat = (command) => {
    document.execCommand(command, false, null);

    setActiveFormats((prevFormats) => ({
      ...prevFormats,
      [command]: !prevFormats[command],
    }));

    if (command === "insertOrderedList") {
      setActiveFormats((prevFormats) => ({
        ...prevFormats,
        orderedList: !prevFormats.orderedList,
        unorderedList: false,
      }));
    }

    if (command === "insertUnorderedList") {
      setActiveFormats((prevFormats) => ({
        ...prevFormats,
        unorderedList: !prevFormats.unorderedList,
        orderedList: false,
      }));
    }
  };

  const handleToggleDropdown = () => {
    setIsOpenDropdown(!isOpenDropdown);
  };

  const handleClickOutside = (event) => {
    if (headerRef.current && !headerRef.current.contains(event.target)) {
      setIsOpenDropdown(false);
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
    if (!title.trim()) {
      setTooltipMessage("⚠ Please add a title.");
      setShowTooltip(true);
      return;
    }
  
    const isTitleDuplicate = notes.some((note) => note.title === title.trim());
    if (isTitleDuplicate) {
      setTooltipMessage("⚠ Title already exists. Try another one.");
      setShowTooltip(true);
      return;
    }
  
    const note = {
      title: title || noteContent.slice(0, 25) || "Untitled Note",
      content: noteContent,
    };

    try {
      const response = await apiService.saveNote(
        user_id,
        note.title,
        note.content,
        token
      );
      if (response.status === 201) {
        setNotes((prevNotes) => [note, ...prevNotes]);
        showSuccessToast("Notes Saved Successfully");
        setUnsavedChanges(false);
        fetchNotes();
      }

      onClose();

      setNoteContent("");
      setTitle("");
      editorRef.current.innerHTML = "";
      setUnsavedChanges(false);
      localStorage.removeItem("unsavedChanges");
    } catch (error) {
      showErrorToast("Error saving note:");
      console.error("Error saving note:", error);
    }
  };
  const handleCloseClick = () => {
    const localUnsavedChanges = localStorage.getItem("unsavedChanges");
    if (!title.trim() && !noteContent.trim()) {
      setUnsavedChanges(false);
      localStorage.removeItem("unsavedChanges");
      onClose();
      return;
    }
    if (unsavedChanges || localUnsavedChanges === "true") {
      setShowConfirm(true);
    } else {
      onClose();
    }
  };

  const confirmDelete = (e) => {
    if (note && note.id) {
      onDelete(note.id);
    }
    setShowConfirmDelete(false);
  };

  const cancelDelete = (e) => {
    e.stopPropagation();
    setShowConfirmDelete(false);
  };
  const handleOpenNotesList = () => {
    //onClose();
    if (unsavedChanges) {
      setShowConfirm(true);
    } else {
      onClose();
    }
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsShareModalOpen(false);
  };

  return (
    <section className="notes">
      <header className="note-header" ref={headerRef}>
        {isOpenDropdown && (
          <div className="dropdown">
            <div className="open-header-dropdown">
              {/* Include your dropdown content here, such as other buttons or options */}
              <div className="colors-section">{/* <Colors /> */}</div>
              <div className="dropdown-button-group">
                <button
                  onClick={handleOpenNotesList}
                  className="dropdown-button-noteslist"
                >
                  <HiOutlineMenuAlt1
                    size={20}
                    style={{ marginRight: "10px" }}
                  />
                  <span>Notes List</span>
                </button>
                {showConfirmDelete && (
                  <div className="confirm-overlay">
                    <div className="confirm-popup">
                      <p>Are you sure to delete this note?</p>
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
          <div
            className="save-in"
            style={{ display: "flex", gap: "3px", alignItems: "center" }}
          >
            <BiSave size={25} color="white" />
          </div>
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
              color={isOpenNotes ? "white" : "white"}
              size={25}
            />
          </button>
          <Button
            text={<IoCloseOutline color="white" size={25} />}
            className="notes-cancel-button"
            onClick={handleCloseClick}
          />
          {showConfirm && (
            <ConfirmSave
              message="Leave without saving?"
              onSave={handleSubmit}
              onDiscard={() => {
                setShowConfirm(false);
                localStorage.removeItem("unsavedChanges");
                onClose();
              }}
              onCancel={handleCancel}
            />
          )}
        </div>
      </header>
      <form
        className="create-note__form"
        onSubmit={handleSubmit}
        style={isOpenNotes ? { height: `${height - 86}px` } : {}}
      >
        <input
          className="note-input"
          type="text"
          ref={inputRef}
          placeholder={"Title"}
          value={title}
          required
          onChange={(e) => {
            const newTitle = e.target.value
            setTitle(newTitle);
            setShowTooltip(false);
            if (!newTitle.trim() && !noteContent.trim()) {
              setUnsavedChanges(false);
              localStorage.removeItem("unsavedChanges");
            } else {
              setUnsavedChanges(true);
              localStorage.setItem("unsavedChanges", "true");
            }
            setUnsavedChanges(true);
          }}
          autoFocus
        />
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
  )}
        <div
          className="note-taking"
          ref={editorRef}
          contentEditable={true}
          suppressContentEditableWarning={true}
          onClick={handleEditorClick}
          onInput={handleInput}
          placeholder="Note details..."
          style={{
            maxHeight: isOpenAnnotate 
              ? `${annotateHeight === 0 ? "35vh" : `${annotateHeight + 4}vh`}` 
              : "35vh",
          }}
          
        ></div>
      </form>
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
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="createNotes-modal-overlay" onClick={handleCloseModal}>
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
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div
          className={
            isOpenNotes ? "lander-email-overlay" : "email-modal-overlay"
          }
          onClick={handleCloseEmailModal}
        >
          <div
            className={
              isOpenNotes ? "lander-email-modal-content" : "email-modal-content"
            }
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
