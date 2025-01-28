import React, { useEffect, useRef, useState, useMemo } from "react";
import "./SearchResults.css";
import { apiService } from "../../assets/api/apiService";
import Footer from "../../components/Footer-New";
import SearchBar from "../../components/SearchBar";
import SearchIcon from "../../assets/images/Search.svg";
import Loading from "../../components/Loading";
import { useSelector } from "react-redux";
import Annotation from "../../components/Annotaions";
import { useLocation, useNavigate, Link } from "react-router-dom";
import annotate from "../../assets/images/task-square.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark as regularBookmark } from "@fortawesome/free-regular-svg-icons";
import { faBookmark as solidBookmark } from "@fortawesome/free-solid-svg-icons";
import { faAnglesUp } from "@fortawesome/free-solid-svg-icons";
import uparrow from "../../assets/images/uparrow.svg";
import { IoCloseOutline } from "react-icons/io5";
import downarrow from "../../assets/images/downarrow.svg";
import axios from "axios";
import { showSuccessToast, showErrorToast } from "../../utils/toastHelper";
import NoteItem from "../../components/Notes/NoteItem";
import filtersIcon from "../../assets/images/001-edit 1.svg"
import homeIcon from "../../assets/images/homeIcon.svg"
import { PiShareNetwork } from "react-icons/pi";
import SearchNavbar from "../../components/SearchNavbar";
const SearchResults = ({ open, onClose, applyFilters, dateloading }) => {
  const ITEMS_PER_PAGE = 10;
  const location = useLocation(); // Access the passed state
  const { data } = location.state || { data: [] };
  const { user } = useSelector((state) => state.auth);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const displayIfLoggedIn = isLoggedIn ? null : "none";
  const displayMessage = isLoggedIn
    ? ""
    : "This feature is available for subscribed users.";
  const user_id = user?.user_id;
  const token = useSelector((state) => state.auth.access_token);
  const searchTerm = sessionStorage.getItem("SearchTerm");
  const navigate = useNavigate();
  const contentRightRef = useRef(null);
  const [result, setResults] = useState();
  const [loading, setLoading] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [bioRxivArticles, setBioRxivArticles] = useState([]);
  const [plosArticles, setPlosArticles] = useState([]);
  const [handleAnnotateCall, setHandleAnnotateCall] = useState(false);
  const totalArticles = useMemo(() => {
    return [...bioRxivArticles, ...plosArticles, ...selectedArticles];
  }, [bioRxivArticles, plosArticles, selectedArticles]);
  const [shareableLinks, setShareableLinks] = useState({});
  const [currentIdType, setCurrentIdType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collections, setCollections] = useState([]);

  const [selectedNote, setSelectedNote] = useState([]);
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
 
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchNotes = async () => {
    try {
      const response = await apiService.fetchNotes(user_id, token);
      const notesArray = Array.isArray(response.data.data)
        ? response.data.data
        : Object.values(response.data.data);

      setNotes(notesArray);
      localStorage.setItem("notes", JSON.stringify(notesArray));
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const prevTotalArticlesRef = useRef(totalArticles);
  useEffect(()=>{
    console.log("exec")
    localStorage.removeItem("sessionIds")
  },[])
  useEffect(() => {
    if (handleAnnotateCall) {
      if (totalArticles.length > 1) {
        // Check if the previous totalArticles length or values are different
        const prevTotalArticles = prevTotalArticlesRef.current;
        const isDifferent =
          prevTotalArticles.length !== totalArticles.length ||
          JSON.stringify(prevTotalArticles) !== JSON.stringify(totalArticles);

        if (isDifferent) {
          handleAnnotateClick();
        }

        // Update the ref to the current totalArticles
        prevTotalArticlesRef.current = totalArticles;
        setHandleAnnotateCall(false);
      }
    }
  }, [handleAnnotateCall, totalArticles]); // Re-run when totalArticles or handleAnnotateCall changes

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

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const [email, setEmail] = useState();

  const [emailSubject, setEmailSubject] = useState();
  const [description, setDecription] = useState();
  const [collectionAction, setCollectionAction] = useState("existing"); // Tracks which radio button is selected
  const [selectedCollection, setSelectedCollection] = useState("favorites");
  const [newCollectionName, setNewCollectionName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState(1);
  const [selectedDateRange, setSelectedDateRange] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [completePMID, setCompletePMID] = useState([]);
  const [ratingsList, setRatingsList] = useState([]);
    // const [termMissing, setTermMissing] = useState(false);
  // Function to get the rating for a specific article by pmid
  const getRatingForArticle = (id, source) => {
    // Standardize source values for specific cases
    let standardizedSource = source;
    if (source === "BioRxiv") standardizedSource = "biorxiv";
    if (source === "Public Library of Science (PLOS)")
      standardizedSource = "plos";

    // Ensure `rated_articles` is an array within `ratingsList`
    const ratingsArray = Array.isArray(ratingsList?.rated_articles)
      ? ratingsList.rated_articles
      : [];

    // Find a matching entry with both `article_id` and `article_source`
    const savedRating = ratingsArray.find(
      (item) =>
        item.article_id === String(id) &&
        item.article_source === standardizedSource
    );

    // Return the saved rating or default to 3 if not found
    return savedRating ? savedRating.average_rating : 0;
  };

  // Use effect to fetch ratings only once on page load or reload
  useEffect(() => {
    const fetchRatedArticles = async () => {
      try {
        const response = await apiService.fetchRatedArticles(token);
        const ratedArticles = response.data || [];
        sessionStorage.setItem("ratingsList", JSON.stringify(ratedArticles));
        setRatingsList(ratedArticles);
      } catch (error) {
        console.error("Error fetching rated articles:", error);
      }
    };

    const storedRatings = JSON.parse(sessionStorage.getItem("ratingsList"));
    if (!storedRatings || location.pathname === "/search") {
      fetchRatedArticles();
    } else {
      setRatingsList(storedRatings);
    }
  }, [location]);

  useEffect(() => {
    const storedDateInfo = localStorage.getItem("publicationDate");
    if (storedDateInfo) {
      const { selectedDateRange, customStartDate, customEndDate } =
        JSON.parse(storedDateInfo);

      if (selectedDateRange) {
        setSelectedDateRange(selectedDateRange);
      }
      if (selectedDateRange === "custom") {
        setCustomStartDate(customStartDate || "");
        setCustomEndDate(customEndDate || "");
      }
    }
  }, [result]);

  const [filters, setFilters] = useState(() => {
    const savedFilters = localStorage.getItem("filters");
    return savedFilters
      ? JSON.parse(savedFilters)
      : { articleType: [], sourceType: [] }; // Add sourceType to initial state
  });
  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("filters", JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem("PublicationDate", selectedDateRange);
  }, [selectedDateRange]);
  const [articleTitle, setArticleTitle] = useState("");
  const [source, setSource] = useState("");
  const [showArticleType, setShowArticleType] = useState(true);
  const [showSourceType, setShowSourceType] = useState(true);
  const [showPublicationDate, setShowPublicationDate] = useState(true);
  const [openAnnotate, setOpenAnnotate] = useState(false);
  const [annotateData, setAnnotateData] = useState();
  const [annotateSource, setAnnotateSource] = useState();
  const [openNotes, setOpenNotes] = useState(false);
  const [annotateLoading, setAnnotateLoading] = useState(false);
  const [sortedData, setSortedData] = useState([]); // State to store sorted data
  const [selectedSort, setSelectedSort] = useState("best_match");
  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split("-");
    const monthIndex = new Date(Date.parse(`${month} 1, ${year}`)).getMonth(); // Get month index from the string (e.g., "Jun" -> 5)
    return new Date(year, monthIndex, day); // Return a Date object
  };

  const scrollToTop = () => {
    if (contentRightRef.current) {
      contentRightRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Scroll event listener to show or hide the scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;

      // Show button if scrolled down more than 100 pixels
      if (scrollTop > 100) {
        document.getElementById("scrollTopBtn").style.display = "block"; // Show button
      } else {
        document.getElementById("scrollTopBtn").style.display = "none"; // Hide button
      }
    };

    // Add event listener for window scroll
    window.addEventListener("scroll", handleScroll);

    // Clean up event listener
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const sortedPublicationData =
    data && data.articles
      ? [...data.articles].sort((a, b) => {
          const dateA = parseDate(a.publication_date);
          const dateB = parseDate(b.publication_date);
          return dateB - dateA; // Sort in descending order (newest first)
        })
      : [];

  useEffect(() => {
    // If the selected sort is neither "publication_date" nor "Ratings", default to "best_match"
    if (selectedSort !== "publication_date" && selectedSort !== "Ratings") {
      handleSortChange({ target: { value: "best_match" } });
    }
  }, [selectedSort]);

  const sortedRatingData = useMemo(() => {
    if (!data || !data.articles || !Array.isArray(data.articles)) {
      return []; // Return an empty array if data or data.articles is missing or not an array
    }

    return [...data.articles].sort((a, b) => {
      const ratingA = getRatingForArticle(a.bioRxiv_id);
      const ratingB = getRatingForArticle(b.bioRxiv_id);
      return ratingB - ratingA; // Sort in descending order by rating
    });
  }, [data?.articles, getRatingForArticle]);

  // Function to handle sorting based on selected option
  const handleSortChange = (e) => {
    const sortType = e.target.value;
    setSelectedSort(sortType); // Store the selected sort option

    // If publication date is selected, use the sorted list for display
    if (sortType === "publication_date") {
      setSortedData(sortedPublicationData); // Sort by publication date
    } else if (sortType === "best_match") {
      setSortedData(sortedSimilarityData); // Sort by similarity score
    } else if (sortType === "Ratings") {
      setSortedData(sortedRatingData); // Sort by rating
    }
  };

  useEffect(() => {
    // Initialize with original data on component load
    setSortedData(data.articles || []);
  }, [data]);

  let sessionDataCache = null; // Cache for session storage data

  // Utility function to get similarity score from article or session storage
  const getSimilarityScore = (article) => {
    let similarityScore = article.similarity_score;

    // If similarity score is not present in the article, try to retrieve it from session storage
    if (!similarityScore) {
      if (!sessionDataCache) {
        const storedData = sessionStorage.getItem("ResultData");
        sessionDataCache = storedData ? JSON.parse(storedData).articles : [];
      }

      // Find the article with the matching pmid in session storage and get similarity score
      const matchedArticle = sessionDataCache.find(
        (storedArticle) => storedArticle.pmid === article.pmid
      );
      similarityScore = matchedArticle
        ? matchedArticle.similarity_score || 0
        : 0;
    }

    return similarityScore || 0; // Default to 0 if no similarity score found
  };

  // Memoized sorting based on similarity score
  const sortedSimilarityData = useMemo(() => {
    if (!data || !data.articles || !Array.isArray(data.articles)) {
      return []; // Return an empty array if data or data.articles is invalid
    }

    // Sort the data in descending order by similarity score
    return [...data.articles].sort(
      (a, b) => getSimilarityScore(b) - getSimilarityScore(a)
    );
  }, [data?.articles, getSimilarityScore]);

  useEffect(() => {
    // Check for updates in sortedData and reset pagination if there's a change
    setCurrentPage(1);
    setPageInput(1);
    // sessionStorage.setItem("currentPage", 1);
  }, [location.state.data]); // Reset pagination only when sortedData changes

  useEffect(() => {
    // Retrieve the stored page number from sessionStorage when the component first loads
    const storedPage = sessionStorage.getItem("currentPage");
    if (storedPage) {
      setCurrentPage(Number(storedPage));
      setPageInput(Number(storedPage));
    }
  }, []); // This effect runs only once on component mount

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedArticles = sortedData.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    if (
      newPage > 0 &&
      newPage <= Math.ceil(sortedData.length / ITEMS_PER_PAGE)
    ) {
      setCurrentPage(newPage);
      setPageInput(newPage);
      sessionStorage.setItem("currentPage", newPage);
      scrollToTop();
    }
  };

  const handleAnnotate = () => {
    if (openAnnotate) {
      setOpenAnnotate(false);
    } else if (annotateData && Object.keys(annotateData).length > 0) {
      setOpenAnnotate(true);
    }
  };
  useEffect(() => {
    if (annotateLoading) {
      // Disable scrolling
      document.body.style.overflow = "hidden";
    } else {
      // Enable scrolling
      document.body.style.overflow = "auto";
    }

    // Cleanup to reset the overflow when the component is unmounted or annotateLoading changes
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [annotateLoading]);
  const handleCloseCollectionModal = () => {
    setCollectionAction("existing"); // Reset to default state
    setNewCollectionName(""); // Clear input
    setSelectedCollection("favorites"); // Reset selection
    setIsModalOpen(false); // Close modal
  };
  const isArticleBookmarked = (idType) => {
    const numericIdType = Number(idType);

    // Loop through each collection to check if the article is bookmarked
    for (const [collectionName, articleArray] of Object.entries(collections)) {
      const found = articleArray.some(
        (article) => Number(article.article_id) === numericIdType
      );

      if (found) {
        return { isBookmarked: true, collectionName }; // Return true with collection name
      }
    }

    return { isBookmarked: false, collectionName: null }; // Not found in any collection
  };

  const handleBookmarkClick = async (idType, title, source) => {
    const { isBookmarked, collectionName } = isArticleBookmarked(idType);

    if (isBookmarked) {
      try {
        const response = await apiService.bookmarkClick(
          user_id,
          collectionName,
          idType,
          token
        );
        if (response.status === 200) {
          // Remove the bookmark from local collections state
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
          await fetchCollections(); // Refetch collections after successful deletion
        }
      } catch (error) {
        console.error("Error deleting bookmark:", error);
      }
    } else {
      // Open modal for adding bookmark
      setCurrentIdType(idType);
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
        article_id: String(currentIdType),
        article_title: articleTitle,
        article_source: source,
      },
    };

    try {
      const response = await apiService.saveToExisting(token, bookmarkData);
      if (response.status === 201) {
        const updatedCollections = {
          ...collections,
          [collectionName]: [
            ...(collections[collectionName] || []),
            {
              article_id: String(currentIdType),
              article_title: articleTitle,
              article_source: source,
            },
          ],
        };
        setCollections(updatedCollections);
        localStorage.setItem("collections", JSON.stringify(updatedCollections));
        showSuccessToast("Added to Existing Collection");

        await fetchCollections(); // Refetch collections after successful addition

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
        article_id: String(currentIdType), // Convert to string
        article_title: articleTitle,
        article_source: source,
      },
    };

    try {
      const response = await apiService.createNewCollection(
        token,
        newCollection
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
  const handleArticleTypeFilter = (event) => {
    const { value, checked } = event.target;
    const updatedArticleTypes = checked
      ? [...filters?.articleType, value]
      : filters?.articleType.filter((type) => type !== value);

    setFilters((prevFilters) => ({
      ...prevFilters,
      articleType: updatedArticleTypes,
    }));
    if (!checked) {
      setShowFilters((prevState) => !prevState);
    }
    fetchFilteredResults({
      sourceTypes: filters.sourceType,
      dateRange: selectedDateRange,
      startDate: customStartDate,
      endDate: customEndDate,
      articleTypes: updatedArticleTypes,
      textAvailability: filters.textAvailability,
    });
  };

  const handleDateFilter = (selectedRange, start = "", end = "") => {
    setSelectedDateRange(selectedRange);
    fetchFilteredResults({
      sourceTypes: filters.sourceType,
      dateRange: selectedRange,
      startDate: selectedRange === "custom" ? start : "",
      endDate: selectedRange === "custom" ? end : "",
    });
  };

  const fetchFilteredResults = ({
    sourceTypes = [],
    dateRange,
    startDate,
    endDate,
    articleTypes = [],
  }) => {
    // Check if all filters are empty
    if (sourceTypes.length === 0 && articleTypes.length === 0 && !dateRange) {
      navigate("/search", { state: { data: searchResults, searchTerm } });
      return;
    }

    // Base URL for the API
    let apiUrl = `https://inferai.ai/api/core_search/?term=${encodeURIComponent(
      searchTerm
    )}`;

    // Add sources if provided
    if (sourceTypes.length > 0) {
      const sourceParams = sourceTypes
        .map((source) => `source=${encodeURIComponent(source)}`)
        .join("&");
      apiUrl += `&${sourceParams}`;
    }

    // Add article types if provided
    if (articleTypes.length > 0) {
      const articleTypeParams = articleTypes
        .map((type) => `article_type=${encodeURIComponent(type)}`)
        .join("&");
      apiUrl += `&${articleTypeParams}`;
    }

    // Add date filters if provided
    if (dateRange) {
      if (dateRange === "custom" && startDate && endDate) {
        apiUrl += `&date_filter=custom&from_date=${formatDate(
          startDate
        )}&to_date=${formatDate(endDate)}`;
      } else if (dateRange === "1" || dateRange === "5") {
        const filterType = dateRange === "5" ? "5 years" : "1 year";
        apiUrl += `&date_filter=${filterType}`;
      }
    }

    setLoading(true);

    axios
      .get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setResults(response.data);
        setLoading(false);

        // Save the filter state to localStorage for persistence
        localStorage.setItem(
          "filters",
          JSON.stringify({
            sourceTypes,
            dateRange,
            customStartDate: dateRange === "custom" ? startDate : "",
            customEndDate: dateRange === "custom" ? endDate : "",
            articleTypes,
          })
        );
        setShowFilters(!showFilters);
        navigate("/search", { state: { data: response.data, searchTerm } });
      })
      .catch((error) => {
        console.error("Error fetching data from the API", error);
        setLoading(false);
        navigate("/search", { state: { data: [], searchTerm } });
      });
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`; // Format for the API
  };

  const handleSourceTypeChange = (event) => {
    const { value, checked } = event.target;
    const updatedSourceTypes = checked
      ? [...filters.sourceType, value]
      : filters.sourceType.filter((type) => type !== value);

    setFilters((prevFilters) => ({
      ...prevFilters,
      sourceType: updatedSourceTypes,
    }));
    fetchFilteredResults({
      sourceTypes: updatedSourceTypes,
      dateRange: selectedDateRange,
      startDate: customStartDate,
      endDate: customEndDate,
    });
  };
  useEffect(() => {
    const storedData = sessionStorage.getItem("AnnotateData");

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setAnnotateData(parsedData);
      } catch (error) {
        console.error(
          "Failed to parse AnnotateData from sessionStorage",
          error
        );
        setAnnotateData([]);
      }
    } else {
      setAnnotateData([]);
    }
    setOpenAnnotate(false);
  }, []);

  const searchResults = useSelector((state) => state.search.searchResults);
  useEffect(() => {
    if (searchResults) {
      const pmidList = searchResults.articles.map((article) => {
        if (article.source === "BioRxiv") {
          return `BioRxiv_${article.bioRxiv_id}`;
        } else if (article.source === "Public Library of Science (PLOS)") {
          return `Public Library of Science (PLOS)_${article.plos_id}`;
        } else {
          return `PubMed_${article.pmid}`;
        }
      });
      sessionStorage.setItem("completePMID", JSON.stringify(pmidList));
      setCompletePMID(pmidList);
    } else {
      const storedData = sessionStorage.getItem("completePMID");

      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setCompletePMID(parsedData);
      }
    }
  }, [searchResults]);

  useEffect(() => {
    // Clear session storage for chatHistory when the location changes
    localStorage.removeItem("chatHistory");
  }, [location]);
  const capitalizeFirstLetter = (text) => {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
  };
  const italicizeTerm = (text) => {
    if (!text) return "";
    if (!searchTerm) return String(text);
    const escapeRegex = (term) =>
      term.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

    const sanitizedSearchTerm = escapeRegex(searchTerm);

    if (!sanitizedSearchTerm.trim()) return String(text); // Return original text if searchTerm is invalid after escaping

    const textString = String(text);
    const regex = new RegExp(`(${sanitizedSearchTerm})`, "gi");

    return textString.split(regex).map((part, index) =>
      part.toLowerCase() === sanitizedSearchTerm.toLowerCase() ? (
        <b key={index} className="bold" style={{}}>
          <i>{part}</i>
        </b>
      ) : (
        part
      )
    );
  };

  const handleResetAll = () => {
    // Clear the filters from state
    setFilters({ articleType: [], sourceType: [] });
    setAnnotateData([]);
    setBioRxivArticles([]);
    setPlosArticles([]);
    setSelectedArticles([]);
    setShareableLinks({});
    setOpenAnnotate(false);
    setSelectedSort("best_match");
    setSelectedDateRange("");
    setCustomStartDate("");
    setCustomEndDate("");
    localStorage.removeItem("filters");
    localStorage.removeItem("publicationDate");
    setShowFilters(!showFilters);
    navigate("/search", { state: { data: searchResults, searchTerm } });
  };
  const getIdType = (article) => {
    return article.source === "BioRxiv"
      ? article.bioRxiv_id
      : article.source === "Public Library of Science (PLOS)"
      ? article.plos_id
      : article.pmid;
  };
  const handleNavigate = (article) => {
    const idType = getIdType(article); // Determine whether it's pmid or bioRxiv_id
    const type =
      article.source === "BioRxiv"
        ? "bioRxiv_id"
        : article.source === "Public Library of Science (PLOS)"
        ? "plos_id"
        : "pmid"; // Pass the type explicitly
    navigate(`/article/content/${type}:${idType}`, {
      state: { data: data, searchTerm, annotateData: annotateData },
    });
  };

  const handlePageInputSubmit = () => {
    const pageNumber = parseInt(pageInput, 10);
    if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= totalPages) {
      handlePageChange(pageNumber); // Only update the page if the input is valid
    } else {
      setPageInput(currentPage); // Reset input to current page if invalid
    }
  };

  useEffect(() => {
    if (loading) {
      document.body.style.overflow = "hidden"; // Prevent scrolling
    } else {
      document.body.style.overflow = "auto"; // Enable scrolling
    }

    return () => {
      document.body.style.overflow = "auto"; // Cleanup on unmount
    };
  }, [loading]);
  // Calculate total pages
  //const totalPages = Math.ceil(data.articles.length / ITEMS_PER_PAGE);
  const totalPages =
    data && data.articles
      ? Math.ceil(data.articles.length / ITEMS_PER_PAGE)
      : 0;

  const handleCheckboxChange = (pmid) => {
    setSelectedArticles(
      (prevSelected) =>
        prevSelected.includes(pmid)
          ? prevSelected.filter((id) => id !== pmid) // Remove unchecked article
          : [...prevSelected, pmid] // Add checked article
    );
  };

  const handleBioRxivBoxChange = (pmid) => {
    setBioRxivArticles(
      (prevBioRxiv) =>
        prevBioRxiv.includes(pmid)
          ? prevBioRxiv.filter((id) => id !== pmid) // Remove unchecked article from BioRxiv
          : [...prevBioRxiv, pmid] // Add checked article to BioRxiv
    );
  };
  const handlePlosBoxChange = (pmid) => {
    setPlosArticles(
      (prevPlos) =>
        prevPlos.includes(pmid)
          ? prevPlos.filter((id) => id !== pmid) // Remove unchecked article from PLOS
          : [...prevPlos, pmid] // Add checked article to PLOS
    );
  };
  const handleSourceCheckboxChange = (source, idType, doi) => {
    const sourceType = source; // Set to "PubMed" if source is null or undefined
    const uniqueId = `${sourceType}_${idType}`;
    let shareableLink;
    if (sourceType === "pubmed") {
      shareableLink = `https://pubmed.ncbi.nlm.nih.gov/${idType}`;
    } else if (sourceType === "Public Library of Science (PLOS)") {
      shareableLink = `https://journals.plos.org/plosone/article?id=${doi}`;
    } else if (sourceType === "BioRxiv") {
      shareableLink = `https://www.biorxiv.org/content/${doi}`;
    }

    // Toggle link in shareableLinks state
    setShareableLinks((prevLinks) => {
      if (prevLinks[uniqueId]) {
        // Remove the link if it already exists
        const updatedLinks = { ...prevLinks };
        delete updatedLinks[uniqueId];
        return updatedLinks;
      } else {
        // Add the link if it doesn't exist
        return {
          ...prevLinks,
          [uniqueId]: shareableLink,
        };
      }
    });

    // Call appropriate checkbox handler based on source type
    if (sourceType === "pubmed") {
      handleCheckboxChange(uniqueId);
    } else if (sourceType === "Public Library of Science (PLOS)") {
      handlePlosBoxChange(uniqueId);
    } else if (sourceType === "BioRxiv") {
      handleBioRxivBoxChange(uniqueId);
    }
  };

  const isArticleSelected = (source, idType) => {
    const uniqueId = `${source}_${idType}`; // Create unique ID for checking selection state
    if (source === "BioRxiv") {
      return bioRxivArticles.includes(uniqueId);
    } else if (source === "Public Library of Science (PLOS)") {
      return plosArticles.includes(uniqueId);
    } else if (source === "pubmed") {
      return selectedArticles.includes(uniqueId); // For other sources
    }
  };
  const handleShare = async () => {
    try {
      // Fetch notes dynamically when the Share button is clicked
      if (user_id && token) {
        await fetchNotes();
      }

      // Open the email modal after fetching notes
      setIsEmailModalOpen(true);
    } catch (error) {
      console.error("Error handling share action:", error);
    }
  };
  const handleSendEmail = async () => {
    if (!email) {
      showErrorToast("Please enter an email address.");
      return;
    }

    const links = Object.values(shareableLinks).join(" "); // Get all the URLs as a single space-separated string

    const emailData = {
      email: email,
      subject: emailSubject,
      content: description,
      noteids: selectedNote,
      urls: [links],
    };
    try {
      //const response = await apiService.shareArticle(emailData, token);
      const response = await axios.post(
        // "https://inferai.ai/api/core_search/sharearticle",
        "https://inferai.ai/api/core_search/sharearticle",
        emailData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add Bearer token
            // "ngrok-skip-browser-warning": true,
          },
        }
      );
      if (response.status === 200) {
        showSuccessToast("Email sent successfully");
        setEmail("");
        setEmailSubject("");
        setDecription("");
        handleCloseEmailModal(); // Close modal after successful email send
      }
    } catch (error) {
      console.error("Error sending email:", error);
      showErrorToast("Failed to send email. Please try again.");
    }
  };
  const handleCloseEmailModal = () => {
    setIsEmailModalOpen(false);
    setEmail("");
    setEmailSubject("");
    setDecription("");
  };

  const handleAnnotateClick = async () => {
    if (totalArticles.length > 0) {
      sessionStorage.setItem("AnnotateData", "");
      sessionStorage.setItem("AnnotateSource", "");
      setAnnotateData([]);
      setAnnotateLoading(true);
      setLoading(true);

      const extractIdType = (uniqueId) => uniqueId.split("_")[1];
      const extractIdSource = (uniqueId) => uniqueId.split("_")[0];

      const annotatedArticles = totalArticles.map((id) => ({
        source: extractIdSource(id),
        idType: extractIdType(id),
      }));

      const pubmedIds = selectedArticles.map((id) =>
        parseInt(extractIdType(id), 10)
      );
      const biorxivIds = bioRxivArticles.map((id) =>
        parseInt(extractIdType(id), 10)
      );
      const plosIds = plosArticles.map((id) => parseInt(extractIdType(id), 10));

      try {
        const response = await axios.post(
          "https://inferai.ai/api/core_search/annotate",
          {
            pubmed: pubmedIds,
            biorxiv: biorxivIds,
            plos: plosIds,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data;
        sessionStorage.setItem("AnnotateData", JSON.stringify(data));
        sessionStorage.setItem(
          "AnnotateSource",
          JSON.stringify(annotatedArticles)
        );
        setAnnotateData(data);
        setAnnotateSource(annotatedArticles);
        setOpenAnnotate(true);
      } catch (error) {
        console.error("Error fetching data from the API", error);
      } finally {
        setAnnotateLoading(false);
        setLoading(false);
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevents default form submission
      handleSendEmail();
    }
  };
  const [containerHeight, setContainerHeight] = useState("auto");
  const containerRef = useRef(null);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const height = containerRef.current.offsetHeight;
        setContainerHeight(`${height}px`);
      }
    };

    // Update height on mount
    updateHeight();

    // Update height on window resize
    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);
  const [isTabletView, setIsTabletView] = useState(false);
