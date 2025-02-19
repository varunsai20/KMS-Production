import React, { useState } from "react";
import { FaStar } from "react-icons/fa";

const Rating = ({ currentRating, onRate, isLoggedIn }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="rating-stars">
      {[1, 2, 3, 4, 5].map((value) => (
        <FaStar
          key={value}
          size={30}
          color={value <= (hover || currentRating) ? "#f39c12" : "#ccc"}
          onMouseEnter={() => isLoggedIn && setHover(value)}
          onMouseLeave={() => setHover(0)}
          onClick={() => isLoggedIn && onRate(value)}
          style={{ cursor: isLoggedIn ? "pointer" : "not-allowed" }}
        />
      ))}
    </div>
  );
};

export default Rating;
