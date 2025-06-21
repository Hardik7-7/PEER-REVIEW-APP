import { useNavigate } from "react-router-dom";

function LogoIcon() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/");
  };

  return (
    <div onClick={handleClick} style={{ cursor: "pointer" }}>
      <div className="flex items-center gap-4 text-[#111518]">
        <div className="w-4 h-4">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <h2 className="text-lg font-bold tracking-[-0.015em]">TeamReview</h2>
      </div>
    </div>
  );
}

export default LogoIcon;