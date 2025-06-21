import React, { useEffect, useState } from "react";
import api from "../../services/api";
import TeamCard from "./TeamCard";

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const response = await api.get("/groups/list/");
        setTeams(response.data);
      } catch (err) {
        setError("Failed to fetch teams.");
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  if (loading) return <p>Loading teams...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (teams.length === 0) return <p>No teams available.</p>;

  return (
    <div className="flex flex-col gap-4">
      {teams.map((team) => (
        <TeamCard
          key={team.id}
          id = {team.id}
          name={team.name}
          members={team.membersCount || team.members?.length || 0}
          imageUrl={
            team.imageUrl ||
            "https://images.pexels.com/photos/3183131/pexels-photo-3183131.jpeg"
          }
          progress={team.progress || 0}
        />
      ))}
    </div>
  );
};

export default TeamList;
