import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../layout";
import Home from "../pages/home";
import { useState } from "react";

const Routers = () => {
  const [lang, setLang] = useState<"vi" | "en">("vi");

  return (
    <BrowserRouter>
      <Layout lang={lang} setLang={setLang}>
        <Routes>
          <Route path="/" element={<Home lang={lang} />} />
          {/* Thêm các route khác tại đây nếu cần */}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default Routers;