import React, { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import { useSelector } from "react-redux";
import Header from "../../components/Header-New";
import Footer from "../../components/Footer-New";
import LandingImage from "../../assets/images/image 1.svg";
import Left1 from "../../assets/images/Left1.svg";
import Left2 from "../../assets/images/Left2.svg";
import Right2 from "../../assets/images/Right2.svg";
import Right1 from "../../assets/images/Right1.svg";
import SearchBar from "../../components/SearchBar";
import points1 from "../../assets/images/points1.svg";
import points2 from "../../assets/images/points2.svg";
import points3 from "../../assets/images/points3.svg";
import points4 from "../../assets/images/points4.svg";
import History from "../../assets/images/Lander-History.svg";
import Help from "../../assets/images/Lander-Help.svg";
import Utilities from "../../assets/images/Lander-Utilities.svg";
import Analytics from "../../assets/images/Lander-Analytics.svg";
import { IoCloseOutline } from "react-icons/io5";
import "./Lander-Logedin.css";

//import Draggable from "react-draggable";
import Collection from "../../components/Collection";

import Notes from "../NotesPage/Notes";

const Lander = () => {
  const isLoggedIn = useSelector((state) => state.auth?.isLoggedIn);

  const [isLanderNotesOpen, setIsLanderNotesOpen] = useState(false);

  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { user } = useSelector((state) => state.auth);

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
  useEffect(() => {
    if (isLanderNotesOpen) {
      const centerX =
        (window.innerWidth - dimensions.width) / 2 + window.innerWidth * 0.365;
      const centerY = (window.innerHeight - dimensions.height) / 1.2;
      setPosition({ x: centerX, y: centerY });
    }
  }, [isLanderNotesOpen]);
  return (
    <div className="Landing-Container"
    style={isLoggedIn?{height:`${100}vh`}:{}}>
      <div className="Landing-Header">
        <Header />
      </div>

      <div className="Landing-Content">
        <div className="Landing-Content-Left">
          <img className="Left1" src={Left2} alt="Left Graphic 1" />
          <img className="Right2" src={Right2} alt="Right Graphic 2" />
          <img className="Left2" src={Left1} alt="Left Graphic 2" />
          <img className="Right1" src={Right1} alt="Right Graphic 1" />
          <div className="Landing-Content-Left-Content">
            <div>
              <h3 className="Landing-Welcome">
                Welcome to <span className="Landing-Infer">Infer!</span>
              </h3>
              <p className="Landing-Welcome-desc">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry. Lorem Ipsum has been the industry's standard dummy.
              </p>
              <SearchBar className={`Landing-Searchbar`} />
            </div>
          </div>
        </div>

        <div className="Landing-Content-Right">
          <img
            className="Landing-Content-Right-Image"
            src={LandingImage}
            alt="Landing Graphic"
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
              <a href="" onClick={handleOpenCollection}>
                Bookmarks
              </a>
              <a href="">Conversations</a>
              <a href="" onClick={handleOpenNotes}>
                Notes
              </a>
            </div>
            <div className="Feature-Item">
              <img
                className="Landing-Analytics-Icon"
                src={Analytics}
                alt="Landing-Analytics-Icon"
              />
              <h4>Analytics</h4>
              <a href="">Dashboard</a>
              <a href="">Reports</a>
              <a href="">Predictive Analysis</a>
            </div>
            <div className="Feature-Item">
              <img
                className="Landing-Utilities-Icon"
                src={Utilities}
                alt="Landing-Utilities-Icon"
              />
              <h4>Utilities</h4>
              <a href="">Annotations</a>
              <a href="">Citation</a>
              <a href="">Protocol</a>
            </div>
            <div className="Feature-Item">
              <img
                className="Landing-Help-Icon"
                src={Help}
                alt="Landing-Help-Icon"
              />
              <h4>Help</h4>
              <a href="">About Infer</a>
              <a href="">FAQs</a>
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
          onResizeStop={(e, direction, ref, delta, position) => {
            setDimensions({
              width: parseInt(ref.style.width, 10),
              height: parseInt(ref.style.height, 10),
            });
            setPosition(position);
          }}
          minWidth={400}
          minHeight={350}
          maxWidth={800}
          maxHeight={600}
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
            <div className="draggable-header">
              <button className="close-modal-notes" onClick={handleCloseNotes}>
                <IoCloseOutline size={30} color="black" />
              </button>
            </div>

            <div style={{ flex: 1 }}>
              <Notes
                isOpenNotes={isLanderNotesOpen}
                height={dimensions.height}
              />
            </div>
          </div>
        </Rnd>
      )}

      {isCollectionOpen && (
        <>
          <div className="blur-overlay">
            <button
              className="close-collection"
              onClick={handleCloseCollection}
            >
              <IoCloseOutline size={30} color="white" />
            </button>
          </div>
          <div className="collection-modal">
            <Collection />
          </div>
        </>
      )}
      <Footer />
    </div>
  );
};

export default Lander;
