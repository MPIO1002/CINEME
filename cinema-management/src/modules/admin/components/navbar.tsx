// import { getUserData, logout } from "../utils/authUtils";

import authApiService from "@/services/authApi";

const Navbar = () => {
//   const userData = getUserData();
    const handleLogout = async () => {
        try {
            const adminToken = localStorage.getItem("admin_accessToken");

            if(adminToken) {
                await authApiService.logout();

                localStorage.removeItem("admin_accessToken");
                localStorage.removeItem("admin_refreshToken");
                localStorage.removeItem("admin_fullName");
                localStorage.removeItem("admin_employeeId");
                localStorage.removeItem("admin_userType");

                window.location.href = "/admin/login";
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center border-1 border-gray-300 sticky top-0 z-10">
      <div className="font-bold text-lg text-indigo-700">CineMe Admin</div>
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <p>Xin chào, {localStorage.getItem("admin_fullName") || "Khách"}</p>
        </div>
        <button
          className="text-indigo-700 hover:underline"
          onClick={handleLogout}
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default Navbar;