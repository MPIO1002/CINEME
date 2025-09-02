import { Edit, Lock, Plus, Shield, Trash2, UserCheck } from "lucide-react";
import React, { useState } from "react";

const SecurityManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("permissions");

  // Mock data for permissions and roles
  const mockData = {
    permissions: [
      { id: 1, name: "view_movies", displayName: "Xem phim", module: "Movies", description: "Quyền xem danh sách và chi tiết phim", status: "active" },
      { id: 2, name: "create_movies", displayName: "Tạo phim", module: "Movies", description: "Quyền tạo phim mới", status: "active" },
      { id: 3, name: "edit_movies", displayName: "Sửa phim", module: "Movies", description: "Quyền chỉnh sửa thông tin phim", status: "active" },
      { id: 4, name: "delete_movies", displayName: "Xóa phim", module: "Movies", description: "Quyền xóa phim", status: "active" },
      { id: 5, name: "view_theaters", displayName: "Xem rạp", module: "Theaters", description: "Quyền xem danh sách rạp chiếu", status: "active" },
      { id: 6, name: "manage_theaters", displayName: "Quản lý rạp", module: "Theaters", description: "Quyền quản lý rạp chiếu", status: "active" },
      { id: 7, name: "view_bookings", displayName: "Xem đặt vé", module: "Bookings", description: "Quyền xem thông tin đặt vé", status: "active" },
      { id: 8, name: "cancel_bookings", displayName: "Hủy đặt vé", module: "Bookings", description: "Quyền hủy đặt vé", status: "active" },
      { id: 9, name: "view_reports", displayName: "Xem báo cáo", module: "Reports", description: "Quyền xem các báo cáo thống kê", status: "active" },
      { id: 10, name: "export_reports", displayName: "Xuất báo cáo", module: "Reports", description: "Quyền xuất báo cáo", status: "active" },
      { id: 11, name: "system_admin", displayName: "Quản trị hệ thống", module: "System", description: "Quyền quản trị toàn hệ thống", status: "active" },
      { id: 12, name: "user_management", displayName: "Quản lý người dùng", module: "Users", description: "Quyền quản lý tài khoản người dùng", status: "inactive" }
    ],
    roles: [
      { 
        id: 1, 
        name: "super_admin", 
        displayName: "Super Admin", 
        description: "Quyền quản trị cao nhất", 
        userCount: 2,
        permissions: ["system_admin", "user_management", "view_movies", "create_movies", "edit_movies", "delete_movies"],
        status: "active",
        level: 1
      },
      { 
        id: 2, 
        name: "cinema_manager", 
        displayName: "Quản lý rạp", 
        description: "Quản lý hoạt động rạp chiếu", 
        userCount: 8,
        permissions: ["view_movies", "view_theaters", "manage_theaters", "view_bookings", "view_reports"],
        status: "active",
        level: 2
      },
      { 
        id: 3, 
        name: "content_manager", 
        displayName: "Quản lý nội dung", 
        description: "Quản lý phim và nội dung", 
        userCount: 5,
        permissions: ["view_movies", "create_movies", "edit_movies", "view_reports"],
        status: "active",
        level: 2
      },
      { 
        id: 4, 
        name: "booking_staff", 
        displayName: "Nhân viên bán vé", 
        description: "Xử lý đặt vé và hỗ trợ khách hàng", 
        userCount: 15,
        permissions: ["view_movies", "view_theaters", "view_bookings", "cancel_bookings"],
        status: "active",
        level: 3
      },
      { 
        id: 5, 
        name: "guest", 
        displayName: "Khách", 
        description: "Quyền xem cơ bản", 
        userCount: 0,
        permissions: ["view_movies", "view_theaters"],
        status: "inactive",
        level: 4
      }
    ]
  };

  const tabs = [
    {
      id: "permissions",
      label: "Quyền hạn",
      icon: <Lock className="w-4 h-4" />,
      description: "Quản lý các quyền hạn trong hệ thống"
    },
    {
      id: "roles",
      label: "Vai trò",
      icon: <UserCheck className="w-4 h-4" />,
      description: "Quản lý vai trò và phân quyền người dùng"
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "permissions":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Quản lý Quyền hạn</h3>
                <p className="text-slate-600">Danh sách các quyền hạn trong hệ thống</p>
              </div>
              <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                <Plus className="w-4 h-4" />
                Thêm quyền
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3">Quyền hạn cơ bản</h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li>• Xem (View)</li>
                  <li>• Tạo mới (Create)</li>
                  <li>• Chỉnh sửa (Update)</li>
                  <li>• Xóa (Delete)</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-3">Quyền hạn đặc biệt</h4>
                <ul className="space-y-2 text-sm text-purple-700">
                  <li>• Quản lý hệ thống (System Admin)</li>
                  <li>• Phê duyệt nội dung (Approve)</li>
                  <li>• Xuất báo cáo (Export)</li>
                  <li>• Sao lưu dữ liệu (Backup)</li>
                </ul>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Tên quyền</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Module</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Mô tả</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Trạng thái</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.permissions.map((permission) => (
                    <tr key={permission.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-slate-800">{permission.displayName}</div>
                          <div className="text-xs text-slate-500 font-mono">{permission.name}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {permission.module}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{permission.description}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          permission.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {permission.status === "active" ? "Hoạt động" : "Ngừng hoạt động"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "roles":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Quản lý Vai trò</h3>
                <p className="text-slate-600">Danh sách các vai trò và phân quyền</p>
              </div>
              <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                <Plus className="w-4 h-4" />
                Thêm vai trò
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-200 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-700" />
                  </div>
                  <h4 className="font-semibold text-green-800">Super Admin</h4>
                </div>
                <ul className="space-y-1 text-sm text-green-700">
                  <li>• Toàn quyền hệ thống</li>
                  <li>• Quản lý tất cả module</li>
                  <li>• Cấu hình hệ thống</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-blue-700" />
                  </div>
                  <h4 className="font-semibold text-blue-800">Manager</h4>
                </div>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• Quản lý nội dung</li>
                  <li>• Quản lý lịch chiếu</li>
                  <li>• Xem báo cáo</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                    <Lock className="w-5 h-5 text-orange-700" />
                  </div>
                  <h4 className="font-semibold text-orange-800">Staff</h4>
                </div>
                <ul className="space-y-1 text-sm text-orange-700">
                  <li>• Xem thông tin</li>
                  <li>• Cập nhật cơ bản</li>
                  <li>• Hỗ trợ khách hàng</li>
                </ul>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Vai trò</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Cấp độ</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Số người dùng</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Quyền hạn</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Trạng thái</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {mockData.roles.map((role) => (
                    <tr key={role.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-slate-800">{role.displayName}</div>
                          <div className="text-sm text-slate-500">{role.description}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          role.level === 1 ? "bg-red-100 text-red-800" :
                          role.level === 2 ? "bg-orange-100 text-orange-800" :
                          role.level === 3 ? "bg-yellow-100 text-yellow-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          Cấp {role.level}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{role.userCount} người</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 3).map((perm) => (
                            <span key={perm} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                              {perm.replace(/_/g, ' ')}
                            </span>
                          ))}
                          {role.permissions.length > 3 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                              +{role.permissions.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          role.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {role.status === "active" ? "Hoạt động" : "Ngừng hoạt động"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-red-100 rounded-xl">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Bảo mật & Phân quyền</h1>
            <p className="text-slate-600">Quản lý quyền hạn và vai trò trong hệ thống</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                  activeTab === tab.id
                    ? "border-red-500 text-red-600 bg-red-50"
                    : "border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Tab Description */}
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-3">
              {tabs.find(tab => tab.id === activeTab)?.icon}
              <div>
                <h3 className="font-semibold text-red-800">
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </h3>
                <p className="text-sm text-red-600">
                  {tabs.find(tab => tab.id === activeTab)?.description}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          {renderTabContent()}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {tabs.map((tab) => {
          let itemCount = 0;
          let activeCount = 0;
          let additionalInfo = "";
          
          if (tab.id === "permissions") {
            itemCount = mockData.permissions.length;
            activeCount = mockData.permissions.filter(item => item.status === "active").length;
            additionalInfo = `${mockData.permissions.filter(p => p.module === "Movies").length} phim • ${mockData.permissions.filter(p => p.module === "System").length} hệ thống`;
          } else if (tab.id === "roles") {
            itemCount = mockData.roles.length;
            activeCount = mockData.roles.filter(item => item.status === "active").length;
            const totalUsers = mockData.roles.reduce((sum, role) => sum + role.userCount, 0);
            additionalInfo = `${totalUsers} người dùng`;
          }
          
          return (
            <div
              key={tab.id}
              className={`p-6 rounded-xl border transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-red-50 border-red-200"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${activeTab === tab.id ? "bg-red-100" : "bg-slate-100"}`}>
                  {tab.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800">{tab.label}</h4>
                  <p className="text-sm text-slate-600 mb-2">{tab.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>{itemCount} items</span>
                    <span>•</span>
                    <span>{activeCount} hoạt động</span>
                    {additionalInfo && (
                      <>
                        <span>•</span>
                        <span>{additionalInfo}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Notice */}
      <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center">
            <Shield className="w-4 h-4 text-amber-700" />
          </div>
          <h3 className="text-lg font-semibold text-amber-800">Lưu ý Bảo mật</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-700">
          <div>
            <p className="font-medium mb-2">Nguyên tắc bảo mật:</p>
            <ul className="space-y-1">
              <li>• Nguyên tắc quyền tối thiểu (Principle of Least Privilege)</li>
              <li>• Phân tách nhiệm vụ (Separation of Duties)</li>
              <li>• Xác thực đa yếu tố (Multi-Factor Authentication)</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-2">Khuyến nghị:</p>
            <ul className="space-y-1">
              <li>• Thường xuyên review và audit quyền hạn</li>
              <li>• Ghi log tất cả thao tác quan trọng</li>
              <li>• Định kỳ cập nhật mật khẩu và session</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityManagement;
