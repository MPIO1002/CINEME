import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "../layout";
import Home from "../pages/home";
import FilmDetail from "../pages/film-detail";
import BookingPage from "../pages/booking";
import PaymentResult from "../pages/payment-result";
const Routers = () => {
  const [lang, setLang] = useState<"vi" | "en">("vi");

  return (
    <BrowserRouter>
      <Layout lang={lang} setLang={setLang}>
        <Routes>
          <Route path="/" element={<Home lang={lang} />} />
          <Route path="/film/:id" element={<FilmDetail />} />
          <Route path="/booking/:id" element={<BookingPage />} />
          <Route path="/payment-result" element={<PaymentResult />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};

export default Routers;