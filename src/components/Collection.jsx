import React, { useState, useEffect } from "react";
import SearchIcon from "../assets/images/Search.svg";
import "./Collection.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoCloseOutline } from "react-icons/io5";
import { apiService } from "../assets/api/apiService";

const Collection = ({ setIsCollectionOpen }) => {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [text, setText] = useState("");
  const [filteredArticles, setFilteredArticles] = useState([]);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const token = useSelector((state) => state.auth.access_token);
  const user_id = user?.user_id;

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await apiService.fetchCollections(user_id, token);
        const fetchedCollections = response.data.collections || {};
        setCollections(fetchedCollections);

        const savedCollectionName = localStorage.getItem(
          "selectedCollectionName"
        );
        if (savedCollectionName && fetchedCollections[savedCollectionName]) {
          setSelectedCollection({
            name: savedCollectionName,
            articles: fetchedCollections[savedCollectionName],
          });
          setFilteredArticles(fetchedCollections[savedCollectionName]); // Initial article list
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
    setFilteredArticles(articles); // Reset filtered articles when selecting a new collection
    localStorage.setItem("selectedCollectionName", collectionName);
  };

  const handleSearch = (e) => {
    const searchText = e.target.value;
    setText(searchText);
    if (selectedCollection) {
      const filtered = selectedCollection.articles
        .filter(
          (article) =>
            article.article_id.toString().includes(searchText) ||
            article.article_title
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            article.article_source
              .toLowerCase()
              .includes(searchText.toLowerCase())
        )
        .sort((a, b) => a.article_title.localeCompare(b.article_title)); // Sort alphabetically by title
      setFilteredArticles(filtered);
    }
  };
  const handleCloseCollection = () => {
    setIsCollectionOpen(false);
  };
  const handleArticleClick = (article_id, source) => {
    
    const sourceType =
  source === "BioRxiv" || source === "biorxiv"
    ? "bioRxiv_id"
    : source === "Public Library of Science (PLOS)" || source === "plos"
    ? "plos_id"
    : "pmid";

    navigate(`/article/content/${sourceType}:${article_id}`, {
      state: {
        annotateData: [],
      },
    });
  };

  return (
    <>
      <div className="collections-list">
        <h3 className="collection-heading" style={{display:"block"}}>My Collections</h3>

        {Object.keys(collections).length > 0 ? (
          Object.keys(collections).map((collectionName) => (
            <div
              key={collectionName}
              className={`collection-item ${
                selectedCollection?.name === collectionName ? "active" : ""
              }`}
              onClick={() => handleSelectCollection(collectionName)}
            >
              <div className="collection-item-list">
                <p >{collectionName}</p>
                <p>
                {`${collections[collectionName].length} (articles)`}
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
          <div className="collection-heading">

            <h3 className="collection-articles-header">
              Articles in {selectedCollection.name}
            </h3>
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
                placeholder="Search articles"
                className="Search-collection-input"
              />
          </div>
            </div>
            <table>
              <thead>
                <tr className="heading-row">
                  <th className="bookmark-articleId" >ArticleId</th>
                  <th className="bookmark-Title">Title</th>
                  <th className="bookmark-Source">Source</th>
                  {/* <th style={{ width: "1%" }}></th> */}
                </tr>
              </thead>
              <div className="scrollable-tbody">
                <tbody>
                  {filteredArticles.map((article) => (
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
                      <td className="bookmark-articleId">
                        {article.article_id}
                      </td>
                      <td className="bookmark-Title">
                        {article.article_title}
                      </td>
                      <td className="bookmark-Source">
                        {article.article_source}
                      </td>
                      {/* <td style={{ width: "1%" }}></td> */}
                    </tr>
                  ))}
                </tbody>
              </div>
            </table>
          </>
        ) : (
          <p>Select a collection to view articles.</p>
        )}
      </div>
      <button className="close-collection" onClick={handleCloseCollection}>
        <IoCloseOutline size={30} color="black" />
      </button>
    </>
  );
};

export default Collection;
