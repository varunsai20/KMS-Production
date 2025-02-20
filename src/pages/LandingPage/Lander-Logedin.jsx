import React, { useState, useEffect,useRef } from "react";
import { Rnd } from "react-rnd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setDeriveInsights } from "../../redux/reducers/deriveInsights";
import Header from "../../components/Header-New";
import Footer from "../../components/Footer-New";
import SearchBar from "../../components/SearchBar";
import points1 from "../../assets/images/points1.svg";
import points2 from "../../assets/images/points2.svg";
import points3 from "../../assets/images/points3.svg";
import points4 from "../../assets/images/points4.svg";
import History from "../../assets/images/Lander-History.svg";
import Help from "../../assets/images/Lander-Help.svg";
import Utilities from "../../assets/images/Lander-Utilities.svg";
import Analytics from "../../assets/images/Lander-Analytics.svg";
import "./Lander-Logedin.css";

import { apiService } from "../../assets/api/apiService";
import Collection from "../../components/Collection";
import Citations from "../../components/Citations";
import GenerateAnnotate from "../../components/GenerateAnnotate";
import Logo from "../../assets/images/InfersolD17aR04aP01ZL-Polk4a 1.svg";
import SearchTermMissing from "../../components/SearchTermMissing";
import Notes from "../NotesPage/Notes";
import { toast } from "react-toastify";

