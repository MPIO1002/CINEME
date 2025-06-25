import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "../layout";
import MovieDetail from "../pages/film-detail"; // Giả sử bạn có một trang chi tiết phim
import Home from "../pages/home";
const Routers = () => {
  const [lang, setLang] = useState<"vi" | "en">("vi");

  return (
    <BrowserRouter>
      <Layout lang={lang} setLang={setLang}>
        <Routes>
          <Route path="/" element={<Home lang={lang} />} />
          {/* Thêm các route khác tại đây nếu cần */}
          <Route path="/:movieId" element={<MovieDetail />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default Routers;