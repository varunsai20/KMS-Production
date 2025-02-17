import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setDeriveInsights } from "../../redux/reducers/deriveInsights";
import newChat from "../../assets/images/20px@2x.svg";
import { apiService } from "../../assets/api/apiService";
import pen from "../../assets/images/16px.svg";
import { useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import Annotation from "../../components/Annotaions";
import Notes from "../NotesPage/Notes";
import notesicon from "../../assets/images/note-2.svg";
import annotate from "../../assets/images/task-square.svg";
import citation_icon from "../../assets/images/Citations-Icon.svg";
import ArticleContent from "./ArticleContent";
import ArticleDerive from "./ArticleDerive";
import Loading from "../../components/Loading";
import GenerateAnnotate from "../../components/DeriveAnnotations";
import { faAnglesUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IoTrashOutline } from "react-icons/io5";
import { AiOutlineMenu } from "react-icons/ai";
import { CgClose } from "react-icons/cg";
import SearchNavbar from "../../components/SearchNavbar";
const ArticleLayout = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const { user } = useSelector((state) => state.auth);
  const deriveInsights = useSelector((state) => state.deriveInsights?.active);
  const token = useSelector((state) => state.auth.access_token);
  const user_id = user?.user_id;
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { pmid } = useParams();
  const prevPathRef = useRef(location.pathname);
  const [isArticlePage, setIsArticlePage] = useState(false);
  console.log(isArticlePage);
  useEffect(() => {
    // Regular Expression to match "/article/{source:id}"
    const articlePattern = /^\/article\/content\/[^/]+:[^/]+$/;

    if (articlePattern.test(location.pathname)) {
      setIsArticlePage(true);
    } else {
      setIsArticlePage(false);
    }
  }, [location.pathname]);
  const dropdownRef = useRef(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openAnnotate, setOpenAnnotate] = useState(false);
  const [annotateHeight, setAnnotateHeight] = useState(0);
  const [notesHeight, setNotesHeight] = useState(0);
  const [hasFetchedAnnotateData, setHasFetchedAnnotateData] = useState(false);
  const [popupSessionId, setPopupSessionId] = useState(null);
  const [annotateLoading, setAnnotateLoading] = useState(false);
  const [showConfirmIcon, setShowConfirmIcon] = useState(false);
  const [savedText, setSavedText] = useState("");
  const [openNotes, setOpenNotes] = useState(false);
  const [isModalOverlay, setIsModalOverlay] = useState(false);
  const [type, id1] = pmid ? pmid.split(":") : "";
  const id = Number(id1);
  const displayMessage = isLoggedIn
    ? ""
    : "This feature is available for subscribed users.";
  const minHeight = 15;
  const maxHeight = 55;
  const [sessions, setSessions] = useState([]);
  const [refreshSessions, setRefreshSessions] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(
    sessionStorage.getItem("session_id") || null
  );
  const isStreamDoneRef = useRef(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [annotateData, setAnnotateData] = useState(
    location.state?.annotateData || ""
  );
  const annotateRef = useRef(null);
  const notesRef = useRef(null);
  const [query, setQuery] = useState("");
  const [isStreamDone, setIsStreamDone] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth < 992);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 576);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth > 576 && window.innerWidth < 992
  );

  useEffect(() => {
    if (isMobile || isTablet) {
      setIsHistoryOpen(false);
    }
    localStorage.removeItem("session_id");
    setActiveSessionId(null);
  }, []);
  const [clickedBack, setClickedBack] = useState(false);

  useEffect(() => {
    const storedSessionId = sessionStorage.getItem("session_id");
    if (storedSessionId) {
      setActiveSessionId(storedSessionId);
      setClickedBack(false);
    }
  }, [sessions, clickedBack]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await apiService.fetchSessions(user_id, token);
        if (response.data?.sessions) {
          const sessionsData = response.data.sessions.reverse();
          setSessions(sessionsData); // Set the reversed sessions array to state
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };
    if (user_id && token) {
      fetchSessions();
    }
  }, [user_id, token, refreshSessions]);

  // useEffect toggle history
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const isNowMobile = width <= 576;
      const isNowTablet = width > 576 && width < 992;
      setIsSmallScreen(width < 992);
      setIsMobile(isNowMobile);
      setIsTablet(isNowTablet);
      // Set `isHistoryOpen` to false for mobile or tablet views
      if (isNowMobile || isNowTablet) {
        setIsHistoryOpen(false);
      } else {
        setIsHistoryOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Toggle History for small screens
  const toggleHistory = () => {
    if (isSmallScreen) {
      setIsHistoryOpen((prev) => !prev);
      setOpenAnnotate(false); // Close Annotate when History is opened
      setOpenNotes(false); // Close Notes when History is opened
    }
  };

  const handleOpenChat = () => {
    setUploadedFile(null);
    localStorage.removeItem("session_id");
    sessionStorage.removeItem("session_id");
    setAnnotateData("");
    setQuery("");
    setActiveSessionId(null);
    localStorage.setItem("chatHistory", JSON.stringify([]));
    dispatch(setDeriveInsights(true)); // Set deriveInsights state in Redux
    navigate("/article/derive", {
      state: {
        resetArticleData: true,
        resetChatHistory: true,
      },
    });
    if (isMobile === true) {
      setIsHistoryOpen(false);
    }
  };
  const calculateContentHeight = (ref) => {
    if (ref.current) {
      const contentHeight = ref.current.scrollHeight; // Actual content height in pixels
      const vhHeight = (contentHeight / window.innerHeight) * 100; // Convert to vh
      return Math.min(vhHeight, maxHeight); // Cap at maxHeight
    }
    return minHeight; // Default minimum height
  };

  useEffect(() => {
    if (openAnnotate && !openNotes) {
      setAnnotateHeight(calculateContentHeight(annotateRef));
      setNotesHeight(0);
    } else if (openNotes && !openAnnotate) {
      setNotesHeight(calculateContentHeight(notesRef));
      setAnnotateHeight(0);
    } else if (openAnnotate && openNotes) {
      const annotateHeight = calculateContentHeight(annotateRef);
      const notesHeight = calculateContentHeight(notesRef);

      // Ensure combined height doesn't exceed maxHeight
      const totalHeight = annotateHeight + notesHeight;
      if (totalHeight > maxHeight) {
        const ratio = annotateHeight / totalHeight;
        setAnnotateHeight(Math.max(minHeight, Math.round(maxHeight * ratio)));
        setNotesHeight(
          Math.max(minHeight, Math.round(maxHeight * (1 - ratio)))
        );
      } else {
        setAnnotateHeight(annotateHeight);
        setNotesHeight(notesHeight);
      }
    }
  }, [openAnnotate, openNotes]);

  const handleAnnotateResize = (e) => {
    if (openAnnotate && openNotes) {
      e.preventDefault();
      const startY = e.clientY;
      const startHeight = annotateHeight;

      const onMouseMove = (moveEvent) => {
        const delta = ((moveEvent.clientY - startY) / window.innerHeight) * 100;
        const newAnnotateHeight = Math.max(
          minHeight,
          Math.min(maxHeight, startHeight + delta)
        );
        const newNotesHeight = 60 - newAnnotateHeight;

        setAnnotateHeight(newAnnotateHeight);
        setNotesHeight(newNotesHeight);
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
  };
  const handleNotesResize = (e) => {
    if (openAnnotate && openNotes) {
      e.preventDefault();
      const startY = e.clientY;
      const startHeight = notesHeight;

      const onMouseMove = (moveEvent) => {
        const delta = ((startY - moveEvent.clientY) / window.innerHeight) * 100;
        const newNotesHeight = Math.max(
          minHeight,
          Math.min(maxHeight, startHeight + delta)
        );
        const newAnnotateHeight = Math.max(minHeight, 60 - newNotesHeight);

        setNotesHeight(newNotesHeight);
        setAnnotateHeight(newAnnotateHeight);
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setPopupSessionId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // const togglePopup = (sessionId) => {
  //   setPopupSessionId((prev) => (prev === sessionId ? null : sessionId));
  // };
  const togglePopup = (sessionId, event) => {
    if (popupSessionId === sessionId) {
      setPopupSessionId(null);
    } else {
      const menuDotsRect = event.target.getBoundingClientRect();
      const popupX = menuDotsRect.right + 10;
      const popupY = menuDotsRect.top;
      setPopupPosition({ x: popupX, y: popupY });
      setPopupSessionId(sessionId);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await apiService.deleteSession(token, user_id, sessionId);
      setSessions((prevSessions) =>
        prevSessions.filter((session) => session.session_id !== sessionId)
      );
      if (activeSessionId === sessionId) {
        // localStorage.removeItem("session_id");
        // setActiveSessionId(null);
        handleOpenChat();
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };
  const handleSessionClick = async (session_id) => {
    setIsStreamDone(true);
    localStorage.removeItem("chatHistory");
    localStorage.removeItem("session_id");
    setQuery("");
    setUploadedFile(null);
    try {
      // Fetch the conversation data
      const conversationResponse = await apiService.fetchChatConversation(
        user_id,
        session_id,
        token
      );

      // Save session ID in local and session storage
      localStorage.setItem("session_id", session_id);
      sessionStorage.setItem("session_id", session_id);

      // Maintain a list of session IDs
      const existingSessionIds =
        JSON.parse(localStorage.getItem("sessionIds")) || [];
      existingSessionIds.push(session_id); // Allow duplicates
      localStorage.setItem("sessionIds", JSON.stringify(existingSessionIds));

      setActiveSessionId(session_id);

      // Initialize chat history
      let formattedChatHistory = [];

      // Format and store chat history only if data is present and valid
      if (conversationResponse.data.conversation?.length > 0) {
        formattedChatHistory = conversationResponse.data.conversation
          .map((entry) => ({
            query: entry.role === "user" ? entry.content : null,
            response: entry.role === "assistant" ? entry.content : null,
            file_url: entry.file_url || null,
          }))
          .filter(
            (entry) => entry.query || entry.response || entry.file_url // Keep entries with at least one valid field
          );

        if (formattedChatHistory.length > 0) {
          localStorage.setItem(
            "chatHistory",
            JSON.stringify(formattedChatHistory)
          );
        }
      }

      // Extract the latest file_url from chat history
      const latestFileEntry = formattedChatHistory
        .filter((entry) => entry.file_url)
        .pop(); // Get the last entry with a file_url

      if (latestFileEntry) {
        setFileUrl(latestFileEntry.file_url); // Set the fileUrl to the latest file_url
      }

      // Extract and store other session details if they are present
      const { source, session_type, session_title } =
        conversationResponse.data || {};

      // Define navigation path based on session type
      const navigatePath =
        session_type === "file_type"
          ? "/article/derive"
          : `/article/content/${source}:${conversationResponse.data?.article_id}`;

      // Clear annotation data and update state
      setOpenAnnotate(false);
      setAnnotateData("");
      if (isMobile === true) {
        setIsHistoryOpen(false);
      }

      // Navigate based on session type
      if (session_type === "file_type") {
        dispatch(setDeriveInsights(true));
        navigate(navigatePath, {
          state: {
            session_id,
            source,
            token,
            user: { access_token: token, user_id },
            chatHistory: formattedChatHistory,
            sessionTitle: session_title,
          },
        });
      } else if (conversationResponse.data.article_id) {
        dispatch(setDeriveInsights(false));
        navigate(navigatePath, {
          state: {
            id: conversationResponse.data.article_id,
            source,
            token,
            user: { access_token: token, user_id },
            chatHistory: formattedChatHistory,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching article or conversation data:", error);
    }
  };

  useEffect(() => {
    sessionStorage.removeItem("AnnotateData");
    setAnnotateData("");
    setOpenAnnotate(false);
    setAnnotateFile(false);

    if (prevPathRef.current !== location.pathname) {
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  const handleEditClick = (sessionId, title) => {
    setEditingSessionId(sessionId);
    setEditedTitle(title);
    setPopupSessionId(null);
  };

  const handleTitleChange = (e) => {
    setEditedTitle(e.target.value); // Update the state as the user types
  };

  const handleSaveEdit = async (sessionId) => {
    try {
      await apiService.saveEdit(token, {
        user_id,
        session_id: sessionId,
        new_title: editedTitle,
      });
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.session_id === sessionId
            ? { ...session, session_title: editedTitle }
            : session
        )
      );
      setEditingSessionId(null);
      setEditedTitle("");
    } catch (error) {
      console.error("Error updating session title:", error);
    }
  };

  const [fileUrl, setFileUrl] = useState("");
  const [annotateFile, setAnnotateFile] = useState(false);
  const [isCitationsOpen, setIsCitationsOpen] = useState(false);
  const handleOpenCitations = () => {
    if (!uploadedFile) {
      return;
    }
    setIsCitationsOpen(true);
  };
  const handleAnnotate = () => {
    // If annotateData is present, set openAnnotate to false and return
    const isOnArticleDerive = location.pathname === "/article/derive"; // Check if user is on /article/derive

    // Retrieve chat history to find the latest file entry
    let chatHistory = [];
    const chatHistoryRaw = localStorage.getItem("chatHistory");
    chatHistory = chatHistoryRaw ? JSON.parse(chatHistoryRaw) : [];
    const latestFileEntry = chatHistory.filter((entry) => entry.file_url).pop(); // Find latest file entry

    if (isOnArticleDerive) {
      // If on /article/derive, check uploaded file conditions
      if (uploadedFile) {
        handleAnnotateUploadedFile(); // Handle uploaded file annotation
        return;
      }

      if (latestFileEntry && !annotateData) {
        setFileUrl(latestFileEntry.file_url);
        handleAnnotateFile(latestFileEntry.file_url);
        return;
      }
    } else {
      // If NOT on /article/derive, check normal annotation behavior

      if (!isSmallScreen && annotateData) {
        setOpenAnnotate((prevOpenAnnotate) => !prevOpenAnnotate);
        return;
      }

      if (annotateData && isSmallScreen) {
        setOpenNotes(false);
      }

      if (isSmallScreen) {
        setOpenNotes(false);
        setIsHistoryOpen(false);
      }

      const matchingIdExists =
        annotateData && Object.prototype.hasOwnProperty.call(annotateData, id);

      if (annotateData && annotateData.length > 0) {
        setOpenAnnotate(true);
      } else if (
        (!annotateData || !matchingIdExists) &&
        !hasFetchedAnnotateData
      ) {
        handleAnnotateClick();
      } else {
        setOpenAnnotate((prevOpenAnnotate) => !prevOpenAnnotate);
      }
    }
  };

  const handleAnnotateFile = async () => {
    setAnnotateLoading(true);
    try {
      const response = await apiService.annotateFileFromURL(token, {
        url: fileUrl,
      });
      const data = response.data;
      setAnnotateData(data);
      setHasFetchedAnnotateData(true);
      setOpenAnnotate(true);
      setAnnotateFile(true);
    } catch (error) {
      console.error("Error fetching data from the API", error);
    } finally {
      setAnnotateLoading(false);
    }
  };
  const handleAnnotateClick = async () => {
    // Define the request body according to source and id
    let requestBody = {};
    if (id) {
      switch (type) {
        case "pubmed":
        case "pmid":
          requestBody = { pubmed: [id] };
          break;
        case "biorxiv":
        case "bioRxiv_id":
          requestBody = { biorxiv: [id] };
          break;
        case "plos":
        case "plos_id":
          requestBody = { plos: [id] };
          break;
        default:
          console.warn("Unrecognized type:", type);
          break;
      }
    }

    setAnnotateLoading(true);
    try {
      const response = await apiService.annotateArticle(requestBody, token);
      const data = response.data;
      setAnnotateData(data);
      setHasFetchedAnnotateData(true); // Set flag after successful fetch
      setOpenAnnotate(true); // Open annotation panel after data is received
    } catch (error) {
      console.error("Error fetching data from the API", error);
    } finally {
      setAnnotateLoading(false);
    }
  };

  const handleAnnotateUploadedFile = async () => {
    if (!uploadedFile) return; // Ensure uploadedFile exists before proceeding

    setAnnotateLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadedFile); // Append the uploaded file to FormData

      const response = await apiService.annotateFile(formData, token);
      const data = response.data;
      setAnnotateData(data);
      setHasFetchedAnnotateData(true); // Set flag after successful fetch
      setOpenAnnotate(true); // Open annotation panel after data is received
      setAnnotateFile(true); // Set annotate file flag
    } catch (error) {
      console.error("Error annotating the uploaded file", error);
    } finally {
      setAnnotateLoading(false);
    }
  };

  useEffect(() => {
    if (!annotateData) {
      setHasFetchedAnnotateData(false);
    }
  }, [annotateData, id]);
  useEffect(() => {
    if (savedText) {
      setOpenNotes(true);
      //setUnsavedChanges(true);
    }
  }, [savedText]);

  const handleNotes = () => {
    const unsavedforIcon = localStorage.getItem("unsavedChanges");
    if (unsavedforIcon === "true") {
      setShowConfirmIcon(true);
    } else {
      setOpenNotes((prevOpenNotes) => !prevOpenNotes);
    }
    if (isSmallScreen) {
      setOpenAnnotate(false);
      setIsHistoryOpen(false);
    }
  };
  const handleCancelIcon = () => {
    setShowConfirmIcon(false);
  };
  const handleCloseIcon = () => {
    setShowConfirmIcon(false);
    setOpenNotes(false);
    localStorage.removeItem("unsavedChanges");
  };

  function scrollToTop() {
    const articleContent = document.querySelector(".meta");
    if (articleContent) {
      articleContent.scrollTo({
        top: 0,
        behavior: "smooth", // This will create the smooth scrolling effect
      });
    }
  }

  return (
    <>
      <div className="container">
        <SearchNavbar containerRef={null} isModalOverlay={isModalOverlay} />

        <div className={`content ${isMobile ? "mobile-view" : ""}`}>
          {/* History Menu Button */}
          {isTablet && (
            <button className="toggle-history-btn" onClick={toggleHistory}>
              {isHistoryOpen ? (
                <CgClose color="#1A82FF" size={20} />
              ) : (
                <AiOutlineMenu color="#1A82FF" size={20} />
              )}
            </button>
          )}
          {!isMobile && isHistoryOpen && (
            <div
              className="history-pagination"
              style={{
                cursor: isLoggedIn ? "pointer" : "not-allowed",
                opacity: isLoggedIn ? 1 : 0.5,
              }}
            >
              <div
                className="history-pagination-header"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <p>Recent Interactions</p>
                <button className="new-chat-button" onClick={handleOpenChat}>
                  <img src={newChat} alt="new-chat-icon" />
                </button>
              </div>
              <ul>
                {sessions.length > 0 ? (
                  sessions.map((session) => {
                    // Trim quotes from session titles
                    const sanitizedTitle = session.session_title.replace(
                      /^"|"$/g,
                      ""
                    ); // Removes leading and trailing quotes

                    const mappedTitle = sanitizedTitle.includes(
                      "what are the key highlights from this article"
                    )
                      ? "Key Highlights"
                      : sanitizedTitle.includes(
                          "what can we conclude form this article"
                        )
                      ? "Conclusion"
                      : sanitizedTitle.includes("Summarize this article")
                      ? "Summarize"
                      : sanitizedTitle;

                    return (
                      <li
                        key={session.session_id}
                        className={
                          session.session_id === activeSessionId ? "active" : ""
                        }
                        onClick={() => {
                          handleSessionClick(session.session_id);
                        }}
                        style={{ position: "relative" }}
                      >
                        {editingSessionId === session.session_id ? (
                          <input
                            type="text"
                            style={{
                              padding: "0",
                              height: "20px",
                              width: "100%",
                              fontSize: "14px",
                              outline: "none",
                              // borderColor: editedTitle ? "" : "",
                              border: "1px solid #007BFF",
                            }}
                            value={editedTitle}
                            onChange={handleTitleChange}
                            onBlur={() => handleSaveEdit(session.session_id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSaveEdit(session.session_id);
                              }
                            }}
                            autoFocus
                          />
                        ) : (
                          <span>
                            {mappedTitle.slice(0, 25)}
                            {mappedTitle.length > 25 ? "..." : ""}
                          </span>
                        )}
                        <div
                          style={{
                            display: "inline-block",
                            position: "relative",
                          }}
                        >
                          {/* Menu dots */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent click from reaching <li>
                              togglePopup(session.session_id, e);
                            }}
                            id="menu-dots"
                            title="Options"
                            style={{ display: editedTitle ? "none" : "block" }}
                          >
                            ⋮
                          </button>

                          {popupSessionId === session.session_id && (
                            <div
                              ref={dropdownRef}
                              className="popup-menu-renamedelete"
                              style={{
                                transform: `translate(${popupPosition.x}px, ${popupPosition.y}px)`,
                              }}
                            >
                              <div
                                className="popup-rename"
                                onClick={() =>
                                  handleEditClick(
                                    session.session_id,
                                    mappedTitle
                                  )
                                }
                              >
                                <img
                                  src={pen}
                                  alt="pen-icon"
                                  style={{ marginRight: "10px", width: "16px" }}
                                />
                                Rename
                              </div>
                              <div
                                className="popup-delete"
                                onClick={() =>
                                  handleDeleteSession(session.session_id)
                                }
                              >
                                <IoTrashOutline
                                  size={15}
                                  style={{ marginRight: "10px" }}
                                />
                                Delete
                              </div>
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })
                ) : (
                  <li>No sessions available</li>
                )}
              </ul>
            </div>
          )}
          {/* <ArticleContent/> */}
          {annotateLoading ? <Loading /> : ""}
          {deriveInsights ? (
            <ArticleDerive
              setRefreshSessions={setRefreshSessions}
              openAnnotate={openAnnotate}
              setOpenAnnotate={setOpenAnnotate}
              setOpenNotes={setOpenNotes}
              openNotes={openNotes}
              setSavedText={setSavedText}
              annotateLoading={annotateLoading}
              setAnnotateLoading={setAnnotateLoading}
              uploadedFile={uploadedFile}
              setUploadedFile={setUploadedFile}
              isCitationsOpen={isCitationsOpen}
              setIsCitationsOpen={setIsCitationsOpen}
              isStreamDone={isStreamDone}
              setIsStreamDone={setIsStreamDone}
              isStreamDoneRef={isStreamDoneRef}
              setClickedBack={setClickedBack}
              setAnnotateData={setAnnotateData}
              query={query}
              setQuery={setQuery}
            />
          ) : (
            <ArticleContent
              setSavedText={setSavedText}
              setRefreshSessions={setRefreshSessions}
              openAnnotate={openAnnotate}
              setOpenAnnotate={setOpenAnnotate}
              setOpenNotes={setOpenNotes}
              openNotes={openNotes}
              annotateLoading={annotateLoading}
              setAnnotateLoading={setAnnotateLoading}
              isStreamDone={isStreamDone}
              setIsStreamDone={setIsStreamDone}
              isStreamDoneRef={isStreamDoneRef}
              setClickedBack={setClickedBack}
              setActiveSessionId={setActiveSessionId}
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
            />
          )}
          <div
            className={`${isHistoryOpen && "bottom-section"} ${
              isMobile && isHistoryOpen && "mobile-bottom"
            }`}
          >
            {/* Mobile history panel */}

            {isMobile && isHistoryOpen && (
              <div className="mobile-history-panel">
                <div
                  className="history-pagination-header"
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <p>Recent Interactions</p>
                  <button className="new-chat-button" onClick={handleOpenChat}>
                    <img src={newChat} alt="new-chat-icon" />
                  </button>
                </div>
                <ul>
                  {sessions.length > 0 ? (
                    sessions.map((session) => {
                      // Trim quotes from session titles
                      const sanitizedTitle = session.session_title.replace(
                        /^"|"$/g,
                        ""
                      ); // Removes leading and trailing quotes

                      const mappedTitle = sanitizedTitle.includes(
                        "what are the key highlights from this article"
                      )
                        ? "Key Highlights"
                        : sanitizedTitle.includes(
                            "what can we conclude form this article"
                          )
                        ? "Conclusion"
                        : sanitizedTitle.includes("Summarize this article")
                        ? "Summarize"
                        : sanitizedTitle;

                      return (
                        <li
                          key={session.session_id}
                          className={
                            session.session_id === activeSessionId
                              ? "active"
                              : ""
                          }
                          onClick={() => {
                            handleSessionClick(session.session_id);
                          }}
                          style={{ position: "relative" }}
                        >
                          {editingSessionId === session.session_id ? (
                            <input
                              type="text"
                              style={{
                                padding: "0",
                                height: "20px",
                                width: "100%",
                                fontSize: "14px",
                                outline: "none",
                                // borderColor: editedTitle ? "" : "",
                                border: "1px solid #007BFF",
                              }}
                              value={editedTitle}
                              onChange={handleTitleChange}
                              onBlur={() => handleSaveEdit(session.session_id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleSaveEdit(session.session_id);
                                }
                              }}
                              autoFocus
                            />
                          ) : (
                            <span>
                              {mappedTitle.slice(0, 25)}
                              {mappedTitle.length > 25 ? "..." : ""}
                            </span>
                          )}
                          <div
                            style={{
                              display: "inline-block",
                              position: "relative",
                            }}
                          >
                            {/* Menu dots */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent click from reaching <li>
                                togglePopup(session.session_id, e);
                              }}
                              id="menu-dots"
                              title="Options"
                              style={{
                                display: editedTitle ? "none" : "block",
                              }}
                            >
                              ⋮
                            </button>

                            {popupSessionId === session.session_id && (
                              <div
                                ref={dropdownRef}
                                className="mobile-popup-menu-renamedelete"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div
                                  className="popup-rename"
                                  onClick={() =>
                                    handleEditClick(
                                      session.session_id,
                                      mappedTitle
                                    )
                                  }
                                >
                                  <img
                                    src={pen}
                                    alt="pen-icon"
                                    style={{
                                      marginRight: "10px",
                                      width: "16px",
                                    }}
                                  />
                                  Rename
                                </div>
                                <div
                                  className="popup-delete"
                                  onClick={() =>
                                    handleDeleteSession(session.session_id)
                                  }
                                >
                                  <IoTrashOutline
                                    size={15}
                                    style={{ marginRight: "10px" }}
                                  />
                                  Delete
                                </div>
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })
                  ) : (
                    <li>No sessions available</li>
                  )}
                </ul>
              </div>
            )}
          </div>
          <div
            className={`right-aside ${isMobile ? "mobile-aside" : ""}`}
            style={{
              cursor: isLoggedIn ? "" : "not-allowed",
              opacity: isLoggedIn ? 1 : 0.5,
            }}
          >
            <div
              className="annotate-note"
              style={{
                height: "55vh",
                overflowY: "hidden",

                borderRadius:
                  openAnnotate && openNotes ? "0px 0px 16px 16px" : "20px",
              }}
            >
              {openAnnotate && (
                <div
                  ref={annotateRef}
                  className="annotate-height"
                  style={{
                    maxHeight: openAnnotate && openNotes ? `40vh` : undefined,
                    height:
                      openAnnotate && openNotes ? `${annotateHeight}vh` : "",
                  }}
                >
                  {annotateFile ? (
                    <GenerateAnnotate
                      openAnnotate={openAnnotate}
                      annotateData={annotateData}
                      annotateHeight={annotateHeight}
                    />
                  ) : (
                    <Annotation
                      openAnnotate={openAnnotate}
                      annotateData={annotateData}
                      annotateHeight={annotateHeight}
                      openNotes={openNotes}
                    />
                  )}
                  {openAnnotate && openNotes ? (
                    <div
                      className="annotate-line2"
                      onMouseDown={handleAnnotateResize}
                    />
                  ) : (
                    ""
                  )}
                </div>
              )}
              {openNotes && (
                <div
                  ref={notesRef}
                  className="notes-height"
                  // style={{
                  //   height: `${notesHeight}vh`,
                  // }}
                >
                  <Notes
                    selectedText={savedText}
                    notesHeight={notesHeight}
                    annotateHeight={annotateHeight}
                    isOpenAnnotate={openAnnotate}
                    isModalOverlay={isModalOverlay}
                    setIsModalOverlay={setIsModalOverlay}
                  />
                  <div
                    className="notes-line1"
                    onMouseDown={handleNotesResize}
                  />
                  {openAnnotate && openNotes ? (
                    <div
                      className="notes-line2"
                      onMouseDown={handleNotesResize}
                    />
                  ) : (
                    ""
                  )}
                </div>
              )}
            </div>
            <div className="icons-group">
              {isMobile && (
                <button
                  className="botton-toggle-history-btn"
                  onClick={toggleHistory}
                >
                  {isHistoryOpen ? (
                    <CgClose color="#1A82FF" size={20} />
                  ) : (
                    <AiOutlineMenu color="#1A82FF" size={20} />
                  )}
                </button>
              )}
              <div
                className={`search-annotate-icon ${
                  openAnnotate ? "open" : "closed"
                }`}
                onClick={() => {
                  handleAnnotate();
                }}
                style={{
                  cursor: isLoggedIn ? "pointer" : "not-allowed",
                  opacity:
                    (uploadedFile && deriveInsights) ||
                    (annotateData && annotateData.length > 0) ||
                    activeSessionId ||
                    isArticlePage
                      ? 1
                      : 0.5,
                  borderRadius: !deriveInsights ? "8px 8px 0 0" : "8px 8px 0 0",
                }}
                title={isLoggedIn ? "annotate the article" : displayMessage}
              >
                <img src={annotate} alt="annotate-icon" />
              </div>
              <div
                className={`notes-icon ${openNotes ? "open" : "closed"}`}
                style={{
                  borderRadius: !deriveInsights ? "0 0 8px 8px" : 0,
                  cursor: isLoggedIn ? "pointer" : "not-allowed",
                }}
                title={isLoggedIn ? "Open notes" : displayMessage}
                onClick={() => {
                  handleNotes();
                }}
              >
                <img src={notesicon} alt="notes-icon" />
              </div>
              {deriveInsights ? (
                <div
                  className={`search-citation-icon ${
                    openAnnotate ? "open" : "closed"
                  }`}
                  onClick={handleOpenCitations}
                  style={{
                    opacity: uploadedFile ? 1 : 0.5,
                  }}
                  title={isLoggedIn ? "Citate the file" : displayMessage}
                >
                  <img src={citation_icon} alt="citation-icon" />
                </div>
              ) : (
                ""
              )}
              {showConfirmIcon && (
                <div className="Article-popup-overlay">
                  <div className="Article-popup-content">
                    <p className="Saving-note">Saving Note</p>
                    <p id="confirming">Are you sure to leave without saving?</p>
                    <div className="Article-confirm-buttons">
                      <button onClick={handleCancelIcon}>Cancel</button>
                      <button onClick={handleCloseIcon}>Leave</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className="ScrollTop"
        style={{
          display: isMobile && (openAnnotate || openNotes) ? "none" : undefined,
        }}
      >
        <button onClick={scrollToTop} id="scrollTopBtn" title="Go to top">
          <FontAwesomeIcon icon={faAnglesUp} />
        </button>
      </div>
    </>
  );
};

export default ArticleLayout;
