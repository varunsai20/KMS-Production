import React, { useState, useEffect } from "react";
import "../../styles/variables.css";
import Button from "../../components/Buttons";
import Footer from "../../components/Footer";
import SearchBar from "../../components/SearchBar";
import "./LandingPage.css";
import points1 from "../../assets/images/points1.svg";
import points2 from "../../assets/images/points2.svg";
import points3 from "../../assets/images/points3.svg";
import points4 from "../../assets/images/points4.svg";
import Logo from "../../assets/images/Logo_New.svg"
const LandingPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const searchBar = document.querySelector(".Search-Bar");
      const searchBarOffset = searchBar.offsetTop + searchBar.offsetHeight;
      if (window.scrollY >= searchBarOffset) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
    }, 5000); // 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  });

  // Move to the next slide
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
  };

  // Move to the previous slide
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + data.length) % data.length);
  };
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    localStorage.removeItem("filters");
    localStorage.removeItem("history");
  }, []);

  const data = [
    {
      image: points1,
      title: "AI-Driven Data Curation",
      content:
        "Data Integration: InfER can aggregate and analyze vast amounts of data from diverse sources, including scientific literature, clinical trials, and genomic databases, enabling researchers to access comprehensive information quickly.The platform employs NLP techniques to interpret and summarize complex scientific texts, making it easier for researchers to stay updated on the latest findings and trends in their fields.Infer Solutions prioritizes ethical considerations in AI development, ensuring that the algorithms used in InfER are transparent and aligned with best practices in scientific research.Utilizing advanced generative AI algorithms, InfER can generate hypotheses, suggest experimental designs, and predict outcomes based on existing data, thereby accelerating the research process.",
    },
    {
      image: points2,
      title: "Seamless Integration",
      content:
        "InfER easily connects with popular platforms, allowing real-time data sharing and automatic updates.Users can create personalized dashboards to visualize data and track key metrics relevant to their research projects, enhancing decision-making and strategic planning.",
    },
    {
      image: points3,
      title: "Advanced Analytics Engine",
      content:
        "Natural Language Processing (NLP): The platform employs NLP techniques to interpret and summarize complex scientific texts, making it easier for researchers to stay updated on the latest findings and trends in their fields.",
    },
    {
      image: points4,
      title: "Collaborative Tools",
      content:
        "Collaboration Tools: InfER facilitates collaboration among researchers by providing tools for sharing data, insights, and findings in real-time, fostering a more interconnected research community.",
    },
  ];

  return (
    <div className="Container">
      <div className="Header">
        <div className={`Header-nav ${isSticky ? "sticky" : ""}`}>
          <img
            className="nav-logo"
            href="/"
            style={{ cursor: "pointer" }}
            src={Logo}
            alt="Infer logo"
          ></img>
          {isSticky && <SearchBar renderInputContainer={true} />}
          <section className="nav-login">
            <Button text="SignUp" className="signup-btn" />
            <Button text="Login" className="login-btn" />
          </section>
        </div>
        <h2>Focused On Unique Needs Of the Research Community</h2>
        <SearchBar
          className={`Search-Bar ${isSticky ? "sticky-search" : ""}`}
        />
      </div>
      <div className="Content">
        <div className="carousel">
          <div style={{ width: "100%" }}>
            <button className="carousel-button prev" onClick={prevSlide}>
              &#10094;
            </button>

            {/* Slide Content */}
            <div className="carousel-content">
              {data.map((item, index) => (
                <div
                  key={index}
                  className={`carousel-slide ${
                    index === currentIndex ? "active" : ""
                  }`}
                  style={{ display: index === currentIndex ? "block" : "none" }}
                >
                  <div className="card">
                    <div className="number">
                      <img src={item.image} alt={`Slide ${index + 1}`} />
                    </div>
                    <h3 className="card-title">{item.title}</h3>
                    <p className="card-content">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Next Button */}
            <button className="carousel-button next" onClick={nextSlide}>
              &#10095;
            </button>
          </div>

          {/* Carousel Indicators */}
          <div className="carousel-indicators">
            {data.map((_, index) => (
              <span
                key={index}
                className={`indicator ${
                  index === currentIndex ? "active" : ""
                }`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="Footer">
        <Footer />
      </div>
    </div>
  );
};

export default LandingPage;
