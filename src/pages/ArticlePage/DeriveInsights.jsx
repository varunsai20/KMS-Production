import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import "./DeriveInsights.css";
import Loading from "../../components/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";
import { faTimes, faAnglesUp } from "@fortawesome/free-solid-svg-icons";
//import { TbFileUpload } from "react-icons/tb";
import { CircularProgress } from "@mui/material";
import Header from "../../components/Header-New";
import uploadimage from "../../assets/images/Upload.svg";
import RecentIntercaions from "../../components/RecentIntercaions";
import ReactMarkdown from "react-markdown";
import upload from "../../assets/images/upload-file.svg";

const DeriveInsights = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const displayIfLoggedIn = isLoggedIn ? null : "none";
  const { user } = useSelector((state) => state.auth);
  const token = useSelector((state) => state.auth.access_token);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [session_id, setSessionId] = useState(null);
  const [showStreamingSection, setShowStreamingSection] = useState(false);
  const location = useLocation();
  const [chatHistory, setChatHistory] = useState(() => {
    const storedHistory =
      JSON.parse(sessionStorage.getItem("chatHistory")) || [];
    return storedHistory;
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const endOfMessagesRef = useRef(null);

  const handleUploadClick = () => {
    document.getElementById("file-upload").click();
  };

  const fetchAllInteractions = async () => {
    const previousInteractions =
      JSON.parse(sessionStorage.getItem("chatHistory")) || [];
    setChatHistory(previousInteractions);
  };
  useEffect(() => {
    // Retrieve chat history from sessionStorage
    const storedChatHistory = sessionStorage.getItem("chatHistory");

    if (storedChatHistory) {
      // Parse the chat history string back into an array
      setChatHistory(JSON.parse(storedChatHistory));
      setShowStreamingSection(true);
    }
  }, []);
  useEffect(() => {
    fetchAllInteractions();
  }, []);
  useEffect(() => {
    // Retrieve chat history from sessionStorage on component mount or on location state change
    const storedChatHistory = sessionStorage.getItem("chatHistory");

    if (storedChatHistory) {
      setChatHistory(JSON.parse(storedChatHistory));
      setShowStreamingSection(true);
    } else {
      setShowStreamingSection(false); // Default to false if no stored chat history
    }
  }, [location.state]);
  const handleAskClick = async () => {
    if (!query && !uploadedFile) {
      alert("Please enter a query or upload a file");
      return;
    }

    setLoading(true);
    const newChatEntry = {
      query,
      file: uploadedFile,
      response: "",
      showDot: true,
    };
    setChatHistory((prevChatHistory) => [...prevChatHistory, newChatEntry]);

    try {
      let url = "http://13.127.207.184:80/insights/upload";
      const headers = {
        Authorization: `Bearer ${token}`,
        "ngrok-skip-browser-warning": true,
      };

      // Initialize FormData
      const formData = new FormData();
      formData.append("question", query);

      // Conditionally set user_id or userid based on session_id existence
      if (session_id) {
        formData.append("user_id", user.user_id);
        formData.append("session_id", session_id);
      } else {
        formData.append("userid", user.user_id);
      }

      if (uploadedFile) {
        formData.append("file", uploadedFile);
      }

      if (session_id) {
        url = "http://13.127.207.184:80/insights/ask";
      }

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
                  if (!session_id && parsedData.session_id) {
                    setSessionId(parsedData.session_id);
                    sessionStorage.setItem("session_id", parsedData.session_id);
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
                    });
                  }
                } catch (error) {
                  console.error("Error parsing JSON chunk:", error);
                }
              }
            }
          }
        }
        setLoading(false);
        sessionStorage.setItem("chatHistory", JSON.stringify(chatHistory));
      };

      readStream();
    } catch (error) {
      console.error("Error fetching or reading stream:", error);
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
  };

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  const handlePromptClick = (queryText) => {
    setQuery(queryText);
    handleAskClick();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAskClick();
    }
  };

  return (
    <>
      <div className="derive-container">
        <Header style={{ width: "100%" }} />
        <div className="derive-content">
          <RecentIntercaions displayIfLoggedIn={displayIfLoggedIn} />
          <div className="derive-article-content">
            {/* Conditionally render file upload if chatHistory is empty */}
            {chatHistory.length === 0 && (
              <div
                className="derive-insights-file-upload"
                onClick={handleUploadClick}
                style={{ cursor: "pointer" }}
              >
                <img src={uploadimage} alt="upload-img" />
                <div className="choosing-file">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                  />
                  <span>Upload file</span>
                </div>
              </div>
            )}

            {/* Display File, Query, and Response */}
            {chatHistory ? (
              <div className="streaming-section">
                <div className="streaming-content">
                  {chatHistory.map((chat, index) => (
                    <div key={index}>
                      {/* Display file if it exists */}
                      {chat.file && (
                        <div className="chat-file">
                          <strong>File:</strong> {chat.file.name}
                        </div>
                      )}

                      <div className="derive-query-asked">
                        <span>
                          {chat.query === "Summarize this article"
                            ? "Summarize"
                            : chat.query ===
                              "what can we conclude from this article"
                            ? "Conclusion"
                            : chat.query ===
                              "what are the key highlights from this article"
                            ? "Key Highlights"
                            : chat.query}
                        </span>
                      </div>

                      <div className="response" style={{ textAlign: "left" }}>
                        {/* Check if there's a response, otherwise show loading dots */}
                        {chat.response ? (
                          <>
                            <span>
                              <ReactMarkdown>{chat.response}</ReactMarkdown>
                            </span>
                          </>
                        ) : (
                          <div className="loading-dots">
                            <span>•••</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={endOfMessagesRef} />
                </div>
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
      <div
        className="derive-chat-query"
        style={{ width: "69%", display: displayIfLoggedIn }}
      >
        <div className="derive-stream-input">
          {/* <label htmlFor="file-upload" className="custom-file-upload">
            <TbFileUpload size={25} />
          </label> */}
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
            {uploadedFile && (
              <span className="uploaded-file-indicator">
                {uploadedFile.name}
                <FontAwesomeIcon
                  icon={faTimes}
                  onClick={removeUploadedFile}
                  className="cancel-file"
                />
              </span>
            )}
            <input
              type="text"
              placeholder="Ask anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
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
              onClick={handleAskClick}
              icon={faTelegram}
              size={"xl"}
            />
          )}
        </div>
      </div>

      <div className="ScrollTop">
        <button
          onClick={() => window.scrollTo(0, 0)}
          id="derive-scrollTopBtn"
          title="Go to top"
        >
          <FontAwesomeIcon icon={faAnglesUp} />
        </button>
      </div>
    </>
  );
};

export default DeriveInsights;
