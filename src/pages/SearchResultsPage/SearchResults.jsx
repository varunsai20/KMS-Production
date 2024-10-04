import React, { useEffect, useRef, useState } from "react";
import "./SearchResults.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SearchBar from "../../components/SearchBar";
import Loading from "../../components/Loading";
import Annotation from "../../components/Annotaions"
import { Button, CircularProgress } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import annotate from "../../assets/images/task-square.svg";
import notesicon from "../../assets/images/note-2.svg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark as regularBookmark } from '@fortawesome/free-regular-svg-icons';
import { faComment  } from '@fortawesome/free-regular-svg-icons';
import flag from "../../assets/images/flash.svg"
//import sendicon from "../../assets/images/sendicon.svg";
import { faTelegram } from "@fortawesome/free-brands-svg-icons";
import axios from "axios";  
const ITEMS_PER_PAGE = 5;

const SearchResults = ({ open, onClose, applyFilters }) => {
  const location = useLocation(); // Access the passed state
  const { data } = location.state || { data: [] };
 

  const searchTerm = location.state?.searchTerm || "";
  const navigate = useNavigate();
  const contentRightRef = useRef(null); // Ref for searchContent-right
  const [result, setResults] = useState();
  const [loading, setLoading] = useState();
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkedPmids, setBookmarkedPmids] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState(1); // Separate state for the page input
  const [selectedDateRange, setSelectedDateRange] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [completePMID,setCompletePMID]=useState([])


 

  //Chatbot
  const [query, setQuery] = useState(""); // Initialize with empty string
  const [response, setResponse] = useState("");
  const [showStreamingSection, setShowStreamingSection] = useState(false);
  const [chatHistory, setChatHistory] = useState(() => {
    const storedHistory = sessionStorage.getItem("chatHistory");
    return storedHistory ? JSON.parse(storedHistory) : [];
  });
  const endOfMessagesRef = useRef(null); // Ref to scroll to the last message
  useEffect(() => {
    const storedDateInfo = localStorage.getItem('publicationDate');
    if (storedDateInfo) {
      const { selectedDateRange, customStartDate, customEndDate } = JSON.parse(storedDateInfo);

      if (selectedDateRange) {
        setSelectedDateRange(selectedDateRange);
      }
      if (selectedDateRange === 'custom') {
        // Only set custom start/end dates if the range is custom
        setCustomStartDate(customStartDate || '');
        setCustomEndDate(customEndDate || '');
      }
    }
  }, []);
  

  const [filters, setFilters] = useState(() => {
    // Get initial state from localStorage, if available
    const savedFilters = localStorage.getItem("filters");
    return savedFilters ? JSON.parse(savedFilters) : { articleType: [] };
  });
  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("filters", JSON.stringify(filters));
  }, [filters]);


  useEffect(()=>{
    localStorage.setItem("PublicationDate",selectedDateRange)
  },[selectedDateRange])
  
  const topPageRef = useRef(null); 
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [showTextAvailability, setShowTextAvailability] = useState(false);
  const [showArticleType, setShowArticleType] = useState(true);
  const [showPublicationDate, setShowPublicationDate] = useState(true);
  const [openAnnotate, setOpenAnnotate] = useState(false);
  const [annotateData, setAnnotateData] = useState();
  const [openNotes, setOpenNotes] = useState(false);
  const [annotateLoading, setAnnotateLoading] = useState(false);
  const [sortedData, setSortedData] = useState([]); // State to store sorted data
  const [selectedSort, setSelectedSort] = useState("best_match");
  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split("-");
    const monthIndex = new Date(Date.parse(`${month} 1, ${year}`)).getMonth(); // Get month index from the string (e.g., "Jun" -> 5)
    return new Date(year, monthIndex, day); // Return a Date object
  };

  const sortedPublicationData = [...data.articles].sort((a, b) => {
    const dateA = parseDate(a.publication_date);
    const dateB = parseDate(b.publication_date);
    return dateB - dateA; // Sort in descending order (newest first)
  });

  // Function to handle sorting based on selected option
  const handleSortChange = (e) => {
    const sortType = e.target.value;
    setSelectedSort(sortType); // Store the selected sort option

    // If publication date is selected, use the sorted list for display
    if (sortType === "publication_date") {
      setSortedData(sortedPublicationData);
    } else {
      setSortedData(data.articles); // Reset to the original data for Best Match
    }
  };

  useEffect(() => {
    // Initialize with original data on component load
    setSortedData(data.articles || []);
  }, [data]);

  // Pagination logic
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedArticles = sortedData.slice(startIndex, endIndex);

  // Function to handle page change
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= Math.ceil(sortedData.length / ITEMS_PER_PAGE)) {
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
  // console.log(filters)
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
  const handleBookmarkClick = (pmid) => {
    setBookmarkedPmids((prevState) => ({
      ...prevState,
      [pmid]: !prevState[pmid], // Toggle the bookmark state for the specific pmid
    }));
    
  };
 
  const handleFilterChange = async (event) => {
    setLoading(true);
    setSelectedArticles([])
    setAnnotateData([])
    setOpenAnnotate(false)
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

    // Making API request with the updated filters and search term when a filter changes
    handleButtonClick(updatedFilters);
  };
  



     // Function to handle radio button change
     const handleDateRangeChange = (event) => {
      const value = event.target.value;
    
      // Check if the new value is different from the current state
      if (value !== selectedDateRange) {
        setSelectedDateRange(value);
    
        if (value !== "custom") {
          // Call the filter immediately for non-custom ranges
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
    
        const requestBody = {
          pmids: completePMID,
          filter_type: "Custom Range",
          from_date: formattedStartDate,
          to_date: formattedEndDate,
        };
    
        console.log(requestBody);
    
        const apiUrl = "http://13.127.207.184:80/filterdate";
        setLoading(true);
        axios
          .post(apiUrl, requestBody)
          .then((response) => {
            const data = response.data;
            setResults(data);
            setLoading(false);

            localStorage.setItem('publicationDate', JSON.stringify({
              selectedDateRange,
              customStartDate: startDate,
              customEndDate: endDate
            }));
            navigate("/search", { state: { data, searchTerm } });
          })
          .catch((error) => {
            console.error("Error fetching data from the API", error);
            setLoading(false);
            navigate("/search", { state: { data: [], searchTerm } });
          });
      } else {
        console.error("Please provide both start and end dates for the custom range.");
      }
    };
    const handleYearFilter = (selectedDateRange) => {
      const filterType = selectedDateRange === "5" ? "5 years" : "1 year";
    
      const requestBody = {
        pmids: completePMID,
        filter_type: filterType,
      };
    
      console.log(requestBody);
    
      const apiUrl = "http://13.127.207.184:80/filterdate";
      setLoading(true);
      axios
        .post(apiUrl, requestBody)
        .then((response) => {
          const data = response.data;
          setResults(data);
          setLoading(false);
          setCustomStartDate(''); // Clear custom dates when selecting a non-custom range
          setCustomEndDate('');
          localStorage.setItem('publicationDate', JSON.stringify({
            selectedDateRange,
            customStartDate: '',
            customEndDate: ''
          }));
          navigate("/search", { state: { data, searchTerm } });
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
    
    
  const handleButtonClick = (updatedFilters) => {
    //setCheckBoxLoading(true);
    //const term = newSearchTerm || seachTerm;
    setLoading(true);
    if (searchTerm) {
      setLoading(true);
      sessionStorage.setItem("SearchTerm", searchTerm);

      const timeoutId = setTimeout(() => {
        setLoading(false);
        navigate("/search", { state: { data: [], searchTerm } });
      }, 30000); // 30 seconds

      const filtersToSend = updatedFilters.articleType;
      // console.log(typeof(filtersToSend))
      // Check the length of filtersToSend
      const apiUrl =
        filtersToSend.length > 0
          ? "http://13.127.207.184:80/filter"
          : "http://13.127.207.184:80/query";
      // console.log(apiUrl);
      const requestBody =
        filtersToSend.length > 0
          ? {
              query: searchTerm,
              filters: filtersToSend, // Send the filters if available
            }
          : {
              query: searchTerm, // Send only the query if filters are empty
            };
      // console.log(requestBody);
      axios
        //.post(apiUrl,{query:term,filters:updatedFilters.articleType})
        .post(apiUrl, requestBody)
        .then((response) => {
          // console.log(response);
          //setIsChecked((prev) => !prev);
          //localStorage.setItem("checkboxState", JSON.stringify(!isChecked));
          const data = response.data; // Assuming the API response contains the necessary data
          setResults(data);
          setAnnotateData([])
          // Navigate to SearchPage and pass data via state
          navigate("/search", { state: { data, searchTerm } });
          //navigate("/search",{state:{data, searchTerm:term}});
          clearTimeout(timeoutId);
          setLoading(false);
        })
        .catch((error) => {
          console.log(error);
          clearTimeout(timeoutId);
          setLoading(false);
          navigate("/search", { state: { data: [], searchTerm } });
          console.error("Error fetching data from the API", error);
        });
    }
  };

  const handleApplyFilters = () => {
    applyFilters(filters);
    setShowFilterPopup(false);
  };
  useEffect(() => {
    setSelectedArticles([]);
    setAnnotateData([]);
    setOpenAnnotate(false) 
  }, []);
  useEffect(() => {
      const pmidData=sessionStorage.getItem("ResultData")
      const parsedPmid=JSON.parse(pmidData)
      const pmidList = parsedPmid.articles.map(article => article.pmid);
      setCompletePMID(pmidList);
    
  }, [data, result]);
  useEffect(() => {
    // Clear session storage for chatHistory when the location changes
    sessionStorage.removeItem("chatHistory");
  }, [location]);
  const capitalizeFirstLetter = (text) => {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
  };
  // Function to italicize the search term in the text
  const italicizeTerm = (text) => {
    if (!text) return "";
    if (!searchTerm) return String(text);

    // Convert text to a string before using split
    const textString = String(text);
    const regex = new RegExp(`(${searchTerm})`, "gi");

    return textString.split(regex).map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <b
          key={index}
          className="bold"
          style={{ fontWeight: "bold", display: "inline-flex" }}
        >
          {part}
        </b>
      ) : (
        part
      )
    );
  };
  const handleResetAll = () => {
    // Clear the filters from state
    setFilters({ articleType: [] });
    setAnnotateData([])
    setSelectedArticles([])
    setOpenAnnotate(false)
    setSelectedSort("best_match")
    setSelectedDateRange(""); // Reset selectedDateRange to its default value (none selected)
    setCustomStartDate(""); // Clear custom start date
    setCustomEndDate(""); // Clear custom end date
    // Clear the filters from localStorage
    localStorage.removeItem("filters");
    localStorage.removeItem("publicationDate");
    // Optionally, you can also trigger the API call without any filters
    const storeddata=sessionStorage.getItem("ResultData")

    const parseddata=JSON.parse(storeddata)
    console.log(parseddata)
    const data=parseddata

    navigate("/search", { state: { data, searchTerm } });
  };
  const handleNavigate = (pmid) => {
    navigate(`/article/${pmid}`, { state: { data: data, searchTerm,annotateData: annotateData } });
  };
  // Calculate the index range for articles to display
  // const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  // const endIndex = startIndex + ITEMS_PER_PAGE;
  // const paginatedArticles = data.articles && data.articles.slice(startIndex, endIndex) || [];
  // console.log(paginatedArticles);

  // Handle page change
  const scrollToTop = () => {
    if (topPageRef.current) {
      topPageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
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
    scrollToTop();

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
  // console.log(data);
  const handleCheckboxChange = (pmid) => {
    setSelectedArticles(
      (prevSelected) =>
        prevSelected.includes(pmid)
          ? prevSelected.filter((id) => id !== pmid) // Remove unchecked article
          : [...prevSelected, pmid] // Add checked article
    );
  };

  // console.log(selectedArticles)
  const handleAnnotateClick = async () => {
    if (selectedArticles.length > 0) {
      setAnnotateData([])
      setAnnotateLoading(true);
      axios.post('http://13.127.207.184:80/annotate', {
        pmid: selectedArticles

          , // Sending the selected PMIDs in the request body
      })
        .then((response) => {

          //setIsChecked((prev) => !prev);
          //localStorage.setItem("checkboxState", JSON.stringify(!isChecked));
          const data = response.data; 
          // console.log(response)
          setAnnotateData(data)

          setOpenAnnotate(true)
          // console.log(data)// Assuming the API response contains the necessary data
          // setResults(data);
          // Navigate to SearchPage and pass data via state
          // navigate("/search", { state: { data, searchTerm } });
          // clearTimeout(timeoutId);
          // setLoading(false);
          setAnnotateLoading(false);

        })
        .catch((error) => {
          console.log(error);
          console.error("Error fetching data from the API", error);
        });
        }
        
        
        // Handle success response (e.g., show a success message or update the UI)
      
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
  console.log(data)
  const toggleExpandText = (key) => {
    setExpandedTexts((prevState) => ({
      ...prevState,
      [key]: !prevState[key], // Toggle between full text and sliced text for a specific row
    }));
  };

  const renderAnnotations = () => {
    return annotateData.map((entry) =>
      Object.entries(entry).flatMap(([pmid, types]) => {
        const rows = [];
        const isExpanded = expandedPmids[pmid];

        // Collect all disease keys and their values into an array
        let diseaseEntries = [];
        let diseaseAnnotationScore = 0;

        if (types.diseases) {
          diseaseEntries = Object.entries(types.diseases)
            .filter(([key]) => key !== "annotation_score")
            .map(([key]) => `${key}`);

          // Extract annotation score if present for diseases
          diseaseAnnotationScore = types.diseases.annotation_score
            ? `${Math.round(types.diseases.annotation_score)}%`
            : "0%"; // Default to 0% if not present
        }

        const diseaseValues = diseaseEntries.join(", ");
        const diseaseKey = `${pmid}-diseases`;
        const isDiseaseTextExpanded = expandedTexts[diseaseKey];
        const diseaseText = isDiseaseTextExpanded
          ? diseaseValues
          : diseaseValues.length > 30
          ? `${diseaseValues.slice(0, 30)}`
          : diseaseValues;

        const diseaseRow = (
          <tr className="search-table-body" key={diseaseKey}>
            <td>{pmid}</td>
            <td>{diseaseAnnotationScore}</td>
            <td>diseases</td>
            <td>
              {diseaseText}
              {diseaseValues.length > 30 && !isDiseaseTextExpanded && (
                <span
                  onClick={() => toggleExpandText(diseaseKey)}
                  style={{
                    color: "blue",
                    cursor: "pointer",
                    marginLeft: "5px",
                  }}
                >
                  ...
                </span>
              )}
            </td>
          </tr>
        );
        
        // Collect all other type rows (cellular, gene, etc.)
        const otherTypeRows = Object.entries(types)
          .filter(([type]) => type !== "diseases")
          .map(([type, values]) => {
            const valueEntries = Object.entries(values)
              .filter(([key]) => key !== "annotation_score")
              .map(([key]) => `${key}`);

            const annotationScore = values.annotation_score
              ? `${Math.round(values.annotation_score)}%`
              : "0%";

            const valueText = valueEntries.join(", ");
            const typeKey = `${pmid}-${type}`;
            const isTypeTextExpanded = expandedTexts[typeKey];
            const displayText = isTypeTextExpanded
              ? valueText
              : valueText.length > 30
              ? `${valueText.slice(0, 30)}`
              : valueText;

            return (
              <tr className="search-table-body" key={typeKey}>
                <td>{pmid}</td>
                <td>{annotationScore}</td>
                <td>{type}</td>
                <td>
                  {displayText}
                  {valueText.length > 30 && !isTypeTextExpanded && (
                    <span
                      onClick={() => toggleExpandText(typeKey)}
                      style={{
                        color: "blue",
                        cursor: "pointer",
                        marginLeft: "5px",
                      }}
                    >
                      ...
                    </span>
                  )}
                </td>
              </tr>
            );
          });

        // Display only the first row and a "+" button if the rows are not expanded
        if (!isExpanded) {
          rows.push(
            <tr className="search-table-body" key={`${pmid}-first`}>
              <td>
                <div className="flex-row">
                  {pmid}
                  <button
                    onClick={() => toggleExpandPmid(pmid)}
                    style={{ marginLeft: "10px" }}
                  >
                    +
                  </button>
                </div>
              </td>
              <td>{diseaseAnnotationScore}</td>
              <td>diseases</td>
              <td>
                {diseaseText}
                {diseaseValues.length > 30 && !isDiseaseTextExpanded && (
                  <span
                    onClick={() => toggleExpandText(diseaseKey)}
                    style={{
                      color: "blue",
                      cursor: "pointer",
                      marginLeft: "5px",
                    }}
                  >
                    ...
                  </span>
                )}
              </td>
            </tr>
          );
        }

        // If expanded, show all rows and a "-" button
        if (isExpanded) {
          rows.push(
            <tr className="search-table-body" key={`${pmid}-header`}>
              <td>
                <div className="flex-row">
                  {pmid}
                  <button
                    onClick={() => toggleExpandPmid(pmid)}
                    style={{ marginLeft: "10px" }}
                  >
                    -
                  </button>
                </div>
              </td>
              <td colSpan="3"></td>
            </tr>
          );
          rows.push(diseaseRow, ...otherTypeRows);
        }

        return rows;
      })
    );
  };

  return (
    <div className="Container">
      {/* Heade */}
      <Header />
      {/* Search-Bar */}
      <SearchBar className="searchResults-Bar"></SearchBar>
      {/* Content-Section */}

      <div className="Content" >
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
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      transform="rotate(0)"
                    >
                      <path
                        d="M3.72603 6.64009C3.94792 6.4182 4.29514 6.39803 4.53981 6.57957L4.60991 6.64009L10.0013 12.0312L15.3927 6.64009C15.6146 6.4182 15.9618 6.39803 16.2065 6.57957L16.2766 6.64009C16.4985 6.86198 16.5186 7.2092 16.3371 7.45387L16.2766 7.52397L10.4432 13.3573C10.2214 13.5792 9.87414 13.5994 9.62946 13.4178L9.55936 13.3573L3.72603 7.52397C3.48195 7.2799 3.48195 6.88417 3.72603 6.64009Z"
                        fill="#4A4B53"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      transform="rotate(180)"
                    >
                      <path
                        d="M3.72603 6.64009C3.94792 6.4182 4.29514 6.39803 4.53981 6.57957L4.60991 6.64009L10.0013 12.0312L15.3927 6.64009C15.6146 6.4182 15.9618 6.39803 16.2065 6.57957L16.2766 6.64009C16.4985 6.86198 16.5186 7.2092 16.3371 7.45387L16.2766 7.52397L10.4432 13.3573C10.2214 13.5792 9.87414 13.5994 9.62946 13.4178L9.55936 13.3573L3.72603 7.52397C3.48195 7.2799 3.48195 6.88417 3.72603 6.64009Z"
                        fill="#4A4B53"
                      />
                    </svg>
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
                        onChange={handleFilterChange}
                        //checked={isChecked} // Controlled checkbox state
                      />{" "}
                      Books & Documents
                      {/* {checkBoxLoading && <span>Loading...</span>} */}
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="Clinical Trials"
                        checked={filters.articleType.includes(
                          "Clinical Trials"
                        )}
                        onChange={handleFilterChange}
                      />{" "}
                      Clinical Trials
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="Meta Analysis"
                        checked={filters.articleType.includes("Meta Analysis")}
                        onChange={handleFilterChange}
                      />{" "}
                      Meta Analysis
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        value="Review"
                        checked={filters.articleType.includes("Review")}
                        onChange={handleFilterChange}
                      />{" "}
                      Review
                    </label>
                  </div>
                )}
              </div>

              {/* Publication date section */}
              <div className="searchfilter-section">
                <h5
                  onClick={() => setShowPublicationDate(!showPublicationDate)}
                >
                  Publication date{" "}
                  <span>
                    {showTextAvailability ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        transform="rotate(0)"
                      >
                        <path
                          d="M3.72603 6.64009C3.94792 6.4182 4.29514 6.39803 4.53981 6.57957L4.60991 6.64009L10.0013 12.0312L15.3927 6.64009C15.6146 6.4182 15.9618 6.39803 16.2065 6.57957L16.2766 6.64009C16.4985 6.86198 16.5186 7.2092 16.3371 7.45387L16.2766 7.52397L10.4432 13.3573C10.2214 13.5792 9.87414 13.5994 9.62946 13.4178L9.55936 13.3573L3.72603 7.52397C3.48195 7.2799 3.48195 6.88417 3.72603 6.64009Z"
                          fill="#4A4B53"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        transform="rotate(180)"
                      >
                        <path
                          d="M3.72603 6.64009C3.94792 6.4182 4.29514 6.39803 4.53981 6.57957L4.60991 6.64009L10.0013 12.0312L15.3927 6.64009C15.6146 6.4182 15.9618 6.39803 16.2065 6.57957L16.2766 6.64009C16.4985 6.86198 16.5186 7.2092 16.3371 7.45387L16.2766 7.52397L10.4432 13.3573C10.2214 13.5792 9.87414 13.5994 9.62946 13.4178L9.55936 13.3573L3.72603 7.52397C3.48195 7.2799 3.48195 6.88417 3.72603 6.64009Z"
                          fill="#4A4B53"
                        />
                      </svg>
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
          checked={selectedDateRange === '1'}
          onChange={handleDateRangeChange}
        />{' '}
        1 year
      </label>
      <label>
        <input
          type="radio"
          name="date"
          value="5"
          checked={selectedDateRange === '5'}
          onChange={handleDateRangeChange}
        />{' '}
        5 years
      </label>
      <label>
        <input
          type="radio"
          name="date"
          value="custom"
          checked={selectedDateRange === 'custom'}
          onChange={handleDateRangeChange}
        />{' '}
        Custom range
      </label>

      {/* Custom date range inputs, displayed only when 'Custom range' is selected */}
      {selectedDateRange === 'custom' && (
        <div className="custom-date-range">
          <div className="custom-date-input">
            <label>
              Start Date:
              <input
                type="date"
                name="startDate"
                value={customStartDate}
                onChange={handleCustomDateChange}
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
                onChange={handleCustomDateChange}
              />
            </label>
          </div>

          <button className="ApplyFilters" onClick={() => handleCustomDateFilter(customStartDate, customEndDate)}>
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
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        transform="rotate(0)"
                      >
                        <path
                          d="M3.72603 6.64009C3.94792 6.4182 4.29514 6.39803 4.53981 6.57957L4.60991 6.64009L10.0013 12.0312L15.3927 6.64009C15.6146 6.4182 15.9618 6.39803 16.2065 6.57957L16.2766 6.64009C16.4985 6.86198 16.5186 7.2092 16.3371 7.45387L16.2766 7.52397L10.4432 13.3573C10.2214 13.5792 9.87414 13.5994 9.62946 13.4178L9.55936 13.3573L3.72603 7.52397C3.48195 7.2799 3.48195 6.88417 3.72603 6.64009Z"
                          fill="#4A4B53"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        transform="rotate(180)"
                      >
                        <path
                          d="M3.72603 6.64009C3.94792 6.4182 4.29514 6.39803 4.53981 6.57957L4.60991 6.64009L10.0013 12.0312L15.3927 6.64009C15.6146 6.4182 15.9618 6.39803 16.2065 6.57957L16.2766 6.64009C16.4985 6.86198 16.5186 7.2092 16.3371 7.45387L16.2766 7.52397L10.4432 13.3573C10.2214 13.5792 9.87414 13.5994 9.62946 13.4178L9.55936 13.3573L3.72603 7.52397C3.48195 7.2799 3.48195 6.88417 3.72603 6.64009Z"
                          fill="#4A4B53"
                        />
                      </svg>
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
          {loading ? (
           <Loading/>):("")}
          
            <div className="searchContent-right" >
              {data.articles && data.articles.length > 0 ? (
                <>
                  <div className="SearchResult-Count-Filters">
                    <div className="SearchResult-Option-Left"
                      style={{
                          cursor: selectedArticles.length > 0 ? 'pointer' : '',
                          opacity: selectedArticles.length > 0 ? 1 : "", // Change opacity for a disabled effect
                        }}
                        title={selectedArticles.length === 0 ? 'Select atleast one article to annotate' : 'Annotate selected articles'}
                        >
                        {annotateLoading ? (
                            <div class="loader"></div>
                            
                          ):(
                            <button 
                            className={`SearchResult-Annotate ${selectedArticles.length > 0 ? "active" : "disabled"}`} 
                            
                            onClick={selectedArticles.length > 0 ? handleAnnotateClick : null} 
                            style={{ 
                              cursor: selectedArticles.length > 0 ? 'pointer' : '',
                              opacity: selectedArticles.length > 0 ? 1 : ""
                            }} 
                            title={selectedArticles.length === 0 ? 'Select an article' : 'Annotate selected articles'}
                          >
                            Annotate
                          </button>
                          )}
                    </div>

                    <div style={{display:"flex",flexDirection:"row",alignItems:"baseline"}}>
                      <div className="SearchResult-count" style={{ marginRight:"15px" }}>
                        <span style={{ color: "blue"}}>
                          
                          {data.articles.length}
                        </span>{" "}
                        results
                      </div>
                      <div style={{display:"flex",flexDirection:"row",alignItems:"baseline",gap:"5px"}}>
                        <span style={{color:"black", fontSize:"14px"}}>Sort by:</span>
                        <select className="SearchResult-dropdown" onChange={handleSortChange} value={selectedSort}>
          <option value="best_match">Most Relevant</option>
          <option value="publication_date">Publication Date</option>
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
    <button style={{ background: "none", border: "1px solid", padding: "0" }}>
    <input
  type="text" 
  value={pageInput === "" || pageInput === "0" ? pageInput : String(pageInput).padStart(2, "0")} 
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
    outline: "none"
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

                  <div className="searchContent-articles" ref={contentRightRef}>
  <div className="searchresults-list">
  {paginatedArticles.map((result, index) => {
    // Check if the similarity_score is available in the result or session storage
    let similarityScore = result.similarity_score;

    // If similarity score is not present in the result, retrieve it from session storage
    if (!similarityScore) {
      const storedData = sessionStorage.getItem('ResultData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const articles = parsedData.articles;

        // Find the article with the matching pmid in session storage and get similarity score
        articles.forEach((article) => {
          if (article.pmid === result.pmid) {
            similarityScore = article.similarity_score || 'N/A';
          }
        });
      }
    }

    return (
      <div key={index} className="searchresult-item" >
        <div className="searchresult-item-header" style={{display:"flex",flexDirection:"column"}}>
          <div >
          <h3 className="searchresult-title">
            <input
              type="checkbox"
              className="result-checkbox"
              onChange={() => handleCheckboxChange(result.pmid)}
              checked={selectedArticles.includes(result.pmid)} // Sync checkbox state
            />
              <span className="gradient-text"onClick={() => handleNavigate(result.pmid)}style={{ cursor: "pointer" }}>
                {italicizeTerm(
                    capitalizeFirstLetter(
                      openAnnotate
                        ? result.article_title.slice(0, 100) + (result.article_title.length > 100 ? "..." : "")
                        : result.article_title
                    )
                  )}
                </span>

          </h3>
        </div>
        <p className="searchresult-authors">{`Published on: ${result.publication_date}`}</p>
        <p className="searchresult-pmid">{`PMID: ${result.pmid}`}</p>
        <p
          className="searchresult-description"
          style={{ textAlign: "justify" }}
        >
          {italicizeTerm(
            Object.values(result.abstract_content[1])
              .join(" ")
              .slice(0, openAnnotate || openNotes ? 200 : 300)
          )}
          {Object.values(result.abstract_content[1]).join(" ").length > (openAnnotate || openNotes ? 200 : 300) ? "..." : ""}
        </p>
        </div>
        <div className="Article-Options">
          <p className="searchresult-similarity_score">
            <span style={{color:"#c05600"}}>Relevancy Score: </span>
            {similarityScore ? `${similarityScore.toFixed(2)} %` : 'N/A'}
          </p>
          <FontAwesomeIcon
            icon={regularBookmark}
            size="l"
            style={{ color: bookmarkedPmids[result.pmid] ? 'blue' : 'black', cursor: 'pointer' }}
            onClick={() => handleBookmarkClick(result.pmid)}
            title={bookmarkedPmids[result.pmid] ? 'Bookmarked' : 'Bookmark this article'}
          />
          {/* <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "3px", cursor: "pointer" }} title="Ask a question">
            <FontAwesomeIcon icon={faComment} />
            <p className="Ask-Question">Ask a Question</p>
          </div> */}
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
    <button style={{ background: "none", border: "1px solid", padding: "0" }}>
    <input
  type="text" 
  value={pageInput === "" || pageInput === "0" ? pageInput : String(pageInput).padStart(2, "0")} 
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
    outline: "none"
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
            
            <div className="search-right-aside">
              {openAnnotate && (
              <div className="search-annotate">
                
                <Annotation 
                    openAnnotate={openAnnotate} 
                    annotateData={annotateData}
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
                      className={`search-annotate-icon ${openAnnotate ? "open" : "closed"} ${annotateData && annotateData.length > 0 ? "" : "disabled"}`}
                      onClick={annotateData && annotateData.length > 0 ? handleAnnotate : null}
                      style={{
                        cursor: annotateData && annotateData.length > 0 ? 'pointer' : '',
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
      </div>
      
      <Footer />
    </div>
  );
};

export default SearchResults;
