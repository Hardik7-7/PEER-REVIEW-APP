import React from "react";
import TeamList from "../components/TeamsHome/TeamsList";
import Navbar from "../components/Navbar.jsx";

const HomePage = () => {
  return (
    <div className="relative flex min-h-screen flex-col bg-white overflow-x-hidden font-['Inter','Noto_Sans',sans-serif]">
      <div className="flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[32px] font-bold leading-tight min-w-72">Teams</p>
            </div>
            <TeamList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
