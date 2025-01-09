import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import "./ArticlePage.css";
import flag from "../../assets/images/flash.svg";
import ReactMarkdown from "react-markdown";
import { CircularProgress } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";
const ArticlePage = () => {
  const { pmid } = useParams();
  const location = useLocation();
  const { data } = location.state || { data: [] };
  const [searchTerm, setSearchTerm] = useState("");
  const [articleData, setArticleData] = useState(null);

  const [query, setQuery] = useState(""); // Initialize with empty string
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const endOfMessagesRef = useRef(null); // Ref to scroll to the last message
  const [chatHistory, setChatHistory] = useState(() => {
    const storedHistory = localStorage.getItem("chatHistory");
    return storedHistory ? JSON.parse(storedHistory) : [];
  });
  const [showStreamingSection, setShowStreamingSection] = useState(false);
  // const [chatInput, setChatInput] = useState(true);
  const [openAnnotate, setOpenAnnotate] = useState(false);
  const [openNotes, setOpenNotes] = useState(false);
  const contentRef = useRef(null); // Ref to target the content div
  const [contentWidth, setContentWidth] = useState(); // State for content width
  const [triggerAskClick, setTriggerAskClick] = useState(false);

  useEffect(() => {
    // Access the computed width of the content div
    if (contentRef.current) {
      const width = contentRef.current.offsetWidth; // Get the width of the content div in pixels
      setContentWidth(`${width}px`); // Update the contentWidth state with the computed width
    }
  }, [openAnnotate]);
  useEffect(() => {
    // Access the computed width of the content div
    if (contentRef.current) {
      const width = contentRef.current.offsetWidth; // Get the width of the content div in pixels
      setContentWidth(`${width}px`); // Update the contentWidth state with the computed width
    }
  }, [openNotes]);

  useEffect(() => {
    if (data && data.articles) {
      const savedTerm = sessionStorage.getItem("SearchTerm");
      setSearchTerm(savedTerm);
      
      const article = data.articles.find((article) => {
        // Example: If pmid is stored as `article.pmid.value`, modify accordingly
        const articlePmid = article.pmid.value || article.pmid; // Update this line based on the actual structure of pmid
        return String(articlePmid) === String(pmid);
      });
      if (article) {
        setArticleData(article);
      } else {
        console.error("Article not found for the given PMID");
      }
    } else {
      console.error("Data or articles not available");
    }
  }, [pmid, data]);
  useEffect(() => {
    // Scroll to the bottom whenever chat history is updated
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]); // This will trigger when chatHistory changes

  const handleAskClick = async () => {
    if (!query) {
      alert("Please enter a query");
      return;
    }

    setShowStreamingSection(true);
    setLoading(true);

    const newChatEntry = { query, response: "", showDot: true };
    setChatHistory((prevChatHistory) => [...prevChatHistory, newChatEntry]);

    const bodyData = JSON.stringify({
      question: query,
      pmid: pmid,
    });

    try {
      const response = await fetch("https://inferai.ai/api/generateanswer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: bodyData,
      });

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

            // Process chunks
            while (buffer.indexOf("{") !== -1 && buffer.indexOf("}") !== -1) {
              let start = buffer.indexOf("{");
              let end = buffer.indexOf("}", start);
              if (start !== -1 && end !== -1) {
                const jsonChunk = buffer.slice(start, end + 1);
                buffer = buffer.slice(end + 1);

                try {
                  const parsedData = JSON.parse(jsonChunk);
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
                            updatedChatHistory[lastEntryIndex].response +
                            " " +
                            word,
                          showDot: true, // Show dot while streaming
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

                  // Hide dot after last word
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

        setLoading(false);
        localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
      };

      readStream();
    } catch (error) {
      console.error("Error fetching or reading stream:", error);
      setLoading(false);
    }
  };
  const handlePromptClick = (queryText) => {
    setQuery(queryText);
    setTriggerAskClick(true);
  };
  useEffect(() => {
    if (triggerAskClick) {
      handleAskClick();
      setTriggerAskClick(false); // Reset the flag after handling the click
    }
  }, [query, triggerAskClick]);
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAskClick();
    }
  };

  return (
    <>
      <div className="container">
        <div className="content">
          {showStreamingSection && (
            <div className="streaming-section">
              <div className="streaming-content">
                {chatHistory.map((chat, index) => (
                  <div key={index}>
                    <div className="query-asked">
                      <span>{chat.query}</span>
                    </div>

                    <div className="response" style={{ textAlign: "left" }}>
                      {/* Check if there's a response, otherwise show loading dots */}
                      {chat.response ? (
                        <>
                          <span>
                            <ReactMarkdown>{`${chat.response}`}</ReactMarkdown>
                          </span>
                        </>
                      ) : (
                        <div className="loading-dots">
                          <span>•••</span>
                        </div>
                      )}

                      <div ref={endOfMessagesRef} />
                    </div>
                  </div>
                ))}
                {/* This div will act as the reference for scrolling */}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="chat-query" style={{ width: contentWidth }}>
        <div className="predefined-prompts">
          <button onClick={() => handlePromptClick("Summarize this article?")}>
            Summarize this article?
          </button>
          <button onClick={() => handlePromptClick("Explain more briefly?")}>
            Explain more briefly?
          </button>
          <button
            onClick={() =>
              handlePromptClick("What can you conclude from this?")
            }
          >
            What can you conclude from this?
          </button>
        </div>
        <div className="stream-input">
          <img src={flag} alt="flag-logo" className="stream-flag-logo" />
          <input
            type="text"
            placeholder="Ask anything..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {loading ? (
            <CircularProgress size={24} color="white" />
          ) : (
            <FontAwesomeIcon
              className="button"
              onClick={handleAskClick}
              icon={faTelegram}
              size={"xl"}
            />
          )}
          {/* </button> */}
        </div>
      </div>
    </>
  );
};

export default ArticlePage;
