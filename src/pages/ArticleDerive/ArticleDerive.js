import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { setDeriveInsights } from "../../redux/reducers/deriveInsights";
import { useParams, useLocation } from "react-router-dom";
import "../ArticlePage/ArticlePage.css";
import { Typography } from "@mui/material";
import flag from "../../assets/images/flash.svg";
import Arrow from "../../assets/images/back-arrow.svg";
import annotate from "../../assets/images/task-square.svg";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { CircularProgress } from "@mui/material";
import uploadimage from "../../assets/images/Upload.svg";
import FileIconForDocument from "../../assets/images/FileIconforDocument.svg";
import pdfICon from "../../assets/images/pdf (1).png";
import docxIcon from "../../assets/images/docx-file.png";   
import txtIcon from "../../assets/images/txt-file.png";                                  
import { TextField } from "@mui/material";
import Annotation from "../../components/Annotaions";
import { faBookmark as regularBookmark } from "@fortawesome/free-regular-svg-icons";
import {
  faL,
  faBookmark as solidBookmark,
} from "@fortawesome/free-solid-svg-icons";
import notesicon from "../../assets/images/note-2.svg";
import rehypeRaw from "rehype-raw";
import newChat from "../../assets/images/20px@2x.svg";
import pen from "../../assets/images/16px.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { LiaTelegramPlane } from "react-icons/lia";
//import { BiSolidPaperPlane } from "react-icons/bi";
import { IoMdPaperPlane } from "react-icons/io";
import Notes from "../NotesPage/Notes";
import { login, logout } from "../../redux/reducers/LoginAuth"; // Import login and logout actions
import ProfileIcon from "../../assets/images/Profile-dummy.svg";
import { toast } from "react-toastify";
import { faTimes, faAnglesUp } from "@fortawesome/free-solid-svg-icons";
//import { TbFileUpload } from "react-icons/tb";
import upload from "../../assets/images/upload-file.svg";
import Header from "../../components/Header-New";

