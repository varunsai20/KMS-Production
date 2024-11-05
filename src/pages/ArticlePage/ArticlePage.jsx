import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useLocation } from "react-router-dom";
import "./ArticlePage.css";
import Loading from "../../components/Loading";
import Button from "../../components/Buttons";
import { Typography } from "@mui/material";
import flag from "../../assets/images/flash.svg";
import Arrow from "../../assets/images/back-arrow.svg";
import annotate from "../../assets/images/task-square.svg";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { CircularProgress } from "@mui/material";
import { TextField } from "@mui/material";
import Annotation from "../../components/Annotaions";
import { faBookmark as regularBookmark } from "@fortawesome/free-regular-svg-icons";
import { faBookmark as solidBookmark } from "@fortawesome/free-solid-svg-icons";
import notesicon from "../../assets/images/note-2.svg";
import rehypeRaw from "rehype-raw";
import Logo from "../../assets/images/Logo_New.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import { faAnglesUp } from "@fortawesome/free-solid-svg-icons";
import { LiaTelegramPlane } from "react-icons/lia";
//import { BiSolidPaperPlane } from "react-icons/bi";
import { IoMdPaperPlane } from "react-icons/io";
import Notes from "../NotesPage/Notes";
import { login, logout } from "../../redux/reducers/LoginAuth"; // Import login and logout actions
import ProfileIcon from "../../assets/images/Profile-dummy.svg";
import { toast } from "react-toastify";

