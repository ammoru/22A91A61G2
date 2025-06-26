import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Stats from "./pages/Stats.jsx";
import Redirect from "./pages/Redirect.js";

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/stats" element={<Stats />} />
    <Route path="/:shortCode" element={<Redirect />} />
  </Routes>
);

export default AppRoutes;
