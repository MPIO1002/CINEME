import { getUserData, logout } from "../utils/authUtils";

const Navbar = () => {
  const userData = getUserData();

  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center border-1 border-gray-300 sticky top-0 z-10">
      <div className="font-bold text-lg text-indigo-700">CineMe Admin</div>
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <p>Xin chào, {localStorage.getItem("fullName") || "Khách"}</p>
          {userData?.permissions && userData.permissions.length > 0 && (
            <p className="text-gray-500 text-xs">
              Quyền: {userData.permissions.join(', ')}
            </p>
          )}
        </div>
        <button
          className="text-indigo-700 hover:underline"
          onClick={async () => {
            try {
              const adminToken = localStorage.getItem("admin_token");
              
              // Call logout API if admin is authenticated
              if (adminToken) {
                const tokenData = JSON.parse(adminToken);
                await fetch('http://localhost:8080/api/v1/auth/logout', {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${tokenData.accessToken || tokenData.token}`,
                  },
                });
              }
            } catch (error) {
              console.error('Admin logout API error:', error);
              // Continue with logout even if API fails
            } finally {
              // Always clear local storage and redirect
              localStorage.removeItem("admin_token");
              window.location.href = "/admin/login";
            }
          }}
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default Navbar;