import { useState } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import Layout from "../layout";
import MovieDetail from "../pages/film-detail";
import Home from "../pages/home";
import AdminLogin from "../../admin/pages/Login";
import AdminMainLayout from "@/modules/admin/layouts/main";
import Dashboard from "@/modules/admin/pages/Dashboard";
import MovieManagement from "@/modules/admin/pages/MovieManagement";
import ShowtimeManagement from "@/modules/admin/pages/ShowtimeManagement";
import RoomManagement from "@/modules/admin/pages/RoomManagement";

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
          <Route path="/movies" element={<h1>Danh sach movies</h1>} />
          <Route path="/movies/:movieId" element={<MovieDetail />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminMainLayout />}>
                <Route element={<AdminPrivateRoute />}>
                    <Route index element={<Dashboard />} />
                    <Route path="movies" element={<MovieManagement />} />
                    <Route path="showtimes" element={<ShowtimeManagement />} />
                    <Route path="rooms" element={<RoomManagement />} />
                    <Route path="users" element={<h1>Quản lý người dùng</h1>} />
                    {/* Các route con khác */}
                </Route>
            </Route>
        </Routes>
    </BrowserRouter>
  );
};

export default Routers;