import uploadDocx from "../../assets/images/uploadDocx.svg";
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
  const deriveInsights = useSelector((state) => state.deriveInsights?.active); // assuming deriveInsights is in Redux state

  const displayIfLoggedIn = isLoggedIn ? null : "none";
  const widthIfLoggedIn = isLoggedIn ? null : "80%";
  const heightIfLoggedIn = isLoggedIn ? null : "80vh";
  const { pmid } = useParams();
  const { user } = useSelector((state) => state.auth);
  const profilePictureUrl = user?.profile_picture_url;
  const token = useSelector((state) => state.auth.access_token);
  const dispatch = useDispatch();
  const user_id = user?.user_id;
  const [type, id1] = pmid ? pmid.split(":") : "";
  const id = Number(id1);
  const [source, setSource] = useState();
  // const [annotateLoading, setAnnotateLoading] = useState(false);
  const location = useLocation();
  const { data } = location.state || { data: [] };
  const [searchTerm, setSearchTerm] = useState("");
  const [articleData, setArticleData] = useState(null);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [searchCollection, setSearchCollection] = useState("");
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
  //   const [refreshSessions, setRefreshSessions] = useState(false);
  const { resetArticleData, resetChatHistory } = location.state || {};
  const [errorCode, setErrorCode] = useState();

  useEffect(() => {
    if (resetArticleData) {
      // Logic to reset article data
      setArticleData(""); // Ensure you have this setter available
    }

    if (resetChatHistory) {
      // Logic to reset chat history
      setChatHistory([]); // Ensure you have this setter available
    }
  }, [resetArticleData, resetChatHistory]);
  useEffect(() => {
    // Retrieve chat history from sessionStorage
    const storedChatHistory = localStorage.getItem("chatHistory");

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
  // const [chatInput, setChatInput] = useState(true);
  // const [openAnnotate, setOpenAnnotate] = useState(false);
  // const [openNotes, setOpenNotes] = useState(false);
  const [activeSection, setActiveSection] = useState("Title");
  const [activeSessionId, setActiveSessionId] = useState(
    localStorage.getItem("session_id") || null
  );
  const isOnArticlePage = location.pathname === "/article";
  const contentRef = useRef(null); // Ref to target the content div
  const [contentWidth, setContentWidth] = useState(); // State for content width
  const [ratingsList, setRatingsList] = useState(() => {
    return JSON.parse(sessionStorage.getItem("ratingsGiven")) || [];
  });
  const [triggerAskClick, setTriggerAskClick] = useState(false);
  const [triggerDeriveClick, setTriggerDeriveClick] = useState(false);
  const [editingPmid, setEditingPmid] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  const [collections, setCollections] = useState([]);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showConfirmIcon, setShowConfirmIcon] = useState(false);
  const [isPromptEnabled, setIsPromptEnabled] = useState(false);

  const fetchCollections = async () => {
    try {
      const response = await axios.get(
        `http://13.127.207.184:8081/bookmarks/${user_id}/collections`,
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
  const [newCollectionName, setNewCollectionName] = useState("");
  const [hasFetchedAnnotateData, setHasFetchedAnnotateData] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [editingSessionId, setEditingSessionId] = useState(null);

  const [bookmarkedPmids, setBookmarkedPmids] = useState({});
  // const [savedText, setSavedText] = useState("");
  const selectedTextRef = useRef("");
  const popupRef = useRef(null);
  const popupPositionRef = useRef({ x: 0, y: 0 });
  const [annotateHeight, setAnnotateHeight] = useState(35);
  const [notesHeight, setNotesHeight] = useState(35);
  const minHeight = 15;
  const maxHeight = 60;
  const [reloadArticle, setReloadArticle] = useState(
    sessionStorage.getItem("reloadArticle") === "true"
  );
  // Add this useEffect to reset savedText when openNotes becomes false
  useEffect(() => {
    if (!openNotes) {
      setSavedText(""); // Reset savedText when notes are closed
    }
  }, [openNotes]);

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

  useEffect(() => {
    if (type === "bioRxiv_id") {
      setSource("biorxiv");
    } else if (type === "pmid") {
      setSource("pubmed");
    } else if (type === "plos_id") {
      setSource("plos");
    }
  }, [type]);

  const handleProfileClick = () => {
    if (user?.role === "Admin") {
      navigate(`/admin/users/profile/${user_id}`); // Navigate to Admin profile page
    } else if (user?.role === "User") {
      navigate(`/users/profile/${user_id}`); // Navigate to User profile page
    }
  };
  const handleLogin = () => navigate("/login");
  const handleLogout = async () => {
    try {
      // Make API call to /auth/logout with user_id as a parameter
      await axios.post(
        `http://13.127.207.184:8081/auth/logout/?user_id=${user_id}`
      );

      // Dispatch logout action and navigate to the home page
      dispatch(logout());
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
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
          const response = await axios.get(
            `http://13.127.207.184/view_article/get_article/${id}?source=${source}`,
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

  const getRatingForArticle = async (uniqueId) => {
    // Check if the rating is already available in ratingsList
    const cachedRating = ratingsList.find((item) => item.uniqueId === uniqueId);
    if (cachedRating) return cachedRating.rating;

    const [source, article_id] = uniqueId.split("_");

    try {
      const response = await axios.get(
        `http://13.127.207.184:8081/rating/user-ratings/${user_id}/${article_id}/${source}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const avgRating = response.data?.average_rating || 0;

      // Update the local rating list with the fetched average rating
      setRatingsList((prevRatings) => [
        ...prevRatings.filter((item) => item.uniqueId !== uniqueId),
        { uniqueId, rating: avgRating },
      ]);

      return avgRating;
    } catch (error) {
      console.error("Error fetching rating:", error);
      return 0;
    }
  };

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
        "http://13.127.207.184:8081/rating/rate",
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
          `http://13.127.207.184:8081/bookmarks/users/${user_id}/collections/${collectionName}/${idType}`,
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
          toast.success("Bookmark unsaved successfully", {
            position: "top-center",
            autoClose: 2000,

            style: {
              backgroundColor: "rgba(237, 254, 235, 1)",
              borderLeft: "5px solid rgba(15, 145, 4, 1)",
              color: "rgba(15, 145, 4, 1)",
            },
            progressStyle: {
              backgroundColor: "rgba(15, 145, 4, 1)",
            },
          });

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
        "http://13.127.207.184:8081/bookmarks/users/collections",
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
        toast.success("Added to Existing Collection", {
          position: "top-center",
          autoClose: 2000,
          style: {
            backgroundColor: "rgba(237, 254, 235, 1)",
            borderLeft: "5px solid rgba(15, 145, 4, 1)",
            color: "rgba(15, 145, 4, 1)",
          },
          progressStyle: {
            backgroundColor: "rgba(15, 145, 4, 1)",
          },
        });

        await fetchCollections();

        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error("Failed to Add to the collection", {
        position: "top-center",
        autoClose: 2000,
        style: {
          backgroundColor: "rgba(254, 235, 235, 1)",
          borderLeft: "5px solid rgba(145, 4, 4, 1)",
          color: "background: rgba(145, 4, 4, 1)",
        },
        progressStyle: {
          backgroundColor: "rgba(145, 4, 4, 1)",
        },
      });
      console.error("Error adding bookmark to existing collection:", error);
    }
  };

  const handleCreateNewCollection = async () => {
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
        "http://13.127.207.184:8081/bookmarks/users/collections",
        newCollection,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success("Collection Created", {
          position: "top-center",
          autoClose: 1000,

          style: {
            backgroundColor: "rgba(237, 254, 235, 1)",
            borderLeft: "5px solid rgba(15, 145, 4, 1)",
            color: "rgba(15, 145, 4, 1)",
          },
          progressStyle: {
            backgroundColor: "rgba(15, 145, 4, 1)",
          },
        });
        await fetchCollections();
        setNewCollectionName("");
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error("Failed to CreateCollection", {
        position: "top-center",
        autoClose: 2000,
        style: {
          backgroundColor: "rgba(254, 235, 235, 1)",
          borderLeft: "5px solid rgba(145, 4, 4, 1)",
          color: "background: rgba(145, 4, 4, 1)",
        },
        progressStyle: {
          backgroundColor: "rgba(145, 4, 4, 1)",
        },
      });
      console.error("Error creating new collection:", error);
    }
  };

  // const handleSaveToNote = () => {
  //   const textToSave = selectedTextRef.current;
  //   if (textToSave) {
  //     setSavedText(textToSave);
  //     // You can save the text to notes or perform any other action here.
  //   }
  //   if (!openNotes) {
  //     setOpenNotes(true);
  //   }

  //   // Hide the popup after saving
  //   if (popupRef.current) {
  //     popupRef.current.style.display = "none";
  //   }
  // };
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

  function scrollToTop() {
    const articleContent = document.querySelector(".meta");
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
      toast.error("Please enter a query");
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
        "http://13.127.207.184:8081/view_article/generateanswer",
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
    localStorage.getItem("sessionId") || localStorage.getItem("session_id");
  const handleDeriveClick = async () => {
    if (!query && !uploadedFile) {
      toast.error("Please enter a query or upload a file", {
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
      let url = "http://13.127.207.184:8081/insights/upload";
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
        url = "http://13.127.207.184:8081/insights/ask";
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
    // handleDeriveClick(prompt, uploadedFile);
    // setQuery(prompt); // Set the prompt as the query
    // handleDeriveClick(); // Immediately trigger derive click with file and prompt
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
      //navigate(-1);
    } else {
      navigate(-1);
    }
    //localStorage.removeItem("unsavedChanges");
    //navigate(-1);
  };

  useEffect(() => {
    localStorage.removeItem("session_id");
    setActiveSessionId(null);
  }, []);
  const handleCancelConfirm = () => {
    setShowConfirmPopup(false);
  };
  const handleOk = () => {
    setShowConfirmPopup(false);
    localStorage.removeItem("unsavedChanges");
    navigate(-1);
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
    return text.replace(regex, "**$1**");
  };
  const handleAnnotate = () => {
    // Replace `desiredId` with the actual ID you want to match against
    const matchingIdExists =
      annotateData && Object.prototype.hasOwnProperty.call(annotateData, id);
    if ((!annotateData || !matchingIdExists) && !hasFetchedAnnotateData) {
      handleAnnotateClick();
    } else {
      setOpenAnnotate((prevOpenAnnotate) => !prevOpenAnnotate); // Open immediately if matching ID is present
    }
  };

  const handleAnnotateClick = async () => {
    // Define the request body according to source and id
    let requestBody = {};
    if (source === "pubmed" && id) {
      requestBody = { pubmed: [id] };
    } else if (source === "biorxiv" && id) {
      requestBody = { biorxiv: [id] };
    } else if (source === "plos" && id) {
      requestBody = { plos: [id] };
    }

    setAnnotateLoading(true);
    try {
      const response = await axios.post(
        "http://13.127.207.184:8081/core_search/annotate",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

  // Optional: useEffect for clearing flag if needed, such as when sources change
  useEffect(() => {
    if (!annotateData) {
      setHasFetchedAnnotateData(false);
    }
  }, [annotateData, source, id]);

  const handleNotes = () => {
    const unsavedforIcon = localStorage.getItem("unsavedChanges");
    if (unsavedforIcon === "true") {
      setShowConfirmIcon(true);
    } else {
      setOpenNotes((prevOpenNotes) => !prevOpenNotes);
    }
    //localStorage.removeItem("unsavedChanges");
  };
  const handleCancelIcon = () => {
    setShowConfirmIcon(false);
  };
  const handleCloseIcon = () => {
    setShowConfirmIcon(false);
    setOpenNotes(false);
    localStorage.removeItem("unsavedChanges");
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

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get(
          `http://13.127.207.184:8081/history/conversations/history/${user_id}`,
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

  // Edit functions
  const handleEditClick = (sessionId, title) => {
    setEditingSessionId(sessionId);
    setEditedTitle(title);
  };

  const handleTitleChange = (e) => {
    setEditedTitle(e.target.value); // Update the state as the user types
  };

  const handleSaveEdit = async (sessionId) => {
    try {
      await axios.put(
        "http://13.127.207.184:8081/history/conversations/edit",
        {
          user_id,
          session_id: sessionId,
          new_title: editedTitle,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(sessionId);
      // console.log(editedTitle);
      // Update the local sessions state after a successful edit
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.session_id === sessionId
            ? { ...session, session_title: editedTitle }
            : session
        )
      );

      // Reset editing state
      setEditingSessionId(null);
      setEditedTitle("");
    } catch (error) {
      console.error("Error updating session title:", error);
    }
  };

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
  const handleSessionClick = async (session_id) => {
    try {
      const conversationResponse = await axios.get(
        `http://13.127.207.184:8081/history/conversations/history/${user_id}/${session_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      sessionStorage.setItem("session_id", session_id);
      setIsPromptEnabled(true);
      setActiveSessionId(session_id);
      const formattedChatHistory = [];
      let currentEntry = {};

      // Process conversation data into chat history
      conversationResponse.data.conversation.forEach((entry) => {
        if (entry.role === "user") {
          if (entry.file_url) {
            currentEntry.file_url = entry.file_url;
          }

          if (currentEntry.query) {
            formattedChatHistory.push(currentEntry);
            currentEntry = {};
          }
          currentEntry.query = entry.parts.join(" ");
        } else if (entry.role === "model") {
          currentEntry.response = entry.parts.join(" ");
          formattedChatHistory.push(currentEntry);
          currentEntry = {};
        }
      });

      if (currentEntry.query) {
        formattedChatHistory.push(currentEntry);
      }

      localStorage.setItem("chatHistory", JSON.stringify(formattedChatHistory));

      const sourceType =
        conversationResponse.data.source === "biorxiv"
          ? "bioRxiv_id"
          : conversationResponse.data.source === "plos"
          ? "plos_id"
          : "pmid";

      const navigatePath = conversationResponse.data.session_type
        ? "/article"
        : `/article/${sourceType}:${conversationResponse.data.article_id}`;

      if (conversationResponse.data.session_type) {
        // Navigate immediately if deriveInsights mode
        dispatch(setDeriveInsights(true));
        console.log(navigatePath);
        navigate(navigatePath, {
          state: {
            id: conversationResponse.data.article_id || id,
            source: source,
            token: token,
            user: { access_token: token, user_id: user_id },
            annotateData: location.state?.annotateData,
            data: location.state?.data,
          },
        });
      } else {
        console.log("nav");
        dispatch(setDeriveInsights(false));

        console.log(navigatePath);
        navigate(navigatePath, {
          state: {
            id: conversationResponse.data.article_id || id,
            source: source,
            token: token,
            user: { access_token: token, user_id: user_id },
            annotateData: location.state?.annotateData,
            data: location.state?.data,
          },
        });
        // Fetch article data before navigating
        // dispatch(setDeriveInsights(false));
        // await fetchArticleBeforeNavigate(
        //   conversationResponse.data.article_id,
        //   sourceType,
        //   location.state?.data
        // );
      }
    } catch (error) {
      console.error("Error fetching article or conversation data:", error);
    }
  };
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

  const fetchArticleBeforeNavigate = async (articleId, sourceType, data) => {
    try {
      // Map sourceType to source using the utility function
      const source = getSourceFromType(sourceType);
      if (!source) {
        console.error("Invalid sourceType provided");
        return;
      }

      const response = await axios.get(
        `http://13.127.207.184/view_article/get_article/${articleId}?source=${source}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const article = response.data;
      setArticleData(article);
      console.log(data);
      // Navigate after article is fetched
      navigate(`/article/content/${sourceType}:${articleId}`, {
        state: {
          id: articleId,
          source: sourceType,
          token: token,
          user: { access_token: token, user_id: user_id },
          data: data,
        },
      });
    } catch (error) {
      console.error("Error fetching article data:", error);
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

  // const handleFileUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setUploadedFile(file);
  //   }
  // };
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return; // Exit if no file was selected
    if (file.size > 5 * 1024 * 1024) {
      toast.error("try uploading files 5MB or less", {
        position: "top-center",
      });
    }

    const allowedExtensions = ["pdf", "docx"];
    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      //alert("Please upload a PDF or DOCX file.");
      toast.error("try uploading .pdf,.docx", {
        position: "top-center",
        autoClose: 2000,
      });
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

  const handleOpenChat = () => {
    localStorage.removeItem("session_id");
    localStorage.setItem("chatHistory", []);
    setArticleData("");
    setChatHistory([]);
    dispatch(setDeriveInsights(true)); // Set deriveInsights state in Redux
    // console.log("clicked");
    navigate("/article", {
      state: true, // Set state to null
    });
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
        return <img src={pdfICon} alt-="pdf-icon" style={{ width: "30px", height: "30px" }} />;
      case "docx":
        return <img src={docxIcon} alt-="pdf-icon" style={{ width: "30px", height: "30px" }} />;
      case "txt":
        return <img src={txtIcon} alt-="pdf-icon" style={{ width: "30px", height: "30px" }} />;
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
                Drag & drop files here or <a href="#">Upload</a>
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
                      <div>
                      {getFileIcon(chat.file_url)}
                      </div>
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
                        <div>
                        {getFileIcon(chat.file.name)}
                        </div>
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
                  {chat.query?<div className="derive-query-asked">
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
                  </div>:""}

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
                <span style={{width:"max-content"}}>{uploadedFile.name}</span>
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
