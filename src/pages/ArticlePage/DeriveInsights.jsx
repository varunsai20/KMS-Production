[10/24 4:38 PM] Varun Reddy
import React, { useState } from 'react';

import { useSelector } from 'react-redux'; // Import useSelector from react-redux

import Header from "../../components/Header-New";

import Footer from '../../components/Footer-New';

import LandingImage from "../../assets/images/image 1.svg";

import Left1 from "../../assets/images/Left1.svg";

import Left2 from "../../assets/images/Left2.svg";

import Right2 from "../../assets/images/Right2.svg";

import Right1 from "../../assets/images/Right1.svg";

import SearchBar from '../../components/SearchBar';

import points1 from "../../assets/images/points1.svg";

import points2 from "../../assets/images/points2.svg";

import points3 from "../../assets/images/points3.svg";

import points4 from "../../assets/images/points4.svg";

import History from "../../assets/images/Lander-History.svg";

import Help from "../../assets/images/Lander-Help.svg";

import Utilities from "../../assets/images/Lander-Utilities.svg";

import Analytics from "../../assets/images/Lander-Analytics.svg";

import "./Lander-Logedin.css";

import Notes from "../NotesPage/Notes";
 
const Lander = () => {

  // Access logged-in status from Redux

  const isLoggedIn = useSelector(state => state.auth?.isLoggedIn); // Assuming you have an `auth` reducer managing login
 
  // State to manage whether the Notes modal is open

  const [isNotesOpen, setIsNotesOpen] = useState(false);
 
  // Function to open the Notes modal

  const handleOpenNotes = () => {

    setIsNotesOpen(true);

  };
 
  // Function to close the Notes modal

  const handleCloseNotes = () => {

    setIsNotesOpen(false);

  };
 
  return (

    <div className="Landing-Container">

      <div className="Landing-Header">

        <Header />

      </div>
 
      <div className='Landing-Content'>

        <div className='Landing-Content-Left'>

          <img className="Left1" src={Left2} alt="Left Graphic 1" />

          <img className="Right2" src={Right2} alt="Right Graphic 2" />

          <img className="Left2" src={Left1} alt="Left Graphic 2" />

          <img className="Right1" src={Right1} alt="Right Graphic 1" />

          <div className='Landing-Content-Left-Content'>

            <div>

              <h3 className='Landing-Welcome'>Welcome to <span className='Landing-Infer'>Infer!</span></h3>

              <p className='Landing-Welcome-desc'>

                Lorem Ipsum is simply dummy text of the printing and typesetting industry. 

                Lorem Ipsum has been the industry's standard dummy.

              </p>

              <SearchBar className={`Landing-Searchbar`} />

            </div>

          </div>

        </div>
 
        <div className='Landing-Content-Right'>

          <img className='Landing-Content-Right-Image' src={LandingImage} alt="Landing Graphic" />

        </div>

      </div>
 
      {/* Show different content based on logged-in status */}

      <div className="Landing-Features">

        {isLoggedIn ? (

          // Show this section if logged in

          <>

            <div className="Feature-Item">

              <img className="Landing-History-Icon" src={History} alt="Landing-History-Icon" />

              <h4>History</h4>

              <a href="#">Bookmarks</a>

              <a href="#">Conversations</a>

              <a href="#" onClick={handleOpenNotes}>Notes</a> {/* Open modal on click */}

            </div>

            <div className="Feature-Item">

              <img className="Landing-Analytics-Icon" src={Analytics} alt="Landing-Analytics-Icon" />

              <h4>Analytics</h4>

              <a href="#">Dashboard</a>

              <a href="#">Reports</a>

              <a href="#">Predictive Analysis</a>

            </div>

            <div className="Feature-Item">

              <img className="Landing-Utilities-Icon" src={Utilities} alt="Landing-Utilities-Icon" />

              <h4>Utilities</h4>

              <a href="#">Annotations</a>

              <a href="#">Citation</a>

              <a href="#">Protocol</a>

            </div>

            <div className="Feature-Item">

              <img className="Landing-Help-Icon" src={Help} alt="Landing-Help-Icon" />

              <h4>Help</h4>

              <a href="#">About Infer</a>

              <a href="#">FAQs</a>

            </div>

          </>

        ) : (

          // Show this section if not logged in

          <section className='WhyInfer-points'>

            <div className="Landing-Features-card">

              <div className='Landing-Features-card-Inner'>

                <div className="number number-1"><img src={points1} alt="Icon 1" /></div>

                <h3 className='card-title'>AI-Driven Data Curation</h3>

                <p className='card-content'>InfER’s system helps speed up research by organizing data, making it easy to connect with different data sources.</p>

              </div>

            </div>

            <div className="Landing-Features-card">

              <div className='Landing-Features-card-Inner'>

                <div className="number number-2"><img src={points2} alt="Icon 2" /></div>

                <h3 className='card-title'>Seamless Integration</h3>

                <p className='card-content'>InfER easily connects with popular platforms, allowing real-time data sharing and automatic updates.</p>

              </div>

            </div>

            <div className="Landing-Features-card">

              <div className='Landing-Features-card-Inner'>

                <div className="number number-3"><img src={points3} alt="Icon 3" /></div>

                <h3 className='card-title'>Advanced Analytics Engine</h3>

                <p className='card-content'>Uses smart technology to provide insights through forecasts, live data displays, and in-depth analysis.</p>

              </div>

            </div>

            <div className="Landing-Features-card">

              <div className='Landing-Features-card-Inner'>

                <div className="number number-4"><img src={points4} alt="Icon 4" /></div>

                <h3 className='card-title'>Collaborative Tools</h3>

                <p className='card-content'>InfER’s Collaborative Tools make it easy for teams to share data, add comments, & give feedback in real time.</p>

              </div>

            </div>

          </section>

        )}

      </div>
 
      {/* Render Notes modal conditionally */}

      {isNotesOpen && (

        <div className="notes-modal">

          <Notes />

          <button className="close-modal" onClick={handleCloseNotes}>Close</button>

        </div>

      )}
 
      <Footer />

    </div>

  );

};
 
