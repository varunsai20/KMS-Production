import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Header from "../../components/Header-New";
import { useNavigate } from "react-router-dom";
import { setDeriveInsights } from "../../redux/reducers/deriveInsights";
import newChat from "../../assets/images/20px@2x.svg";
import { apiService } from "../../assets/api/apiService";
import axios from "axios";
import pen from "../../assets/images/16px.svg";
import { useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import Annotation from "../../components/Annotaions";
import Notes from "../NotesPage/Notes";
import notesicon from "../../assets/images/note-2.svg";
import annotate from "../../assets/images/task-square.svg";
import ArticleContent from "./ArticleContent";
import ArticleDerive from "./ArticleDerive";
import Loading from "../../components/Loading";
import GenerateAnnotate from "../../components/DeriveAnnotations";
import { faAnglesUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const ArticleLayout = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const { user } = useSelector((state) => state.auth);
  const deriveInsights = useSelector((state) => state.deriveInsights?.active); // assuming deriveInsights is in Redux state
  console.log(deriveInsights);
  const token = useSelector((state) => state.auth.access_token);
  const user_id = user?.user_id;
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { pmid } = useParams();
  const prevPathRef = useRef(location.pathname);
  const [openAnnotate, setOpenAnnotate] = useState(false);
  const [annotateHeight, setAnnotateHeight] = useState(35);
  const [notesHeight, setNotesHeight] = useState(35);
  const [hasFetchedAnnotateData, setHasFetchedAnnotateData] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [annotateLoading, setAnnotateLoading] = useState(false);
  const [showConfirmIcon, setShowConfirmIcon] = useState(false);
  const [savedText, setSavedText] = useState("");
  console.log("tet saved in", savedText);
  const [openNotes, setOpenNotes] = useState(false);
  const [type, id1] = pmid ? pmid.split(":") : "";
  const id = Number(id1);
  const [source, setSource] = useState();
  const displayIfLoggedIn = isLoggedIn ? null : "none";
  const widthIfLoggedIn = isLoggedIn ? null : "80%";
  //const heightIfLoggedIn = isLoggedIn ? null : "80vh";
  const minHeight = 15;
  const maxHeight = 55;
  const [sessions, setSessions] = useState([]);
  const [refreshSessions, setRefreshSessions] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(
    localStorage.getItem("session_id") || null
  );
  const [isPromptEnabled, setIsPromptEnabled] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [annotateData, setAnnotateData] = useState(
    location.state?.annotateData || ""
  );
  useEffect(() => {
    localStorage.removeItem("session_id");
    setActiveSessionId(null);
  }, []);
  useEffect(() => {
    const storedSessionId = localStorage.getItem("session_id");
    if (storedSessionId) {
      setActiveSessionId(storedSessionId);
    }
  }, [sessions]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await apiService.fetchSessions(user_id, token);
        if (response.data?.sessions) {
          const sessionsData = response.data.sessions.reverse(); // Reverse the array order
          // console.log(sessionsData)
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
  const handleOpenChat = () => {
    localStorage.removeItem("session_id");
    setActiveSessionId(null);
    localStorage.setItem("chatHistory", JSON.stringify([]));
    dispatch(setDeriveInsights(true)); // Set deriveInsights state in Redux
    navigate("/article/derive", {
      state: {
        resetArticleData: true,
        resetChatHistory: true,
      },
    });
  };
  useEffect(() => {
    if (openAnnotate && !openNotes) {
      setAnnotateHeight(70);
      setNotesHeight(0);
    } else if (openNotes && !openAnnotate) {
      setNotesHeight(70);
      setAnnotateHeight(0);
    } else {
      setAnnotateHeight(35); // Reset to default when both are open
      setNotesHeight(35);
    }
  }, [openAnnotate, openNotes]);

  const handleSessionClick = async (session_id) => {
    console.log("called in session");
    localStorage.removeItem("session_id");
    try {
      const conversationResponse = await apiService.fetchChatConversation(
        user_id,
        session_id,
        token
      );
      localStorage.setItem("session_id", session_id);
      sessionStorage.setItem("session_id", session_id);
      setIsPromptEnabled(true);
      setActiveSessionId(session_id);

      const formattedChatHistory = [];
      let currentEntry = {};

      // Process the conversation data into a usable format for the chat history
      conversationResponse.data.conversation.forEach((entry) => {
        if (entry.role === "user") {
          if (entry.file_url) {
            currentEntry.file_url = entry.file_url;
          }

          if (currentEntry.query) {
            formattedChatHistory.push(currentEntry);
            currentEntry = {};
          }
          currentEntry.query = entry.parts ? entry.parts.join(" ") : "";
        } else if (entry.role === "model") {
          currentEntry.response = entry.parts ? entry.parts.join(" ") : "";
          formattedChatHistory.push(currentEntry);
          currentEntry = {};
        }
      });

      // Push any remaining entries
      if (currentEntry.query) {
        formattedChatHistory.push(currentEntry);
      }

      localStorage.setItem("chatHistory", JSON.stringify(formattedChatHistory));

      const { source, session_type, article_id } = conversationResponse.data;
      const sourceType =
        source === "biorxiv"
          ? "bioRxiv_id"
          : source === "plos"
          ? "plos_id"
          : "pmid";

      // Define the navigation path based on session type
      const navigatePath =
        session_type === "file_type"
          ? "/article/derive"
          : `/article/content/${sourceType}:${article_id}`;
      setOpenAnnotate(false);
      setAnnotateData("");
      // Dispatch state and navigate accordingly
      if (session_type === "file_type") {
        dispatch(setDeriveInsights(true));
        navigate(navigatePath, {
          state: {
            session_id,
            source,
            token,
            user: { access_token: token, user_id },
            chatHistory: formattedChatHistory,
            sessionTitle: conversationResponse.data.session_title,
          },
        });
      } else {
        dispatch(setDeriveInsights(false));
        navigate(navigatePath, {
          state: {
            id: article_id,
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
  const fetchSessionData = async (session_id) => {
    try {
      const conversationResponse = await axios.get(
        `https://inferai.ai/api/history/conversations/history/${user_id}/${session_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem("session_id", session_id);
      sessionStorage.setItem("session_id", session_id);

      const formattedChatHistory = [];
      let currentEntry = {};

      conversationResponse.data.conversation.forEach((entry) => {
        if (entry.role === "user") {
          if (entry.file_url) {
            currentEntry.file_url = entry.file_url;
          }

          if (currentEntry.query) {
            formattedChatHistory.push(currentEntry);
            currentEntry = {};
          }
          currentEntry.query = entry.parts ? entry.parts.join(" ") : "";
        } else if (entry.role === "model") {
          currentEntry.response = entry.parts ? entry.parts.join(" ") : "";
          formattedChatHistory.push(currentEntry);
          currentEntry = {};
        }
      });

      if (currentEntry.query) {
        formattedChatHistory.push(currentEntry);
      }

      localStorage.setItem("chatHistory", JSON.stringify(formattedChatHistory));
      return conversationResponse.data;
    } catch (error) {
      console.error("Error fetching session data:", error);
      throw error;
    }
  };

  useEffect(() => {
    sessionStorage.removeItem("AnnotateData");
    setAnnotateData("");
    setOpenAnnotate(false);
    setAnnotateFile(false);
    console.log(prevPathRef);
    console.log(location.pathname);

    if (prevPathRef.current !== location.pathname) {
      console.log("workHappened");
      const storedSessionId = localStorage.getItem("session_id");
      if (storedSessionId) {
        fetchSessionData(storedSessionId)
          .then((sessionData) => {
            console.log("Session data updated:", sessionData);
          })
          .catch((error) => {
            console.error("Error fetching session data in useEffect:", error);
          });
      }
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  const handleEditClick = (sessionId, title) => {
    setEditingSessionId(sessionId);
    setEditedTitle(title);
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
        const newNotesHeight = 70 - newAnnotateHeight;

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
  const [fileUrl, setFileUrl] = useState("");
  const [annotateFile, setAnnotateFile] = useState(false);
  const handleAnnotate = () => {
    const matchingIdExists =
      annotateData && Object.prototype.hasOwnProperty.call(annotateData, id);
    let chatHistory = [];
    // Check for chatHistory in localStorage
    const chatHistoryRaw = localStorage.getItem("chatHistory");
    chatHistory = chatHistoryRaw ? JSON.parse(chatHistoryRaw) : [];
    // Find the latest entry with a file_url
    const latestFileEntry = chatHistory
      .filter((entry) => entry.file_url) // Filter entries with file_url
      .pop(); // Get the last entry with file_url (highest index)

    if (latestFileEntry && !annotateData) {
      setFileUrl(latestFileEntry.file_url);
      handleAnnotateFile(latestFileEntry.file_url); // Pass the latest file_url to handleAnnotateFile
      return;
    }

    if (annotateData && annotateData.length > 0) {
      setOpenAnnotate(true); // Set openAnnotate to true if annotateData has items
    } else if (
      (!annotateData || !matchingIdExists) &&
      !hasFetchedAnnotateData
    ) {
      handleAnnotateClick();
    } else {
      setOpenAnnotate((prevOpenAnnotate) => !prevOpenAnnotate); // Toggle if matching ID is present
    }
  };

  console.log(fileUrl);

  const handleAnnotateFile = async () => {
    setAnnotateLoading(true);
    try {
      const response = await apiService.annotateFileFromURL(token,
        { url: fileUrl },
      );
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

  console.log("source", type);

  console.log("id", id);

  const handleAnnotateClick = async () => {
    // Define the request body according to source and id
    let requestBody = {};
    if (type === "pmid" && id) {
      requestBody = { pubmed: [id] };
    } else if (type === "bioRxiv_id" && id) {
      requestBody = { biorxiv: [id] };
    } else if (type === "plos_id" && id) {
      requestBody = { plos: [id] };
    }

    setAnnotateLoading(true);
    try {
      const response = await apiService.annotateFile(requestBody,token);
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
  useEffect(() => {
    if (!annotateData) {
      setHasFetchedAnnotateData(false);
    }
  }, [annotateData, source, id]);
  useEffect(() => {
    if (savedText) {
      setOpenNotes(true);
      setUnsavedChanges(true);
    }
  }, [savedText]);

  const handleNotes = () => {
    const unsavedforIcon = localStorage.getItem("unsavedChanges");
    if (unsavedforIcon === "true") {
      setShowConfirmIcon(true);
    } else {
      setOpenNotes((prevOpenNotes) => !prevOpenNotes);
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
        const newAnnotateHeight = Math.max(minHeight, 70 - newNotesHeight);

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
        <Header style={{ width: "100%" }} />
        <div className="content" style={{ width: widthIfLoggedIn }}>
          <div
            className="history-pagination"
            style={{ display: displayIfLoggedIn }}
          >
            <div
              className="history-pagination-header"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <p>Recent Interactions</p>
              <button className="new-chat-button" onClick={handleOpenChat}>
                <img
                  src={newChat}
                  alt="new-chat-icon"
                  // style={{ paddingRight: "10px" }}
                />
              </button>
            </div>
            <ul>
              {sessions.length > 0 ? (
                sessions.map((session) => {
                  // Mapping keywords to custom titles
                  const mappedTitle = session.session_title.includes(
                    "what are the key highlights from this article"
                  )
                    ? "Key Highlights"
                    : session.session_title.includes(
                        "what can we conclude form this article"
                      )
                    ? "Conclusion"
                    : session.session_title.includes("Summarize this article")
                    ? "Summarize"
                    : session.session_title; // Default title if no keyword match

                  return (
                    <li
                      key={session.session_id}
                      className={
                        session.session_id === activeSessionId ? "active" : ""
                      }
                      onClick={() => {
                        handleSessionClick(
                          session.session_id
                        );
                      }}
                    >
                      {editingSessionId === session.session_id ? (
                        <input
                          type="text"
                          style={{
                            padding: "0",
                            height: "20px",
                            width: "100%",
                            fontSize: "16px",
                            outline: "none",
                            borderColor: editedTitle ? "#1a82ff" : "#1a82ff",
                          }}
                          value={editedTitle}
                          onChange={handleTitleChange}
                          onBlur={() => handleSaveEdit(session.session_id)} // Save on blur
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
                      <img
                        src={pen}
                        alt="pen-icon"
                        title="Rename the title"
                        //icon={faPen}
                        onClick={() =>
                          handleEditClick(session.session_id, mappedTitle)
                        }
                        style={{ cursor: "pointer", marginLeft: "10px" }}
                      />
                    </li>
                  );
                })
              ) : (
                <li>No sessions available</li>
              )}
            </ul>
          </div>
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
            />
          )}
          <div className="right-aside" style={{ display: displayIfLoggedIn }}>
            <div className="annotate-note">
              {openAnnotate && (
                <div
                  className="annotate-height"
                  style={{
                    height: `${annotateHeight}vh`,
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
                    />
                  )}
                  <div
                    className="annotate-line2"
                    onMouseDown={handleAnnotateResize}
                  />
                </div>
              )}
              {openNotes && (
                <div
                  className="notes-height"
                  style={{ height: `${notesHeight}vh` }}
                >
                  <Notes selectedText={savedText} notesHeight={notesHeight} />
                  <div
                    className="notes-line1"
                    onMouseDown={handleNotesResize}
                  />
                  <div
                    className="notes-line2"
                    onMouseDown={handleNotesResize}
                  />
                </div>
              )}
            </div>
            <div className="icons-group">
              <div
                className={`search-annotate-icon ${
                  openAnnotate ? "open" : "closed"
                }`}
                onClick={() => {
                  handleAnnotate();
                }}
                style={{
                  opacity: annotateData && annotateData.length > 0 ? 1 : 1, // Adjust visibility when disabled
                }}
              >
                <img src={annotate} alt="annotate-icon" />
              </div>
              <div
                className={`notes-icon ${openNotes ? "open" : "closed"}`}
                onClick={() => {
                  handleNotes();
                }}
              >
                <img src={notesicon} alt="notes-icon" />
              </div>
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
      <div className="ScrollTop">
        <button onClick={scrollToTop} id="scrollTopBtn" title="Go to top">
          <FontAwesomeIcon icon={faAnglesUp} />
        </button>
      </div>
    </>
  );
};

export default ArticleLayout;
