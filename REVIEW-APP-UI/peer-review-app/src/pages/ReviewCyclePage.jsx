import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar.jsx"; // Adjust path as needed

export default function ReviewCyclePage() {
  const { teamId: group_id } = useParams();
  const navigate = useNavigate();

  const [reviewCycles, setReviewCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReviewCycles() {
      if (!group_id) return;

      setLoading(true);
      setError("");
      try {
        const response = await api.get(`/review-cycle/list/?group_id=${group_id}`);
        setReviewCycles(response.data);
      } catch (err) {
        const message =
          err.response?.data?.detail ||
          err.message ||
          "Failed to load review cycles.";
        setError(message);
        setReviewCycles([]);
      } finally {
        setLoading(false);
      }
    }

    fetchReviewCycles();
  }, [group_id]);

  return (
    <div className="min-h-screen bg-white font-sans text-[#121416]">
      <main className="p-10 max-w-5xl mx-auto">
        <h3 className="text-xl font-semibold mb-6 border-b border-gray-300 pb-2">Review Cycles</h3>

        {loading ? (
          <p className="text-center text-gray-500">Loading review cycles...</p>
        ) : error ? (
          <p className="text-center text-red-600 font-medium">{error}</p>
        ) : reviewCycles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 rounded-md divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reviewCycles.map((cycle, index) => {
                  const now = new Date();
                  const startDate = new Date(cycle.start_date);
                  const endDate = new Date(cycle.end_date);
                  let status = "Upcoming";
                  if (now >= startDate && now <= endDate) status = "Ongoing";
                  else if (now > endDate) status = "Completed";

                  return (
                    <tr
                      key={cycle.id ?? index}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/review-cycles/${group_id}/team-review/${cycle.id}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-700">{cycle.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{cycle.group}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cycle.start_date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cycle.end_date}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold
                          ${
                            status === "Ongoing"
                              ? "text-green-600"
                              : status === "Completed"
                              ? "text-gray-500"
                              : "text-blue-600"
                          }`}>
                        {status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-400 italic">No review cycles found for this team.</p>
        )}
      </main>
    </div>
  );
}
