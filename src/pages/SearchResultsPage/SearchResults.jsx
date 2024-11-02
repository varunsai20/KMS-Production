import React, { useEffect, useRef, useState, useMemo } from "react";
import "./SearchResults.css";
import Footer from "../../components/Footer-New";
import SearchBar from "../../components/SearchBar";
import Loading from "../../components/Loading";
import { useDispatch, useSelector } from "react-redux";
import Annotation from "../../components/Annotaions";
import { useLocation, useNavigate } from "react-router-dom";
import annotate from "../../assets/images/task-square.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookmark as regularBookmark } from "@fortawesome/free-regular-svg-icons";
import { faAnglesUp } from "@fortawesome/free-solid-svg-icons";
import uparrow from "../../assets/images/uparrow.svg";
import { IoCloseOutline, IoShareSocial } from "react-icons/io5";
import downarrow from "../../assets/images/downarrow.svg";
import axios from "axios";
import { login, logout } from "../../redux/reducers/LoginAuth"; // Import login and logout actions
import Button from "../../components/Buttons";
import Logo from "../../assets/images/Logo_New.svg";
import ProfileIcon from "../../assets/images/Profile-dummy.svg";
import { toast } from "react-toastify";
const ITEMS_PER_PAGE = 10;
const SearchResults = ({ open, onClose, applyFilters, dateloading }) => {
  const location = useLocation(); // Access the passed state
  const { data } = location.state || { data: [] };
  const { user } = useSelector((state) => state.auth);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const displayIfLoggedIn = isLoggedIn ? null : "none";
  const dispatch = useDispatch();
  const user_id = user?.user_id;
  const token = useSelector((state) => state.auth.access_token);
  console.log(user);
  const searchTerm = sessionStorage.getItem("SearchTerm");
  const navigate = useNavigate();
  const contentRightRef = useRef(null); // Ref for searchContent-right
  const [result, setResults] = useState();
  const [loading, setLoading] = useState(false);

  const [selectedArticles, setSelectedArticles] = useState([]);
  const [bioRxivArticles, setBioRxivArticles] = useState([]);
  const [plosArticles, setPlosArticles] = useState([]);
  const totalArticles = useMemo(() => {
    return [...bioRxivArticles, ...plosArticles, ...selectedArticles];
  }, [bioRxivArticles, plosArticles, selectedArticles]);
  //const [showPopup, setShowPopup] = useState(false);
  //const [hoveredRow, setHoveredRow] = useState(null);
  const [shareableLinks, setShareableLinks] = useState({});
  //const [bookmarkedPmids, setBookmarkedPmids] = useState({});
  const [currentIdType, setCurrentIdType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const handleEmailClick = () => setIsEmailModalOpen(true);
  //const handleCloseEmailModal = () => setIsEmailModalOpen(false);
  const [email, setEmail] = useState();
  const [emailSubject, setEmailSubject] = useState();

  const [newCollectionName, setNewCollectionName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState(1); // Separate state for the page input
  const [selectedDateRange, setSelectedDateRange] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [completePMID, setCompletePMID] = useState([]);
  // const [ratingsList, setRatingsList] = useState(() => {
  //   // Get ratingsList from sessionStorage or initialize an empty array
  //   return JSON.parse(sessionStorage.getItem("ratingsList")) || [];
  // });
  const [ratingsList, setRatingsList] = useState([]);

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

    // Log when both `article_id` and `article_source` match

    // Find entries where only `article_id` matches
    const idOnlyMatch = ratingsArray.find(
      (item) =>
        item.article_id === String(id) &&
        item.article_source !== standardizedSource
    );

    // Log if only `article_id` matches but `article_source` does not
    if (idOnlyMatch) {
      console.log("ID-only Match Found:", idOnlyMatch);
    }

    // Return the saved rating or default to 3 if not found
    return savedRating ? savedRating.average_rating : 0;
  };

  // Use effect to fetch ratings only once on page load or reload
  useEffect(() => {
    const fetchRatedArticles = async () => {
      try {
        const response = await axios.get(
          "http://13.127.207.184:80/rating/rated-articles",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const ratedArticles = response.data || [];

        // Store ratings list in sessionStorage and state
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
  }, [location]); // Depend on `location` changes

  useEffect(() => {
    const storedDateInfo = localStorage.getItem("publicationDate");
    if (storedDateInfo) {
      const { selectedDateRange, customStartDate, customEndDate } =
        JSON.parse(storedDateInfo);

      if (selectedDateRange) {
        setSelectedDateRange(selectedDateRange);
      }
      if (selectedDateRange === "custom") {
        // Only set custom start/end dates if the range is custom
        setCustomStartDate(customStartDate || "");
        setCustomEndDate(customEndDate || "");
      }
    }
  }, []);

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
  const topPageRef = useRef(null);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [showTextAvailability, setShowTextAvailability] = useState(true);
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
      if (window.scrollY > 100) {
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
    return [...data.articles].sort((a, b) => {
      const ratingA = getRatingForArticle(a.bioRxiv_id);
      const ratingB = getRatingForArticle(b.bioRxiv_id);
      return ratingB - ratingA; // Sort in descending order by rating
    });
  }, [data.articles]);

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
    // Sort the data in descending order by similarity score
    return [...data.articles].sort(
      (a, b) => getSimilarityScore(b) - getSimilarityScore(a)
    );
  }, [data.articles]); // Re-run sorting only when articles change

  //

  // Pagination logic
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedArticles = sortedData.slice(startIndex, endIndex);

  // Function to handle page change
  const handlePageChange = (newPage) => {
    if (
      newPage > 0 &&
      newPage <= Math.ceil(sortedData.length / ITEMS_PER_PAGE)
    ) {
      setCurrentPage(newPage);
      setPageInput(newPage);
      scrollToTop();
    }
  };

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

  const handleBookmarkClick = (idType, title, source) => {
    setCurrentIdType(idType);
    setArticleTitle(title);
    setSource(source);
    setIsModalOpen(true); // Open the modal for collection selection
  };

  const handleSaveToExisting = async (collectionName) => {
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
      const response = await axios.post(
        "http://13.127.207.184:80/bookmarks/users/collections",
        bookmarkData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // if (response.status === 201) {
      //   console.log(response.data.collections);

      //   const updatedCollections = collections.map((collection) => {
      //     if (collection === collectionName) {
      //       // Append the new article ID to the articles if it doesn't already exist
      //       console.log(response.data.collections);

      //       return {
      //         ...collection,
      //         articles: [...(collection.articles || []), currentIdType],
      //       };
      //     }
      //     return collection;
      //   });
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
        article_id: String(currentIdType), // Convert to string
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

  const handleFilterChange = async (event) => {
    setLoading(true);
    setAnnotateData([]);
    setOpenAnnotate(false);
    const newCheckedState = event.target.checked;
    //setIsChecked(newCheckedState);
    localStorage.setItem("checkboxState", JSON.stringify(newCheckedState)); // Save state to localStorage
    const { value, checked } = event.target;

    const updatedFilters = {
      ...filters,
      articleType: checked
        ? [...filters.articleType, value]
        : filters.articleType.filter((type) => type !== value),
    };

    setFilters(updatedFilters);
    setLoading(false);
    // Making API request with the updated filters and search term when a filter changes
    handleArticleTypeFilter(updatedFilters);
  };
  const handleSourceTypeChange = (event) => {
    const { value, checked } = event.target;

    const updatedSourceTypes = checked
      ? [...filters.sourceType, value]
      : filters.sourceType.filter((type) => type !== value);

    const updatedFilters = {
      ...filters,
      sourceType: updatedSourceTypes,
    };

    setFilters(updatedFilters);
    fetchFilteredResults(updatedSourceTypes);
  };

  const fetchFilteredResults = (sourceTypes) => {
    const sourceParam = sourceTypes.join(","); // Join multiple source types with commas for the query
    const apiUrl = `http://13.127.207.184:80/core_search/?term=${searchTerm}&source=${sourceParam}`;
    setLoading(true);

    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`, // Add Bearer token here
        },
      })
      .then((response) => {
        const data = response.data;
        setResults(data);
        setLoading(false);
        localStorage.setItem("sourceFilters", JSON.stringify(sourceTypes));
        navigate("/search", { state: { data, searchTerm } });
      })
      .catch((error) => {
        console.error("Error fetching data from the API", error);
        setLoading(false);
        navigate("/search", { state: { data: [], searchTerm } });
      });
  };

  // Function to handle radio button change
  const handleDateRangeChange = (event) => {
    const value = event.target.value;

    // Check if the new value is different from the current state
    if (value !== selectedDateRange) {
      setSelectedDateRange(value);

      if (value !== "custom") {
        // Call the filter immeqtely for non-custom ranges
        handleYearFilter(value);
      }
    }
  };

  const isValidDate = (dateString) => {
    // Check if the format matches yyyy-mm-dd and the date is valid
    const regex = /^\d{4}-\d{2}-\d{2}$/;

    if (!regex.test(dateString)) {
      return false; // Invalid format
    }

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date); // Check if it's a valid date
  };

  const handleCustomDateChange = (event) => {
    const { name, value } = event.target;

    // Validate the date before setting it
    if (isValidDate(value)) {
      if (name === "startDate") {
        setCustomStartDate(value); // Only set if valid
      } else if (name === "endDate") {
        setCustomEndDate(value); // Only set if valid
      }

      // Ensure both dates are available and fully entered (length = 10) before calling handleDateFilter
      const updatedStartDate = name === "startDate" ? value : customStartDate;
      const updatedEndDate = name === "endDate" ? value : customEndDate;

      // if (updatedStartDate.length === 10 && updatedEndDate.length === 10) {
      //   handleDateFilter(updatedStartDate, updatedEndDate); // Pass valid raw dates to the filter
      // }
    } else {
      console.error("Invalid date format. Please enter a valid date.");
    }
  };

  const handleCustomDateFilter = (startDate, endDate) => {
    if (startDate && endDate) {
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);
      const filter_type = "custom";
      const apiUrl = `http://13.127.207.184:80/core_search/?term=${searchTerm}&date_filter=${filter_type}&from_date=${formattedStartDate}&to_date=${formattedEndDate}`;
      setLoading(true);

      axios
        .get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`, // Add Bearer token here
          },
        })
        .then((response) => {
          const data = response.data;
          setResults(data);
          setLoading(false);
          localStorage.setItem(
            "publicationDate",
            JSON.stringify({
              selectedDateRange: "Custom Range",
              customStartDate: startDate,
              customEndDate: endDate,
            })
          );
          navigate("/search", { state: { data, searchTerm } });
        })
        .catch((error) => {
          console.error("Error fetching data from the API", error);
          setLoading(false);
          navigate("/search", { state: { data: [], searchTerm } });
        });
    } else {
      console.error(
        "Please provide both start and end dates for the custom range."
      );
    }
  };

  const handleYearFilter = (selectedDateRange) => {
    const filterType = selectedDateRange === "5" ? "5 years" : "1 year";

    const apiUrl = `http://13.127.207.184:80/core_search/?term=${searchTerm}&date_filter=${filterType}`;
    setLoading(true);

    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`, // Add Bearer token here
        },
      })
      .then((response) => {
        console.log("response from api", response);
        const data = response.data;
        setResults(data);
        setLoading(false);
        setCustomStartDate(""); // Clear custom dates when selecting a non-custom range
        setCustomEndDate("");
        localStorage.setItem(
          "publicationDate",
          JSON.stringify({
            selectedDateRange,
            customStartDate: "",
            customEndDate: "",
          })
        );
        navigate("/search", { state: { data, searchTerm } });
      })
      .catch((error) => {
        console.error("Error fetching data from the API", error);
        setLoading(false);
        navigate("/search", {
          state: { data: [], searchTerm, dateloading: true },
        });
      });
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`; // Format for the API
  };

  const handleArticleTypeFilter = (selectedArticleTypes) => {
    const filterTypes = selectedArticleTypes.articleType; // Assuming this is an array
    const queryParams = filterTypes
      .map((type) => `article_type=${encodeURIComponent(type)}`) // Encode each type for URL safety
      .join("&");

    const apiUrl = `http://13.127.207.184:80/core_search/?term=${encodeURIComponent(
      searchTerm
    )}&${queryParams}`;

    setLoading(true);

    axios
      .get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`, // Add Bearer token here
        },
      })
      .then((response) => {
        console.log("Response from API with article types:", response);
        const data = response.data;
        setResults(data);
        setLoading(false);

        // Save the filter state
        localStorage.setItem(
          "articleTypeFilter",
          JSON.stringify({
            selectedArticleTypes,
          })
        );
        navigate("/search", { state: { data, searchTerm } });
      })
      .catch((error) => {
        console.error(
          "Error fetching data from the API with article type filters",
          error
        );
        setLoading(false);
        navigate("/search", {
          state: { data: [], searchTerm, dateloading: true },
        });
      });
  };

  const handleApplyFilters = () => {
    applyFilters(filters);
    setShowFilterPopup(false);
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
    sessionStorage.removeItem("chatHistory");
  }, [location]);
  const capitalizeFirstLetter = (text) => {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
  };
  // console.log(data)
  // Function to italicize the search term in the text
  const italicizeTerm = (text) => {
    if (!text) return "";
    if (!searchTerm) return String(text);

    // Convert text to a string before using split
    const textString = String(text);
    const regex = new RegExp(`(${searchTerm})`, "gi");

    return textString.split(regex).map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
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
    setBioRxivArticles([]); // Reset bioRxivArticles array
    setPlosArticles([]); // Reset plosArticles array
    setSelectedArticles([]); // Reset selectedArticles array

    setShareableLinks({});
    setOpenAnnotate(false);
    setSelectedSort("best_match");
    setSelectedDateRange(""); // Reset selectedDateRange to its default value (none selected)
    setCustomStartDate(""); // Clear custom start date
    setCustomEndDate(""); // Clear custom end date
    // Clear the filters from localStorage
    localStorage.removeItem("filters");
    localStorage.removeItem("publicationDate");
    // Optionally, you can also trigger the API call without any filters
    // const storeddata=sessionStorage.getItem("ResultData")
    // const parseddata=JSON.parse(storeddata)
    // const data=parseddata

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
    navigate(`/article/${type}:${idType}`, {
      state: { data: data, searchTerm, annotateData: annotateData },
    });
  };
  // Calculate the index range for articles to display
  // const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  // const endIndex = startIndex + ITEMS_PER_PAGE;
  // const paginatedArticles = data.articles && data.articles.slice(startIndex, endIndex) || [];

  // Handle page change

  // const handlePageChange = (newPage) => {
  //   if (newPage > 0 && newPage <= totalPages) {
  //     setCurrentPage(newPage);
  //     setPageInput(newPage);
  //     scrollToTop();
  //     // contentRightRef.current.scrollIntoView({ behavior: "smooth" });
  //   }
  // };
  const handlePageInputChange = (e) => {
    const value = e.target.value;
    setPageInput(value); // Update the input field value regardless of its validity
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
    setCurrentPage(1); // Reset currentPage to 1 whenever new search results are loaded
    setPageInput(1); // Reset the input field to 1 as well
  }, [data.articles]);
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
  const totalPages = Math.ceil(data.articles.length / ITEMS_PER_PAGE);
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
  console.log(totalArticles);
  const handleSourceCheckboxChange = (source, idType, doi) => {
    const sourceType = source; // Set to "PubMed" if source is null or undefined
    const uniqueId = `${sourceType}_${idType}`;
    console.log(sourceType);
    let shareableLink;
    if (sourceType === "pubmed") {
      console.log("entered");
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
    } else if (source === "Pub") {
      return selectedArticles.includes(uniqueId); // For other sources
    }
  };
  const handleShare = () => {
    setIsEmailModalOpen(true);
  };
  const handleSendEmail = async () => {
    if (!email) {
      toast.error("Please enter an email address.");
      return;
    }

    const links = Object.values(shareableLinks).join(" "); // Get all the URLs as a single space-separated string

    const emailData = {
      email: email, // assuming `email` state holds the email input value
      subject: emailSubject || "Check out this article", // default subject if none provided
      content: links, // the concatenated URLs
    };
    console.log(links);
    try {
      const response = await axios.post(
        "http://13.127.207.184:80/core_search/sharearticle",
        emailData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add Bearer token
          },
        }
      );

      if (response.status === 200) {
        toast.success("Email sent successfully", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        console.log("Email sent successfully");
        setEmail("");
        setEmailSubject("");
        handleCloseEmailModal(); // Close modal after successful email send
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Failed to send email. Please try again.");
    }
  };
  const handleCloseEmailModal = () => {
    setIsEmailModalOpen(false);
    setEmail("");
    setEmailSubject("");
  };
  const handleAnnotateClick = async () => {
    if (totalArticles.length > 0) {
      sessionStorage.setItem("AnnotateData", "");
      sessionStorage.setItem("AnnotateSource", "");
      setAnnotateData([]);
      setAnnotateLoading(true);

      const extractIdType = (uniqueId) => {
        return uniqueId.split("_")[1]; // This splits "source_idType" and returns only the idType
      };
      const extractIdSource = (uniqueId) => uniqueId.split("_")[0];

      const annotatedArticles = totalArticles.map((id) => ({
        source: extractIdSource(id),
        idType: extractIdType(id),
      }));

      // Prepare the data by removing the "source_" part from uniqueId
      const pubmedIds = selectedArticles.map((id) =>
        parseInt(extractIdType(id), 10)
      );
      const biorxivIds = bioRxivArticles.map((id) =>
        parseInt(extractIdType(id), 10)
      );
      const plosIds = plosArticles.map((id) => parseInt(extractIdType(id), 10));

      axios
        .post(
          "http://13.127.207.184:80/core_search/annotate",
          {
            pubmed: pubmedIds,
            biorxiv: biorxivIds,
            plos: plosIds,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`, // Add the Bearer token here
            },
          }
        )
        .then((response) => {
          const data = response.data;
          sessionStorage.setItem("AnnotateData", JSON.stringify(data));
          sessionStorage.setItem(
            "AnnotateSource",
            JSON.stringify(annotatedArticles)
          );
          setAnnotateData(data);
          setAnnotateSource(annotatedArticles);
          setOpenAnnotate(true);
          setAnnotateLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching data from the API", error);
          setAnnotateLoading(false);
        });
    }
  };

  const [expandedPmids, setExpandedPmids] = useState({}); // Track which PMIDs are expanded
  const [expandedTexts, setExpandedTexts] = useState({});
  // Function to toggle the expansion for all rows associated with a given PMID
  useEffect(() => {
    // Reset expandedTexts when openAnnotate changes
    if (openAnnotate) {
      setExpandedTexts({}); // Resets all expanded texts to the collapsed (sliced) state
    }
  }, [openAnnotate]);
  const toggleExpandPmid = (pmid) => {
    setExpandedPmids((prevState) => {
      const isExpanding = !prevState[pmid]; // Determine if we are expanding or collapsing
      if (!isExpanding) {
        // If we are collapsing, reset the expanded texts for this PMID
        const updatedTexts = { ...expandedTexts };
        Object.keys(updatedTexts).forEach((key) => {
          if (key.startsWith(`${pmid}-`)) {
            delete updatedTexts[key]; // Remove expanded text for this PMID's rows
          }
        });
        setExpandedTexts(updatedTexts); // Update expanded texts
      }
      return {
        ...prevState,
        [pmid]: isExpanding, // Toggle expansion for the specific PMID
      };
    });
  };
  const toggleExpandText = (key) => {
    setExpandedTexts((prevState) => ({
      ...prevState,
      [key]: !prevState[key], // Toggle between full text and sliced text for a specific row
    }));
  };

  return (
    <div className="Container" ref={contentRightRef}>
      <div className="search-container-content">
        <header className="search-header">
          <div className="search-header-logo" style={{ margin: "20px 0" }}>
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
            className="search-header-auth-buttons"
            style={{ margin: "20px 26px 20px 0", display: "flex", gap: "10px" }}
          >
            {isLoggedIn ? (
              <>
                <div
                  onClick={handleProfileClick}
                  style={{ cursor: "pointer", height: "35px" }}
                >
                  <img
                    src={ProfileIcon}
                    style={{ width: "35px" }}
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
      </div>
      <SearchBar className="searchResults-Bar"></SearchBar>

      <div id="Search-Content-Container">
        <div className="searchContent-left">
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
                  <img src={downarrow} />
                ) : (
                  <img src={uparrow} />
                )}
              </h5>
              {showArticleType && (
                <div className="searchfilter-options-dropdown">
                  <label>
                    <input
                      type="checkbox"
                      value="Books and Documents"
                      // disabled={checkBoxLoading}
                      checked={filters.articleType.includes(
                        "Books and Documents"
                      )}
                      onChange={handleFilterChange} //FiltersComments
                      //checked={isChecked} // Controlled checkbox state
                    />{" "}
                    Books & Documents
                    {/* {checkBoxLoading && <span>Loading...</span>} */}
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      value="Clinical Trials"
                      checked={filters.articleType.includes("Clinical Trials")}
                      onChange={handleFilterChange} //FiltersComments
                    />{" "}
                    Clinical Trials
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      value="Meta Analysis"
                      checked={filters.articleType.includes("Meta Analysis")}
                      onChange={handleFilterChange} //FiltersComments
                    />{" "}
                    Meta Analysis
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      value="Review"
                      checked={filters.articleType.includes("Review")}
                      onChange={handleFilterChange} //FiltersComments
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
                  <img src={downarrow} />
                ) : (
                  <img src={uparrow} />
                )}
              </h5>

              {showSourceType && (
                <div className="searchfilter-options-dropdown">
                  <label>
                    <input
                      type="checkbox"
                      value="BioRxiv"
                      checked={filters.sourceType.includes("BioRxiv")}
                      onChange={handleSourceTypeChange}
                    />{" "}
                    BioRxiv
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      value="Public Library of Science (PLOS)"
                      checked={filters.sourceType.includes(
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
                      checked={filters.sourceType.includes("pubmed")}
                      onChange={handleSourceTypeChange}
                    />{" "}
                    PubMed
                  </label>
                </div>
              )}
            </div>

            {/* Publication date section */}
            <div className="searchfilter-section">
              <h5 onClick={() => setShowPublicationDate(!showPublicationDate)}>
                Publication date{" "}
                <span>
                  {showPublicationDate ? (
                    <img src={downarrow} />
                  ) : (
                    <img src={uparrow} />
                  )}
                </span>
              </h5>
              {showPublicationDate && (
                <div className="searchfilter-options-dropdown">
                  {/* Radio buttons for 1 year, 5 years, and custom range */}
                  <label>
                    <input
                      type="radio"
                      name="date"
                      value="1"
                      checked={selectedDateRange === "1"}
                      onChange={handleDateRangeChange} //FiltersComments
                    />{" "}
                    1 year
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="date"
                      value="5"
                      checked={selectedDateRange === "5"}
                      onChange={handleDateRangeChange} //FiltersComments
                    />{" "}
                    5 years
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="date"
                      value="custom"
                      checked={selectedDateRange === "custom"}
                      onChange={handleDateRangeChange} //FiltersComments
                    />{" "}
                    Custom range
                  </label>

                  {/* Custom date range inputs, displayed only when 'Custom range' is selected */}
                  {selectedDateRange === "custom" && (
                    <div className="custom-date-range">
                      <div className="custom-date-input">
                        <label>
                          Start Date:
                          <input
                            type="date"
                            name="startDate"
                            value={customStartDate}
                            onChange={handleCustomDateChange} //FiltersComments
                          />
                        </label>
                      </div>

                      <div className="custom-date-input">
                        <label>
                          End Date:
                          <input
                            type="date"
                            name="endDate"
                            value={customEndDate}
                            onChange={handleCustomDateChange} //FiltersComments
                          />
                        </label>
                      </div>

                      <button
                        className="ApplyFilters"
                        onClick={() =>
                          handleCustomDateFilter(customStartDate, customEndDate)
                        }
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Text availability section */}
            <div className="searchfilter-section">
              <h5
                onClick={() => setShowTextAvailability(!showTextAvailability)}
              >
                <span>Text availability</span>
                <span>
                  {showTextAvailability ? (
                    <img src={downarrow} />
                  ) : (
                    <img src={uparrow} />
                  )}
                </span>
              </h5>
              {showTextAvailability && (
                <div className="searchfilter-options-dropdown">
                  <label>
                    <input type="checkbox" /> Abstract
                  </label>
                  <label>
                    <input type="checkbox" /> Free full text
                  </label>
                  <label>
                    <input type="checkbox" /> Full text
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
        {loading ? <Loading /> : ""}

        <div className="searchContent-right">
          {data.articles && data.articles.length > 0 ? (
            <>
              <div className="SearchResult-Count-Filters">
                <div className="SearchResult-Option-Buttons">
                  <div
                    className="SearchResult-Option-Left"
                    style={{
                      cursor: selectedArticles.length > 0 ? "pointer" : "",
                      opacity: selectedArticles.length > 0 ? 1 : "", // Change opacity for a disabled effect
                      display: displayIfLoggedIn,
                    }}
                    title={
                      selectedArticles.length === 0
                        ? "Select at least one article to annotate"
                        : "Annotate selected articles"
                    }
                  >
                    <div style={{ position: "relative" }}>
                      {" "}
                      {/* Wrapper for the button to position loading spinner */}
                      <button
                        className={`SearchResult-Annotate ${
                          totalArticles.length > 0 ? "active" : "disabled"
                        }`}
                        onClick={
                          totalArticles.length > 0 ? handleAnnotateClick : null
                        }
                        style={{
                          cursor: totalArticles.length > 0 ? "pointer" : "",
                          opacity: annotateLoading ? 0.5 : 1, // Gray out the button when loading
                          position: "relative", // Make the button position relative to the wrapper for loader positioning
                        }}
                        title={
                          totalArticles.length === 0
                            ? "Select an article"
                            : "Annotate selected articles"
                        }
                        disabled={annotateLoading} // Disable the button while loading
                      >
                        Annotate
                      </button>
                      {/* Show loading spinner */}
                      {annotateLoading && (
                        <div
                          className="loader" // Applying your loader CSS
                          style={{
                            position: "absolute",
                            top: "12.5%",
                            left: "25%",
                          }}
                        ></div>
                      )}
                    </div>
                  </div>

                  <button
                    style={{ display: displayIfLoggedIn }}
                    onClick={
                      Object.keys(shareableLinks).length > 0
                        ? handleShare
                        : null
                    }
                    className={`SearchResult-Share ${
                      Object.keys(shareableLinks).length > 0
                        ? "active"
                        : "disabled"
                    }`}
                    title={
                      Object.keys(shareableLinks).length === 0
                        ? "Select an article to share"
                        : "Share selected articles"
                    }
                  >
                    Share
                  </button>
                  <button
                    style={{ display: displayIfLoggedIn }}
                    className="SearchResult-Save"
                    title="Save selected articles"
                  >
                    Save
                  </button>
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
                    <select
                      className="SearchResult-dropdown"
                      onChange={handleSortChange}
                      value={selectedSort}
                    >
                      <option value="best_match">Most Relevant</option>
                      <option value="publication_date">Publication Date</option>
                      <option value="Ratings">Rating</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="pagination">
                <div className="pagination-controls">
                  {/* Button to go to the first page */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    {"<<"} {/* First page button */}
                  </button>

                  {/* Button to go to the previous page */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    {"<"} {/* Previous page button */}
                  </button>

                  {/* Input for direct page number entry */}
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

                        // Only allow numeric input
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
                  {/* Button to go to the next page */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    {">"} {/* Next page button */}
                  </button>

                  {/* Button to go to the last page */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    {">>"} {/* Last page button */}
                  </button>
                </div>
              </div>

              <div className="searchContent-articles">
                <div className="searchresults-list">
                  {paginatedArticles.map((result, index) => {
                    // Assuming you already have access to Redux searchResults

                    // Assuming you already have access to Redux searchResult

                    // Define the logic to get similarity_score from Redux (searchResults)
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
                            <div className="searchresult-title-container">
                              <div className="searchresult-ArticleTitle">
                                <input
                                  type="checkbox"
                                  className="result-checkbox"
                                  style={{ display: displayIfLoggedIn }}
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
                                icon={regularBookmark}
                                size="l"
                                style={{
                                  color: isBookmarked(idType)
                                    ? "blue"
                                    : "black",
                                  cursor: "pointer",
                                  display: displayIfLoggedIn,
                                }}
                                onClick={() =>
                                  handleBookmarkClick(
                                    idType,
                                    result.article_title,
                                    result.source || "PubMed"
                                  )
                                }
                                title={
                                  isBookmarked(idType)
                                    ? "Bookmarked"
                                    : "Bookmark this article"
                                }
                              />

                              {isModalOpen && (
                                <div className="bookmark-modal-overlay">
                                  <div className="modal-content" ref={modalRef}>
                                    <h3>Save Bookmark</h3>
                                    {/* Existing Collections */}
                                    {Object.keys(collections).length > 0 && (
                                      <>
                                        <h4>Save to existing collection:</h4>
                                        <ul>
                                          {Object.keys(collections).map(
                                            (collectionName, index) => (
                                              <li key={index}>
                                                {" "}
                                                {/* using index as key since collection names are unique */}
                                                <button
                                                  onClick={() =>
                                                    handleSaveToExisting(
                                                      collectionName
                                                    )
                                                  }
                                                >
                                                  {collectionName}
                                                </button>
                                              </li>
                                            )
                                          )}
                                        </ul>
                                      </>
                                    )}

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
                                      style={{ display: "flex", gap: "20px" }}
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
                                  </div>
                                </div>
                              )}
                              {isEmailModalOpen && (
                                <div
                                  className="email-modal-overlay"
                                  style={{
                                    backdropFilter: "blur(1px)",
                                    background: "none",
                                  }}
                                  onClick={handleCloseEmailModal}
                                >
                                  <div
                                    className="email-modal-content"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="email-modal-header">
                                      <h3>Send to</h3>
                                      <button
                                        className="email-modal-close-button"
                                        onClick={handleCloseEmailModal}
                                      >
                                        <IoCloseOutline size={20} />
                                      </button>
                                    </div>
                                    <div
                                      className="email-modal-body"
                                      style={{
                                        display: "flex",
                                        gap: "10px",
                                        flexDirection: "column",
                                      }}
                                    >
                                      <input
                                        type="email"
                                        value={email}
                                        onChange={(e) =>
                                          setEmail(e.target.value)
                                        }
                                        placeholder="Email"
                                        className="email-input"
                                      />
                                      <input
                                        type="text"
                                        value={emailSubject}
                                        onChange={(e) =>
                                          setEmailSubject(e.target.value)
                                        }
                                        placeholder="Enter Subject"
                                        className="email-input"
                                      />
                                      <button
                                        onClick={handleSendEmail}
                                        style={{ width: "50%", margin: "auto" }}
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
                              {result.doi ? (
                                <p className="searchresult-pmid">
                                  {" "}
                                  DoI:
                                  <a
                                    href={`https://doi.org/${result.doi}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >{`${result.doi}`}</a>
                                </p>
                              ) : (
                                ""
                              )}
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
                          <div className="Article-Options-Right">
                            <div
                              class="searchResult-rate"
                              style={{ display: displayIfLoggedIn }}
                            >
                              {[5, 4, 3, 2, 1].map((value) => (
                                <React.Fragment key={value}>
                                  <input
                                    type="radio"
                                    id={`star${value}-${idType}`}
                                    name={`rate_${idType}`}
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
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pagination">
                <div className="pagination-controls">
                  {/* Button to go to the first page */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    {"<<"} {/* First page button */}
                  </button>

                  {/* Button to go to the previous page */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    {"<"} {/* Previous page button */}
                  </button>

                  {/* Input for direct page number entry */}
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

                        // Only allow numeric input
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
                  {/* Button to go to the next page */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    {">"} {/* Next page button */}
                  </button>

                  {/* Button to go to the last page */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    {">>"} {/* Last page button */}
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

        <>
          <div
            className="search-right-aside"
            style={{ display: displayIfLoggedIn }}
          >
            {openAnnotate && (
              <div className="search-annotate">
                <Annotation
                  openAnnotate={openAnnotate}
                  annotateData={annotateData}
                  source={annotateSource}
                />
              </div>
            )}

            {/* {openNotes && (
                          <div className="search-notes">
                            
                            <div className="search-stream-input" >
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
                                      <FontAwesomeIcon className="button" onClick={handleAskClick} icon={faTelegram} size={"xl"} />
                                    )}
                                  
                                </div>
                          </div>
                        )} */}

            <div className="search-icons-group">
              <>
                <div
                  className={`search-annotate-icon ${
                    openAnnotate ? "open" : "closed"
                  } ${
                    annotateData && annotateData.length > 0 ? "" : "disabled"
                  }`}
                  onClick={
                    annotateData && annotateData.length > 0
                      ? handleAnnotate
                      : null
                  }
                  style={{
                    cursor:
                      annotateData && annotateData.length > 0 ? "pointer" : "",
                    opacity: annotateData && annotateData.length > 0 ? 1 : 1, // Adjust visibility when disabled
                  }}
                >
                  <img src={annotate} alt="annotate-icon" />
                </div>
                {/* <div
                className={`notes-icon ${openNotes ? "open" : "closed"}`}
                onClick={() => {
                  handleNotes();
                  // handleResize();
                }}
              >
                <img src={notesicon} alt="notes-icon" />
              </div> */}
              </>
            </div>
          </div>
        </>
      </div>

      <Footer />
      <div className="ScrollTop">
        <button onClick={scrollToTop} id="scrollTopBtn" title="Go to top">
          <FontAwesomeIcon icon={faAnglesUp} />
        </button>
      </div>
    </div>
  );
};

export default SearchResults;
