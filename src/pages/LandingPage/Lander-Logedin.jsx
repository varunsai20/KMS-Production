import React, { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setDeriveInsights } from "../../redux/reducers/deriveInsights";
import Header from "../../components/Header-New";
import Footer from "../../components/Footer-New";
import LandingImage from "../../assets/images/image 1.svg";
import circle from "../../assets/images/Left1.svg";
import ReactLogo from "../../assets/images/Left2.svg";
import Bulb from "../../assets/images/Right2.svg";
import Molecules from "../../assets/images/Right1.svg";
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
import axios from "axios";
//import Draggable from "react-draggable";
import Collection from "../../components/Collection";
import Citations from "../../components/Citations";
import GenerateAnnotate from "../../components/GenerateAnnotate";

import Notes from "../NotesPage/Notes";
import { toast } from "react-toastify";

const Lander = () => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth?.isLoggedIn);
  const [sessions, setSessions] = useState([]);
  const [isLanderNotesOpen, setIsLanderNotesOpen] = useState(false);
  //const [openInsights, setOpenInsights] = useState(false);
  const [refreshSessions, setRefreshSessions] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [isCitationsOpen, setIsCitationsOpen] = useState(false);
  const [isAnnotateOpen, setIsAnnotateOpen] = useState(false);

  const [openInsights, setOpenInsights] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 400, height: 380 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { user } = useSelector((state) => state.auth);
  const token = useSelector((state) => state.auth.access_token);
  const user_id = user?.user_id;
  const [isDeriveInsights, setIsDeriveInsights] = useState(false);
  const navigate = useNavigate();
  const handleOpenNotes = () => {
    setIsLanderNotesOpen(true);
  };

  const handleCloseNotes = () => {
    setIsLanderNotesOpen(false);
  };
  const handleOpenCollection = () => {
    setIsCollectionOpen(true);
  };
  const handleCloseCollection = () => {
    setIsCollectionOpen(false);
  };
  const handleOpenCitations = () => {
    setIsCitationsOpen(true);
  };
  const handleCloseCitations = () => {
    setIsCitationsOpen(false);
  };

  const handleOpenAnnotate = () => {
    setIsAnnotateOpen(true);
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

  // const handleCloseInsights = () => {};
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get(
          `http://13.127.207.184:80/history/conversations/history/${user_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data?.sessions) {
          const sessionsData = response.data.sessions.reverse(); // Reverse the array order
          console.log(sessionsData);
          setSessions(sessionsData); // Set the reversed sessions array to state
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
  }, [user_id, token]);

  console.log(sessions);
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
    console.log(sessions[0]);
    try {
      const conversationResponse = await axios.get(
        `http://13.127.207.184:80/history/conversations/history/${user_id}/${session_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(conversationResponse);

      const formattedChatHistory = [];
      let currentEntry = {};

      conversationResponse.data.conversation.forEach((entry) => {
        if (entry.role === "user") {
          if (entry.file_url) {
            currentEntry.file_url = entry.file_url;
          }
          if (currentEntry.query) {
            formattedChatHistory.push(currentEntry);
            currentEntry = {};
          }
          if (Array.isArray(entry.parts)) {
            currentEntry.query = entry.parts.join(" ");
          }
        } else if (entry.role === "model") {
          if (Array.isArray(entry.parts)) {
            currentEntry.response = entry.parts.join(" ");
          }
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

      const article_id = conversationResponse.data.article_id;

      const navigatePath = conversationResponse.data.session_type
        ? "/article/derive"
        : `/article/content/${sourceType}:${article_id}`;
      console.log(navigatePath);
      // console.log(session_type)
      if (conversationResponse.data.session_type) {
        dispatch(setDeriveInsights(true));
      } else {
        dispatch(setDeriveInsights(false));
      }

      navigate(navigatePath, {
        state: {
          id: article_id,
          source: sourceType,
          token: token,
          user: { access_token: token, user_id: user_id },
        },
      });
    } catch (error) {
      console.error("Error fetching article or conversation data:", error);
    }
  };

  // useEffect(() => {
  //   if (isLanderNotesOpen) {
  //     const centerX =
  //       (window.innerWidth - dimensions.width) / 2 + window.innerWidth * 0.365;
  //     const centerY = (window.innerHeight - dimensions.height) / 1.2;
  //     setPosition({ x: centerX, y: centerY });
  //   }
  // }, [isLanderNotesOpen]);
  useEffect(() => {
    if (isLanderNotesOpen) {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const bottomRightX = viewportWidth - dimensions.width - 20;
      const bottomRightY = viewportHeight - dimensions.height - 20;

      setPosition({ x: bottomRightX, y: bottomRightY });
    }
  }, [isLanderNotesOpen]);

  return (
    <div
      className="Landing-Container"
      // style={isLoggedIn ? { height: `${100}vh` } : {}}
    >
      <div className="Landing-Header">
        <Header />
      </div>
    
      <div className="Landing-Content">
        <div className="Landing-Content-Left">
          <img className="Right2" src={ReactLogo} alt="Right Graphic 2" />
          <img className="Left1" src={Bulb} alt="Left Graphic 1" />
          <img className="Left2" src={circle} alt="Left Graphic 2" />
          <img className="Right1" src={Molecules} alt="Right Graphic 1" />
          <div className="welcome-search">
            <h3 className="Landing-Welcome">
              Welcome to <span className="Landing-Infer">Inferai!</span>
            </h3>
            <p className="Landing-Welcome-desc">
              Inferai by Infer Solutions, Inc, a cutting-edge product leveraging
              generative AI to revolutionize research in pharmaceuticals,
              biotechnology, and healthcare. This innovative platform
              streamlines research processes, enhances data analysis, and
              uncovers new insights.
            </p>
            <SearchBar className={`Landing-Searchbar`} />
          </div>
          {/* </div> */}
        </div>

        <div className="Landing-Content-Right">
          <img
            className="Landing-Content-Right-Image"
            src={LandingImage}
            alt="Landing Graphic"
            style={{
              height: "-webkit-fill-available",
              maxWidth: "234px",
              // maxHeight: "254px",
              mixBlendMode: "color-burn",
            }}
          />
        </div>
      </div>

      <div className="Landing-Features">
        {isLoggedIn ? (
          // Show this section if logged in
          <>
            <div className="Feature-Item">
              <img
                className="Landing-History-Icon"
                src={History}
                alt="Landing-History-Icon"
              />
              <h4>History</h4>

              <span onClick={handleOpenCollection}>Bookmarks</span>
              <span onClick={handleSessionClick}>Conversations</span>
              <span onClick={handleOpenNotes}>
                {/* <a href="#" onClick={handleOpenNotes}> */}
                Notes
              </span>
            </div>
            <div className="Feature-Item">
              <img
                className="Landing-Analytics-Icon"
                src={Analytics}
                alt="Landing-Analytics-Icon"
              />
              <h4>Analytics</h4>

              <span>Dashboard</span>
              <span>Reports</span>

              <span onClick={handleOpenInsights}>Derive Insights</span>
            </div>

            <div className="Feature-Item">
              <img
                className="Landing-Utilities-Icon"
                src={Utilities}
                alt="Landing-Utilities-Icon"
              />
              <h4>Utilities</h4>

              <span onClick={handleOpenAnnotate}>Annotations</span>
              <span onClick={handleOpenCitations}>Citation</span>
              <span>Protocol</span>
            </div>
            <div className="Feature-Item">
              <img
                className="Landing-Help-Icon"
                src={Help}
                alt="Landing-Help-Icon"
              />
              <h4>Help</h4>

              <span>About Infer</span>
              <span>FAQs</span>
            </div>
          </>
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
                  InfER’s system helps speed up research by organizing data,
                  making it easy to connect with different data sources.
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
                  InfER easily connects with popular platforms, allowing
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
                  Uses smart technology to provide insights through forecasts,
                  live data displays, and in-depth analysis.
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
                  InfER’s Collaborative Tools make it easy for teams to share
                  data, add comments, & give feedback in real time.
                </p>
              </div>
            </div>
          </section>
        )}
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
          minWidth={400}
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
              border: "1px solid #ddd",
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

            <div style={{ flex: 1 }}>
              <Notes
                isOpenNotes={isLanderNotesOpen}
                height={dimensions.height}
                oncloseNotes={handleCloseNotes}
              />
            </div>
          </div>
        </Rnd>
      )}

      {isCollectionOpen && (
        <>
          <div className="blur-overlay">
            <div className="collection-modal">
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
