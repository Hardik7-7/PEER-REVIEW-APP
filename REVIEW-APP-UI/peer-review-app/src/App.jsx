import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import LoginForm from "./pages/LoginForm";
import HomePage from "./pages/HomePage";
import ReviewCyclePage from "./pages/ReviewCyclePage";
import TeamsReview from "./pages/TeamReviewPage.jsx"; // ✅ NEW
import Navbar from "./components/Navbar.jsx"; // ✅ NEW
import api, { setAuthHandler } from "./services/api"; // 👈 import setAuthHandler


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // ⬅️ Add loading state

  useEffect(() => {
    setAuthHandler(setIsAuthenticated); // 👈 this connects it
    const token = Cookies.get("accessToken");
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const RequireAuth = ({ children }) => {
    if (isLoading) return null; // ⬅️ Prevent premature redirect
    return isAuthenticated ? children : <Navigate to="/" />;
  };

  return (
    <Router>
      <div className="min-h-screen bg-white font-sans text-[#121416]">
      {isAuthenticated && <Navbar setIsAuthenticated={setIsAuthenticated} />}
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/home" />
            ) : (
              <LoginForm onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        <Route
          path="/review-cycles/:teamId"
          element={
            <RequireAuth>
              <ReviewCyclePage />
            </RequireAuth>
          }
        />
        <Route
          path="/review-cycles/:teamId/team-review/:reviewCycleId"
          element={
            <RequireAuth>
              <TeamsReview />
            </RequireAuth>
          }
        />
      </Routes>
      </div>
    </Router>
  );
}

export default App;
