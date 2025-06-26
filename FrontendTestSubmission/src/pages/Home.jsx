import { useState } from "react";
import URLForm from "../components/URLForm";
import URLCard from "../components/URLCard";
import { shortenUrl } from "../services/urlService";
import { logger } from "../utils/logger";

const Home = () => {
  const [shortened, setShortened] = useState(null);

  const handleSubmit = async ({ url, customCode, validity }) => {
    const result = await shortenUrl(url, customCode, validity);
    setShortened(result);
    logger("Shortened URL created", result);
  };

  return (
    <>
      <URLForm onSubmit={handleSubmit} />
      {shortened && <URLCard data={shortened} />}
    </>
  );
};

export default Home;