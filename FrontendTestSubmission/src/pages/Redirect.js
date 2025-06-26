import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { getOriginalUrl } from "../services/urlService";

const Redirect = () => {
  const { shortCode } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToOriginal = async () => {
      const originalUrl = await getOriginalUrl(shortCode);
      if (originalUrl) {
        window.location.href = originalUrl;
      } else {
        navigate("/");
      }
    };
    redirectToOriginal();
  }, [shortCode, navigate]);

  return null;
};

export default Redirect;