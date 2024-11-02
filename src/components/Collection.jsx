import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchIcon from "../assets/images/Search.svg";
import "./Collection.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useParams, useLocation } from "react-router-dom";
import { IoCloseOutline } from "react-icons/io5";
const Collection = () => {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [text, setText] = useState("");
  const [filteredCollections, setFilteredCollections] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const token = useSelector((state) => state.auth.access_token);
  const user_id = user?.user_id; // Replace with actual user ID
  useEffect(() => {
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
        const fetchedCollections = response.data.collections || {};
        setCollections(fetchedCollections);
        setFilteredCollections(fetchedCollections);

        const savedCollectionName = localStorage.getItem(
          "selectedCollectionName"
        );
        if (savedCollectionName && fetchedCollections[savedCollectionName]) {
          setSelectedCollection({
            name: savedCollectionName,
            articles: fetchedCollections[savedCollectionName],
          });
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
      }
    };

    fetchCollections();
  }, [user_id, token]);

  const handleSelectCollection = (collectionName) => {
    const articles = collections[collectionName];
    setSelectedCollection({ name: collectionName, articles });
    localStorage.setItem("selectedCollectionName", collectionName);
  };

  const handleSearch = (e) => {
    const searchText = e.target.value;
    setText(searchText);
    const filtered = Object.fromEntries(
      Object.entries(collections).filter(([name]) =>
        name.toLowerCase().includes(searchText.toLowerCase())
      )
    );
    setFilteredCollections(filtered);
  };
  const handleArticleClick = (article_id, source) => {
    const sourceType =
      source === "BioRxiv"
        ? "bioRxiv_id"
        : source === "Public Library of Science (PLOS)"
        ? "plos_id"
        : "pmid";
    navigate(`/article/${sourceType}:${article_id}`, {
      state: {
        annotateData: [],
      },
    });
  };
  return (
    <>
      <div className="collections-list">
        <h3 className="collection-heading">My Collections</h3>

        <div className="Search-Collection">
          <img
            src={SearchIcon}
            alt="search"
            className="Search-collection-icon"
          />
          <input
            type="text"
            value={text}
            onChange={handleSearch}
            placeholder="Search collections..."
            className="Search-collection-input"
          />
        </div>
        {Object.keys(filteredCollections).length > 0 ? (
          Object.keys(filteredCollections).map((collectionName) => (
            <div
              key={collectionName}
              className={`collection-item ${
                selectedCollection?.name === collectionName ? "active" : ""
              }`}
              onClick={() => handleSelectCollection(collectionName)}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p style={{ margin: "0", padding: "0" }}>{collectionName}</p>
                <p style={{ margin: "0", padding: "0" }}>
                  {filteredCollections[collectionName].length} articles
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No collections found.</p>
        )}
      </div>
      <div className="articles-list">
        {selectedCollection ? (
          <>
            <h3 className="collection-articles-header">
              Articles in {selectedCollection.name}
            </h3>
            <button className="close-collection">
              <IoCloseOutline size={30} color="black" />
            </button>
            <table>
              <thead>
                <tr className="heading-row">
                  <th>ArticleId</th>
                  <th>Title</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {selectedCollection.articles.map((article) => (
                  <tr
                    key={article.article_id}
                    className="article-item"
                    onClick={() =>
                      handleArticleClick(
                        article.article_id,
                        article.article_source
                      )
                    }
                  >
                    <td>{article.article_id}</td>
                    <td>{article.article_title}</td>
                    <td>{article.article_source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p>Select a collection to view articles.</p>
        )}
      </div>
    </>
  );
};

export default Collection;
