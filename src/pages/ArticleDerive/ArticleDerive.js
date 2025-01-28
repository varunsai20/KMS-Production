import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  
} from "react";
import { useSelector } from "react-redux";
import { useParams, useLocation } from "react-router-dom";
import "../ArticlePage/ArticlePage.css";
import "../ArticlePage/DeriveInsights.css";
import Arrow from "../../assets/images/back-arrow.svg";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { CircularProgress } from "@mui/material";
import pdfICon from "../../assets/images/pdf (1).png";
import docxIcon from "../../assets/images/docx-file.png";
import txtIcon from "../../assets/images/txt-file.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";
import { showErrorToast } from "../../utils/toastHelper";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import upload from "../../assets/images/upload-file.svg";
import { apiService } from "../../assets/api/apiService";
import { renderAsync } from "docx-preview";
import { LiaTelegramPlane } from "react-icons/lia";
import Citations from "../../components/Citations";

const ArticleDerive = ({
  setRefreshSessions,
  openAnnotate,
  openNotes,
  setOpenNotes,
  setOpenAnnotate,
  setSavedText,
  annotateLoading,
  setAnnotateLoading,
  uploadedFile,
  setUploadedFile,
  isCitationsOpen,
  setIsCitationsOpen,
  isStreamDone,
  setIsStreamDone,
  isStreamDoneRef,
  setClickedBack,
  setAnnotateData
}) => {

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const deriveInsights = useSelector((state) => state.deriveInsights?.active);
  const displayIfLoggedIn = isLoggedIn ? null : "none";
  const widthIfLoggedIn = isLoggedIn ? null : "80%";
  const heightIfLoggedIn = isLoggedIn ? null : "80vh";
  const { pmid } = useParams();
  const { user } = useSelector((state) => state.auth);
  const token = useSelector((state) => state.auth.access_token);
  const user_id = user?.user_id;
  const [type, id1] = pmid ? pmid.split(":") : "";
  const id = Number(id1);
  const [source, setSource] = useState();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [articleData, setArticleData] = useState(null);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false);
  
  const endOfMessagesRef = useRef(null);
  const [chatHistory, setChatHistory] = useState(() => {
    const storedHistory = localStorage.getItem("chatHistory");
    return storedHistory ? JSON.parse(storedHistory) : [];
  });

  const { resetArticleData, resetChatHistory } = location.state || {};
  const pdfURL = useMemo(
    () => uploadedFile && URL.createObjectURL(uploadedFile),
    [uploadedFile]
  );

  useEffect(() => {
    if (resetArticleData) {
      setArticleData("");
    }

    if (resetChatHistory) {
      setChatHistory([]);
    }
  }, [resetArticleData, resetChatHistory]);
  useEffect(() => {
    const storedChatHistory = localStorage.getItem("chatHistory");

    if (storedChatHistory) {
      setChatHistory(JSON.parse(storedChatHistory));
      setShowStreamingSection(true);
    }
  }, []);
  useEffect(() => {
    if (annotateLoading) {
      document.body.style.overflow = "hidden"; // Prevent scrolling
    } else {
      document.body.style.overflow = "auto"; // Enable scrolling
    }

    return () => {
      document.body.style.overflow = "auto"; // Cleanup on unmount
    };
  }, [annotateLoading]);
  const [showStreamingSection, setShowStreamingSection] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(
    localStorage.getItem("session_id") || null
  );
  const contentRef = useRef(null); // Ref to target the content div
  const [contentWidth, setContentWidth] = useState(); // State for content width
  const [triggerDeriveClick, setTriggerDeriveClick] = useState(false);
  const [collections, setCollections] = useState([]);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [isPromptEnabled, setIsPromptEnabled] = useState(false);

  const fetchCollections = async () => {
    try {
      const response = await apiService.fetchCollections(user_id, token);
      if (response.data) {
        setCollections(response.data.collections);
        if (response.data.collections.length > 0) {
          localStorage.setItem(
            "collections",
            JSON.stringify(response.data.collections)
          );
        }
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  useEffect(() => {
    if (user_id && token) {
      fetchCollections();
    }
  }, [user_id, token]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const selectedTextRef = useRef("");
  const popupRef = useRef(null);
  //const popupPositionRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    if (!openNotes) {
      setSavedText(""); // Reset savedText when notes are closed
    }
  }, [openNotes]);

  useEffect(() => {
    if (type === "bioRxiv_id") {
      setSource("biorxiv");
    } else if (type === "pmid") {
      setSource("pubmed");
    } else if (type === "plos_id") {
      setSource("plos");
    }
  }, [type]);

  useEffect(() => {
    if (user_id && token) {
      fetchCollections();
    }
  }, [user_id, token]);

  useEffect(() => {
    if (source && id && !deriveInsights) {
      setAnnotateLoading(true);
      const fetchArticleData = async () => {
        try {
          const response = await apiService.fetchArticleData(id, source, token);
          const article = response.data;
          setArticleData(article);
          setAnnotateLoading(false);
          const savedTerm = sessionStorage.getItem("SearchTerm");
          setSearchTerm(savedTerm);
        } catch (error) {
          setAnnotateLoading(false);
          console.error("Error fetching article data:", error);
        }
      };

      fetchArticleData();
    }
  }, [id, source, token, deriveInsights]);

  useEffect(() => {
    // Access the computed width of the content div
    if (contentRef.current) {
      const width = contentRef.current.offsetWidth;
      setContentWidth(`${width}px`);
    }
  }, [openAnnotate]);
  useEffect(() => {
    // Access the computed width of the content div
    if (contentRef.current) {
      const width = contentRef.current.offsetWidth;
      setContentWidth(`${width}px`);
    }
  }, [openNotes]);
  const handleCloseCitations = () => {
    setIsCitationsOpen(false);
  };
  const handleMouseUpInsideContent = (e) => {
    if (!isLoggedIn) return;
    console.log(e);
    const content = contentRef.current;
    const popup = popupRef.current;
  
    if (!content || !popup) return;
  
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString().trim();
  
      if (selectedText && content.contains(range.commonAncestorContainer)) {
        const rects = range.getClientRects();
        const lastRect = rects[rects.length - 1];
  
        if (lastRect) {
          selectedTextRef.current = selectedText;
  
          // Use getBoundingClientRect() for reliable positioning
          const contentRect = content.getBoundingClientRect();
          const popupWidth = popup.offsetWidth;
          const popupHeight = popup.offsetHeight;
  
          // Calculate popup position relative to the container
          let popupX = lastRect.left - contentRect.left; // Relative to the content
          let popupY = lastRect.bottom - contentRect.top; // Below the selection
  
          // Adjust position to prevent the popup from overflowing the content boundaries
          const contentWidth = contentRect.width;
          const contentHeight = contentRect.height;
  
          if (popupX + popupWidth > contentWidth) {
            popupX = contentWidth - popupWidth - 5; // Add margin
          }
          if (popupX < 0) {
            popupX = 5; // Add margin
          }
          if (popupY + popupHeight > contentHeight) {
            popupY = contentHeight - popupHeight - 5; // Add margin
          }
          if (popupY < 0) {
            popupY = 5; // Add margin
          }
  
          // Set popup position
          popup.style.left = `${popupX}px`;
          popup.style.top = `${popupY}px`;
          popup.style.display = "block";
        } else {
          popup.style.display = "none";
        }
      } else {
        popup.style.display = "none";
      }
    } else {
      popup.style.display = "none";
    }
  };
  
  

  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

    useEffect(() => {
      const content = contentRef.current;
      if (!content) return;

      content.addEventListener("mouseup", handleMouseUpInsideContent);

      return () => {
        content.removeEventListener("mouseup", handleMouseUpInsideContent);
      };
    }, [contentRef]);

  const handleSendToNotes = () => {
    if (selectedTextRef.current) {
      setSavedText(selectedTextRef.current); // Update savedText
      selectedTextRef.current = ""; // Clear the selected text
    }
    if (!openNotes) {
      setOpenNotes(true); // Open Notes if not already open
    }
    popupRef.current.style.display = "none"; // Hide popup
  };
  useEffect(() => {
    const articleContent = document.querySelector(".meta");
    const handleScroll = () => {
      if (articleContent.scrollTop > 20) {
        document.getElementById("scrollTopBtn").style.display = "block"; // Show the button
      } else {
        document.getElementById("scrollTopBtn").style.display = "none"; // Hide the button
      }
    };

    // Attach the scroll event listener to .article-content
    if (articleContent) {
      articleContent.addEventListener("scroll", handleScroll);
    }

    // Clean up event listener on component unmount
    return () => {
      if (articleContent) {
        articleContent.removeEventListener("scroll", handleScroll);
      }
    };
  });

  useEffect(() => {
    // Auto-scroll to the bottom if enabled
    if (autoScrollEnabled && endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
      setAutoScrollEnabled(false);
    }
  }, [chatHistory, autoScrollEnabled]);


  const storedSessionId =
    sessionStorage.getItem("sessionId") || sessionStorage.getItem("session_id");
  useEffect(()=>{
    sessionStorage.removeItem("sessionId")
    sessionStorage.removeItem("session_id")
    sessionStorage.removeItem("articleSessions")
    const storedSessionId=null
  },[])

    useEffect(() => {
      isStreamDoneRef.current = isStreamDone; // Sync ref with state
      console.log(`isStreamDone changed: ${isStreamDone}`);
    }, [isStreamDone]);
    
    const handleDeriveClick = useCallback(async () => {
      if (!query && !uploadedFile) {
        showErrorToast("Please enter a query or upload a file");
        return;
      }else if(query && !uploadedFile){
        showErrorToast("please upload your file to proceed");
        return;
      }
      setIsStreamDone(false);
      removeUploadedFile();
      setQuery("");
      setLoading(true);
    
      const newChatEntry = {
        query,
        file: uploadedFile,
        response: "",
        showDot: true,
      };
      setChatHistory((prevChatHistory) => [...prevChatHistory, newChatEntry]);
    
      const sessionKey = `${user.user_id}_${uploadedFile?.name || "query"}`;
      const storedSessionId =
        sessionStorage.getItem("session_id") || "";
    
      try {
        let url = "https://inferai.ai/api/insights/upload";
        const headers = {
          Authorization: `Bearer ${token}`,
        };
    
        const formData = new FormData();
        formData.append("question", query);
    
        if (storedSessionId) {
          formData.append("user_id", user.user_id);
          formData.append("session_id", storedSessionId);
        } else {
          formData.append("userid", user.user_id);
        }
    
        if (uploadedFile) {
          formData.append("file", uploadedFile);
        }
    
        if (storedSessionId) {
          url = "https://inferai.ai/api/insights/ask";
        }
    
        const response = await fetch(url, {
          method: "POST",
          headers: headers,
          body: formData,
        });
    
        if (!response.ok) throw new Error("Network response was not ok");
    
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
    
        const readStream = async () => {
          try {
            let autoScrollSet = false;
            let done = false;
            const delay = 0;
    
            while (!done) {
              if (isStreamDoneRef.current) break; // Stop streaming if flagged
              const { value, done: streamDone } = await reader.read();
              done = streamDone;
    
              if (value) {
                buffer += decoder.decode(value, { stream: true });
    
                while (buffer.indexOf("{") !== -1 && buffer.indexOf("}") !== -1) {
                  let start = buffer.indexOf("{");
                  let end = buffer.indexOf("}", start);
                  if (start !== -1 && end !== -1) {
                    const jsonChunk = buffer.slice(start, end + 1);
                    buffer = buffer.slice(end + 1);
    
                    try {
                      const parsedData = JSON.parse(jsonChunk);
    
                      if (parsedData.session_id) {
                        const articleSessions =
                          JSON.parse(sessionStorage.getItem("articleSessions")) || {};
                        sessionStorage.setItem("session_id", parsedData.session_id);
                        articleSessions[sessionKey] = parsedData.session_id;
                        sessionStorage.setItem(
                          "articleSessions",
                          JSON.stringify(articleSessions)
                        );
                      }
    
                      const answer = parsedData.answer;
                      const words = answer.split("");
    
                      for (const word of words) {
                        if (isStreamDoneRef.current) break; // Stop streaming if flagged
                        await new Promise((resolve) => setTimeout(resolve, delay));
    
                        setChatHistory((chatHistory) => {
                          const updatedChatHistory = [...chatHistory];
                          const lastEntryIndex = updatedChatHistory.length - 1;
    
                          if (lastEntryIndex >= 0) {
                            updatedChatHistory[lastEntryIndex] = {
                              ...updatedChatHistory[lastEntryIndex],
                              response:
                                (updatedChatHistory[lastEntryIndex].response || "") +
                                word,
                              showDot: true,
                            };
                          }
    
                          return updatedChatHistory;
                        });
    
                        if (!autoScrollSet && endOfMessagesRef.current) {
                          setAutoScrollEnabled(true);
                          autoScrollSet = true;
                        }
                      }
                    } catch (error) {
                      console.error("Error parsing JSON chunk:", error);
                    }
                  }
                }
              }
            }
    
            setRefreshSessions((prev) => !prev);
            setLoading(false);
            localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
          } catch (error) {
            console.error("Error reading stream:", error);
            setLoading(false);
          }
        };
    
        readStream();
      } catch (error) {
        console.error("Error during fetch or reading stream:", error);
        setLoading(false);
      }
    }, [query, token, storedSessionId, user.user_id, uploadedFile]);
    
    

  const handlePromptWithFile = (prompt) => {
    if (!uploadedFile && !storedSessionId) return; // Ensure either a file is selected or a session exists

    setQuery(prompt);
    setTriggerDeriveClick(true);
  };
  useEffect(() => {
    if (triggerDeriveClick) {
      handleDeriveClick();
      setTriggerDeriveClick(false); // Reset the flag after handling the click
    }
  }, [query, triggerDeriveClick]);
  const handleDeriveKeyDown = (e) => {
    if (e.key === "Enter") {
      handleDeriveClick();
    }
  };
  const handleBackClick = () => {
    const unsavedChanges = localStorage.getItem("unsavedChanges");
  
    if (unsavedChanges === "true") {
      setShowConfirmPopup(true);
      return; // Do not proceed further if unsaved changes exist
    }
  
    // Retrieve session IDs from localStorage
    const sessionIds = JSON.parse(localStorage.getItem("sessionIds")) || [];
  
    if (sessionIds.length > 1) {
      // Remove the last session ID
      const currentSessionId = sessionIds.pop();
  
      // Set the previous session ID (last after pop) in sessionStorage
      const previousSessionId = sessionIds[sessionIds.length - 1];
      sessionStorage.setItem("session_id", previousSessionId);
  
      // Update localStorage with the remaining session IDs
      localStorage.setItem("sessionIds", JSON.stringify(sessionIds));
  
      console.log(`Navigated back. Current session ID removed: ${currentSessionId}`);
      console.log(`New active session ID set: ${previousSessionId}`);
    } else if (sessionIds.length === 1) {
      // If there's only one session, clear sessionStorage and localStorage for session_id
      sessionStorage.removeItem("session_id");
      localStorage.removeItem("sessionIds");
  
      console.log("Last session ID removed. No more sessions available.");
    } else {
      // If there are no session IDs in localStorage
      setActiveSessionId(null)
      sessionStorage.removeItem("session_id");
      console.log("No session IDs found. Cleared session storage.");
    }
  
    setClickedBack(true);
    // Navigate back
    navigate(-1);
  };

  useEffect(() => {
    localStorage.removeItem("session_id");
    setActiveSessionId(null);
  }, []);

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
  }, [user_id, token]);

  useEffect(() => {
    // Retrieve chat history from sessionStorage on component mount or on location state change
    const storedChatHistory = localStorage.getItem("chatHistory");

    if (storedChatHistory) {
      setChatHistory(JSON.parse(storedChatHistory));
      setShowStreamingSection(true);
    } else {
      setShowStreamingSection(false); // Default to false if no stored chat history
    }
  }, [location.state]);

  useEffect(() => {
    const storedSessionId =
      sessionStorage.getItem("sessionId") || sessionStorage.getItem("session_id");
  
    if ((storedSessionId || uploadedFile) && !loading) {
      setIsPromptEnabled(true);
    } else {
      setIsPromptEnabled(false);
    }
  }, [handleDeriveClick, uploadedFile, loading]);
  

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return; // Exit if no file was selected
    if (file.size > 5 * 1024 * 1024) {
      showErrorToast("try uploading files 5MB or less", {
        position: "top-center",
      });
    }

    const allowedExtensions = ["pdf", "docx"];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      //alert("Please upload a PDF or DOCX file.");
      showErrorToast("try uploading .pdf,.docx");
      return;
    }

    setUploadedFile(file); // Proceed if the file type is valid
    setIsPromptEnabled(true);
    if (fileExtension === "pdf") {
      // setNumPages(null);
      // setPageNumber(1);
    } else if (fileExtension === "docx") {
      handleDocxPreview(file);
    }
  };
  const handleDocxPreview = async (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const container = document.createElement("div"); // Create a container dynamically
      const buffer = e.target.result;
      try {
        await renderAsync(new Uint8Array(buffer), container);
        document.getElementById("docx-container").appendChild(container); // Append the rendered DOCX content
      } catch (error) {
        console.error("Error rendering DOCX:", error);
      }
    };
    reader.readAsArrayBuffer(file);
  };
  const removeUploadedFile = () => {
    setUploadedFile(null);
    setIsPromptEnabled(false);
    setAnnotateData()
    setAnnotateData(null)
    setOpenAnnotate(false)
    // setDocxContent("");
    // setNumPages(null);
    // setPageNumber(1);
  };

  const getFileIcon = (filename) => {
    const fileExtension = filename.split(".").pop().toLowerCase();
    switch (fileExtension) {
      case "pdf":
        return (
          <img
            src={pdfICon}
            alt="pdf-icon"
            style={{ width: "30px", height: "30px" }}
          />
        );
      case "docx":
        return (
          <img
            src={docxIcon}
            alt="pdf-icon"
            style={{ width: "30px", height: "30px" }}
          />
        );
      case "txt":
        return (
          <img
            src={txtIcon}
            alt="pdf-icon"
            style={{ width: "30px", height: "30px" }}
          />
        );
      default:
        return <span style={{ fontSize: "20px" }}>📄</span>;
    }
  };

  return (
    <>
      <div
        className="derive-article-content"
        style={{
          width: widthIfLoggedIn,
          height: heightIfLoggedIn,
          border:
            !uploadedFile && chatHistory.length === 0
              ? "1px solid rgba(235, 235, 243, 1)"
              : undefined,
          display: !uploadedFile && chatHistory.length === 0 ? "flex" : undefined,
          flexDirection: !uploadedFile ? "column" : undefined,
          justifyContent: !uploadedFile ? "center" : undefined,
        }}
                ref={contentRef}
        onMouseUp={handleMouseUpInsideContent}
      >
        
        {/* Display File, Query, and Response */}
        {chatHistory.length > 0 ? (
          <div className="streaming-section-derive">
            
            <div className="streaming-content" style={{paddingRight:"0"}}>
              <div style={{ display: "flex" }} onClick={handleBackClick}>
                <img
                  src={Arrow}
                  style={{ width: "14px" }}
                  alt="arrow-icon"
                ></img>
                <button className="back-button">Back</button>
              </div>
              <div style={{overflowY:"auto"}}>
                
              {chatHistory.map((chat, index) => (
                <div style={{paddingRight:"10px"}}>
                <div key={index}>
                  {chat.file_url ? (
                    <div className="chat-file">
                      <div>{getFileIcon(chat.file_url)}</div>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span>
                          <strong>
                            {decodeURIComponent(chat.file_url.split("/").pop())}
                          </strong>
                        </span>
                      </div>
                    </div>
                  ) : (
                    chat.file && (
                      <div className="chat-file">
                        <div>{getFileIcon(chat.file.name)}</div>
                        <div
                          style={{ display: "flex", flexDirection: "column" }}
                        >
                          <span>
                            <strong>{chat.file.name}</strong>
                          </span>
                          <span>
                            {chat.file.name.split(".").pop().toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                  {chat.query ? (
                    <div className="derive-query-asked">
                      <span>{chat.query}</span>
                    </div>
                  ) : (
                    ""
                  )}
                  {chat.response && (
                    <div className="response" style={{ textAlign: "left" }}>
                      <span ref={endOfMessagesRef}>
                        <ReactMarkdown>{chat.response.trim()}</ReactMarkdown>
                      </span>
                    </div>
                  )}

                  <div
                    ref={popupRef}
                    className="popup-button"
                    style={{
                      position: "absolute",
                      display: "none",
                      backgroundColor: "#afa7a7",
                      color: "white",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    <button
                      onClick={handleSendToNotes}
                      className="Popup-buttons"
                      title="Send to Notes"
                    >
                      <span className="send-to-notes">Send to notes</span>
                      <LiaTelegramPlane size={20} color="black" />
                    </button>
                  </div>
                </div>
                </div>
              ))}
              </div>
              
              {/* File Preview */}
              
            </div>
          </div>
        ) : (
          <>
            {uploadedFile && (
  <>
    {uploadedFile.name.endsWith(".docx") && (
      <div
        className="docx-preview"
        style={{
          border: "1px solid rgb(235, 235, 243)",
          borderRadius: "20px",
        }}
      >
        <div
          id="docx-container"
          // ref={endOfMessagesRef}
          style={{
            maxHeight: "55vh",
            overflow: "auto",
            overflowX: openNotes || openAnnotate ? "auto" : "hidden",
            border: "1px solid #ccc",
            borderRadius: "20px",
          }}
        ></div>
      </div>
    )}
    {uploadedFile.name.endsWith(".pdf") && (
      <div
        className="iframe-preview"
        style={{
          maxHeight: "55vh",
          overflow: "auto",
          overflowX: openNotes || openAnnotate ? "auto" : "hidden",
          border: "1px solid #ccc",
          borderRadius: "20px",
        }}
      >
        <iframe
          src={pdfURL}
          width="100%"
          height="350px"
          title="PDF Preview"
        ></iframe>
      </div>
    )}
  </>
)}

          </>
        )}
        
        <div
          className="derive-chat-query"
          style={{
            bottom: uploadedFile || chatHistory.length > 0 ? "0px" : "auto",
            // position: uploadedFile || chatHistory.length > 0 ? "absolute" : "",
            width: uploadedFile || chatHistory.length > 0 
            ? "100%"
            : "95%",
            display: displayIfLoggedIn,
            // margin: "auto",
          }}
        >
          <div className="prompts">
            <div className="derive-predefined-prompts">
              <button
                onClick={() => handlePromptWithFile("Summarize this article")}
                disabled={!isPromptEnabled}
                style={{
                  backgroundColor: isPromptEnabled ? "#c4dad2" : "#cccccc",
                  color: isPromptEnabled ? "#000000" : "#666666",
                }}
              >
                Summarize
              </button>
              <button
                onClick={() =>
                  handlePromptWithFile("What can we conclude from this article")
                }
                disabled={!isPromptEnabled}
                style={{
                  backgroundColor: isPromptEnabled ? "#c4dad2" : "#cccccc",
                  color: isPromptEnabled ? "#000000" : "#666666",
                }}
              >
                Conclusion
              </button>
              <button
                onClick={() =>
                  handlePromptWithFile(
                    "What are the key highlights from this article"
                  )
                }
                disabled={!isPromptEnabled}
                style={{
                  backgroundColor: isPromptEnabled ? "#c4dad2" : "#cccccc",
                  color: isPromptEnabled ? "#000000" : "#666666",
                }}
              >
                Key Highlights
              </button>
            </div>
            <div className="file-palcement">
              {uploadedFile && (
                <div className="file-showing">
                  <span className="uploaded-file-indicator">
                    {getFileIcon(uploadedFile.name)}
                    <span style={{ width: "max-content" }}>
                      {uploadedFile.name.slice(0, 10)}...
                    </span>
                    <FontAwesomeIcon
                      icon={faTimes}
                      onClick={removeUploadedFile}
                      className="cancel-file"
                      color="black"
                    />
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="derive-stream-input">
            <label htmlFor="file-upload" className="custom-file-upload">
              <img
                src={upload}
                alt="upload-icon"
                style={{ paddingLeft: "10px", cursor: "pointer" }}
              />
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            <div className="query-file-input">
              <input
                type="text"
                placeholder="Upload here for insights..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleDeriveKeyDown}
              />
            </div>
            {loading ? (
              <CircularProgress
                className="button"
                size={24}
                style={{ marginLeft: "1.5%" }}
                color="white"
              />
            ) : (
              <FontAwesomeIcon
                className="button"
                onClick={handleDeriveClick}
                icon={faTelegram}
                size={"xl"}
                style={{
                  cursor: isLoggedIn && query ? "pointer" : "not-allowed", // Set cursor
                  color: (isLoggedIn && query) || uploadedFile ? "" : "grey", // Change color to grey when disabled
                }}
              />
            )}
          </div>
        </div>
        
      </div>
      {isCitationsOpen && (
        <>
          <div className="citation-overlay">
            <div className="citation-modal">
              <Citations
                handleCloseCitations={handleCloseCitations}
                uploadedFile={uploadedFile}
                handleCitations={true}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ArticleDerive;
