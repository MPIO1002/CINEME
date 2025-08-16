import AdminMainLayout from "@/modules/admin/layouts/main";
import ActorManagement from "@/modules/admin/pages/ActorManagement";
import Dashboard from "@/modules/admin/pages/Dashboard";
import MovieManagement from "@/modules/admin/pages/MovieManagement";
import RoomManagement from "@/modules/admin/pages/RoomManagement";
import SecurityManagement from "@/modules/admin/pages/SecurityManagement";
import ShowtimeManagement from "@/modules/admin/pages/ShowtimeManagement";
import SystemManagement from "@/modules/admin/pages/SystemManagement";
import TheaterManagement from "@/modules/admin/pages/TheaterManagement";
import UserManagement from "@/modules/admin/pages/UserManagement";
import { useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import AdminLogin from "../../admin/pages/Login";
import Layout from "../layout";
import Home from "../pages/home";
import FilmDetail from "../pages/film-detail";
import BookingPage from "../pages/booking";
import PaymentResult from "../pages/payment-result";

// Giả lập kiểm tra đăng nhập admin (bạn nên thay bằng logic thực tế)
const isAdminAuthenticated = () => {
  return !!localStorage.getItem("admin_token");
};

// Component bảo vệ route admin
const AdminPrivateRoute = () => {
  return isAdminAuthenticated() ? <Outlet /> : <Navigate to="/admin/login" replace />;
};
const Routers = () => {
  const [lang, setLang] = useState<"vi" | "en">("vi");

  return (
    <BrowserRouter>
      <Routes>
        {/* Client routes */}
        <Route element={<Layout lang={lang} setLang={setLang}> <Outlet /> </Layout>}>
          <Route path="/" element={<Home lang={lang} />} />
          <Route path="/film/:id" element={<FilmDetail />} />
          <Route path="/booking/:id" element={<BookingPage />} />
          <Route path="/payment-result" element={<PaymentResult />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminMainLayout />}>
                <Route element={<AdminPrivateRoute />}>
                    <Route index element={<Dashboard />} />
                    <Route path="movies" element={<MovieManagement />} />
                    <Route path="actors" element={<ActorManagement />} />
                    <Route path="showtimes" element={<ShowtimeManagement />} />
                    <Route path="theaters" element={<TheaterManagement />} />
                    <Route path="rooms" element={<RoomManagement />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="system" element={<SystemManagement />} />
                    <Route path="security" element={<SecurityManagement />} />
                    {/* Các route con khác */}
                </Route>
            </Route>
        </Routes>
    </BrowserRouter>
  );
};

export default Routers;