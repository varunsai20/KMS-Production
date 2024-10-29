import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useParams, useLocation } from "react-router-dom";
import "./ArticlePage.css";
import { Typography } from "@mui/material";
import flag from "../../assets/images/flash.svg";
import Header from "../../components/Header-New";
import Arrow from "../../assets/images/back-arrow.svg";
import annotate from "../../assets/images/task-square.svg";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { CircularProgress } from "@mui/material";
import { TextField } from "@mui/material";
import Annotation from "../../components/Annotaions";
import { faBookmark as regularBookmark } from "@fortawesome/free-regular-svg-icons";
import notesicon from "../../assets/images/note-2.svg";
import rehypeRaw from "rehype-raw";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { faAnglesUp } from "@fortawesome/free-solid-svg-icons";
//import { IoSaveOutline } from "react-icons/io5";
import { BsSend } from "react-icons/bs";
import Notes from "../NotesPage/Notes";

const ArticlePage = () => {
  const { pmid } = useParams();
  const { user } = useSelector((state) => state.auth);
  const token = user?.access_token;
  const user_id = user?.user_id;
  const [type, id1] = pmid.split(":");
  const id = Number(id1);
  const [source, setSource] = useState();
  const location = useLocation();
  const { data } = location.state || { data: [] };
  const [searchTerm, setSearchTerm] = useState("");
  const [articleData, setArticleData] = useState(null);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const annotateData = location.state.annotateData || { annotateData: [] };
  const endOfMessagesRef = useRef(null);
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
  const [editingPmid, setEditingPmid] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [collections, setCollections] = useState(() => {
    const storedCollections =
      JSON.parse(localStorage.getItem("collections")) || [];
    return storedCollections;
  });
  const [currentIdType, setCurrentIdType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const isBookmarked = (idType) => {
    return collections.some((collection) =>
      collection.articles.includes(idType)
    );
  };

  const [bookmarkedPmids, setBookmarkedPmids] = useState({});
  const [savedText, setSavedText] = useState("");
  const selectedTextRef = useRef("");
  const popupRef = useRef(null);
  const popupPositionRef = useRef({ x: 0, y: 0 });
  const [annotateHeight, setAnnotateHeight] = useState(35);
  const [notesHeight, setNotesHeight] = useState(35);
  const minHeight = 15;
  const maxHeight = 60;

  useEffect(() => {
    // Determine the source based on `type`
    if (type === "bioRxiv_id") {
      setSource("biorxiv");
    } else if (type === "pmid") {
      setSource("pubmed");
    } else if (type === "plos_id") {
      setSource("plos");
    }

    // Perform GET request to fetch article data
    if (source && id) {
      const fetchArticleData = async () => {
        try {
          const response = await axios.get(
            `http://13.127.207.184/view_article/get_article/${id}?source=${source}`,
            {
              headers: {
                Authorization: `Bearer ${token}`, // Include Bearer token
              },
            }
          );
          const article = response.data; // Assuming response contains article data directly
          setArticleData(article);

          // Retrieve saved search term from session storage
          const savedTerm = sessionStorage.getItem("SearchTerm");
          setSearchTerm(savedTerm);
        } catch (error) {
          console.error("Error fetching article data:", error);
        }
      };

      fetchArticleData();
    }
  }, [id, source, token]);
  // Handle mouse drag for annotate (bottom border)
  const handleAnnotateResize = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = annotateHeight;

    const onMouseMove = (moveEvent) => {
      const delta = ((moveEvent.clientY - startY) / window.innerHeight) * 100;
      const newAnnotateHeight = Math.max(
        minHeight,
        Math.min(maxHeight, startHeight + delta)
      );
      const newNotesHeight = 70 - newAnnotateHeight; // adjust notes height dynamically

      setAnnotateHeight(newAnnotateHeight);
      setNotesHeight(newNotesHeight);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Handle mouse drag for notes (top border)
  const handleNotesResize = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = notesHeight;

    const onMouseMove = (moveEvent) => {
      const delta = ((startY - moveEvent.clientY) / window.innerHeight) * 100;
      const newNotesHeight = Math.max(
        minHeight,
        Math.min(maxHeight, startHeight + delta)
      );
      //const newAnnotateHeight = 70 - newNotesHeight; // adjust annotate height dynamically
      const newAnnotateHeight = Math.max(minHeight, 70 - newNotesHeight); // ensure annotateHeight is at least minHeight

      setNotesHeight(newNotesHeight);
      setAnnotateHeight(newAnnotateHeight);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

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
    if (!contentRef.current.contains(event.target)) {
      return; // Exit if the selection is outside .article-content
    }
    const selection = window.getSelection();

    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString().trim();

      if (selectedText) {
        const rect = range.getClientRects();
        const lastRect = rect[rect.length - 1];

        selectedTextRef.current = selectedText;
        popupPositionRef.current = {
          x: lastRect.right + window.scrollX,
          y: lastRect.bottom + window.scrollY,
        };

        // Position the popup without triggering re-render
        if (popupRef.current) {
          popupRef.current.style.left = `${popupPositionRef.current.x}px`;
          popupRef.current.style.top = `${popupPositionRef.current.y + 5}px`; // Adjust offset for better visibility
          popupRef.current.style.display = "block"; // Show the popup
        }
      } else {
        if (popupRef.current) {
          popupRef.current.style.display = "none"; // Hide the popup if no selection
        }
      }
    }
  };

  const modalRef = useRef(null); // Ref for modal content

  // Handle clicks outside the modal to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false); // Close modal if clicked outside
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // Clean up the event listener
    };
  }, [isModalOpen]);

  const handleBookmarkClick = (idType) => {
    setCurrentIdType(idType);
    setIsModalOpen(true); // Open the modal for collection selection
  };

  const handleSaveToExisting = (collectionName) => {
    const updatedCollections = collections.map((collection) => {
      if (collection.name === collectionName) {
        // Only add the idType if it doesn't already exist in the collection
        if (!collection.articles.includes(currentIdType)) {
          return {
            ...collection,
            articles: [...collection.articles, currentIdType],
          };
        }
      }
      return collection;
    });
    setCollections(updatedCollections);
    localStorage.setItem("collections", JSON.stringify(updatedCollections));
    setIsModalOpen(false);
  };

  const handleCreateNewCollection = () => {
    const newCollection = {
      name: newCollectionName,
      articles: [currentIdType],
    };
    const updatedCollections = [...collections, newCollection];
    setCollections(updatedCollections);
    localStorage.setItem("collections", JSON.stringify(updatedCollections));
    setNewCollectionName("");
    setIsModalOpen(false);
  };

  const handleSaveToNote = () => {
    const textToSave = selectedTextRef.current; // Get the selected text from ref
    if (textToSave) {
      setSavedText(textToSave);
      // You can save the text to notes or perform any other action here.
    }
    if (!openNotes) {
      setOpenNotes(true);
    }

    // Hide the popup after saving
    if (popupRef.current) {
      popupRef.current.style.display = "none";
    }
  };
  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  // const handleSaveToNote = () => {
  //   const textToSave = selectedText;
  //   console.log(selectedText);

  //   if (textToSave) {
  //     console.log(textToSave);
  //     setSavedText(textToSave);
  //     setShowPopup(false);

  //     if (!openNotes) {
  //       setOpenNotes(true);
  //     }
  //     window.getSelection().removeAllRanges();
  //   }
  // };

  const getIdType = () => {
    return `${source}_${id}`;
  };

  const uniqueId = getIdType();

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
        "http://13.127.207.184:80/view_article/generateanswer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add the Bearer token here
          },
          body: bodyData,
        }
      );
      console.log("API Response:", response);

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
                  console.log("Received Data Chunk:", parsedData); // Log each parsed data chunk

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
  // const handleAnnotate = () => {
  //   if (openAnnotate) {
  //     setOpenAnnotate(false);
  //   } else {
  //     setOpenAnnotate(true);
  //     setOpenNotes(false);
  //   }
  // };
  // const handleNotes = () => {
  //   if (openNotes) {
  //     setOpenNotes(false);
  //   } else {
  //     setOpenAnnotate(false);
  //     setOpenNotes(true);
  //   }
  // };
  const handleAnnotate = () => {
    setOpenAnnotate((prevOpenAnnotate) => !prevOpenAnnotate); // Toggle annotate
    // No need to close Notes when Annotate is toggled
  };

  const handleNotes = () => {
    setOpenNotes((prevOpenNotes) => !prevOpenNotes); // Toggle notes
    // No need to close Annotate when Notes is toggled
  };

  // Dynamically render the nested content in order, removing numbers, and using keys as side headings
  // Helper function to capitalize the first letter of each word
  const capitalizeFirstLetter = (text) => {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
  };
  const capitalize = (text) => {
    if (!text) return text; // Return if the text is empty
    return text.charAt(0).toUpperCase() + text.slice(1);
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
          <div
            key={sectionKey}
            style={{ marginBottom: "10px" }}
            //onMouseUp={handleMouseUp}
          >
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
      // if (cleanedSectionKey.toLowerCase() === "images") {
      //   const imageEntries = Object.values(sectionData); // Extract image objects

      //   return imageEntries.map((image, index) => (
      //     <div
      //       key={index}
      //       style={{ marginBottom: "20px", textAlign: "center" }}
      //     >
      //       <img
      //         src={image.image_url}
      //         alt={image.label || "Image"}
      //         style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
      //       />
      //       {image.caption && (
      //         <Typography variant="body2" style={{ marginTop: "8px" }}>
      //           <strong>{image.label}</strong>: {image.caption}
      //         </Typography>
      //       )}
      //     </div>
      //   ));
      // }

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
    localStorage.setItem("history", JSON.stringify(updatedHistory));

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
            >
              <div className="article-title">
                <div
                  style={{
                    display: "flex",
                    cursor: "pointer",
                    marginTop: "1%",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex" }} onClick={handleBackClick}>
                    <img
                      src={Arrow}
                      style={{ width: "14px" }}
                      alt="arrow-icon"
                    ></img>
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
                  <p
                    style={{
                      marginTop: "0",
                      marginBottom: "0",
                      color: "#0071bc",
                      fontSize: "20px",
                    }}
                  >
                    {articleData.article.article_title}
                  </p>
                  <FontAwesomeIcon
                    icon={regularBookmark}
                    size="l"
                    style={{
                      color: isBookmarked(id) ? "blue" : "black",
                      cursor: "pointer",
                    }}
                    onClick={() => handleBookmarkClick(id)}
                    title={
                      isBookmarked(id) ? "Bookmarked" : "Bookmark this article"
                    }
                  />

                  {isModalOpen && (
                    <div className="bookmark-modal-overlay">
                      <div className="modal-content" ref={modalRef}>
                        <h3>Save Bookmark</h3>

                        {/* Existing Collections */}
                        {collections.length > 0 && (
                          <>
                            <h4>Save to existing collection:</h4>
                            <ul>
                              {collections.map((collection) => (
                                <li key={collection.name}>
                                  <button
                                    onClick={() =>
                                      handleSaveToExisting(collection.name)
                                    }
                                  >
                                    {collection.name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}

                        {/* Create New Collection */}
                        <h4>Create a new collection:</h4>
                        <input
                          type="text"
                          value={newCollectionName}
                          onChange={(e) => setNewCollectionName(e.target.value)}
                          placeholder="New collection name"
                        />
                        <div style={{ display: "flex", gap: "20px" }}>
                          <button
                            onClick={handleCreateNewCollection}
                            disabled={!newCollectionName}
                          >
                            Create
                          </button>

                          <button onClick={() => setIsModalOpen(false)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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
                  {articleData.article.publication_type ? (
                    <span>
                      Publication Type :
                      <strong style={{ color: "black" }}>
                        {articleData.article.publication_type.join(", ")}
                      </strong>
                    </span>
                  ) : (
                    ""
                  )}
                  <span style={{ color: "#2b9247" }}>PMID : {id}</span>
                </div>

                {articleData.article.abstract_content && (
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
                    <p>
                      {renderContentInOrder(
                        articleData.article.abstract_content,
                        true
                      )}
                    </p>
                  </>
                )}
                {/* <div className="content-brake"></div>  */}
                {articleData.article.body_content &&
                  renderContentInOrder(articleData.article.body_content, true)}

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
                <div
                  ref={popupRef}
                  className="popup-button"
                  // className="Popup"
                  style={{
                    position: "absolute",
                    display: "none", // Initially hidden
                    backgroundColor: "#1A82ff",
                    // padding: "5px",
                    color: "white",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                  //onClick={handleSaveToNote}
                >
                  <button onClick={handleSaveToNote} className="Popup-buttons">
                    <div className="save-icon">
                      {/* <IoSaveOutline fontSize={"15px"} color="black" /> */}
                      <BsSend
                        size={17}
                        color="white"
                        title="Send to Notes"
                        style={{ paddingTop: "3px" }}
                      />
                    </div>
                    <span style={{ color: "white", fontSize: "17px" }}>
                      send to notes
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="Article-data-not-found">
              <p>Data not found for the given PMID</p>
            </div>
          )}

          <div className="right-aside">
            <div className="annotate-note">
              {openAnnotate && (
                <div
                  className="annotate-height"
                  style={{
                    height: `${annotateHeight}vh`,
                  }}
                >
                  <Annotation
                    openAnnotate={openAnnotate}
                    annotateData={annotateData}
                    annotateHeight={annotateHeight}
                  />
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
                  <div className="notes-line1" />
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