const [isMobileView, setIsMobileView] = useState(false);

useEffect(() => {
  const handleResize = () => {
    const width = window.innerWidth;

    // Update mobile view state
    setIsMobileView(width < 600); // For screens smaller than 600px (mobile)

    // Update tablet view state
    setIsTabletView(width >= 600 && width < 769); // For screens between 600px and 768px (tablet)
  };

  // Set initial state
  handleResize();

  // Add event listener
  window.addEventListener("resize", handleResize);

  // Cleanup event listener
  return () => window.removeEventListener("resize", handleResize);
}, []);
console.log("tab view is",isTabletView)
console.log("mobile view is",isMobileView)

  const [showFilters, setShowFilters] = useState(false);

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  console.log("Tablet view enabled",isTabletView  )
  return (
    <div className="Container" ref={contentRightRef}>
      <SearchNavbar containerRef={containerRef} isTabletView={isTabletView} isMobileView={isMobileView}/>
      {isTabletView&&
      <>
        <div className="SearchOptions-ViewChange">
          <div className="SearchResult-Count-Filters-ViewChange">
              <div className="filters-container-ViewChange">
      {/* Button to toggle filters */}
      <button className="toggle-filters-button-ViewChange" onClick={toggleFilters}>
        <img src={filtersIcon}></img>
      </button>

      {/* Filters section */}
      {showFilters && (
        <div className={`search-filters-container-ViewChange ${isTabletView && "tabletview"} ${ isMobileView && "mobileview"}`}>
                    {/* <div className="filters-header-ViewChange">
            <h3>Filters</h3>
            
          </div> */}

          <div className="filters-content-ViewChange">
            

            {/* Article Type Section */}
            <div className="filter-group-ViewChange">
              <h4>Article type</h4>
              <label>
                <input
                  type="checkbox"
                  value="Books & Documents"
                  checked={filters.articleType?.includes("Books & Documents")}
                  onChange={handleArticleTypeFilter}
                />{" "}
                Books & Documents
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Clinical Trials"
                  checked={filters.articleType?.includes("Clinical Trials")}
                  onChange={handleArticleTypeFilter}
                />{" "}
                Clinical Trials
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Meta Analysis"
                  checked={filters.articleType?.includes("Meta Analysis")}
                  onChange={handleArticleTypeFilter}
                />{" "}
                Meta Analysis
              </label>
            </div>

            {/* Publication Date Section */}
            <div className="filter-group-ViewChange">
              <h4>Publication date</h4>
              <label>
                <input
                  type="radio"
                  name="publicationDate"
                  value="1"
                  checked={selectedDateRange === "1"}
                  onChange={() => handleDateFilter("1")}
                />{" "}
                1 year
              </label>
              <label>
                <input
                  type="radio"
                  name="publicationDate"
                  value="5"
                  checked={selectedDateRange === "5"}
                  onChange={() => handleDateFilter("5")}
                />{" "}
                5 years
              </label>
              <label>
                <input
                  type="radio"
                  name="publicationDate"
                  value="custom"
                  checked={selectedDateRange === "custom"}
                  onChange={() => setSelectedDateRange("custom")}
                />{" "}
                Custom range
              </label>

              {selectedDateRange === "custom" && (
                <div className="custom-date-range-ViewChange">
                  <label>
                    Start Date:
                    <input
                      type="date"
                      name="startDate"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                  </label>
                  <label>
                    End Date:
                    <input
                      type="date"
                      name="endDate"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </label>
                  <button
                    className="apply-button-ViewChange"
                    onClick={() =>
                      handleDateFilter("custom", customStartDate, customEndDate)
                    }
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Text Availability Section */}
            <div className="filter-group-ViewChange">
              <h4>Text availability</h4>
              <label>
                <input
                  type="checkbox"
                  value="Abstract"
                  checked={filters.textAvailability?.includes("Abstract")}
                  // onChange={handleTextAvailabilityChange}
                />{" "}
                Abstract
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Free full text"
                  checked={filters.textAvailability?.includes("Free full text")}
                  // onChange={handleTextAvailabilityChange}
                />{" "}
                Free full text
              </label>
              <label>
                <input
                  type="checkbox"
                  value="Full Text"
                  checked={filters.textAvailability?.includes("Full Text")}
                  // onChange={handleTextAvailabilityChange}
                />{" "}
                Full Text
              </label>
            </div>
          </div>
          <div className="resetbutton-Filters" style={{display:"flex",justifyContent:"flex-end"}}>
            <button className="reset-button-ViewChange" onClick={handleResetAll}>
              Reset all
            </button>
          </div>
        </div>
      )}
              </div>
              <div className="SearchResult-Option-Buttons">
                  <div
                    className="SearchResult-Option-Left"
                    style={{
                      cursor:
                        isLoggedIn && selectedArticles.length > 0
                          ? "pointer"
                          : "not-allowed",
                      opacity: isLoggedIn
                        ? selectedArticles.length > 0
                          ? 1
                          : 1
                        : 0.5, // Grayed out if not logged in1
                    }}
                    title={
                      isLoggedIn
                        ? selectedArticles.length === 0
                          ? "Select an article to share"
                          : "Share selected articles"
                        : displayMessage
                    }
                  >
                    <button
                      onClick={
                        isLoggedIn && Object.keys(shareableLinks).length > 0
                          ? handleShare
                          : null
                      }
                      disabled={
                        !isLoggedIn || Object.keys(shareableLinks).length === 0
                      }
                      className={`SearchResult-Share ${
                        isLoggedIn && Object.keys(shareableLinks).length > 0
                          ? "active"
                          : "disabled"
                      }`}
                      title={
                        isLoggedIn
                          ? Object.keys(shareableLinks).length === 0
                            ? "Select an article to share"
                            : "Share selected articles"
                          : displayMessage
                      }
                    >
                      {/* <img src={shareIcon}/> */}
                      Share
                    </button>
                    {/* {!isLoggedIn && (
    <p style={{ color: "gray", fontSize: "0.9rem", marginTop: "5px" }}>
      {displayMessage}
    </p>
  )} */}
                  </div>
              </div>
              
          </div>
          <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "baseline",
                  }}
                >
                  <div
                    className="SearchResult-count"
                    style={{ marginRight: "15px" }}
                  >
                    <span style={{ color: "blue" }}>
                      {data.articles.length}
                    </span>{" "}
                    results
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "baseline",
                      gap: "5px",
                    }}
                  >
                    <span style={{ color: "black", fontSize: "14px" }}>
                      Sort by:
                    </span>
                    <div className="SearchResult-dropdown-container">
                      <select
                        className="SearchResult-dropdown"
                        onChange={handleSortChange}
                        value={selectedSort}
                      >
                        <option value="best_match">Most Relevant</option>
                        <option value="publication_date">
                          Publication Date
                        </option>
                        <option value="Ratings">Rating</option>
                      </select>
                    </div>
                  </div>
          </div>   
          <div className="search-icons-group">
              <>
                <div
                  className={`search-annotate-icon ${
                    openAnnotate ? "open" : "closed"
                  }${
                    isLoggedIn &&
                    (!annotateData || Object.keys(annotateData).length === 0)
                      ? "disabled"
                      : ""
                  } 
                   
                  `}
                  onClick={() => {
                    if (!isLoggedIn) {
                      return; // Prevent action if not logged in
                    }
                    setHandleAnnotateCall(true);
                    if (annotateData && Object.keys(annotateData).length > 0) {
                      handleAnnotate();
                    } else if (totalArticles.length > 0) {
                      handleAnnotateClick();
                    }
                  }}
                  title={isLoggedIn ? "" : displayMessage}
                  style={{
                    cursor: isLoggedIn
                      ? annotateData && Object.keys(annotateData).length > 0
                        ? "pointer"
                        : totalArticles.length > 0
                        ? "pointer"
                        : "default"
                      : "not-allowed", // Disable interaction if not logged in
                    opacity: isLoggedIn
                      ? annotateData && Object.keys(annotateData).length > 0
                        ? 1
                        : totalArticles.length > 0
                        ? 1
                        : 0.5
                      : 0.5, // Grayed out if not logged in
                  }}
                >
                  <img src={annotate} alt="annotate-icon" />
                </div>
              </>
          </div>
        </div>
      </>}
      {isMobileView&&
      <>
        <div className="SearchOptions-ViewChange">
          <div className="SearchResult-Count-Filters-ViewChange" style={{width:"100%",justifyContent:"space-around"}}>
              <div className="filters-container-ViewChange">
                  <button className="toggle-filters-button-ViewChange" onClick={toggleFilters}>
                    <img src={filtersIcon}></img>
                  </button>
                  {showFilters && (
                    <div className="search-filters-container-ViewChange ">
                      {/* <div className="filters-header-ViewChange">
                        <h3>Filters</h3>
                        
                      </div> */}

                      <div className="filters-content-ViewChange">
                        

                        {/* Article Type Section */}
                        <div className="filter-group-ViewChange">
                          <h4>Article type</h4>
                          <label>
                            <input
                              type="checkbox"
                              value="Books & Documents"
                              checked={filters.articleType?.includes("Books & Documents")}
                              onChange={handleArticleTypeFilter}
                            />{" "}
                            Books & Documents
                          </label>
                          <label>
                            <input
                              type="checkbox"
                              value="Clinical Trials"
                              checked={filters.articleType?.includes("Clinical Trials")}
                              onChange={handleArticleTypeFilter}
                            />{" "}
                            Clinical Trials
                          </label>
                          <label>
                            <input
                              type="checkbox"
                              value="Meta Analysis"
                              checked={filters.articleType?.includes("Meta Analysis")}
                              onChange={handleArticleTypeFilter}
                            />{" "}
                            Meta Analysis
                          </label>
                        </div>

                        {/* Publication Date Section */}
                        <div className="filter-group-ViewChange">
                          <h4>Publication date</h4>
                          <label>
                            <input
                              type="radio"
                              name="publicationDate"
                              value="1"
                              checked={selectedDateRange === "1"}
                              onChange={() => handleDateFilter("1")}
                            />{" "}
                            1 year
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="publicationDate"
                              value="5"
                              checked={selectedDateRange === "5"}
                              onChange={() => handleDateFilter("5")}
                            />{" "}
                            5 years
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="publicationDate"
                              value="custom"
                              checked={selectedDateRange === "custom"}
                              onChange={() => setSelectedDateRange("custom")}
                            />{" "}
                            Custom range
                          </label>

                          {selectedDateRange === "custom" && (
                            <div className="custom-date-range-ViewChange">
                              <label>
                                Start Date:
                                <input
                                  type="date"
                                  name="startDate"
                                  value={customStartDate}
                                  onChange={(e) => setCustomStartDate(e.target.value)}
                                />
                              </label>
                              <label>
                                End Date:
                                <input
                                  type="date"
                                  name="endDate"
                                  value={customEndDate}
                                  onChange={(e) => setCustomEndDate(e.target.value)}
                                />
                              </label>
                              <button
                                className="apply-button-ViewChange"
                                onClick={() =>
                                  handleDateFilter("custom", customStartDate, customEndDate)
                                }
                              >
                                Apply
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Text Availability Section */}
                        <div className="filter-group-ViewChange">
                          <h4>Text availability</h4>
                          <label>
                            <input
                              type="checkbox"
                              value="Abstract"
                              checked={filters.textAvailability?.includes("Abstract")}
                              // onChange={handleTextAvailabilityChange}
                            />{" "}
                            Abstract
                          </label>
                          <label>
                            <input
                              type="checkbox"
                              value="Free full text"
                              checked={filters.textAvailability?.includes("Free full text")}
                              // onChange={handleTextAvailabilityChange}
                            />{" "}
                            Free full text
                          </label>
                          <label>
                            <input
                              type="checkbox"
                              value="Full Text"
                              checked={filters.textAvailability?.includes("Full Text")}
                              // onChange={handleTextAvailabilityChange}
                            />{" "}
                            Full Text
                          </label>
                        </div>
                      </div>
                      <div style={{display:"flex",justifyContent:"flex-end"}}>
                        <button className="reset-button-ViewChange" onClick={handleResetAll}>
                          Reset all
                        </button>
                      </div>
                    </div>
                  )}
              </div>
              <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "baseline",
                  }}
                >
                  <div
                    className="SearchResult-count"
                    style={{ marginRight: "15px" }}
                  >
                    <span style={{ color: "blue" }}>
                      {data.articles.length}
                    </span>{" "}
                    results
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "baseline",
                      gap: "5px",
                    }}
                  >
                    <span style={{ color: "black", fontSize: "14px" }}>
                      Sort by:
                    </span>
                    <div className="SearchResult-dropdown-container">
                      <select
                        className="SearchResult-dropdown"
                        onChange={handleSortChange}
                        value={selectedSort}
                      >
                        <option value="best_match">Most Relevant</option>
                        <option value="publication_date">
                          Publication Date
                        </option>
                        <option value="Ratings">Rating</option>
                      </select>
                    </div>
                  </div>
          </div>  
          </div>
        </div>
      </>}
      <div id="Search-Content-Container" style={{width:(isTabletView||isMobileView)?"95%":"",justifyContent:isTabletView?openAnnotate?"space-between":"":"" }}>
      {!isTabletView && !isMobileView && (
                <div className="searchContent-left" style={{ top: containerHeight }}>
          <div className="searchContent-left-header">
            <p className="title">Filters</p>
            <p className="Filters-ResetAll" onClick={handleResetAll}>
              Reset All
            </p>
          </div>

          <div className="searchfilter-options">
            {/* Article type section */}
            <div className="searchfilter-section">
              <h5 onClick={() => setShowArticleType(!showArticleType)}>
                Article type{" "}
                {showArticleType ? (
                  <img src={downarrow} alt="down-arrow" />
                ) : (
                  <img src={uparrow} alt="up-arrow" />
                )}
              </h5>
              {showArticleType && (
                <div className="searchfilter-options-dropdown">
                  <label>
                    <input
                      type="checkbox"
                      value="Books and Documents"
                      checked={filters.articleType?.includes(
                        "Books and Documents"
                      )}
                      onChange={handleArticleTypeFilter}
                    />{" "}
                    Books & Documents
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      value="Clinical Trials"
                      checked={filters.articleType?.includes("Clinical Trials")}
                      onChange={handleArticleTypeFilter} //FiltersComments
                    />{" "}
                    Clinical Trials
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      value="Meta Analysis"
                      checked={filters.articleType?.includes("Meta Analysis")}
                      onChange={handleArticleTypeFilter} //FiltersComments
                    />{" "}
                    Meta Analysis
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      value="Review"
                      checked={filters.articleType?.includes("Review")}
                      onChange={handleArticleTypeFilter} //FiltersComments
                    />{" "}
                    Review
                  </label>
                </div>
              )}
            </div>

            {/* Source type section */}
            <div className="searchfilter-section">
              <h5 onClick={() => setShowSourceType(!showSourceType)}>
                Source Type{" "}
                {showSourceType ? (
                  <img src={downarrow} alt="down-arrow" />
                ) : (
                  <img src={uparrow} alt="up-arrow" />
                )}
              </h5>

              {showSourceType && (
                <div className="searchfilter-options-dropdown">
                  <label>
                    <input
                      type="checkbox"
                      value="BioRxiv"
                      checked={filters.sourceType?.includes("BioRxiv")}
                      onChange={handleSourceTypeChange}
                    />{" "}
                    BioRxiv
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      value="Public Library of Science (PLOS)"
                      checked={filters.sourceType?.includes(
                        "Public Library of Science (PLOS)"
                      )}
                      onChange={handleSourceTypeChange}
                    />{" "}
                    PLOS
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      value="pubmed"
                      checked={filters.sourceType?.includes("pubmed")}
                      onChange={handleSourceTypeChange}
                    />{" "}
                    PubMed
                  </label>
                </div>
              )}

              <div className="searchfilter-section">
                <h5
                  onClick={() => setShowPublicationDate(!showPublicationDate)}
                >
                  Publication date{" "}
                  <span>
                    {showPublicationDate ? (
                      <img src={downarrow} alt="down-arrow" />
                    ) : (
                      <img src={uparrow} alt="up-arrow" />
                    )}
                  </span>
                </h5>
                {showPublicationDate && (
                  <div className="searchfilter-options-dropdown">
                    <label>
                      <input
                        type="radio"
                        name="date"
                        value="1"
                        checked={selectedDateRange === "1"}
                        onChange={() => handleDateFilter("1")}
                      />{" "}
                      1 year
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="date"
                        value="5"
                        checked={selectedDateRange === "5"}
                        onChange={() => handleDateFilter("5")}
                      />{" "}
                      5 years
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="date"
                        value="custom"
                        checked={selectedDateRange === "custom"}
                        onChange={() => setSelectedDateRange("custom")}
                      />{" "}
                      Custom range
                    </label>

                    {selectedDateRange === "custom" && (
                      <div className="custom-date-range custom-date-input">
                        <label>
                          Start Date:
                          <input
                            type="date"
                            name="startDate"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                          />
                        </label>
                        <label>
                          End Date:
                          <input
                            type="date"
                            name="endDate"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                          />
                        </label>
                        <button
                          className="ApplyFilters"
                          onClick={() =>
                            handleDateFilter(
                              "custom",
                              customStartDate,
                              customEndDate
                            )
                          }
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
)}
        {loading ? <Loading /> : ""}

        <div className="searchContent-right"style={{width: (isTabletView)
    ? openAnnotate
      ? "50%"
      : "100%"
    : "100%",margin:isTabletView&&"0"}} >
          {data.articles && data.articles.length > 0 ? (
            <>
            {!isTabletView && !isMobileView && (<>
            <div className="SearchResult-Count-Filters">
                <div className="SearchResult-Option-Buttons">
                  <div
                    className="SearchResult-Option-Left"
                    style={{
                      cursor:
                        isLoggedIn && selectedArticles.length > 0
                          ? "pointer"
                          : "not-allowed",
                      opacity: isLoggedIn
                        ? selectedArticles.length > 0
                          ? 1
                          : 1
                        : 0.5, // Grayed out if not logged in1
                    }}
                    title={
                      isLoggedIn
                        ? selectedArticles.length === 0
                          ? "Select an article to share"
                          : "Share selected articles"
                        : displayMessage
                    }
                  >
                    <button
                      onClick={
                        isLoggedIn && Object.keys(shareableLinks).length > 0
                          ? handleShare
                          : null
                      }
                      disabled={
                        !isLoggedIn || Object.keys(shareableLinks).length === 0
                      }
                      className={`SearchResult-Share ${
                        isLoggedIn && Object.keys(shareableLinks).length > 0
                          ? "active"
                          : "disabled"
                      }`}
                      title={
                        isLoggedIn
                          ? Object.keys(shareableLinks).length === 0
                            ? "Select an article to share"
                            : "Share selected articles"
                          : displayMessage
                      }
                    >
                      Share
                    </button>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "baseline",
                  }}
                >
                  <div
                    className="SearchResult-count"
                    style={{ marginRight: "15px" }}
                  >
                    <span style={{ color: "blue" }}>
                      {data.articles.length}
                    </span>{" "}
                    results
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "baseline",
                      gap: "5px",
                    }}
                  >
                    <span style={{ color: "black", fontSize: "14px" }}>
                      Sort by:
                    </span>
                    <div className="SearchResult-dropdown-container">
                      <select
                        className="SearchResult-dropdown"
                        onChange={handleSortChange}
                        value={selectedSort}
                      >
                        <option value="best_match">Most Relevant</option>
                        <option value="publication_date">
                          Publication Date
                        </option>
                        <option value="Ratings">Rating</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pagination">
                <div className="pagination-controls">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    {"<<"} {/* First page button */}
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    {"<"} {/* Previous page button */}
                  </button>
                  <button
                    style={{
                      background: "none",
                      border: "1px solid",
                      padding: "0",
                    }}
                  >
                    <input
                      type="text"
                      value={
                        pageInput === "" || pageInput === "0"
                          ? pageInput
                          : String(pageInput).padStart(2, "0")
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          setPageInput(value); // Update only if it's a valid number or empty
                        }
                      }}
                      onBlur={handlePageInputSubmit} // Validate when input loses focus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handlePageInputSubmit(); // Validate when pressing Enter
                      }}
                      style={{
                        width: "35px",
                        textAlign: "center",
                        border: "none",
                        padding: "6px",
                        outline: "none",
                      }}
                    />
                  </button>

                  <span> / {totalPages}</span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    {">"} {/* Next page button */}
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    {">>"} {/* Last page button */}
                  </button>
                </div>
              </div>
              </>
              )}

              <div className="searchContent-articles">
                <div className="searchresults-list">
                  {paginatedArticles.map((result, index) => {
                    let similarityScore = result.similarity_score;

                    if (!similarityScore && searchResults) {
                      const articles = searchResults.articles;

                      // Find the article with the matching pmid in Redux store and get similarity score
                      const matchingArticle = articles.find(
                        (article) => article.pmid === result.pmid
                      );

                      if (matchingArticle) {
                        similarityScore =
                          matchingArticle.similarity_score || "N/A"; // Get similarity_score or fallback to 'N/A'
                      }
                    }

                    const idType = getIdType(result);
                    // Safely handle abstract_content based on its type
                    let abstractContent = "";
                    if (result.abstract_content) {
                      if (Array.isArray(result.abstract_content)) {
                        // If abstract_content is an array, join its elements (assuming they are strings)
                        abstractContent = result.abstract_content.join(" ");
                      } else if (typeof result.abstract_content === "string") {
                        // If it's already a string, use it directly
                        abstractContent = result.abstract_content;
                      } else if (typeof result.abstract_content === "object") {
                        // If it's an object, access specific keys or values
                        abstractContent = Object.values(
                          result.abstract_content
                        ).join(" ");
                      }
                    } else {
                      abstractContent = "No abstract available";
                    }

                    return (
                      <div key={index} className="searchresult-item">
                        <div
                          className="searchresult-item-header"
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            maxHeight: "85%",
                            overflow: "hiddden",
                          }}
                        >
                          <div className="div1">
                            <div
                              className="searchresult-title-container"
                              style={{ marginLeft: !isLoggedIn ? "17px" : "" }}
                            >
                              <div className="searchresult-ArticleTitle">
                                <input
                                  type="checkbox"
                                  className="result-checkbox"
                                  style={{
                                    display: displayIfLoggedIn,
                                    height: "14px",
                                    width: "14px",
                                    marginTop: "5px",
                                    marginLeft: 0,
                                  }}
                                  onChange={() =>
                                    handleSourceCheckboxChange(
                                      result.source,
                                      idType,
                                      result.doi
                                    )
                                  }
                                  checked={isArticleSelected(
                                    result.source,
                                    idType
                                  )} // Sync checkbox state
                                />
                                <h3 className="searchresult-title">
                                  <span
                                    className="gradient-text"
                                    onClick={() => handleNavigate(result)}
                                    style={{ cursor: "pointer" }}
                                  >
                                    {italicizeTerm(
                                      capitalizeFirstLetter(
                                        openAnnotate
                                          ? result.article_title.slice(0, 100) +
                                              (result.article_title.length > 100
                                                ? "..."
                                                : "")
                                          : result.article_title
                                      )
                                    )}
                                  </span>
                                </h3>
                              </div>
                              <FontAwesomeIcon
                                icon={
                                  isArticleBookmarked(idType).isBookmarked
                                    ? solidBookmark
                                    : regularBookmark
                                }
                                size="l"
                                style={{
                                  color: isArticleBookmarked(idType)
                                    .isBookmarked
                                    ? "#1B365D"
                                    : "black",
                                  cursor: isLoggedIn
                                    ? "pointer"
                                    : "not-allowed",
                                  opacity: isLoggedIn ? 1 : 0.5,
                                }}
                                onClick={() =>
                                  isLoggedIn
                                    ? handleBookmarkClick(
                                        idType,
                                        result.article_title,
                                        result.source || "PubMed"
                                      )
                                    : ""
                                }
                                title={
                                  isLoggedIn
                                    ? isArticleBookmarked(idType).isBookmarked
                                      ? "Bookmarked"
                                      : "Bookmark this article"
                                    : displayMessage
                                }
                              />
                              {isModalOpen && (
                                <div
                                  className="search-bookmark-modal-overlay"
                                  // onClick={handleCloseCollectionModal}
                                >
                                  
                                  <div className="search-modal-content">
                                    <div style={{display:"flex",justifyContent:"space-between"}}>

                                    <p>ADD TO COLLECTION</p>
                                    <button
                                    id="close-collection-modal"
                                    onClick={handleCloseCollectionModal}
                                  >
                                    <IoCloseOutline size={20} />
                                  </button>
                                    </div>
                                    {/* Radio buttons for collection action */}
                                    <div className="radio-buttons">
                                      <div className="radio1">
                                        <input
                                          type="radio"
                                          id="collectionAction1"
                                          value="existing"
                                          checked={
                                            collectionAction === "existing"
                                          }
                                          onChange={() =>
                                            setCollectionAction("existing")
                                          }
                                        />
                                        <label htmlFor="collectionAction1">
                                          Add to Existing Collection
                                        </label>
                                      </div>
                                      <div className="radio2">
                                        <input
                                          type="radio"
                                          id="collectionAction2"
                                          value="new"
                                          checked={collectionAction === "new"}
                                          onChange={() =>
                                            setCollectionAction("new")
                                          }
                                        />
                                        <label htmlFor="collectionAction2">Create New Collection</label>
                                      </div>
                                    </div>

                                    {/* Logic for adding to existing collection */}
                                    {collectionAction === "existing" && (
                                      <div className="select-dropdown">
                                        <div className="choose-collection">
                                          <label htmlFor="">
                                            *Choose a collection
                                          </label>
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
                                              setSelectedCollection(
                                                e.target.value
                                              )
                                            }
                                          >
                                            <option
                                              value="favorites"
                                              disabled
                                              selected
                                            >
                                              Favorites
                                            </option>
                                            {Object.keys(collections).map(
                                              (collectionName, index) => (
                                                <option
                                                  key={index}
                                                  value={collectionName}
                                                >
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
                                              handleSaveToExisting(
                                                selectedCollection
                                              )
                                            }
                                            disabled={!selectedCollection}
                                          >
                                            Add
                                          </button>
                                          <button
                                            onClick={handleCloseCollectionModal}
                                          >
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
                                          onChange={(e) =>
                                            setNewCollectionName(e.target.value)
                                          }
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
                                          <button
                                            onClick={handleCloseCollectionModal}
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {isEmailModalOpen && (
                                <div
                                  className="email-modal-overlay"
                                  style={{
                                    background: "rgba(0, 0, 0, 0.1)",
                                  }}
                                  onClick={handleCloseEmailModal}
                                >
                                  <div
                                    className="email-modal-content"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      background: "rgba(255, 255, 255, 1)",
                                      width: "65%",
                                    }}
                                  >
                                    <div className="email-modal-header">
                                      <h3>Share with</h3>
                                      <div className="search-wrapper-notes">
                                        <img
                                          src={SearchIcon}
                                          alt="search"
                                          className="search-icon-notes"
                                          style={{ padding: "2px" }}
                                        />
                                        <input
                                          type="text"
                                          value={searchQuery}
                                          onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                          }
                                          placeholder="Search notes..."
                                          className="note-search-input"
                                          style={{
                                            width: "100%",
                                            padding: "10px 8px 8px 20px",
                                            border: "1px solid #ccc",
                                            borderRadius: "4px",
                                            fontSize: "14px",
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <div
                                      className="share-notes-modal"
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: "20px",
                                      }}
                                    >
                                      <div
                                        className="notes-radio"
                                        style={{
                                          // display: "grid",
                                          width: "50%",
                                          height: "40vh",
                                          overflow: "auto",
                                        }}
                                      >
                                        {filteredNotes?.length > 0 ? (
                                          filteredNotes.map((note) => (
                                            <div
                                              key={note.note_id}
                                              className="note-item-selection"
                                              style={{
                                                display: "flex",
                                                alignItems: "center",
                                              }}
                                            >
                                              <input
                                                type="checkbox"
                                                value={note.note_id}
                                                checked={
                                                  note.id &&
                                                  selectedNote.includes(note.id)
                                                }
                                                onChange={() => {
                                                  if (note.note_id) {
                                                    setSelectedNote(
                                                      (prevSelected) =>
                                                        prevSelected.includes(
                                                          note.note_id
                                                        )
                                                          ? prevSelected.filter(
                                                              (id) =>
                                                                id !==
                                                                note.note_id
                                                            )
                                                          : [
                                                              ...prevSelected,
                                                              note.note_id,
                                                            ]
                                                    );
                                                  } else {
                                                    console.warn(
                                                      "Note ID is undefined:",
                                                      note
                                                    );
                                                  }
                                                }}
                                              />
                                              <NoteItem
                                                note={note}
                                                onEdit={() => {}}
                                                onDelete={() => {}}
                                                isOpenNotes={false}
                                                minimalView={true}
                                                customStyles={{
                                                  height: "4vh",
                                                  width: "100%",
                                                }}
                                              />
                                            </div>
                                          ))
                                        ) : (
                                          <p>No notes available</p>
                                        )}
                                      </div>
                                      <div
                                        className="email-modal-body"
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          width: "50%",
                                        }}
                                      >
                                        <label
                                          htmlFor="email"
                                          aria-required="true"
                                          id="label-text"
                                        >
                                          Email ID
                                        </label>
                                        <input
                                          type="email"
                                          value={email}
                                          onChange={(e) =>
                                            setEmail(e.target.value)
                                          }
                                          required
                                          placeholder="Email ID"
                                          id="email-input"
                                          onKeyDown={handleKeyDown}
                                        />
                                        <label
                                          htmlFor="subject"
                                          aria-required="true"
                                          id="label-text"
                                        >
                                          Subject
                                        </label>
                                        <input
                                          type="text"
                                          value={emailSubject}
                                          onChange={(e) =>
                                            setEmailSubject(e.target.value)
                                          }
                                          required
                                          placeholder="Subject"
                                          id="email-input"
                                          onKeyDown={handleKeyDown}
                                        />
                                        <label
                                          htmlFor="subject"
                                          aria-required="true"
                                          id="label-text"
                                        >
                                          Description(optional)
                                        </label>
                                        <textarea
                                          type="text"
                                          value={description}
                                          onChange={(e) =>
                                            setDecription(e.target.value)
                                          }
                                          required
                                          placeholder="Enter Description"
                                          id="description-input"
                                          onKeyDown={handleKeyDown}
                                        />
                                      </div>
                                    </div>
                                    <div className="confirm-buttons">
                                      <button
                                        onClick={handleCloseEmailModal}
                                        style={{
                                          borderRadius: "30px",
                                          backgroundColor:
                                            "rgba(234, 234, 236, 1)",
                                          color: "rgba(78, 78, 86, 1)",
                                        }}
                                        className="cancel-button"
                                      >
                                        cancel
                                      </button>
                                      <button
                                        onClick={handleSendEmail}
                                        style={{
                                          borderRadius: "30px",
                                          width: "10%",
                                          // margin: "auto",
                                        }}
                                        className="send-button"
                                      >
                                        Send
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                            <p className="searchresult-authors">{`Published on: ${result.publication_date}`}</p>
                            <div className="searchresult-ID">
                              <p className="searchresult-pmid">{`ID: ${idType}`}</p>
                            </div>
                            <p
                              className="searchresult-description"
                              style={{ textAlign: "justify" }}
                            >
                              {result.source === "BioRxiv"
                                ? italicizeTerm(
                                    abstractContent.slice(
                                      0,
                                      openAnnotate || openNotes ? 100 : 400
                                    )
                                  )
                                : result.source ===
                                  "Public Library of Science (PLOS)"
                                ? result.abstract_content?.Abstract?.[1]
                                  ? italicizeTerm(
                                      Object.values(
                                        result.abstract_content.Abstract[1] ||
                                          result.abstract_content[0]
                                      )
                                        .join("")
                                        .slice(
                                          0,
                                          openAnnotate || openNotes ? 100 : 400
                                        )
                                    )
                                  : Object.keys(result.abstract_content || {})
                                      .length > 0
                                  ? italicizeTerm(
                                      Object.values(result.abstract_content)
                                        .map((section) =>
                                          Object.values(section).join(" ")
                                        )
                                        .join(" ")
                                        .slice(
                                          0,
                                          openAnnotate || openNotes ? 100 : 400
                                        )
                                    )
                                  : "No abstract available"
                                : result.abstract_content?.[1]
                                ? italicizeTerm(
                                    Object.values(result.abstract_content[1])
                                      .join(" ")
                                      .slice(
                                        0,
                                        openAnnotate || openNotes ? 100 : 400
                                      )
                                  )
                                : "No abstract available"}

                              {result.source === "BioRxiv"
                                ? abstractContent.length > 300
                                  ? "..."
                                  : ""
                                : result.source ===
                                  "Public Library of Science (PLOS)"
                                ? result.abstract_content?.Abstract?.[1]
                                  ? Object.values(
                                      result.abstract_content.Abstract[1] ||
                                        result.abstract_content[1]
                                    ).join("").length > 300
                                    ? "..."
                                    : ""
                                  : Object.keys(result.abstract_content || {})
                                      .length > 0
                                  ? Object.values(result.abstract_content)
                                      .map((section) =>
                                        Object.values(section).join(" ")
                                      )
                                      .join(" ").length > 300
                                    ? "..."
                                    : ""
                                  : ""
                                : result.abstract_content?.[1]
                                ? Object.values(
                                    result.abstract_content[1]
                                  ).join(" ").length > 300
                                  ? "..."
                                  : ""
                                : ""}
                            </p>
                          </div>
                        </div>
                        <div
                          className="Article-Options"
                          style={{ justifyContent: "space-between" }}
                        >
                          <div className="Article-Options-Left">
                            <p className="searchresult-similarity_score">
                              <span style={{ color: "#c05600" }}>
                                Relevancy Score:{" "}
                              </span>
                              {similarityScore
                                ? `${similarityScore.toFixed(2)} %`
                                : "N/A"}
                            </p>
                            <p className="searchresult-similarity_score">
                              <span style={{ color: "#c05600" }}>Source: </span>
                              {result.source ? result.source : "PubMed"}
                            </p>
                          </div>
                            <div class="searchResult-rate">
                              {[5, 4, 3, 2, 1].map((value) => (
                                <React.Fragment key={value}>
                                  <input
                                    type="radio"
                                    id={`star${value}-${idType}`}
                                    name={`rate_${idType}`}
                                    style={{ cursor: "default" }}
                                    value={value}
                                    checked={
                                      getRatingForArticle(
                                        idType,
                                        result.source ? result.source : "PubMed"
                                      ) === value
                                    }
                                    disabled // Disable the input as we don't want to modify it
                                  />
                                  <label
                                    htmlFor={`star${value}-${idType}`}
                                    title={`${value} star`}
                                  />
                                </React.Fragment>
                              ))}
                            </div>
                          
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pagination">
                <div className="pagination-controls">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    {"<<"}
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    {"<"}
                  </button>
                  <button
                    style={{
                      background: "none",
                      border: "1px solid",
                      padding: "0",
                    }}
                  >
                    <input
                      type="text"
                      value={
                        pageInput === "" || pageInput === "0"
                          ? pageInput
                          : String(pageInput).padStart(2, "0")
                      }
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          setPageInput(value);
                        }
                      }}
                      onBlur={handlePageInputSubmit}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handlePageInputSubmit();
                      }}
                      style={{
                        width: "35px",
                        textAlign: "center",
                        border: "none",
                        padding: "6px",
                        outline: "none",
                      }}
                    />
                  </button>

                  <span> / {totalPages}</span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    {">"}
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    {">>"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="data-not-found-container">
              <div className="data-not-found">
                <h2>Data Not Found</h2>
                <p>
                  We couldn't find any data matching your search. Please try
                  again with different keywords.
                </p>
              </div>
            </div>
          )}
        </div>

        
          {!isMobileView&&<div className="search-right-aside" style={{ width:isTabletView?openAnnotate?"46%":"":"" ,top: containerHeight, position:isTabletView?openAnnotate?"unset":"":"" }}>
            {openAnnotate && (  
              <div className="search-annotate" style={{width:isTabletView?"100%":"",margin:isTabletView?"0":""}}>
                <Annotation
                  openAnnotate={openAnnotate}
                  annotateData={annotateData}
                  source={annotateSource}
                  isTabletView={isTabletView}
                />
              </div>
            )}
            {!isTabletView&&!isMobileView&&(<div className="search-icons-group">
              <>
                <div
                  className={`search-annotate-icon ${
                    openAnnotate ? "open" : "closed"
                  }${
                    isLoggedIn &&
                    (!annotateData || Object.keys(annotateData).length === 0)
                      ? "disabled"
                      : ""
                  } 
                   
                  `}
                  onClick={() => {
                    if (!isLoggedIn) {
                      return; // Prevent action if not logged in
                    }
                    setHandleAnnotateCall(true);
                    if (annotateData && Object.keys(annotateData).length > 0) {
                      handleAnnotate();
                    } else if (totalArticles.length > 0) {
                      handleAnnotateClick();
                    }
                  }}
                  title={isLoggedIn ? "" : displayMessage}
                  style={{
                    cursor: isLoggedIn
                      ? annotateData && Object.keys(annotateData).length > 0
                        ? "pointer"
                        : totalArticles.length > 0
                        ? "pointer"
                        : "default"
                      : "not-allowed", // Disable interaction if not logged in
                    opacity: isLoggedIn
                      ? annotateData && Object.keys(annotateData).length > 0
                        ? 1
                        : totalArticles.length > 0
                        ? 1
                        : 0.5
                      : 0.5, // Grayed out if not logged in
                  }}
                >
                  <img src={annotate} alt="annotate-icon" />
                </div>
              </>
            </div>)}
          </div>}
        
      </div>

      <Footer />
      <div className="ScrollTop">
        <button onClick={scrollToTop} id="scrollTopBtn" title="Go to top">
          <FontAwesomeIcon icon={faAnglesUp} />
          Back To Top
        </button>
      </div>
      {isMobileView&&<div className="MobileView-Options"> 
        <div className="HomeIcon-MobileView" style={{width:"33.33%"}}>
          <img src={homeIcon}/>
          {/* Home */}
          </div>
        <div
                      className="SearchResult-Option-Left"
                      style={{
                        width:"33.33%",
                        cursor:
                          isLoggedIn && selectedArticles.length > 0
                            ? "pointer"
                            : "not-allowed",
                        opacity: isLoggedIn
                          ? selectedArticles.length > 0
                            ? 1
                            : 1
                          : 0.5, // Grayed out if not logged in1
                          
                      }}
                      title={
                        isLoggedIn
                          ? selectedArticles.length === 0
                            ? "Select an article to share"
                            : "Share selected articles"
                          : displayMessage
                      }
                    >
                      <button
                        onClick={
                          isLoggedIn && Object.keys(shareableLinks).length > 0
                            ? handleShare
                            : null
                        }
                        disabled={
                          !isLoggedIn || Object.keys(shareableLinks).length === 0
                        }
                        style={{border:"none"}}
                        className={`SearchResult-Share ${
                          isLoggedIn && Object.keys(shareableLinks).length > 0
                            ? "active"
                            : "disabled"
                        }`}
                        title={
                          isLoggedIn
                            ? Object.keys(shareableLinks).length === 0
                              ? "Select an article to share"
                              : "Share selected articles"
                            : displayMessage
                        }
                      >
                       <PiShareNetwork color="#007bff" size={23}/>

                        {/* Share */}
                      </button>
                      {/* {!isLoggedIn && (
      <p style={{ color: "gray", fontSize: "0.9rem", marginTop: "5px" }}>
        {displayMessage}
      </p>
    )} */}
        </div>
        <div className="search-icons-group" style={{width:"33.33%"}}>
              <>
                <div
                  className={`search-annotate-icon ${
                    openAnnotate ? "open" : "closed"
                  }${
                    isLoggedIn &&
                    (!annotateData || Object.keys(annotateData).length === 0)
                      ? "disabled"
                      : ""
                  } 
                   
                  `}
                  onClick={() => {
                    if (!isLoggedIn) {
                      return; // Prevent action if not logged in
                    }
                    setHandleAnnotateCall(true);
                    if (annotateData && Object.keys(annotateData).length > 0) {
                      handleAnnotate();
                    } else if (totalArticles.length > 0) {
                      handleAnnotateClick();
                    }
                  }}
                  title={isLoggedIn ? "" : displayMessage}
                  style={{
                    cursor: isLoggedIn
                      ? annotateData && Object.keys(annotateData).length > 0
                        ? "pointer"
                        : totalArticles.length > 0
                        ? "pointer"
                        : "default"
                      : "not-allowed", // Disable interaction if not logged in
                    opacity: isLoggedIn
                      ? annotateData && Object.keys(annotateData).length > 0
                        ? 1
                        : totalArticles.length > 0
                        ? 1
                        : 0.5
                      : 0.5, // Grayed out if not logged in
                      background:"none"
                  }}
                >
                  <img src={annotate} alt="annotate-icon" />
                </div>
              </>
          </div>
      </div>}
    </div>
  );
};

export default SearchResults;