export default Lander;

[10/24 4:38 PM] Varun Reddy
.notes-modal {

  position: fixed;

  top: 50%;

  left: 50%;

  transform: translate(-50%, -50%);

  background-color: white;

  padding: 20px;

  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);

  z-index: 1000;

  border-radius: 8px;

}
 
.close-modal {

  background-color: #007bff;

  color: white;

  padding: 10px 20px;

  border: none;

  border-radius: 5px;

  cursor: pointer;

}
 
.notes-modal .close-modal:hover {

  background-color: #0056b3;

}

[10:49 AM] Varun Reddy
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate,useLocation } from "react-router-dom";
import "./DeriveInsights.css";
import Loading from "../../components/Loading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";
import { faTimes, faAnglesUp } from "@fortawesome/free-solid-svg-icons";
import { TbFileUpload } from "react-icons/tb";
import { CircularProgress } from "@mui/material";
import Header from "../../components/Header-New";
import uploadimage from "../../assets/images/Upload.svg";
import RecentIntercaions from "../../components/RecentIntercaions";
import ReactMarkdown from "react-markdown";
 
 
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
    const storedHistory = JSON.parse(sessionStorage.getItem("chatHistory")) || [];
    return storedHistory;
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const endOfMessagesRef = useRef(null);
 
  const handleUploadClick = () => {
    document.getElementById("file-upload").click();
  };
 
  const fetchAllInteractions = async () => {
    const previousInteractions = JSON.parse(sessionStorage.getItem("chatHistory")) || [];
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
      formData.append("userid", user.user_id);
 
      if (uploadedFile) {
        formData.append("file", uploadedFile);
      }
 
      if (session_id) {
        url = "http://13.127.207.184:80/insights/ask";
        formData.append("session_id", session_id);
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
              <div className="derive-insights-file-upload" onClick={handleUploadClick} style={{ cursor: "pointer" }}>
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
            {chatHistory?  (
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
                     
                      <div className="query-asked">
                        <span>
                          {chat.query === "Summarize this article"
                            ? "Summarize"
                            : chat.query === "what can we conclude from this article"
                            ? "Conclusion"
                            : chat.query === "what are the key highlights from this article"
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
             ):""}
          </div>
        </div>
      </div>
      <div className="derive-chat-query" style={{ width: "69%", display: displayIfLoggedIn }}>
        <div className="derive-stream-input">
          <label htmlFor="file-upload" className="custom-file-upload">
            <TbFileUpload size={25} />
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
                <FontAwesomeIcon icon={faTimes} onClick={removeUploadedFile} className="cancel-file" />
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
            <CircularProgress className="button" size={24} style={{ marginLeft: "1.5%" }} color="white" />
          ) : (
            <FontAwesomeIcon className="button" onClick={handleAskClick} icon={faTelegram} size={"xl"} />
          )}
        </div>
      </div>
 
      <div className="ScrollTop">
        <button onClick={() => window.scrollTo(0, 0)} id="derive-scrollTopBtn" title="Go to top">

          <FontAwesomeIcon icon={faAnglesUp} />
        </button>
      </div>
    </>
  );
 
};
 
export default DeriveInsights;
 