const Navbar = () => {
  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center border-1 border-gray-300 sticky top-0 z-10">
      <div className="font-bold text-lg text-indigo-700">CineMe Admin</div>
      <div>
        {/* Thêm các nút, avatar, logout ở đây nếu cần */}
        <p>Xin chao {JSON.parse(localStorage.getItem("admin_token") || "{}").email}</p>
        <button
          className="text-indigo-700 hover:underline"
          onClick={() => {
            localStorage.removeItem("admin_token");
            window.location.href = "/admin/login";
          }}
        >
          Đăng xuất
        </button>
      </div>
    </header>
  );
};

export default Navbar;