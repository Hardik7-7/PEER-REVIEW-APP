import React from "react";
import TeamMemberCard from "./TeamMemberCard";
import { getSmoothRatingColor } from "../../utils/ratingColor"; // ✅ Reused shared function

const RatingSlider = ({ rating, onRatingChange }) => {
  const handleChange = (e) => {
    onRatingChange(parseFloat(e.target.value));
  };

  const sliderTrackColor = getSmoothRatingColor(rating);

  return (
    <div className="flex items-center gap-4 w-full">
      <input
        type="range"
        min="1"
        max="10"
        step="0.1"
        value={rating}
        onChange={handleChange}
        className="w-full appearance-none h-2 rounded-lg outline-none transition-all duration-300 ease-in-out"
        style={{
          background: `linear-gradient(to right, ${sliderTrackColor} ${(rating - 1) * 11.11}%, #e5e7eb ${(rating - 1) * 11.11}%)`,
        }}
      />
      <span className="text-sm font-semibold text-[#121416] w-10 text-right">
        {rating.toFixed(1)}
      </span>

      <style>
        {`
          input[type='range']::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: ${sliderTrackColor};
            cursor: pointer;
            box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.05);
            transition: background 0.3s, transform 0.2s;
            position: relative;
            z-index: 10;
          }

          input[type='range']::-webkit-slider-thumb:hover {
            transform: scale(1.2);
          }

          input[type='range']::-webkit-slider-thumb:active {
            transform: scale(1.3);
          }

          input[type='range']::-moz-range-thumb {
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: ${sliderTrackColor};
            cursor: pointer;
            box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.05);
            transition: background 0.3s, transform 0.2s;
            position: relative;
            z-index: 10;
          }

          input[type='range']::-moz-range-thumb:hover {
            transform: scale(1.2);
          }

          input[type='range']::-moz-range-thumb:active {
            transform: scale(1.3);
          }
        `}
      </style>
    </div>
  );
};


const TeamMemberReview = ({ members, updateRating }) => {
  return (
    <div className="flex flex-col gap-6 mb-6">
      {members.map((member) => (
        <div key={member.id} className="bg-white shadow rounded-xl p-4">
          <TeamMemberCard
            name={member.name}
            role={member.role}
            rating={member.rating}
            imageUrl={member.imageUrl}
          />
          <div className="mt-4">
            <label className="block text-sm text-[#6a7681] mb-1">Rating</label>
            <RatingSlider
              rating={member.rating}
              onRatingChange={(val) => updateRating(member.id, val)}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamMemberReview;
