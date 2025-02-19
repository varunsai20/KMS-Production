import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const AverageRating = ({ averageRating }) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (averageRating >= i) {
      stars.push(<FaStar key={i} size={30} color="#f39c12" />);
    } else if (averageRating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} size={30} color="#f39c12" />);
    } else {
      stars.push(<FaRegStar key={i} size={30} color="#ccc" />);
    }
  }

  return (
    <div className="average-rating">
      {stars}
      <p>{averageRating ? averageRating.toFixed(1) : "0.0"} / 5</p>
    </div>
  );
};

export default AverageRating;
