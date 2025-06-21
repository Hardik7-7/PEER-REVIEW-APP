import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TeamMemberReview from "../components/TeamsReview/TeamMemberReview";
import api from "../services/api";
import { TbArrowBigRightLineFilled } from "react-icons/tb";

const dummyImages = [
  "https://randomuser.me/api/portraits/men/17.jpg",
  "https://randomuser.me/api/portraits/women/18.jpg",
  "https://randomuser.me/api/portraits/men/19.jpg",
  "https://randomuser.me/api/portraits/women/20.jpg",
  "https://randomuser.me/api/portraits/men/21.jpg",
];

const TeamReviewPage = () => {
  const { teamId, reviewCycleId } = useParams();

  const [members, setMembers] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [currentMetricIndex, setCurrentMetricIndex] = useState(0);
  const [ratingsMap, setRatingsMap] = useState({});

  const currentMetric = metrics[currentMetricIndex];

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get("/metrics/list/", {
          params: { review_cycle_id: reviewCycleId },
        });
        const metricData = response.data || [];
        setMetrics(metricData);

        if (metricData.length > 0 && teamId) {
          const response = await api.get("/users/list/", {
            params: { group_id: teamId },
          });
          const data = response.data;

          const processed = data.slice(0, 5).map((user, index) => ({
            id: user.id,
            name: user.name || user.username || "Unknown",
            role: "Software Engineer",
            rating: Math.floor(Math.random() * 10) + 1,
            imageUrl: dummyImages[index % dummyImages.length],
          }));

          setMembers(processed);
        }
      } catch (error) {
        console.error("Error fetching metrics or team members:", error);
      }
    };

    if (reviewCycleId) fetchMetrics();
  }, [teamId, reviewCycleId]);

  const updateRating = (userId, newRating) => {
    setRatingsMap((prev) => {
      const updated = { ...prev };
      const metricId = currentMetric?.id;

      if (!updated[metricId]) updated[metricId] = {};
      updated[metricId][userId] = newRating;
      return updated;
    });

    setMembers((prev) =>
      prev.map((member) =>
        member.id === userId ? { ...member, rating: newRating } : member
      )
    );
  };

  const handleNextMetric = () => {
    if (currentMetricIndex < metrics.length - 1) {
      setCurrentMetricIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    const finalPayload = {
      ratings: [], // ✅ now a list, as expected by backend
    };

    Object.entries(ratingsMap).forEach(([metricId, userRatings]) => {
      const values = Object.entries(userRatings).map(([userId, value]) => ({
        target_user: parseInt(userId),
        value,
      }));

      finalPayload.ratings.push({
        metric: parseInt(metricId),
        values,
      });
    });

    try {
      const response = await api.post(
        `/ratings/bulk-submit/${reviewCycleId}/`,
        finalPayload
      );
      console.log("Submitted successfully:", response.data);
      alert("Ratings submitted!");
    } catch (error) {
      console.error("Submission failed:", error);
      alert(error.response?.data?.detail || "Failed to submit ratings.");
    }
  };

  if (metrics.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white font-sans">
        <p className="text-xl text-[#6a7681]">
          No Metric Available to Review Upon.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <main className="px-40 py-5 flex-1">
        <div className="max-w-[960px] mx-auto">
          <h1 className="text-3xl font-bold text-[#121416] mb-1">
            {currentMetric?.name}
          </h1>
          <p className="text-sm text-[#6a7681] mb-6">
            Rate your team members on their{" "}
            {currentMetric?.name?.toLowerCase()} skills.
          </p>

          <h3 className="text-lg font-bold text-[#121416] mb-2">
            Team Members
          </h3>

          <TeamMemberReview members={members} updateRating={updateRating} />

          <div className="flex justify-end mt-6">
            {currentMetricIndex < metrics.length - 1 ? (
              <button
                onClick={handleNextMetric}
                className="flex items-center justify-center gap-2 bg-[#f5f7fa] text-[#121416] p-3 rounded-full border border-[#d0d5dd] hover:bg-[#e4e7ec] transition shadow-sm"
              >
                <TbArrowBigRightLineFilled className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-[#2563eb] text-white px-5 py-2 rounded-md hover:bg-[#1e40af] transition"
              >
                Submit Ratings
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeamReviewPage;
