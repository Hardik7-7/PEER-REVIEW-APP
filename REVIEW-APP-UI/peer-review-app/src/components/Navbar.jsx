import React from "react";
import { useNavigate } from "react-router-dom";
import logoutUser from "../services/logout"; // ✅ import helper
import LogoIcon  from "./LogoIcons";

const Navbar = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    setIsAuthenticated(false); // update auth state
    navigate("/"); // redirect to login page
  };

  return (
    <header className="flex items-center justify-between border-b border-[#f0f2f5] px-10 py-3">
      <div className="flex items-center gap-4 text-[#111518]">
        <LogoIcon />
      </div>

      <div className="flex flex-1 justify-end gap-8 items-center">
        <div className="flex items-center gap-9">
          <a className="text-sm font-medium" href="#">
            Home
          </a>
          <a className="text-sm font-medium" href="#">
            Reviews
          </a>
          <a className="text-sm font-medium" href="#">
            Reports
          </a>
        </div>

        <button
          onClick={handleLogout}
          className="text-sm font-medium text-red-600 hover:underline"
        >
          Logout
        </button>

        <div
          className="bg-center bg-no-repeat bg-cover rounded-full w-10 h-10"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/your-image.jpg")',
          }}
        ></div>
      </div>
    </header>
  );
};

export default Navbar;
