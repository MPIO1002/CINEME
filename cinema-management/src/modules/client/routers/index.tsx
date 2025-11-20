import AdminPrivateRoute from "@/components/protect-route";
import AdminMainLayout from "@/modules/admin/layouts/main";
import ActorManagement from "@/modules/admin/pages/Actor/ActorManagement";
import BookingManagement from "@/modules/admin/pages/Booking/BookingManagement";
import ComboManagement from "@/modules/admin/pages/Combo/ComboManagement";
import Dashboard from "@/modules/admin/pages/Dashboard";
import EmployeeManagement from "@/modules/admin/pages/Employee/EmployeeManagement";
import MovieManagement from "@/modules/admin/pages/Movie/MovieManagement";
import MovieConfigManagement from "@/modules/admin/pages/MovieConfig/MovieConfigManagement";
import PriceManagement from "@/modules/admin/pages/Price/PriceManagement";
import RankManagement from "@/modules/admin/pages/Rank/RankManagement";
import RoomManagement from "@/modules/admin/pages/Room/RoomManagement";
import SecurityManagement from "@/modules/admin/pages/SecurityManagement";
import ShowtimeManagement from "@/modules/admin/pages/ShowTime/ShowtimeManagement";
import TheaterManagement from "@/modules/admin/pages/Theater/TheaterManagement";
import UserManagement from "@/modules/admin/pages/User/UserManagement";
import { useState } from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import AdminLogin from "../../admin/pages/Login";
import Layout from "../layout";
import BookingPage from "../pages/booking";
import FilmDetail from "../pages/film-detail";
import Home from "../pages/home";
import PaymentResult from "../pages/payment-result";
import Profile from "../pages/profile";
import ResultPayment from "@/modules/admin/pages/ResultPayment/ResultPayment";
import ShowtimesPage from "../pages/showtimes";

const Routers = () => {
  const [lang, setLang] = useState<"vi" | "en">("vi");

  return (
    <BrowserRouter>
      <Routes>
        {/* Client routes */}
        <Route element={<Layout lang={lang} setLang={setLang}>
          <Outlet />
        </Layout>}>
          <Route path="/" element={<Home lang={lang} />} />
          <Route path="/film/:id" element={<FilmDetail />} />
          <Route path="/booking/:id" element={<BookingPage />} />
          <Route path="/payment-result" element={<PaymentResult />} />
          <Route path="/result-payment" element={<ResultPayment />} />
          <Route path="/showtimes" element={<ShowtimesPage />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPrivateRoute><AdminMainLayout /></AdminPrivateRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="movies" element={<MovieManagement />} />
          <Route path="actors" element={<ActorManagement />} />
          <Route path="showtimes" element={<ShowtimeManagement />} />
          <Route path="theaters" element={<TheaterManagement />} />
          <Route path="rooms" element={<RoomManagement />} />
          <Route path="combos" element={<ComboManagement />} />
          <Route path="prices" element={<PriceManagement />} />
          <Route path="ranks" element={<RankManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="movie-config" element={<MovieConfigManagement />} />
          <Route path="security" element={<SecurityManagement />} />
          <Route path="bookings" element={<BookingManagement />} />
          <Route path="result-payment" element={<ResultPayment />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Routers;