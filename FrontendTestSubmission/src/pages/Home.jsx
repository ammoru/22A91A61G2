// src/pages/Home.jsx

import { useState } from "react";
import URLForm from "../components/URLForm";
// import URLCard from "../components/URLCard";
import { shortenUrl } from "../services/urlService";
import { logger } from "../utils/logger";
import "./Home.css"; // <-- Import the CSS

const Home = () => {
  const [shortened, setShortened] = useState(null);

  const handleSubmit = async ({ url, customCode, validity }) => {
    const result = await shortenUrl(url, customCode, validity);
    setShortened(result);
    logger("Shortened URL created", result);
  };

  return (
    <div className="home-container">
      <URLForm onSubmit={handleSubmit} />
      {shortened && <URLCard data={shortened} />}
    </div>
  );
};

export default Home;