const ArticlePage = () => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const displayIfLoggedIn = isLoggedIn ? null : "none";
  const widthIfLoggedIn = isLoggedIn ? null : "100%";
  const { pmid } = useParams();
  const { user } = useSelector((state) => state.auth);
  const profilePictureUrl = user?.profile_picture_url;
  const token = useSelector((state) => state.auth.access_token);
  const dispatch = useDispatch();
  const user_id = user?.user_id;
  const [type, id1] = pmid.split(":");
  const id = Number(id1);
  const [source, setSource] = useState();
  const [annotateLoading, setAnnotateLoading] = useState(false);
  const location = useLocation();
  const { data } = location.state || { data: [] };
  const [searchTerm, setSearchTerm] = useState("");
  const [articleData, setArticleData] = useState(null);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [annotateData, setAnnotateData] = useState(location.state?.annotateData || "");
  const endOfMessagesRef = useRef(null);
  const [chatHistory, setChatHistory] = useState(() => {
    const storedHistory = sessionStorage.getItem("chatHistory");
    return storedHistory ? JSON.parse(storedHistory) : [];
  });
  const [refreshSessions, setRefreshSessions] = useState(false);
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
  const [openAnnotate, setOpenAnnotate] = useState(false);
  const [openNotes, setOpenNotes] = useState(false);
  const [activeSection, setActiveSection] = useState("Title");
  const contentRef = useRef(null); // Ref to target the content div
  const [contentWidth, setContentWidth] = useState(); // State for content width
  const [ratingsList, setRatingsList] = useState(() => {
    return JSON.parse(sessionStorage.getItem("ratingsGiven")) || [];
  });
  const [triggerAskClick, setTriggerAskClick] = useState(false);
  const [editingPmid, setEditingPmid] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  const [collections, setCollections] = useState([]);

  const fetchCollections = async () => {
    try {
      const response = await axios.get(
        `http://13.127.207.184:80/bookmarks/${user_id}/collections`,
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
  const isBookmarked = (idType) => {
    // Convert idType to a number for comparison
    const numericIdType = Number(idType);

    // console.log(`Checking for idType: ${numericIdType}`);

    // Loop through each collection and log article IDs as numbers
    // Object.entries(collections).forEach(([collectionName, articleArray]) => {
    //   console.log(`Collection: ${collectionName}`);
    //   articleArray.forEach((article) => {
    //     console.log(`article_id: ${Number(article.article_id)}`);
    //   });
    // });

    // Check if the article is bookmarked
    const result = Object.values(collections).some((articleArray) =>
      articleArray.some(
        (article) => Number(article.article_id) === numericIdType
      )
    );

    return result;
  };
  const [currentid, setCurrentid] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [hasFetchedAnnotateData, setHasFetchedAnnotateData] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [editingSessionId, setEditingSessionId] = useState(null);

  const [bookmarkedPmids, setBookmarkedPmids] = useState({});
  const [savedText, setSavedText] = useState("");
  const selectedTextRef = useRef("");
  const popupRef = useRef(null);
  const popupPositionRef = useRef({ x: 0, y: 0 });
  const [annotateHeight, setAnnotateHeight] = useState(35);
  const [notesHeight, setNotesHeight] = useState(35);
  const minHeight = 15;
  const maxHeight = 60;

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
        `http://13.127.207.184:80/auth/logout/?user_id=${user_id}`
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
    // Determine the source based on `type`
    setAnnotateLoading(true)
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
          setAnnotateLoading(false)
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

  const getRatingForArticle = async (uniqueId) => {
    // Check if the rating is already available in ratingsList
    const cachedRating = ratingsList.find((item) => item.uniqueId === uniqueId);
    if (cachedRating) return cachedRating.rating;

    const [source, article_id] = uniqueId.split("_");

    try {
      const response = await axios.get(
        `http://13.127.207.184:80/rating/user-ratings/${user_id}/${article_id}/${source}`,
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
        "http://13.127.207.184:80/rating/rate",
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

  const handleBookmarkClick = (id, title, source) => {
    setCurrentid(id);
    setArticleTitle(title);
    setSource(source);
    setIsModalOpen(true); // Open the modal for collection selection
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
        "http://13.127.207.184:80/bookmarks/users/collections",
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
        toast.success("Successfully added to Existing Collection", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });

        await fetchCollections(); // Refetch collections after successful addition

        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error("Failed to Add to the collection");
      console.error("Error adding bookmark to existing collection:", error);
    }
  };

  const handleCreateNewCollection = async () => {
    const newCollection = {
      user_id,
      collection_name: newCollectionName,
      bookmark: {
        article_id: String(currentid), // Convert to string
        article_title: articleTitle,
        article_source: source,
      },
    };

    try {
      const response = await axios.post(
        "http://13.127.207.184:80/bookmarks/users/collections",
        newCollection,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success("Collection Created", {
          position: "top-right",
          autoClose: 1000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        await fetchCollections(); // Refetch collections after successful creation
        setNewCollectionName("");
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error("Failed to CreateCollection");
      console.error("Error creating new collection:", error);
    }
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

  const getid = () => {
    return `${source}_${id}`;
  };

  const uniqueId = getid();

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
        setRefreshSessions((prev) => !prev);
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
  console.log(annotateData)
  const handleAnnotate = () => {
    // Replace `desiredId` with the actual ID you want to match against
    const matchingIdExists = annotateData && Object.prototype.hasOwnProperty.call(annotateData, id);
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
        "http://13.127.207.184:80/core_search/annotate",
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
  
  
  console.log(annotateData)
  const handleNotes = () => {
    setOpenNotes((prevOpenNotes) => !prevOpenNotes);
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
                `http://13.127.207.184:80/history/conversations/sessions/${user_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.data?.sessions) {
                const sessionsData = response.data.sessions.reverse(); // Reverse the array order
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
        "http://13.127.207.184:80/history/conversations/edit",
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
      console.log(sessionId);
      console.log(editedTitle);
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
    const storedChatHistory = sessionStorage.getItem("chatHistory");

    if (storedChatHistory) {
      setChatHistory(JSON.parse(storedChatHistory));
      setShowStreamingSection(true);
    } else {
      setShowStreamingSection(false); // Default to false if no stored chat history
    }

  }, [location.state]); // Add location.state as a dependency to re-run on navigation

  const handleSessionClick = async (article_id, source, session_id) => {
    try {
      const conversationResponse = await axios.get(
        `http://13.127.207.184:80/history/conversations/history/${user_id}/${session_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const formattedChatHistory = [];
      let currentEntry = {};

      conversationResponse.data.conversation.forEach((entry) => {
        if (entry.role === "user") {
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

      console.log(formattedChatHistory);

      sessionStorage.setItem(
        "chatHistory",
        JSON.stringify(formattedChatHistory)
      );

      // Update `source` based on its value
      const sourceType =
        source === "biorxiv"
          ? "bioRxiv_id"
          : source === "plos"
          ? "plos_id"
          : "pmid";

      navigate(`/article/${sourceType}:${article_id}`, {
        state: {
          id: article_id,
          source: sourceType,
          token: token,
          user: { access_token: token, user_id: user_id },
          annotateData: location.state.annotateData,
          data: location.state.data,
        },
      });
      console.log(conversationResponse);
    } catch (error) {
      console.error("Error fetching article or conversation data:", error);
    }
  };

  return (
    <>
      <div className="container">
        <header className="header">
          <div className="logo" style={{ margin: "20px 0" }}>
            <a href="/">
              <img href="/" src={Logo} alt="Infer Logo" />
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
          <div
            className="auth-buttons"
            style={{ margin: "20px 26px 20px 0", display: "flex", gap: "10px" }}
          >
            {isLoggedIn ? (
              <>
                <div
                  onClick={handleProfileClick}
                  style={{ cursor: "pointer", height: "35px" }}
                >
                  <img
                                    src={profilePictureUrl || ProfileIcon} // Use profilePictureUrl if available, else fallback to ProfileIcon
                                    style={{ width: "35px",borderRadius:"16px" }}
                    alt="Profile"
                    className="profile-icon"
                  />
                </div>
                <Button
                  text="Logout"
                  className="logout-btn"
                  onClick={handleLogout}
                />
              </>
            ) : (
              <Button
                text="Login"
                className="login-btn"
                onClick={handleLogin}
              />
            )}
          </div>
        </header>
        {annotateLoading ? <Loading /> : ""}
        <div className="content">
          <div
            className="history-pagination"
            style={{ display: displayIfLoggedIn }}
          >
            <h5>Recent Interactions</h5>
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
                    <li key={session.session_id}>
                      {editingSessionId === session.session_id ? (
                        <input
                          type="text"
                          style={{
                            padding: "0",
                            height: "20px",
                            width: "100%", // Adjust width as needed
                            fontSize: "16px", // Adjust font size as needed
                            // Add any additional styles you need
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
                        <a
                          onClick={() => {
                            console.log("Session ID:", session.session_id);
                            console.log("Source:", session.source);
                            handleSessionClick(
                              session.article_id,
                              session.source,
                              session.session_id,
                              user_id
                            );
                          }}
                        >
                          {mappedTitle.slice(0, 30)}
                          {mappedTitle.length > 30 ? "..." : ""}
                        </a>
                      )}
                      <FontAwesomeIcon
                        title="Rename the title"
                        icon={faPen}
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

          {articleData ? (
            <div
              className="article-content"
              onMouseUp={handleMouseUp}
              ref={contentRef}
              style={{ width: widthIfLoggedIn }}
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
                  <div
                    className="Rate-Article"
                    style={{ display: displayIfLoggedIn }}
                  >
                    <div>
                      <span>Rate the article </span>
                    </div>
                    <div className="rate">
                    {[5, 4, 3, 2, 1].map((value) => {
                      const existingRating = Array.isArray(ratingsList) &&
                        ratingsList.find((item) => item.uniqueId === uniqueId)?.rating;

                      return (
                        <React.Fragment key={value}>
                          <input
                            type="radio"
                            id={`star${value}-${uniqueId}`}
                            name={`rate_${uniqueId}`}
                            value={value}
                            checked={existingRating === value}
                            onChange={() => handleRatingChange(uniqueId, value)}
                            disabled={!!existingRating} // Disable if a rating already exists
                          />
                          <label
                            htmlFor={`star${value}-${uniqueId}`}
                            title={`${value} star`}
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
                    icon={isBookmarked(id) ? solidBookmark : regularBookmark}
                    size="l"
                    style={{
                      color: isBookmarked(id) ? "#0071bc" : "black",
                      cursor: "pointer",
                      display: displayIfLoggedIn,
                    }}
                    onClick={() =>
                      handleBookmarkClick(
                        id,
                        articleData.article.article_title,
                        source || "PubMed"
                      )
                    }
                    title={
                      isBookmarked(id) ? "Bookmarked" : "Bookmark this article"
                    }
                  />

{isModalOpen && (
                                <div className="bookmark-modal-overlay">
                                  <div className="modal-content" ref={modalRef}>
                                    {/* Existing Collections */}

                                    {/* Create New Collection */}
                                    <h4>Create a new collection:</h4>
                                    <input
                                      type="text"
                                      value={newCollectionName}
                                      onChange={(e) =>
                                        setNewCollectionName(e.target.value)
                                      }
                                      placeholder="New collection name"
                                      />
                                    <div
                                      style={{ display: "flex", gap: "20px",marginBottom:"15px" }}
                                      >
                                      <button
                                        onClick={handleCreateNewCollection}
                                        disabled={!newCollectionName}
                                        >
                                        Create
                                      </button>

                                      <button
                                        onClick={() => setIsModalOpen(false)}
                                        >
                                        Cancel
                                      </button>
                                    </div>
                                    
                                  {Object.keys(collections).length > 0 && (
                                    <>
                                      <h4>Save to existing collection:</h4>
                                      <ul>
                                        {Object.keys(collections).map(
                                          (collectionName, index) => (
                                            <ul key={index}>
                                              
                                              {/* using index as key since collection names are unique */}
                                              <li onClick={() =>
                                                  handleSaveToExisting(
                                                    collectionName
                                                  )
                                                }><span className="collection-name">{collectionName}</span>
                                                <span className="collection-article-count">
                                                  {collections[collectionName].length} articles
                                                </span>
                                                </li>
                                              {/* <button
                                                onClick={() =>
                                                  handleSaveToExisting(
                                                    collectionName
                                                  )
                                                }
                                              >
                                                {collectionName}
                                              </button> */}
                                            </ul>
                                          )
                                        )}
                                      </ul>
                                    </>
                                  )}
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
                  <span style={{ color: "#2b9247" }}>
                    {type === "bioRxiv_id" && "BioRxiv ID"}
                    {type === "pmid" && "PMID"}
                    {type === "plos_id" && "PLOS ID"} : {id}
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
                    {/* <BiSolidPaperPlane size={25} color="black" /> */}
                    {/* <IoMdPaperPlane size={25} color="black" /> */}

                    <LiaTelegramPlane size={25} color="black" />
                    {/* <span style={{ color: "black", fontSize: "17px" }}>
                      send to notes
                    </span> */}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="Article-data-not-found"
              style={{
                width: widthIfLoggedIn,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "70vh",
              }}
            >
              <p style={{}}>Data not found for the given PMID</p>
            </div>
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
                }`}
                onClick={
                 handleAnnotate
                }
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
        style={{
          width: openNotes ? contentWidth : "69%",
          display: displayIfLoggedIn,
        }}
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
              handlePromptClick("what are the key highlights from this article")
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
