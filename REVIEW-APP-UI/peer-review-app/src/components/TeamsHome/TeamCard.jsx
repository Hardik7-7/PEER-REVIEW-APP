import React from "react";
import { useNavigate } from "react-router-dom";

const TeamCard = ({ id, name, members, imageUrl }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/review-cycles/${id}/`);
  };

  return (
    <div
      onClick={handleClick}
      className="p-4 rounded-2xl cursor-pointer transition-transform duration-300 hover:shadow-lg hover:scale-[1.015] bg-white dark:bg-[#1f2937]"
    >
      <div className="flex flex-col sm:flex-row items-stretch gap-4">
        {/* Text Section */}
        <div className="flex flex-col justify-between sm:w-2/3 gap-2">
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white leading-snug">
              {name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{members} members</p>
          </div>
        </div>

        {/* Image Section */}
        <div className="relative w-full sm:w-1/3 aspect-video rounded-xl overflow-hidden shadow-inner">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-300"
            style={{ backgroundImage: `url(${imageUrl})` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export default TeamCard;