const Lander = () => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth?.isLoggedIn);
  const [sessions, setSessions] = useState([]);
  const [isLanderNotesOpen, setIsLanderNotesOpen] = useState(false);
  const [termMissing, setTermMissing] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [isCitationsOpen, setIsCitationsOpen] = useState(false);
  const [isAnnotateOpen, setIsAnnotateOpen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 340, height: 350 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { user } = useSelector((state) => state.auth);
  const token = useSelector((state) => state.auth.access_token);
  const user_id = user?.user_id;
  const [hasBeenDragged, setHasBeenDragged] = useState(false);
  const navigate = useNavigate();
  const[isModalOverlay,setIsModalOverlay] = useState(false);
  // useEffect(()=>{
  //   sessionStorage.removeItem("currentPage")
  // })
  useEffect(() => {
    if (termMissing) {
      // Set a timeout to hide the error message after 5 seconds
      const timer = setTimeout(() => {
        setTermMissing(false); // Set termMissing to false after 5 seconds
      }, 3000);

      // Cleanup the timeout on component unmount or if termMissing changes
      return () => clearTimeout(timer);
    }
  }, [termMissing]);
  
  const handleOpenCollection = () => {
    setIsCollectionOpen(true);
  };

  const handleCloseCitations = () => {
    setIsCitationsOpen(false);
  };

  const handleCloseAnnotate = () => {
    setIsAnnotateOpen(false);
  };

  const handleOpenInsights = () => {
    sessionStorage.setItem("clickedDerive", true);
    dispatch(setDeriveInsights(true)); // Set deriveInsights in Redux state
    navigate("/article/derive", {
      state: {
        deriveInsights: true,
      },
    });
  };
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await apiService.fetchSessions(user_id, token);
        if (response.data?.sessions) {
          const sessionsData = response.data.sessions.reverse();
          setSessions(sessionsData);
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    if (user_id && token) {
      fetchSessions();
      dispatch(setDeriveInsights(false));

      localStorage.setItem("chatHistory", []);
    }
  }, [user_id, token, dispatch]);

  const handleSessionClick = async () => {
    if (sessions.length === 0) {
      toast.error("No conversations currently", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    const { session_id } = sessions[0];
    localStorage.setItem("session_id", session_id);
    try {
      // Fetch the conversation data
      const conversationResponse = await apiService.fetchChatConversation(
        user_id,
        session_id,
        token
      );

      // Save session ID in local and session storage
      localStorage.setItem("session_id", session_id);
      sessionStorage.setItem("session_id", session_id);

      // Initialize chat history
      let formattedChatHistory = [];

      // Format and store chat history only if data is present and valid
      if (conversationResponse.data.conversation?.length > 0) {
        formattedChatHistory = conversationResponse.data.conversation
          .map((entry) => ({
            query: entry.role === "user" ? entry.content : null,
            response: entry.role === "assistant" ? entry.content : null,
            file_url: entry.file_url || null,
          }))
          .filter(
            (entry) => entry.query || entry.response || entry.file_url // Keep entries with at least one valid field
          );

        if (formattedChatHistory.length > 0) {
          localStorage.setItem(
            "chatHistory",
            JSON.stringify(formattedChatHistory)
          );
        }
      }

      // Extract and store other session details if they are present
      const { source, session_type, session_title } =
        conversationResponse.data || {};

      // Define navigation path based on session type
      const navigatePath =
        session_type === "file_type"
          ? "/article/derive"
          : `/article/content/${source}:${conversationResponse.data?.article_id}`;

      // Clear annotation data and update state

      // Navigate based on session type
      if (session_type === "file_type") {
        dispatch(setDeriveInsights(true));
        navigate(navigatePath, {
          state: {
            session_id,
            source,
            token,
            user: { access_token: token, user_id },
            chatHistory: formattedChatHistory,
            sessionTitle: session_title,
          },
        });
      } else if (conversationResponse.data.article_id) {
        dispatch(setDeriveInsights(false));
        navigate(navigatePath, {
          state: {
            id: conversationResponse.data.article_id,
            source,
            token,
            user: { access_token: token, user_id },
            chatHistory: formattedChatHistory,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching article or conversation data:", error);
    }
  };

  useEffect(() => {
    if (isLanderNotesOpen && !hasBeenDragged) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const bottomRightX = viewportWidth - dimensions.width - 20;
      const bottomRightY = viewportHeight - dimensions.height - 20;

      setPosition({ x: bottomRightX, y: bottomRightY });
    }
  }, [isLanderNotesOpen, dimensions.width, dimensions.height, hasBeenDragged]);

  useEffect(() => {
    const handleResize = () => {
      if (!hasBeenDragged) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const bottomRightX = viewportWidth - dimensions.width - 20;
        const bottomRightY = viewportHeight - dimensions.height - 20;

        setPosition({ x: bottomRightX, y: bottomRightY });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [dimensions.width, dimensions.height, hasBeenDragged]);

  const handleDragStop = (e, d) => {
    setPosition({ x: d.x, y: d.y });
    setHasBeenDragged(true); // Mark as dragged
  };

  const handleOpenNotes = () => {
    setIsLanderNotesOpen(true);
  };

  const handleCloseNotes = () => {
    setIsLanderNotesOpen(false);
    setHasBeenDragged(false); // Reset drag state on close
  };
  return (
    <div className="Landing-Container">
      <div className="Landing-Header">
        <Header />
      </div>
      <div className="Landing-main-content">
          <div className="Landing-Content">
            <div className="welcome-search">
              <img src={Logo} alt="inferAI-logo" className="inferai-logo" />
              <div className="search-bar-div" style={{ position: "relative" }}>
                <SearchBar
                  className="Landingpage-SearchBar"
                  // landingWidth="auto"
                  zIndex="0"
                  setTermMissing={setTermMissing}
                ></SearchBar>

                {/* TermMissing Outbox */}
                {/* {termMissing && (
                  <div className="search-term-missing-container">
                    <div className="search-term-missing-error">
                      <div className="error-arrow"></div>
                      <span>Search Term is Missing</span>
                    </div>
                  </div>
                )} */}
                <SearchTermMissing
                  termMissing={termMissing}
                  setTermMissing={setTermMissing}
                />
              </div>
              <p className="Landing-Welcome-desc">
                <span className="highlight-context-infer-out">Infer</span>
                <span className="highlight-context-ai-out">ai</span> (
                <span className="highlight-context-infer">In</span>formation{" "}
                <span className="highlight-context-infer">F</span>or{" "}
                <span className="highlight-context-infer">E</span>xcellence in{" "}
                <span className="highlight-context-infer">R</span>esearch using{" "}
                <span className="highlight-context-ai">A</span>rtifical{" "}
                <span className="highlight-context-ai">I</span>ntelligence) by Infer
                Solutions, Inc, a cutting-edge product leveraging Artificial
                Intelligence to revolutionize research in the life sciences
                industry. This innovative platform streamlines research processes,
                enhances data analysis, and uncovers new insights.
              </p>
            </div>
          </div>

          <div className="Landing-Features">
            {isLoggedIn ? (
              // Show this section if logged in
              <div className="LoggedinFeatures">
                <div className="Feature-Item">
                  <img
                    className="Landing-History-Icon"
                    src={History}
                    alt="Landing-History-Icon"
                  />
                  <h4>History</h4>

                  <span onClick={handleOpenCollection}>Bookmarks</span>
                  <span onClick={handleSessionClick}>Conversations</span>
                  <span onClick={handleOpenNotes}>Notes</span>
                </div>
                <div className="Feature-Item">
                  <img
                    className="Landing-Analytics-Icon"
                    src={Analytics}
                    alt="Landing-Analytics-Icon"
                  />
                  <h4>Analytics</h4>

                  <span style={{}} title="This feature will ">
                    Dashboard
                  </span>
                  <span>Reports</span>
                </div>

                <div className="Feature-Item">
                  <img
                    className="Landing-Utilities-Icon"
                    src={Utilities}
                    alt="Landing-Utilities-Icon"
                  />
                  <h4>Utilities</h4>
                  <span onClick={handleOpenInsights}>Derive Insights</span>
                  {/* <span onClick={handleOpenAnnotate}>Annotations</span> */}
                  {/* <span onClick={handleOpenCitations}>Citation</span> */}
                  <span>Job Scheduler</span>
                  <span>LifeSciHub</span>
                </div>
                <div className="Feature-Item">
                  <img
                    className="Landing-Help-Icon"
                    src={Help}
                    alt="Landing-Help-Icon"
                  />
                  <h4>Help</h4>
                  <span>User Guide</span>
                  {/* <span>About Infer</span> */}
                  <a
                    href="https://www.infersol.com/about-infer-solutions-inc/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none", color: "#007BFF" }}
                  >
                    About Infer
                  </a>
                  <span>FAQs</span>
                </div>
              </div>
            ) : (
              // Show this section if not logged in
              <section className="WhyInfer-points">
                <div className="Landing-Features-card">
                  <div className="Landing-Features-card-Inner">
                    <div className="number number-1">
                      <img src={points1} alt="Icon 1" />
                    </div>
                    <h3 className="card-title">AI-Driven Data Curation</h3>
                    <p className="card-content">
                      Inferai helps speed up research by organizing data, making it
                      easy to connect with different content sources.
                    </p>
                  </div>
                </div>
                <div className="Landing-Features-card">
                  <div className="Landing-Features-card-Inner">
                    <div className="number number-2">
                      <img src={points2} alt="Icon 2" />
                    </div>
                    <h3 className="card-title">Seamless Integration</h3>
                    <p className="card-content">
                      Inferai seamlessly integrates with popular platforms, allowing
                      real-time data sharing and automatic updates.
                    </p>
                  </div>
                </div>
                <div className="Landing-Features-card">
                  <div className="Landing-Features-card-Inner">
                    <div className="number number-3">
                      <img src={points3} alt="Icon 3" />
                    </div>
                    <h3 className="card-title">Advanced Analytics Engine</h3>
                    <p className="card-content">
                      Inferai leverages Artificial Intelligence to provide insights
                      through forecasts, live data displays, and in-depth analysis.
                    </p>
                  </div>
                </div>
                <div className="Landing-Features-card">
                  <div className="Landing-Features-card-Inner">
                    <div className="number number-4">
                      <img src={points4} alt="Icon 4" />
                    </div>
                    <h3 className="card-title">Collaborative Tools</h3>
                    <p className="card-content">
                      Inferai's collaborative tools make it easy for researchers to
                      share data, rate content, make notes, & give feedback in real
                      time.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
      </div>
      {isLanderNotesOpen && (
        <Rnd
          
          size={{ width: dimensions.width, height: dimensions.height }}
          position={{ x: position.x, y: position.y }}
          onDragStop={(e, d) => {
            setPosition({ x: d.x, y: d.y });
          }}
          style={{ zIndex: 1 }}
          onResizeStop={(e, direction, ref, delta, position) => {
            setDimensions({
              width: parseInt(ref.style.width, 10),
              height: parseInt(ref.style.height, 10),
            });
            setPosition(position);
          }}
          minWidth={340}
          minHeight={350}
          // maxWidth={800}
          // maxHeight={600}
          maxWidth={Math.min(800, window.innerWidth)}
          maxHeight={Math.min(600, window.innerHeight)}
          bounds="window"
          enableResizing={{
            top: true,
            right: true,
            bottom: true,
            left: true,
            topRight: true,
            bottomRight: true,
            bottomLeft: true,
            topLeft: true,
          }}
          dragHandleClassName="draggable-header"
        >
          <div
            className="notes-modal"
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
            
              className="draggable-header"
              style={{
                cursor: "move",
                padding: "10px",
                position: "absolute",
                height: "2.5vh",
                width: "95%",
              }}
            ></div>

            <div  style={{ flex: 1 }}>
              <Notes
                isOpenNotes={isLanderNotesOpen}
                height={dimensions.height}
                oncloseNotes={handleCloseNotes}
                isModalOverlay={isModalOverlay}
                setIsModalOverlay={setIsModalOverlay}
              />
            </div>
          </div>
        </Rnd>
      )}

      {isCollectionOpen && (
        <>
          <div className="blur-overlay">
            <div className="collection-modal">
        {/* <h3 className="collection-heading">My Collections</h3> */}

              <Collection setIsCollectionOpen={setIsCollectionOpen} />
            </div>
          </div>
        </>
      )}
      {isCitationsOpen && (
        <>
          <div className="citation-overlay">
            <div className="citation-modal">
              <Citations handleCloseCitations={handleCloseCitations} />
            </div>
          </div>
        </>
      )}
      {isAnnotateOpen && (
        <>
          <div className="annotate-overlay">
            <div className="annotate-modal">
              <GenerateAnnotate handleCloseAnnotate={handleCloseAnnotate} />
            </div>
          </div>
        </>
      )}
      
      <Footer />
    </div>
  );
};

export default Lander;
