import React from "react";
import { getSmoothRatingColor } from "../../utils/ratingColor"; // Reuse the shared logic

const TeamMemberCard = ({ name, role, rating, imageUrl }) => {
  const bgColor = getSmoothRatingColor(rating);

  return (
    <div className="flex items-center justify-between gap-4 px-0 py-1">
      <div className="flex items-center gap-4">
        <div
          className="h-14 w-14 rounded-full bg-center bg-no-repeat bg-cover"
          style={{ backgroundImage: `url("${imageUrl}")` }}
        />
        <div className="flex flex-col">
          <p className="text-[#121416] text-base font-semibold">{name}</p>
          <p className="text-[#6a7681] text-sm">{role}</p>
        </div>
      </div>
      <div
        className="flex items-center justify-center w-12 h-8 rounded-full font-semibold text-white select-none transition-colors duration-300"
        style={{ backgroundColor: bgColor }}
        title={`Rating: ${rating.toFixed(1)}`}
      >
        {rating.toFixed(1)}
      </div>
    </div>
  );
};

export default TeamMemberCard;
