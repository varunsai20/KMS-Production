import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import "./ArticlePage.css";
import { Typography } from "@mui/material";
import flag from "../../assets/images/flash.svg";
import Arrow from "../../assets/images/back-arrow.svg";
import annotate from "../../assets/images/task-square.svg";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { CircularProgress } from "@mui/material";
import { Autocomplete, InputAdornment, TextField } from "@mui/material";
import Annotation from "../../components/Annotaions";
import { faBookmark as regularBookmark } from '@fortawesome/free-regular-svg-icons';

import Button from "../../components/Buttons";
//import edit from "../../assets/images/16px.svg";
//import annotate from "../../assets/images/task-square.svg";
import notesicon from "../../assets/images/note-2.svg";
import rehypeRaw from "rehype-raw";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//import sendicon from "../../assets/images/sendicon.svg";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { faAnglesUp } from "@fortawesome/free-solid-svg-icons";
//import { TextContext } from "../../components/Notes/TextProvider";
import { IoSaveOutline } from "react-icons/io5";
import Notes from "../NotesPage/Notes";
const ArticlePage = () => {
  const { pmid } = useParams();
  const [type, id1] = pmid.split(":");
  const id = Number(id1);
  const [source, setSource] = useState();

  const location = useLocation();
  const { data } = location.state || { data: [] };

  const [searchTerm, setSearchTerm] = useState("");
  const [articleData, setArticleData] = useState(null);
  const navigate = useNavigate();
  const [query, setQuery] = useState(""); // Initialize with empty string
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const annotateData = location.state.annotateData || { annotateData: [] };
  console.log(annotateData)
  const endOfMessagesRef = useRef(null); // Ref to scroll to the last message
  const [chatHistory, setChatHistory] = useState(() => {
    const storedHistory = sessionStorage.getItem("chatHistory");
    return storedHistory ? JSON.parse(storedHistory) : [];
  });
  useEffect(() => {
    // Retrieve chat history from sessionStorage
    const storedChatHistory = sessionStorage.getItem("chatHistory");

    if (storedChatHistory) {
      // Parse the chat history string back into an array
      setChatHistory(JSON.parse(storedChatHistory));
    }
  }, []);
  const [showStreamingSection, setShowStreamingSection] = useState(false);
  // const [chatInput, setChatInput] = useState(true);
  const [openAnnotate, setOpenAnnotate] = useState(false);
  const [openNotes, setOpenNotes] = useState(false);
  const [activeSection, setActiveSection] = useState("Title");
  const contentRef = useRef(null); // Ref to target the content div
  const [contentWidth, setContentWidth] = useState(); // State for content width
  const [ratingsList, setRatingsList] = useState(() => {
    return JSON.parse(sessionStorage.getItem("ratingsList")) || [];
  });
  const [triggerAskClick, setTriggerAskClick] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");
  const [editingPmid, setEditingPmid] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [bookmarkedPmids, setBookmarkedPmids] = useState({});
  // const handleResize = (event) => {
  //   const newWidth = event.target.value; // Get the new width from user interaction
  //   setWidth1(newWidth);
  //   setWidth2(100 - newWidth); // Second div takes up the remaining width
  // };
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

  const getRatingForArticle = (uniqueId) => {
    const savedRating = ratingsList.find((item) => item.uniqueId === uniqueId);
    return savedRating ? savedRating.rating : 0; // Default rating is 0 if not found
  };

  const handleRatingChange = (uniqueId, newRating) => {
    const updatedRatings = [...ratingsList];
    const existingRatingIndex = updatedRatings.findIndex(
      (item) => item.uniqueId === uniqueId
    );

    if (existingRatingIndex !== -1) {
      updatedRatings[existingRatingIndex].rating = newRating;
    } else {
      updatedRatings.push({ uniqueId, rating: newRating });
    }

    setRatingsList(updatedRatings);
    sessionStorage.setItem("ratingsList", JSON.stringify(updatedRatings));
  };
  const handleMouseUp = (event) => {
    const selection = window.getSelection().toString().trim();
    if (selection) {
      setSelectedText(selection); // Store selected text
      setPopupPosition({ x: event.pageX, y: event.pageY }); // Set popup position
      setShowPopup(true); // Show the popup for saving the selection
    } else {
      setShowPopup(false);
    }
  };
  const handleBookmarkClick = (pmid) => {
    setBookmarkedPmids((prevState) => ({
      ...prevState,
      [pmid]: !prevState[pmid], // Toggle the bookmark state for the specific pmid
    }));
    
  };
 
  const handleSaveToNote = () => {

    if (selectedText) {
      setOpenNotes(true); // Open Notes when the "Save to Notes" button is clicked
      setShowPopup(false); // Hide the popup
    }
  };
  useEffect(() => {
    if (selectedText && openNotes === true) {
      setOpenNotes(true);
    }
  }, [selectedText]);


  const getIdType = () => {
    return `${source}_${id}`;
  };

  const uniqueId = getIdType();

  useEffect(() => {
    if (type === "bioRxiv_id") {
      setSource("biorxiv");
    } else if (type === "pmid") {
      setSource("pubmed");
    } else if (type === "plos_id") {
      setSource("plos");
    }

    if (data && data.articles) {
      const savedTerm = sessionStorage.getItem("SearchTerm");
      setSearchTerm(savedTerm);
      const article = data.articles.find((article) => {
        const articlePmid =
          article.pmid || article.bioRxiv_id || article.plos_id;
        return String(articlePmid) === String(id);
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
    const articleContent = document.querySelector(".article-content");

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

  function scrollToTop() {
    const articleContent = document.querySelector(".article-content");
    if (articleContent) {
      articleContent.scrollTo({
        top: 0,
        behavior: "smooth", // This will create the smooth scrolling effect
      });
    }
  }

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
      id: id,
      source: source,
    });
    try {
      const response = await fetch("http://13.127.207.184:80/generateanswer", {
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
            if (articleData) {
              let storedHistory =
                JSON.parse(localStorage.getItem("history")) || [];

              // Check if the pmid is already present in the history
              const pmidExists = storedHistory.some(
                (item) => item.pmid === pmid
              );

              // Only add the entry if the pmid is not already in the history
              if (!pmidExists) {
                const newHistoryEntry = {
                  pmid: pmid,
                  title: articleData.article_title.toLowerCase(),
                };

                // Add the new entry to the beginning of the history
                storedHistory = [newHistoryEntry, ...storedHistory];

                // Update localStorage
                localStorage.setItem("history", JSON.stringify(storedHistory));
              }
            }
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
                            (updatedChatHistory[lastEntryIndex].response ||
                              "") +
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
        sessionStorage.setItem("chatHistory", JSON.stringify(chatHistory));
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

  const handleBackClick = () => {
    navigate("/search", { state: { data, searchTerm } });
  };
  const handleNavigationClick = (section) => {
    setActiveSection(section);
  };

  const boldTerm = (text) => {
    if (typeof text !== "string") {
      return JSON.stringify(text);
    }

    if (!searchTerm) return text;

    // Create a regex to find the search term
    const regex = new RegExp(`(${searchTerm})`, "gi");

    // Replace the search term in the text with markdown bold syntax
    return text.replace(regex, "**$1**"); // Wrap the matched term with markdown bold syntax
  };
  // const contentWidth = "43.61%";
  // const searchBarwidth = "62%";
  // const handleWidth = (newWidth) => {
  //   //const newWidth = parseInt(event.target.value);
  //   setSearchWidth(newWidth);
  // };
  const handleAnnotate = () => {
    if (openAnnotate) {
      setOpenAnnotate(false);
    } else {
      setOpenAnnotate(true);
      setOpenNotes(false);
    }
  };
  const handleNotes = () => {
    if (openNotes) {
      setOpenNotes(false);
    } else {
      setOpenAnnotate(false);
      setOpenNotes(true);
    }
  };
  // Dynamically render the nested content in order, removing numbers, and using keys as side headings
  // Dynamically render the nested content in order, removing numbers, and using keys as side headings

  // Helper function to capitalize the first letter of each word
  // Helper function to capitalize the first letter of each word
  const capitalizeFirstLetter = (text) => {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
  };
  const capitalize = (text) => {
    if (!text) return text; // Return if the text is empty
    return text.charAt(0).toUpperCase() + text.slice(1);
  };
  const MyMarkdownComponent = ({ markdownContent }) => {
    return (
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]} // Enables HTML parsing
      >
        {markdownContent}
      </ReactMarkdown>
    );
  };

  const renderContentInOrder = (content, isAbstract = false) => {
    const sortedKeys = Object.keys(content).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );
  
    return sortedKeys.map((sectionKey) => {
      const sectionData = content[sectionKey];
  
      // Remove numbers from the section key
      const cleanedSectionKey = sectionKey.replace(/^\d+[:.]?\s*/, "");
  
      // Handle paragraphs
      if (cleanedSectionKey.toLowerCase() === "paragraph") {
        const textContent =
          typeof sectionData === "string"
            ? sectionData
            : JSON.stringify(sectionData);
        const boldtextContent = boldTerm(textContent);
  
        return (
          <div key={sectionKey} style={{ marginBottom: "10px" }}>
            <MyMarkdownComponent markdownContent={boldtextContent} />
          </div>
        );
      }
  
      // Handle keywords
      if (cleanedSectionKey.toLowerCase() === "keywords") {
        let keywords = Array.isArray(sectionData)
          ? sectionData.join(", ")
          : sectionData;
        keywords = capitalizeFirstLetter(keywords);
        const boldKeywords = boldTerm(keywords);
  
        return (
          <div key={sectionKey} style={{ marginBottom: "10px" }}>
            <Typography variant="h6" style={{ fontSize: "18px" }}>
              Keywords
            </Typography>
            <Typography variant="body1">{boldKeywords}</Typography>
          </div>
        );
      }
  
      // Handle Images Section
      if (cleanedSectionKey.toLowerCase() === "images") {
        const imageEntries = Object.values(sectionData); // Extract image objects
  
        return imageEntries.map((image, index) => (
          <div key={index} style={{ marginBottom: "20px", textAlign: "center" }}>
            <img
              src={image.image_url}
              alt={image.label || "Image"}
              style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
            />
            {image.caption && (
              <Typography variant="body2" style={{ marginTop: "8px" }}>
                <strong>{image.label}</strong>: {image.caption}
              </Typography>
            )}
          </div>
        ));
      }
  
      // Handle nested objects or other content
      if (typeof sectionData === "object") {
        return (
          <div key={sectionKey} style={{ marginBottom: "20px" }}>
            <Typography variant="h6" style={{ fontSize: "18px" }}>
              {capitalizeFirstLetter(cleanedSectionKey)}
            </Typography>
            {renderContentInOrder(sectionData)}
          </div>
        );
      } else {
        const textContent =
          typeof sectionData === "string"
            ? sectionData
            : JSON.stringify(sectionData);
        const boldtextContent = boldTerm(textContent);
  
        return (
          <div key={sectionKey} style={{ marginBottom: "10px" }}>
            <Typography variant="h6" style={{ fontSize: "18px" }}>
              {capitalizeFirstLetter(cleanedSectionKey)}
            </Typography>
            <MyMarkdownComponent markdownContent={boldtextContent} />
          </div>
        );
      }
    });
  };
  
  const getHistoryTitles = () => {
    let storedHistory = JSON.parse(localStorage.getItem("history")) || {};
    // Return the stored history as an array of {pmid, title} objects
    return storedHistory;
  };
  const handleEditClick = (pmid, title) => {
    setEditingPmid(pmid); // Set the current pmid being edited
    setEditedTitle(title); // Set the initial value for editing
  };

  const handleTitleChange = (e) => {
    setEditedTitle(e.target.value); // Update the state as the user types
  };

  const handleSaveEdit = (pmid) => {
    const updatedHistory = getHistoryTitles().map((item) =>
      item.pmid === pmid ? { ...item, title: editedTitle } : item
    );

    // Save the updated history back to localStorage without changing the pmid
    localStorage.setItem("history", updatedHistory);

    // Reset the editing state
    setEditingPmid(null);
    setEditedTitle("");
  };

  // const getHistoryTitles = () => {
  //   let storedHistory = JSON.parse(localStorage.getItem("history")) || [];
  //   return storedHistory; // No need to reverse, latest items are already at the top
  // };
  return (
    <>
      <div className="container">
        <header className="header">
          <div className="logo" style={{ margin: "20px 0" }}>
            <a href="/">
              <img
                href="/"
                src="https://www.infersol.com/wp-content/uploads/2020/02/logo.png"
                alt="Infer Logo"
              />
            </a>
          </div>
          <nav className="nav-menu">
            <ul>
              {/* <li>
                <a href="/">Home</a>
              </li> */}
              {/* <li>
                <a href="#why-infer">Why Infer?</a>
              </li> */}
              {/* <li>
                <a href="#FAQ's">FAQs</a>
              </li> */}
            </ul>
          </nav>
          <div className="auth-buttons" style={{ margin: "20px 26px 20px 0" }}>
            <button className="signup">Sign up</button>
            <button className="login">Login</button>
          </div>
        </header>
        <div className="content">
          <div className="history-pagination">
            <h5>Recent Interactions</h5>
            <ul>
              {getHistoryTitles().length > 0 ? (
                getHistoryTitles().map((item) => (
                  <li key={item.pmid}>
                    {editingPmid === item.pmid ? (
                      <TextField
                        type="text"
                        open
                        style={{ padding: "0" }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "40px",
                            "& fieldset": {
                              borderColor: "transparent",
                            },
                            "&:hover fieldset": {
                              borderColor: "transparent",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "transparent",
                            },
                          },
                          "& .MuiOutlinedInput-input": {
                            outline: "none",
                          },
                        }}
                        value={editedTitle}
                        onChange={handleTitleChange}
                        onBlur={() => handleSaveEdit(item.pmid)} // Save on blur
                        autoFocus
                      />
                    ) : (
                      <a>
                        {capitalize(item.title.slice(0, 35))}
                        {item.title.length > 35 ? "..." : ""}
                      </a>
                    )}
                    <FontAwesomeIcon
                      title="Rename the title"
                      icon={faPen}
                      onClick={() => handleEditClick(item.pmid, item.title)}
                      style={{ cursor: "pointer", marginLeft: "10px" }}
                    />
                  </li>
                ))
              ) : (
                <li>No recent interactions</li>
              )}
            </ul>
          </div>

          {articleData ? (
            <div
              className="article-content"
              onMouseUp={handleMouseUp}
              ref={contentRef}
              // style={{ width: `43.61%` }}
              // value={searchWidth}
              // onChange={handleWidth}
            >
              <div className="article-title">
                {/* <button
                    
                    alt="Arrow-left-icon"
                    onClick={handleBackClick}
                    style={{cursor:"pointer"}}
                  >Back</button> */}

                <div
                  style={{
                    display: "flex",
                    cursor: "pointer",
                    marginTop: "1%",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex" }} onClick={handleBackClick}>
                    <img src={Arrow} style={{ width: "14px" }}></img>
                    <button className="back-button">Back</button>
                  </div>
                  <div className="Rate-Article">
                    <div>
                      <span>Rate the article </span>
                    </div>
                    <div className="rate">
                      {[5, 4, 3, 2, 1].map((value) => (
                        <React.Fragment key={value}>
                          <input
                            type="radio"
                            id={`star${value}-${uniqueId}`}
                            name={`rate_${uniqueId}`}
                            value={value}
                            checked={getRatingForArticle(uniqueId) === value}
                            onChange={() => handleRatingChange(uniqueId, value)}
                          />
                          <label
                            htmlFor={`star${value}-${uniqueId}`}
                            title={`${value} star`}
                          />
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="ArticleTitle-Bookmark">      
                <p  style={{ marginTop: "0", marginBottom: "0",  color: "#0071bc", fontSize: "20px", }} >
                  {articleData.article_title}
                </p>
                <FontAwesomeIcon
                icon={regularBookmark}
                size="l"
            
                style={{ color: bookmarkedPmids[id] ? 'blue' : 'black', cursor: 'pointer',width:"20px",height:"20px" }}
                onClick={() => handleBookmarkClick(id)}
                title={bookmarkedPmids[id] ? 'Bookmarked' : 'Bookmark this article'}
              />
                </div>
              </div>

              <div className="meta">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    fontSize: "14px",
                    color: "grey",
                    marginBottom: "5px",
                  }}
                >
                  {articleData.publication_type ? (
                    <span>
                      Publication Type :
                      <strong style={{ color: "black" }}>
                        {articleData.publication_type.join(", ")}
                      </strong>
                    </span>
                  ) : (
                    ""
                  )}
                  <span style={{ color: "#2b9247" }}>PMID : {id}</span>
                </div>

                {articleData.abstract_content && (
                  <>
                    <Typography
                      variant="h4"
                      gutterBottom
                      style={{
                        fontSize: "18px",
                        marginBottom: "0 ",
                        marginTop: "1%",
                      }}
                    >
                      Abstract
                    </Typography>
                    <div onMouseUp={handleMouseUp}>
                      {renderContentInOrder(articleData.abstract_content, true)}
                    </div>
                  </>
                )}
                {/* <div className="content-brake"></div>  */}
                {articleData.body_content &&
                  renderContentInOrder(articleData.body_content, true)}

                {showStreamingSection && (
                  <div className="streaming-section">
                    <div className="streaming-content">
                      {chatHistory.map((chat, index) => (
                        <div key={index}>
                          <div className="query-asked">
                            <span>{chat.query}</span>
                          </div>

                          <div
                            className="response"
                            style={{ textAlign: "left" }}
                          >
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

                            <div ref={endOfMessagesRef} />
                          </div>
                        </div>
                      ))}
                      {/* This div will act as the reference for scrolling */}
                    </div>
                  </div>
                )}
                {showPopup && (
                  <div
                    className="Popup"
                    style={{
                      position: "absolute",
                      top: popupPosition.y + 10,
                      left: popupPosition.x + 10,
                      backgroundColor: "#f1f1f1",
                      // gridTemplateColumns: "1fr",
                      zindex: "1000",
                    }}
                  >
                    <button
                      onClick={handleSaveToNote}
                      className="Popup-buttons"
                    >
                      <IoSaveOutline fontSize={"20px"} color="#1A82ff" />
                      <span style={{ color: "#1A82FF" }}>Save to notes</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="Article-data-not-found">
              <p>Data not found for the given PMID</p>
            </div>
          )}

          <div className="right-aside">
            {openAnnotate && (
              <div className="search-annotate">
                <Annotation
                  openAnnotate={openAnnotate}
                  annotateData={annotateData}
                />
              </div>
            )}
            {openNotes && <Notes selectedText={selectedText} />}
            <div className="icons-group">
              <div
                className={`search-annotate-icon ${
                  openAnnotate ? "open" : "closed"
                } ${annotateData && annotateData.length > 0 ? "" : "disabled"}`}
                onClick={
                  annotateData && annotateData.length > 0
                    ? handleAnnotate
                    : null
                }
                style={{
                  cursor:
                    annotateData && annotateData.length > 0
                      ? "pointer"
                      : "not-allowed",
                  opacity: annotateData && annotateData.length > 0 ? 1 : 1, // Adjust visibility when disabled
                }}
              >
                <img src={annotate} alt="annotate-icon" />
              </div>
              <div
                className={`notes-icon ${openNotes ? "open" : "closed"}`}
                onClick={() => {
                  handleNotes();
                  // handleResize();
                }}
              >
                <img src={notesicon} alt="notes-icon" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="chat-query"
        style={{ width: openNotes ? contentWidth : "69%" }}
      >
        <div className="predefined-prompts">
          <button onClick={() => handlePromptClick("Summarize this article")}>
            Summarize
          </button>
          <button
            onClick={() =>
              handlePromptClick("what can we conclude form this article")
            }
          >
            Conclusion
          </button>
          <button
            onClick={() =>
              handlePromptClick(
                " what are the key highlights from this article"
              )
            }
          >
            Key Highlights
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
          {/* <button onClick={handleAskClick} > */}
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
          {/* </button> */}
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

export default ArticlePage;