import AdminMainLayout from "@/modules/admin/layouts/main";
import ActorManagement from "@/modules/admin/pages/Actor/ActorManagement";
import Dashboard from "@/modules/admin/pages/Dashboard";
import MovieManagement from "@/modules/admin/pages/Movie/MovieManagement";
import RoomManagement from "@/modules/admin/pages/Room/RoomManagement";
import SecurityManagement from "@/modules/admin/pages/SecurityManagement";
import ShowtimeManagement from "@/modules/admin/pages/ShowTime/ShowtimeManagement";
import SystemManagement from "@/modules/admin/pages/System/SystemManagement";
import TheaterManagement from "@/modules/admin/pages/theater/TheaterManagement";
import UserManagement from "@/modules/admin/pages/User/UserManagement";
import { useState } from "react";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import AdminPrivateRoute from "../../../components/protect-route";
import AdminLogin from "../../admin/pages/Login";
import Layout from "../layout";
import BookingPage from "../pages/booking";
import FilmDetail from "../pages/film-detail";
import Home from "../pages/home";
import PaymentResult from "../pages/payment-result";
import Profile from "../pages/profile";
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
          <Route path="/showtimes" element={<ShowtimesPage />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <AdminPrivateRoute>
            <AdminMainLayout />
          </AdminPrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="movies" element={<MovieManagement />} />
          <Route path="actors" element={<ActorManagement />} />
          <Route path="showtimes" element={<ShowtimeManagement />} />
          <Route path="theaters" element={<TheaterManagement />} />
          <Route path="rooms" element={<RoomManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="system" element={<SystemManagement />} />
          <Route path="security" element={<SecurityManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default Routers;