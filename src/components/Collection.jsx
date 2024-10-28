// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import "./Collection.css";
// import SearchIcon from "../assets/images/Search.svg";

// const Collection = () => {
//   const [collections, setCollections] = useState([]);
//   const [selectedCollection, setSelectedCollection] = useState(null);
//   const [text, setText] = useState("");
//   const [filteredCollections, setFilteredCollections] = useState([]);
//   const navigate = useNavigate();
//   // Fetch collections from localStorage on component mount
//   //   useEffect(() => {
//   //     const storedCollections =
//   //       JSON.parse(localStorage.getItem("collections")) || [];
//   //     setCollections(storedCollections);
//   //   }, []);

//   useEffect(() => {
//     const storedCollections =
//       JSON.parse(localStorage.getItem("collections")) || [];
//     setCollections(storedCollections);

//     // Retrieve the selected collection from localStorage
//     const savedCollectionName = localStorage.getItem("selectedCollectionName");
//     if (savedCollectionName) {
//       const savedCollection = storedCollections.find(
//         (col) => col.name === savedCollectionName
//       );
//       setSelectedCollection(savedCollection);
//     }
//   }, []);

//   // Handle collection selection
//   const handleSelectCollection = (collectionName) => {
//     const collection = collections.find((col) => col.name === collectionName);
//     setSelectedCollection(collection);
//   };
//   //   const handleSearch = (e) => {
//   //     setText(e.target.value);
//   //   };
//   const handleSearch = (e) => {
//     const searchText = e.target.value;
//     setText(searchText);

//     // Filter collections based on search text
//     const filteredCollections = collections.filter((collection) =>
//       collection.name.toLowerCase().includes(searchText.toLowerCase())
//     );
//     setFilteredCollections(filteredCollections);

//     // If a collection is selected, filter articles within it
//     // if (selectedCollection) {
//     //   const filteredArticles = selectedCollection.articles.filter((article) =>
//     //     article.toLowerCase().includes(searchText.toLowerCase())
//     //   );
//     //   setFilteredArticles(filteredArticles);
//     // }
//   };

//   const handleNavigate = () => {
//     navigate("/article/");
//   };
//   return (
//     <div className="collection-container">
//       <header className="Collection-header">
//         <h3 className="collection-heading">My Collections</h3>
//         <div className="Search-Collection">
//           <img
//             src={SearchIcon}
//             alt="search"
//             className="Search-collection-icon"
//           />
//           <input
//             type="text"
//             value={text}
//             onChange={handleSearch}
//             autoFocus
//             placeholder="Search..."
//             className="Search-collection-input"
//           />
//         </div>
//       </header>
//       <div className="collection-list">
//         <div className="new-collection">
//           {filteredCollections.length > 0 ? (
//             filteredCollections.map((collection) => (
//               <div
//                 key={collection.name}
//                 className="collection-item"
//                 onClick={() => handleSelectCollection(collection.name)}
//               >
//                 <p
//                   style={{
//                     fontSize: "16px",
//                     fontWeight: "600",
//                     fontFamily: "manrope",
//                     // margin: "0",
//                   }}
//                 >
//                   {collection.name}
//                 </p>
//                 <p
//                   style={{
//                     fontSize: "14px",
//                     fontFamily: "manrope",
//                     // margin: "0",
//                   }}
//                 >
//                   {collection.articles.length} articles
//                 </p>
//               </div>
//             ))
//           ) : (
//             <p>No collections found.</p>
//           )}
//         </div>
//         <div className="list">
//           {selectedCollection && (
//             <div className="collection-articles">
//               <div
//                 className="collection-articles-header"
//                 style={{ display: "flex", justifyContent: "center" }}
//               >
//                 {/* <button
//                   className="back-button"
//                   onClick={() => setSelectedCollection(null)}
//                 >
//                   Back
//                 </button> */}
//                 <h4>Articles in {selectedCollection.name}</h4>
//               </div>
//               <ul>
//                 {selectedCollection.articles.map((articleId) => (
//                   <li key={articleId}>
//                     <p>ID: {articleId}</p>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Collection;
import React, { useState, useEffect } from "react";
//import { IoCloseOutline } from "react-icons/io5";
import SearchIcon from "../assets/images/Search.svg";
import "./Collection.css";

