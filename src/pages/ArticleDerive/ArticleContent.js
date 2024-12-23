import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setDeriveInsights } from "../../redux/reducers/deriveInsights";
import { useParams, useLocation } from "react-router-dom";
import "../ArticlePage/ArticlePage.css";
import { IoCloseOutline } from "react-icons/io5";
import { Typography } from "@mui/material";
import flag from "../../assets/images/flash.svg";
import Arrow from "../../assets/images/back-arrow.svg";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { CircularProgress } from "@mui/material";
import { faBookmark as regularBookmark } from "@fortawesome/free-regular-svg-icons";
import { faBookmark as solidBookmark } from "@fortawesome/free-solid-svg-icons";
import rehypeRaw from "rehype-raw";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";
import { LiaTelegramPlane } from "react-icons/lia";
import { showErrorToast, showSuccessToast } from "../../utils/toastHelper";
const ArticleContent = ({
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
  const displayMessage = isLoggedIn
    ? ""
    : "This feature is available for subscribed users.";
  const { pmid } = useParams();
  const { user } = useSelector((state) => state.auth);
  const token = useSelector((state) => state.auth.access_token);
  const dispatch = useDispatch();
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
  console.log(type);
  console.log(id);
  const endOfMessagesRef = useRef(null);
  const [chatHistory, setChatHistory] = useState(() => {
    const storedHistory = localStorage.getItem("chatHistory");
    console.log("stored Chat History", storedHistory);
    return storedHistory ? JSON.parse(storedHistory) : [];
  });
  useEffect(() => {
    // Retrieve chat history from sessionStorage
    const storedChatHistory = localStorage.getItem("chatHistory");
    console.log("got the chatHistory");
    if (storedChatHistory) {
      // Parse the chat history string back into an array
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
  const [activeSection, setActiveSection] = useState("Title");
  const [activeSessionId, setActiveSessionId] = useState(
    sessionStorage.getItem("session_id") || null
  );
  const contentRef = useRef(null); // Ref to target the content div
  const [contentWidth, setContentWidth] = useState(); // State for content width
  const [ratingsList, setRatingsList] = useState(() => {
    return JSON.parse(sessionStorage.getItem("ratingsGiven")) || [];
  });
  const [triggerAskClick, setTriggerAskClick] = useState(false);
  const [triggerDeriveClick, setTriggerDeriveClick] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  const [collections, setCollections] = useState([]);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showConfirmIcon, setShowConfirmIcon] = useState(false);
  const [isPromptEnabled, setIsPromptEnabled] = useState(false);

  const fetchCollections = async () => {
    try {
      const response = await axios.get(
        `https://inferai.ai/api/bookmarks/${user_id}/collections`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
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

  const [currentid, setCurrentid] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collectionAction, setCollectionAction] = useState("existing"); // Tracks which radio button is selected
  const [selectedCollection, setSelectedCollection] = useState("favorites");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [hasFetchedAnnotateData, setHasFetchedAnnotateData] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [editingSessionId, setEditingSessionId] = useState(null);

  const selectedTextRef = useRef("");
  const popupRef = useRef(null);
  const popupPositionRef = useRef({ x: 0, y: 0 });

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
    if (type === "biorxiv" || type === "pubmed" || type === "plos") {
      setSource(type);
    }
    if (type === "biorxiv" || type === "pubmed" || type === "plos") {
      setSource(type);
    }
  }, [type]);

  useEffect(() => {
    if (source && id && !deriveInsights) {
      setAnnotateLoading(true);
      const fetchArticleData = async () => {
        try {
          const response = await axios.get(
            `https://inferai.ai/api/view_article/get_article/${id}?source=${source}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const article = response.data;
          setArticleData(article);
          setAnnotateLoading(false);

          // Retrieve and set saved search term from sessionStorage
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

  const handleRatingChange = async (uniqueId, newRating) => {
    // Ensure ratingsList is an array
    const currentRatings = Array.isArray(ratingsList) ? ratingsList : [];

    // Create a copy of ratingsList
    const updatedRatings = [...currentRatings];

    const existingRatingIndex = updatedRatings.findIndex(
      (item) => item.uniqueId === uniqueId
    );

    if (existingRatingIndex !== -1) {
      updatedRatings[existingRatingIndex].rating = newRating;
    } else {
      updatedRatings.push({ uniqueId, rating: newRating });
    }

    setRatingsList(updatedRatings);
    sessionStorage.setItem("ratingsGiven", JSON.stringify(updatedRatings));

    // Extract source and article_id from uniqueId
    const [article_source, article_id] = uniqueId.split("_");

    try {
      await axios.post(
        "https://inferai.ai/api/rating/rate",
        {
          user_id, // Assuming `user_id` is available in the component's state or props
          rating_data: {
            article_id,
            rating: newRating,
            article_source,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Bearer token authorization
          },
        }
      );
    } catch (error) {
      console.error("Error saving rating:", error);
    }
  };
  const handleMouseUp = (event) => {
    if (!isLoggedIn) return;
    if (!contentRef.current || !contentRef.current.contains(event.target)) {
      return;
    }

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const selectedText = selection.toString().trim();

      if (selectedText) {
        const rects = range.getClientRects();
        const lastRect = rects[rects.length - 1];
        if (lastRect) {
          selectedTextRef.current = selectedText;
          popupPositionRef.current = {
            x: lastRect.right + window.scrollX,
            y: lastRect.bottom + window.scrollY,
          };

          if (popupRef.current) {
            popupRef.current.style.left = `${popupPositionRef.current.x}px`;
            popupRef.current.style.top = `${popupPositionRef.current.y + 5}px`;
            popupRef.current.style.display = "block";
          }
        } else {
          if (popupRef.current) {
            popupRef.current.style.display = "none";
          }
        }
      } else {
        if (popupRef.current) {
          popupRef.current.style.display = "none";
        }
      }
    }
  };
  const handleCloseCollectionModal = () => {
    setCollectionAction("existing"); // Reset to default state
    setNewCollectionName(""); // Clear input
    setSelectedCollection("favorites"); // Reset selection
    setIsModalOpen(false); // Close modal
  };

  const isArticleBookmarked = (idType) => {
    const numericIdType = Number(idType);
    for (const [collectionName, articleArray] of Object.entries(collections)) {
      const found = articleArray.some(
        (article) => Number(article.article_id) === numericIdType
      );

      if (found) {
        return { isBookmarked: true, collectionName };
      }
    }
    return { isBookmarked: false, collectionName: null };
  };

  const handleBookmarkClick = async (idType, title, source) => {
    const { isBookmarked, collectionName } = isArticleBookmarked(idType);

    if (isBookmarked) {
      try {
        const response = await axios.delete(
          `https://inferai.ai/api/bookmarks/users/${user_id}/collections/${collectionName}/${idType}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 200) {
          const updatedCollections = {
            ...collections,
            [collectionName]: collections[collectionName].filter(
              (article) => article.article_id !== String(idType)
            ),
          };

          setCollections(updatedCollections);
          localStorage.setItem(
            "collections",
            JSON.stringify(updatedCollections)
          );
          //showSuccessToast("Bookmark unsaved successfully");

          await fetchCollections();
        }
      } catch (error) {
        console.error("Error deleting bookmark:", error);
      }
    } else {
      setCurrentid(idType);
      setArticleTitle(title);
      setSource(source);
      setIsModalOpen(true);
    }
  };

  const handleSaveToExisting = async (collectionName) => {
    if (!collectionName) return;
    const bookmarkData = {
      user_id,
      collection_name: collectionName,
      bookmark: {
        article_id: String(currentid),
        article_title: articleTitle,
        article_source: source,
      },
    };

    try {
      const response = await axios.post(
        "https://inferai.ai/api/bookmarks/users/collections",
        bookmarkData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        const updatedCollections = {
          ...collections,
          [collectionName]: [
            ...(collections[collectionName] || []),
            {
              article_id: String(currentid),
              article_title: articleTitle,
              article_source: source,
            },
          ],
        };

        setCollections(updatedCollections);
        localStorage.setItem("collections", JSON.stringify(updatedCollections));
        showSuccessToast("Added to Existing Collection");

        await fetchCollections();

        setIsModalOpen(false);
      }
    } catch (error) {
      showErrorToast("Failed to Add to the collection");
      console.error("Error adding bookmark to existing collection:", error);
    }
  };

  const handleCreateNewCollection = async () => {
    if (!newCollectionName) return;
    const newCollection = {
      user_id,
      collection_name: newCollectionName,
      bookmark: {
        article_id: String(currentid),
        article_title: articleTitle,
        article_source: source,
      },
    };

    try {
      const response = await axios.post(
        "https://inferai.ai/api/bookmarks/users/collections",
        newCollection,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        await fetchCollections(); // Refetch collections after successful creation
        setNewCollectionName("");
        setCollectionAction("existing");
        setIsModalOpen(false);
        handleCloseCollectionModal();
      }
      showSuccessToast("New Collection Created");
    } catch (error) {
      showErrorToast("Failed to CreateCollection");
      console.error("Error creating new collection:", error);
    }
  };

  const handleSaveToNote = () => {
    const textToSave = selectedTextRef.current;
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
    sessionStorage.setItem("session_id", "");
    //   localStorage.setItem("chatHistory", []);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  const getid = () => {
    return `${source}_${id}`;
  };

  const uniqueId = getid();

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
        try {
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

                    if (parsedData.session_id) {
                      const articleSessions =
                        JSON.parse(sessionStorage.getItem("articleSessions")) ||
                        {};
                      articleSessions[sessionKey] = parsedData.session_id;
                      sessionStorage.setItem(
                        "articleSessions",
                        JSON.stringify(articleSessions)
                      );
                    }

                    const answer = parsedData.answer;
                    const words = answer.split(" ");

                    for (const word of words) {
                      await new Promise((resolve) =>
                        setTimeout(resolve, delay)
                      );

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
        } catch (error) {
          console.error("Error fetching or reading stream:", error);

          setChatHistory((chatHistory) => {
            const updatedChatHistory = [...chatHistory];
            const lastEntryIndex = updatedChatHistory.length - 1;

            if (lastEntryIndex >= 0) {
              updatedChatHistory[lastEntryIndex] = {
                ...updatedChatHistory[lastEntryIndex],
                response:
                  "There is some error. Please try again after some time.",
                showDot: false,
              };
            }

            return updatedChatHistory;
          });

          setLoading(false);
        }
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
  const storedSessionId =
    sessionStorage.getItem("sessionId") || sessionStorage.getItem("session_id");
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

  useEffect(() => {
    if (triggerDeriveClick) {
      handleDeriveClick();
      setTriggerDeriveClick(false); // Reset the flag after handling the click
    }
  }, [query, triggerDeriveClick]);

  const handleBackClick = () => {
    const unsavedChanges = localStorage.getItem("unsavedChanges");
    if (unsavedChanges === "true") {
      setShowConfirmPopup(true);
      //navigate(-1);
    } else {
      navigate(-1);
    }
    //localStorage.removeItem("unsavedChanges");
    //navigate(-1);
  };

  const handleCancelConfirm = () => {
    setShowConfirmPopup(false);
  };
  const handleOk = () => {
    setShowConfirmPopup(false);
    localStorage.removeItem("unsavedChanges");
    navigate(-1);
  };

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

  const renderContentInOrder = (content, isAbstract = false) => {
    const sortedKeys = Object.keys(content).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );

    return sortedKeys.map((sectionKey) => {
      const sectionData = content[sectionKey];

      // Remove numbers from the section key
      const cleanedSectionKey = sectionKey.replace(/^\d+[:.]?\s*/, "");

      // Skip Images Section
      if (cleanedSectionKey.toLowerCase() === "images") {
        return null;
      }

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
    const storedSessionId = sessionStorage.getItem("session_id");
    if (storedSessionId) {
      setActiveSessionId(storedSessionId);
    }
  }, [sessions]);

  const [uploadedFile, setUploadedFile] = useState(null);
  useEffect(() => {
    const storedSessionId =
      sessionStorage.getItem("sessionId") ||
      sessionStorage.getItem("session_id");
    console.log("exec");
    if (storedSessionId || uploadedFile) {
      setIsPromptEnabled(true); // Enable prompts if session_id exists or a file is uploaded
    } else {
      setIsPromptEnabled(false); // Disable prompts if neither session_id nor file is present
    }
  }, [handleDeriveClick, uploadedFile]);

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setIsPromptEnabled(false);
  };

  return (
    <>
      {articleData ? (
        <div
          className="article-content"
          onMouseUp={handleMouseUp}
          ref={contentRef}
          // style={{ height: heightIfLoggedIn }}
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
              {/* HI varun */}
              {showConfirmPopup && (
                <div className="Article-popup-overlay">
                  <div className="Article-popup-content">
                    <p className="Saving-note">Saving Note</p>
                    <p id="confirming">Are you sure to leave without saving?</p>
                    <div className="Article-confirm-buttons">
                      <button
                        className="overlay-cancel-button"
                        onClick={handleCancelConfirm}
                      >
                        Cancel
                      </button>
                      <button className="overlay-ok-button" onClick={handleOk}>
                        Leave
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div
                className="Rate-Article"
                // style={{ display: displayIfLoggedIn }}
              >
                <div>
                  <span>Rate the article </span>
                </div>
                <div className="rate">
                  {[5, 4, 3, 2, 1].map((value) => {
                    const existingRating =
                      Array.isArray(ratingsList) &&
                      ratingsList.find((item) => item.uniqueId === uniqueId)
                        ?.rating;

                    return (
                      <React.Fragment key={value}>
                        <input
                          type="radio"
                          id={`star${value}-${uniqueId}`}
                          name={`rate_${uniqueId}`}
                          value={isLoggedIn ? value : ""}
                          checked={isLoggedIn ? existingRating === value : ""}
                          onChange={() =>
                            !isLoggedIn
                              ? ""
                              : handleRatingChange(uniqueId, value)
                          }
                          // disabled={!!existingRating} // Disable if a rating already exists
                        />
                        <label
                          style={{
                            cursor: isLoggedIn ? "pointer" : "not-allowed",
                            opacity:
                              annotateData && annotateData.length > 0 ? 1 : 1, // Adjust visibility when disabled
                          }}
                          title={
                            isLoggedIn ? "Rate the article" : displayMessage
                          }
                          htmlFor={`star${value}-${uniqueId}`}
                          // title={`${value} star`}
                        />
                      </React.Fragment>
                    );
                  })}
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
                icon={
                  isArticleBookmarked(id).isBookmarked
                    ? solidBookmark
                    : regularBookmark
                }
                size="l"
                style={{
                  color: isArticleBookmarked(id).isBookmarked
                    ? "#1B365D"
                    : "black",
                  cursor: isLoggedIn ? "pointer" : "not-allowed",
                  opacity: isLoggedIn ? 1 : 0.5,
                }}
                onClick={() =>
                  isLoggedIn
                    ? handleBookmarkClick(
                        id,
                        articleData.article.article_title,
                        source || "PubMed"
                      )
                    : ""
                }
                title={
                  isLoggedIn
                    ? isArticleBookmarked(id).isBookmarked
                      ? "Bookmarked"
                      : "Bookmark this article"
                    : displayMessage
                }
              />

              {isModalOpen && (
                <div className="bookmark-modal-overlay">
                  <button
                    id="close-collection-modal"
                    onClick={handleCloseCollectionModal}
                  >
                    <IoCloseOutline size={20} />
                  </button>
                  <div className="search-modal-content">
                    <p>ADD TO COLLECTION</p>
                    {/* Radio buttons for collection action */}
                    <div className="radio-buttons">
                      <div className="radio1">
                        <input
                          type="radio"
                          id="collectionAction"
                          value="existing"
                          checked={collectionAction === "existing"}
                          onChange={() => setCollectionAction("existing")}
                        />
                        <label>Add to Existing Collection</label>
                      </div>
                      <div className="radio2">
                        <input
                          type="radio"
                          id="collectionAction"
                          value="new"
                          checked={collectionAction === "new"}
                          onChange={() => setCollectionAction("new")}
                        />
                        <label>Create New Collection</label>
                      </div>
                    </div>

                    {/* Logic for adding to existing collection */}
                    {collectionAction === "existing" && (
                      <div className="select-dropdown">
                        <div className="choose-collection">
                          <label htmlFor="">*Choose a collection</label>
                          <select
                            name="collections"
                            id="collection-select"
                            className="select-tag"
                            style={{
                              width: "35%",
                              height: "5vh",
                            }}
                            value={selectedCollection}
                            onChange={(e) =>
                              setSelectedCollection(e.target.value)
                            }
                          >
                            <option value="favorites" disabled selected>
                              Favorites
                            </option>
                            {Object.keys(collections).map(
                              (collectionName, index) => (
                                <option key={index} value={collectionName}>
                                  {collectionName}
                                </option>
                              )
                            )}
                          </select>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "20px",
                            // marginTop: "15px",
                          }}
                        >
                          <button
                            onClick={() =>
                              handleSaveToExisting(selectedCollection)
                            }
                            disabled={!selectedCollection}
                          >
                            Add
                          </button>
                          <button onClick={handleCloseCollectionModal}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Logic for creating a new collection */}
                    {collectionAction === "new" && (
                      <div>
                        <input
                          type="text"
                          value={newCollectionName}
                          onChange={(e) => setNewCollectionName(e.target.value)}
                          placeholder="New collection name"
                        />
                        <div
                          style={{
                            display: "flex",
                            gap: "20px",
                            marginTop: "15px",
                          }}
                        >
                          <button
                            onClick={handleCreateNewCollection}
                            disabled={!newCollectionName}
                          >
                            Create
                          </button>
                          <button onClick={handleCloseCollectionModal}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            className="meta"
            style={{ height: !isLoggedIn ? "42" : undefined }}
          >
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
              <span style={{ color: "#2b9247" }}>
                {(type === "bioRxiv_id" || type === "biorxiv") && "BioRxiv ID"}
                {(type === "pmid" || type === "pubmed") && "PMID"}
                {(type === "plos_id" || type === "plos") && "PLOS ID"} : {id}
              </span>{" "}
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
                      {chat.query && (
                        <div className="query-asked">
                          <span>
                            {chat.query === "Summarize this article"
                              ? "Summarize"
                              : chat.query ===
                                "what can we conclude form this article"
                              ? "Conclusion"
                              : chat.query ===
                                "what are the key highlights from this article"
                              ? "Key Highlights"
                              : chat.query}
                          </span>
                        </div>
                      )}

                      {chat.response && (
                        <div className="response" style={{ textAlign: "left" }}>
                          <>
                            <span>
                              <ReactMarkdown>{chat.response}</ReactMarkdown>
                            </span>
                            <div ref={endOfMessagesRef} />
                          </>
                        </div>
                      )}
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
                backgroundColor: "#afa7a7",
                // padding: "5px",
                color: "white",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              //onClick={handleSaveToNote}
            >
              <button
                onClick={handleSaveToNote}
                className="Popup-buttons"
                title="Send to Notes"
              >
                <span className="send-to-notes">Send to notes</span>
                <LiaTelegramPlane size={20} color="black" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      {articleData ? (
        <div
          className="article-chat-query"
          style={{
            width: openAnnotate || openNotes ? contentWidth : "56%",
            cursor: isLoggedIn ? "" : "not-allowed",
            opacity: isLoggedIn ? 1 : 0.5,
          }}
          title={isLoggedIn ? "" : displayMessage}
        >
          <div className="predefined-prompts">
            <button
              style={{ cursor: isLoggedIn ? "pointer" : "not-allowed" }}
              onClick={() =>
                isLoggedIn ? handlePromptClick("Summarize this article") : ""
              }
            >
              Summarize
            </button>
            <button
              style={{ cursor: isLoggedIn ? "pointer" : "not-allowed" }}
              onClick={() =>
                isLoggedIn
                  ? handlePromptClick("what can we conclude form this article")
                  : ""
              }
            >
              Conclusion
            </button>
            <button
              style={{ cursor: isLoggedIn ? "pointer" : "not-allowed" }}
              onClick={() =>
                isLoggedIn
                  ? handlePromptClick(
                      "what are the key highlights from this article"
                    )
                  : ""
              }
            >
              Key Highlights
            </button>
          </div>
          <div
            className="stream-input"
            style={{ cursor: isLoggedIn ? "" : "not-allowed" }}
          >
            <img src={flag} alt="flag-logo" className="stream-flag-logo" />
            <input
              style={{ cursor: isLoggedIn ? "" : "not-allowed" }}
              type="text"
              placeholder="Ask anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={isLoggedIn ? handleKeyDown : null} // Pass null when not logged in
            />
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
                onClick={isLoggedIn ? handleAskClick : null} // Pass null when not logged in
                icon={faTelegram}
                size={"xl"}
                style={{
                  cursor: isLoggedIn ? "pointer" : "not-allowed",
                }}
              />
            )}
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default ArticleContent;
