import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setDeriveInsights } from "../../redux/reducers/deriveInsights";
import { useParams, useLocation } from "react-router-dom";
import "../ArticlePage/ArticlePage.css";
import { Typography } from "@mui/material";
import Arrow from "../../assets/images/back-arrow.svg";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { CircularProgress } from "@mui/material";
import pdfICon from "../../assets/images/pdf (1).png";
import docxIcon from "../../assets/images/docx-file.png";
import txtIcon from "../../assets/images/txt-file.png";
import rehypeRaw from "rehype-raw";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";
import { LiaTelegramPlane } from "react-icons/lia";
import { showErrorToast } from "../../utils/toastHelper";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import upload from "../../assets/images/upload-file.svg";

import uploadDocx from "../../assets/images/uploadDocx.svg";
import { apiService } from "../../assets/api/apiService";
const ArticleDerive = ({
  setRefreshSessions,
  openAnnotate,
  openNotes,
  setOpenNotes,
  setOpenAnnotate,
  setSavedText,
  annotateLoading,
  setAnnotateLoading,
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

  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [annotateData, setAnnotateData] = useState(
    location.state?.annotateData || ""
  );
  const endOfMessagesRef = useRef(null);
  const [chatHistory, setChatHistory] = useState(() => {
    const storedHistory = localStorage.getItem("chatHistory");
    return storedHistory ? JSON.parse(storedHistory) : [];
  });

  const { resetArticleData, resetChatHistory } = location.state || {};

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

  const [triggerAskClick, setTriggerAskClick] = useState(false);
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

  const [hasFetchedAnnotateData, setHasFetchedAnnotateData] = useState(false);
  const [sessions, setSessions] = useState([]);
  const selectedTextRef = useRef("");
  const popupRef = useRef(null);
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

  const handleMouseUpInsideContent = (e) => {
    if (!isLoggedIn) return;
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

          const popupX = lastRect.right + window.scrollX;
          const popupY = lastRect.bottom + window.scrollY;

          popup.style.left = `${popupX}px`;
          popup.style.top = `${popupY + 5}px`; // Add offset below the text
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
    const content = contentRef.current;
    if (!content) return;

    content.addEventListener("mouseup", handleMouseUpInsideContent);

    return () => {
      content.removeEventListener("mouseup", handleMouseUpInsideContent);
    };
  }, [contentRef]);
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
    // Scroll to the bottom whenever chat history is updated
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]); // This will trigger when chatHistory changes

  const handleAskClick = async () => {
    if (!query) {
      showErrorToast("Please enter a query");
      return;
    }

    setShowStreamingSection(true);
    setLoading(true);

    const newChatEntry = { query, response: "", showDot: true };
    setChatHistory((prevChatHistory) => [...prevChatHistory, newChatEntry]);

    // Create a unique key for the session based on the source and article id
    const sessionKey = `${source}_${id}`;
    const storedSessionId =
      JSON.parse(sessionStorage.getItem("articleSessions"))?.[sessionKey] || "";

    const bodyData = JSON.stringify({
      question: query,
      user_id: user_id,
      session_id: storedSessionId || undefined, // Use stored session_id if available
      source: source,
      article_id: Number(id),
    });

    try {
      const response = await fetch(
        "https://inferai.ai/api/view_article/generateanswer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add the Bearer token here
          },
          body: bodyData,
        }
      );
      // console.log("API Response:", response);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      setQuery("");

      const readStream = async () => {
        let done = false;
        const delay = 100; // Delay between words

        while (!done) {
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
                  // console.log("Received Data Chunk:", parsedData); // Log each parsed data chunk

                  // Store session_id for the specific article and source in sessionStorage if it exists
                  if (parsedData.session_id) {
                    const articleSessions =
                      JSON.parse(sessionStorage.getItem("articleSessions")) ||
                      {};
                    articleSessions[sessionKey] = parsedData.session_id; // Store session_id under source_id key
                    sessionStorage.setItem(
                      "articleSessions",
                      JSON.stringify(articleSessions)
                    );
                  }

                  const answer = parsedData.answer;
                  const words = answer.split(" ");

                  for (const word of words) {
                    await new Promise((resolve) => setTimeout(resolve, delay));

                    setChatHistory((chatHistory) => {
                      const updatedChatHistory = [...chatHistory];
                      const lastEntryIndex = updatedChatHistory.length - 1;

                      if (lastEntryIndex >= 0) {
                        updatedChatHistory[lastEntryIndex] = {
                          ...updatedChatHistory[lastEntryIndex],
                          response:
                            (updatedChatHistory[lastEntryIndex].response ||
                              "") +
                            " " +
                            word,
                          showDot: true,
                        };
                      }

                      return updatedChatHistory;
                    });

                    setResponse((prev) => prev + " " + word);

                    if (endOfMessagesRef.current) {
                      endOfMessagesRef.current.scrollIntoView({
                        behavior: "smooth",
                      });
                    }
                  }
                  setChatHistory((chatHistory) => {
                    const updatedChatHistory = [...chatHistory];
                    const lastEntryIndex = updatedChatHistory.length - 1;
                    if (lastEntryIndex >= 0) {
                      updatedChatHistory[lastEntryIndex].showDot = false;
                    }
                    return updatedChatHistory;
                  });
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
      };

      readStream();
    } catch (error) {
      console.error("Error fetching or reading stream:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (triggerAskClick) {
      handleAskClick();
      setTriggerAskClick(false); // Reset the flag after handling the click
    }
  }, [query, triggerAskClick]);

  const storedSessionId =
    localStorage.getItem("sessionId") || localStorage.getItem("session_id");
  const handleDeriveClick = async () => {
    if (!query && !uploadedFile) {
      showErrorToast("Please enter a query or upload a file", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }
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

    try {
      let url = "https://inferai.ai/api/insights/upload";
      const headers = {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": true,
      };
      console.log(storedSessionId);
      // Initialize FormData
      const formData = new FormData();
      formData.append("question", query);

      // Conditionally set user_id or userid based on session_id existence
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
      console.log(storedSessionId);
      // Use fetch instead of axios to handle streaming response
      const response = await fetch(url, {
        method: "POST",
        headers: headers,
        body: formData,
      });

      if (!response.ok) throw new Error("Network response was not ok");

      // Stream response and update chat history
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let apiResponse = ""; // To accumulate the full response

      const readStream = async () => {
        let done = false;
        const delay = 100;

        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;

          if (value) {
            buffer += decoder.decode(value, { stream: true });

            // Process chunks of JSON-like data
            while (buffer.indexOf("{") !== -1 && buffer.indexOf("}") !== -1) {
              let start = buffer.indexOf("{");
              let end = buffer.indexOf("}", start);
              if (start !== -1 && end !== -1) {
                const jsonChunk = buffer.slice(start, end + 1);
                buffer = buffer.slice(end + 1);

                try {
                  const parsedData = JSON.parse(jsonChunk);
                  const answer = parsedData.answer;
                  apiResponse += answer + " "; // Accumulate the full response

                  // Store session_id if not already stored
                  if (!storedSessionId && parsedData.session_id) {
                    // setSessionId(parsedData.session_id);
                    localStorage.setItem("session_id", parsedData.session_id);
                  }

                  setChatHistory((chatHistory) => {
                    const updatedChatHistory = [...chatHistory];
                    const lastEntryIndex = updatedChatHistory.length - 1;
                    if (lastEntryIndex >= 0) {
                      updatedChatHistory[lastEntryIndex] = {
                        ...updatedChatHistory[lastEntryIndex],
                        response: apiResponse.trim(),
                        showDot: false,
                      };
                    }
                    return updatedChatHistory;
                  });

                  if (endOfMessagesRef.current) {
                    endOfMessagesRef.current.scrollIntoView({
                      behavior: "smooth",
                      // block: "end",
                    });
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
      };

      readStream();
    } catch (error) {
      console.error("Error fetching or reading stream:", error);
      setLoading(false);
    }
  };

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
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    localStorage.removeItem("session_id");
    setActiveSessionId(null);
  }, []);

  const boldTerm = (text) => {
    if (typeof text !== "string") {
      return JSON.stringify(text);
    }

    if (!searchTerm) return text;

    // Create a regex to find the search term
    const regex = new RegExp(`(${searchTerm})`, "gi");

    // Replace the search term in the text with markdown bold syntax
    return text.replace(regex, "**$1**");
  };

  // Optional: useEffect for clearing flag if needed, such as when sources change
  useEffect(() => {
    if (!annotateData) {
      setHasFetchedAnnotateData(false);
    }
  }, [annotateData, source, id]);

  const capitalizeFirstLetter = (text) => {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const MyMarkdownComponent = ({ markdownContent, handleMouseUp }) => {
    return (
      <div onMouseUp={handleMouseUp}>
        <ReactMarkdown
          rehypePlugins={[rehypeRaw]} // Enables HTML parsing
        >
          {markdownContent}
        </ReactMarkdown>
      </div>
    );
  };
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get(
          `https://inferai.ai/api/history/conversations/history/${user_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

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
  }, [location.state]); // Add location.state as a dependency to re-run on navigation
  console.log(source);
  const getSourceFromType = (type) => {
    switch (type) {
      case "bioRxiv_id":
        return "biorxiv";
      case "pmid":
        return "pubmed";
      case "plos_id":
        return "plos";
      default:
        return null;
    }
  };
  useEffect(() => {
    const storedSessionId = localStorage.getItem("session_id");
    if (storedSessionId) {
      setActiveSessionId(storedSessionId);
    }
  }, [sessions]);

  const [uploadedFile, setUploadedFile] = useState(null);
  useEffect(() => {
    const storedSessionId =
      localStorage.getItem("sessionId") || localStorage.getItem("session_id");
    if (storedSessionId || uploadedFile) {
      setIsPromptEnabled(true); // Enable prompts if session_id exists or a file is uploaded
    } else {
      setIsPromptEnabled(false); // Disable prompts if neither session_id nor file is present
    }
  }, [handleDeriveClick, uploadedFile]);

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
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setIsPromptEnabled(false);
  };
  const handleUploadClick = () => {
    document.getElementById("file-upload").click();
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
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
  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (
      file &&
      (file.type === "application/pdf" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "text/plain")
    ) {
      handleFileUpload({ target: { files: [file] } });
    }
  };

  return (
    <>
      <div
        className="derive-article-content"
        style={{ width: widthIfLoggedIn, height: heightIfLoggedIn }}
        ref={contentRef}
        onMouseUp={handleMouseUpInsideContent}
      >
        {" "}
        {/* Conditionally render file upload if chatHistory is empty */}
        {chatHistory.length === 0 && (
          <div
            className={`derive-insights-file-upload ${
              isDragging ? "dragging" : ""
            }`}
            onClick={handleUploadClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ cursor: "pointer" }}
          >
            <img src={uploadDocx} style={{ width: "40%" }} alt="upload-img" />
            <div className="choosing-file">
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                style={{ display: "none" }}
              />
              <span>
                Drag & drop files here or <a href="#file">Upload</a>
              </span>
            </div>
          </div>
        )}
        {/* Display File, Query, and Response */}
        {chatHistory.length > 0 ? (
          <div className="streaming-section">
            <div className="streaming-content">
              <div style={{ display: "flex" }} onClick={handleBackClick}>
                <img
                  src={Arrow}
                  style={{ width: "14px" }}
                  alt="arrow-icon"
                ></img>
                <button className="back-button">Back</button>
              </div>
              {chatHistory.map((chat, index) => (
                <div key={index}>
                  {/* Display file_url if it exists */}
                  {chat.file_url ? (
                    <div className="chat-file">
                      <div>{getFileIcon(chat.file_url)}</div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {/* Display the file name and extension from file_url */}
                        <span>
                          <strong>
                            {decodeURIComponent(chat.file_url.split("/").pop())}
                          </strong>
                        </span>
                        {/* <span>
                          {chat.file_url.split(".").pop().toUpperCase()}
                        </span> */}
                      </div>
                    </div>
                  ) : (
                    chat.file && (
                      <div className="chat-file">
                        <div>{getFileIcon(chat.file.name)}</div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          {/* Display the file name and extension from chat.file.name */}
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

                  {/* Display the query */}
                  {chat.query ? (
                    <div className="derive-query-asked">
                      <span>
                        {chat.query === "Summarize this article"
                          ? "Summarize"
                          : chat.query ===
                            "What can we conclude from this article"
                          ? "Conclusion"
                          : chat.query ===
                            "What are the key highlights from this article"
                          ? "Key Highlights"
                          : chat.query}
                      </span>
                    </div>
                  ) : (
                    ""
                  )}

                  {/* Display the response */}
                  <div className="response" style={{ textAlign: "left" }}>
                    {chat.response ? (
                      <span ref={endOfMessagesRef}>
                        <ReactMarkdown>{chat.response}</ReactMarkdown>
                      </span>
                    ) : (
                      <div className="loading-dots">
                        <span>•••</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {/* <div ref={endOfMessagesRef} /> */}
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
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
      <div
        className="derive-chat-query"
        style={{
          width: openAnnotate || openNotes ? contentWidth : "69%",
          display: displayIfLoggedIn,
        }}
      >
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
                  {uploadedFile.name}
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
              placeholder="Ask anything..."
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
            />
          )}
        </div>
      </div>
    </>
  );
};

export default ArticleDerive;