const Collection = () => {
  //   const mockCollections = [
  //     {
  //       name: "Science Articles",
  //       articles: ["001", "002", "003", "004", "005", "006", "007", "008", "009"],
  //     },
  //     { name: "Scence Articles", articles: ["001", "002", "003", "004"] },
  //     { name: "Scence rticles", articles: ["001", "002", "003", "004"] },
  //     { name: "Technology Insghts", articles: ["005", "006", "007"] },
  //     { name: "Technology Insights", articles: ["005", "006", "007"] },
  //     { name: "Technology Isights", articles: ["005", "006", "007"] },
  //     { name: "Health & Wellness", articles: ["008", "009"] },
  //     { name: "Health & Welns", articles: ["008", "009"] },
  //     { name: "Health & Welness", articles: ["008", "009"] },
  //     { name: "Halth & Welness", articles: ["008", "009"] },
  //     { name: "Helth & Welness", articles: ["008", "009"] },
  //   ];
  const mockCollections = [
    {
      name: "Science Articles",
      articles: [
        {
          id: "001",
          title: "Genomic Insights into Human Evolution",
          source: "PubMed",
        },
        {
          id: "002",
          title: "CRISPR Technology in Modern Medicine",
          source: "PLOS",
        },
        { id: "003", title: "Advances in Quantum Biology", source: "BioRxiv" },
        {
          id: "004",
          title: "Climate Change and Ecosystem Shifts",
          source: "PubMed",
        },
        {
          id: "005",
          title: "Artificial Intelligence in Biochemistry",
          source: "PLOS",
        },
        {
          id: "006",
          title: "New Frontiers in Neuroscience",
          source: "BioRxiv",
        },
        {
          id: "007",
          title: "Applications of Microbiome Research",
          source: "PubMed",
        },
        {
          id: "008",
          title: "Bioinformatics and Protein Structure",
          source: "PLOS",
        },
        { id: "009", title: "Vaccines and Immune Response", source: "BioRxiv" },
      ],
    },
    {
      name: "Science Articles - Part II",
      articles: [
        { id: "010", title: "Genetic Markers of Disease", source: "PubMed" },
        {
          id: "011",
          title: "Stem Cell Therapies for Cancer",
          source: "BioRxiv",
        },
        {
          id: "012",
          title: "Impacts of CRISPR on Gene Editing",
          source: "PLOS",
        },
        {
          id: "013",
          title: "Environmental DNA Applications",
          source: "PubMed",
        },
      ],
    },
    {
      name: "Technology Insights",
      articles: [
        {
          id: "014",
          title: "Blockchain in Health Data Security",
          source: "PLOS",
        },
        {
          id: "015",
          title: "Quantum Computing for Drug Discovery",
          source: "PubMed",
        },
        {
          id: "016",
          title: "5G and Healthcare Innovations",
          source: "BioRxiv",
        },
      ],
    },
    {
      name: "Health & Wellness",
      articles: [
        {
          id: "017",
          title: "Mental Health Trends in the Modern Era",
          source: "PubMed",
        },
        {
          id: "018",
          title: "Nutritional Science and Longevity",
          source: "PLOS",
        },
      ],
    },
    {
      name: "Health & Wellness - Expanded",
      articles: [
        {
          id: "019",
          title: "Physical Exercise and Cardiovascular Health",
          source: "BioRxiv",
        },
        {
          id: "020",
          title: "Impact of Sleep on Cognitive Function",
          source: "PubMed",
        },
      ],
    },
  ];

  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [text, setText] = useState("");
  const [filteredCollections, setFilteredCollections] =
    useState(mockCollections);

  useEffect(() => {
    setCollections(mockCollections);
    const savedCollectionName = localStorage.getItem("selectedCollectionName");
    if (savedCollectionName) {
      const savedCollection = mockCollections.find(
        (col) => col.name === savedCollectionName
      );
      setSelectedCollection(savedCollection);
    }
  }, []);

  const handleSelectCollection = (collectionName) => {
    const collection = collections.find((col) => col.name === collectionName);
    setSelectedCollection(collection);
    localStorage.setItem("selectedCollectionName", collectionName);
  };

  const handleSearch = (e) => {
    const searchText = e.target.value;
    setText(searchText);
    const filtered = collections.filter((collection) =>
      collection.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredCollections(filtered);
  };

  return (
    <>
      {/* <div className="collection-modal"> */}
      {/* <button
          className="close-collection"
          onClick={() => setSelectedCollection(null)}
        >
          <IoCloseOutline size={30} color="#1A82FF" />
        </button> */}
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
        {filteredCollections.length > 0 ? (
          filteredCollections.map((collection) => (
            <div
              key={collection.name}
              className={`collection-item ${
                selectedCollection?.name === collection.name ? "active" : ""
              }`}
              onClick={() => handleSelectCollection(collection.name)}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p style={{ margin: "0", padding: "0" }}>{collection.name}</p>
                <p style={{ margin: "0", padding: "0" }}>
                  {collection.articles.length} articles
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
                    key={article.id} // Use a unique identifier for the key
                    className="article-item"
                    onClick={() => alert(`Viewing article ${article.id}`)}
                  >
                    <td>{article.id}</td>
                    <td>{article.title}</td>
                    <td>{article.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* <ul>
              {selectedCollection.articles.map((article) => (
                <li
                  key={article}
                  className="article-item"
                  onClick={() => alert(`Viewing article ${article}`)}
                >
                  <div className="item">
                    <span className="label">PMID:</span>
                    <span className="value">{article.id}</span>
                  </div>

                  <div className="item">
                    <span className="label">Title:</span>
                    <span className="value">{article.title}</span>
                  </div>

                  <div className="item">
                    <span className="label">Source:</span>
                    <span className="value">{article.source}</span>
                  </div>
                </li>
              ))}
            </ul> */}
          </>
        ) : (
          <p>Select a collection to view articles.</p>
        )}
      </div>
      {/* </div> */}
    </>
  );
};

export default Collection;
