// import React, { useState, useEffect } from "react";
// import "./Ratings.css";
// import axios from "axios";

// const Ratings = ({ uniqueId, isLoggedIn, token, user_id }) => {
//   const [rating, setRating] = useState(0);
//   const [averageRating, setAverageRating] = useState(0);
//   const [hover, setHover] = useState(0);

//   useEffect(() => {
//     // Load existing rating from sessionStorage (if available)
//     const savedRatings = JSON.parse(sessionStorage.getItem("ratingsGiven")) || [];
//     const existingRating = savedRatings.find((item) => item.uniqueId === uniqueId);
//     if (existingRating) {
//       setRating(existingRating.rating);
//     }

//     // Fetch average rating
//     fetchAverageRating();
//   }, [uniqueId]);

//   const fetchAverageRating = async () => {
//     try {
//       const response = await axios.get(`https://inferai.ai/api/rating/average/${uniqueId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setAverageRating(response.data.average_rating || 0);
//     } catch (error) {
//       console.error("Error fetching average rating:", error);
//     }
//   };

//   const handleRatingChange = async (value) => {
//     if (!isLoggedIn) return;
//     setRating(value);

//     // Save rating to sessionStorage
//     const updatedRatings = JSON.parse(sessionStorage.getItem("ratingsGiven")) || [];
//     const existingIndex = updatedRatings.findIndex((item) => item.uniqueId === uniqueId);

//     if (existingIndex !== -1) {
//       updatedRatings[existingIndex].rating = value;
//     } else {
//       updatedRatings.push({ uniqueId, rating: value });
//     }

//     sessionStorage.setItem("ratingsGiven", JSON.stringify(updatedRatings));

//     // Extract article source and ID
//     const [article_source, article_id] = uniqueId.split("_");

//     // API call to save rating
//     try {
//       await axios.post(
//         "https://inferai.ai/api/rating/rate",
//         {
//           user_id,
//           rating_data: {
//             article_id,
//             rating: value,
//             article_source,
//           },
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       fetchAverageRating(); // Update average rating after rating submission
//     } catch (error) {
//       console.error("Error saving rating:", error);
//     }
//   };

//   return (
//     <>
   
//       <div className="Rate-Article">
//         <div className="rate-article-div">
//           <span>Rate the article</span>
//         </div>
//         <div className="rate">
//           {[1, 2, 3, 4, 5].reverse().map((value) => {
//             const starFill =
//               value <= Math.floor(averageRating)
//                 ? "full"
//                 : value === Math.ceil(averageRating) && averageRating % 1 !== 0
//                 ? "half"
//                 : "empty";

//             return (
//               <label
//                 key={value}
//                 className={`star ${starFill}`}
//                 onClick={() => handleRatingChange(value)}
//                 onMouseEnter={() => isLoggedIn && setHover(value)}
//                 onMouseLeave={() => setHover(0)}
//                 title={`${value} star`}
//               >
//                 ★
//                 {starFill === "half" && <span className="half-star">★</span>}
//               </label>
//             );
//           })}
//         </div>
//       </div>
//       {/* <p className="average-rating">
//         Avg: {averageRating ? averageRating.toFixed(1) : "0.0"} / 5
//       </p> */}
//       </>
//   );
// };

// export default Ratings;

import React, { useState, useEffect } from "react";
import "./Ratings.css";
import axios from "axios";
import Rating from "./Rating";
import AverageRating from "./AverageRating";

const Ratings = ({ uniqueId, isLoggedIn, token, user_id }) => {
  const [userRating, setUserRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    // Load user's existing rating from sessionStorage
    const savedRatings = JSON.parse(sessionStorage.getItem("ratingsGiven")) || [];
    const existingRating = savedRatings.find((item) => item.uniqueId === uniqueId);
    if (existingRating) setUserRating(existingRating.rating);

    // Fetch average rating
    fetchAverageRating();
  }, [uniqueId]);

  // Fetch Average Rating from API
  const fetchAverageRating = async () => {
    try {
      const response = await axios.get(`https://inferai.ai/api/rating/average/${uniqueId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAverageRating(response.data.average_rating || 0);
    } catch (error) {
      console.error("Error fetching average rating:", error);
    }
  };

  // Handle Rating Change and API Call
  const handleRatingChange = async (value) => {
    if (!isLoggedIn) return;

    setUserRating(value);

    // Save rating locally
    const updatedRatings = JSON.parse(sessionStorage.getItem("ratingsGiven")) || [];
    const existingIndex = updatedRatings.findIndex((item) => item.uniqueId === uniqueId);
    if (existingIndex !== -1) {
      updatedRatings[existingIndex].rating = value;
    } else {
      updatedRatings.push({ uniqueId, rating: value });
    }
    sessionStorage.setItem("ratingsGiven", JSON.stringify(updatedRatings));

    // Extract article source and ID
    const [article_source, article_id] = uniqueId.split("_");

    // API call to save rating
    try {
      await axios.post(
        "https://inferai.ai/api/rating/rate",
        {
          user_id,
          rating_data: {
            article_id,
            rating: value,
            article_source,
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchAverageRating(); // Refresh average rating
    } catch (error) {
      console.error("Error saving rating:", error);
    }
  };

  return (
    <div className="ratings-container">
      <div className="rate-section">
        <h3>Rate the article</h3>
        <Rating currentRating={userRating} onRate={handleRatingChange} isLoggedIn={isLoggedIn} />
      </div>
      <div className="average-section">
        <AverageRating averageRating={averageRating} />
      </div>
    </div>
  );
};

export default Ratings;
