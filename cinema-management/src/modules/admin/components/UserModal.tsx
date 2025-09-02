import {
    Activity,
    Calendar,
    CheckCircle,
    Crown,
    DollarSign,
    Edit3,
    Eye,
    EyeOffIcon,
    Key,
    Mail,
    Phone,
    Plus,
    Settings,
    Shield,
    ShoppingBag,
    User as UserIcon,
    X
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { type User } from '../../../services/userApi';

interface UserModalProps {
  open: boolean;
  mode: "add" | "edit" | "view";
  user?: User;
  onClose: () => void;
  onSubmit: (user: User) => void;
}

// Available permissions
const PERMISSIONS = [
  { key: 'USER_MANAGEMENT', label: 'Quản lý người dùng', description: 'Thêm, sửa, xóa tài khoản người dùng' },
  { key: 'MOVIE_MANAGEMENT', label: 'Quản lý phim', description: 'Quản lý thông tin phim và trailer' },
  { key: 'ROOM_MANAGEMENT', label: 'Quản lý phòng chiếu', description: 'Quản lý phòng chiếu và ghế ngồi' },
  { key: 'SHOWTIME_MANAGEMENT', label: 'Quản lý suất chiếu', description: 'Tạo và quản lý lịch chiếu' },
  { key: 'BOOKING_MANAGEMENT', label: 'Quản lý đặt vé', description: 'Xử lý đặt vé và hoàn tiền' },
  { key: 'REPORTS', label: 'Báo cáo', description: 'Xem báo cáo doanh thu và thống kê' },
  { key: 'SYSTEM_SETTINGS', label: 'Cài đặt hệ thống', description: 'Cấu hình hệ thống' }
];

const UserModal: React.FC<UserModalProps> = ({
  open,
  mode,
  user,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<User>(
    user || {
      id: "",
      email: "",
      fullName: "",
      phone: "",
      roleId: "",
      roleName: "Customer",
      provider: "LOCAL",
      createdAt: "",
      updatedAt: "",
      role: "CUSTOMER",
      status: "ACTIVE",
      joinDate: "",
      permissions: [],
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"info" | "permissions" | "activity">("info");
  const [visibleEmails, setVisibleEmails] = useState<Set<string>>(new Set());
  const [visiblePhones, setVisiblePhones] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      setForm(user);
    } else if (mode === "add") {
      setForm({
        id: "",
        email: "",
        fullName: "",
        phone: "",
        roleId: "",
        roleName: "Customer",
        provider: "LOCAL",
        createdAt: "",
        updatedAt: "",
        role: "CUSTOMER",
        status: "ACTIVE",
        joinDate: "",
        permissions: [],
      });
    }
    setErrors({});
    setActiveTab("info");
  }, [user, mode, open]);

  if (!open) return null;

  const isView = mode === "view";
  const isAdd = mode === "add";
  const isEdit = mode === "edit";

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!form.fullName.trim()) {
      newErrors.fullName = "Họ tên là bắt buộc";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (form.phone && !/^[0-9]{10,11}$/.test(form.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm() && onSubmit) {
      onSubmit(form);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev: User) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev: User) => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setForm((prev: User) => ({
      ...prev,
      permissions: checked 
        ? [...(prev.permissions || []), permission]
        : (prev.permissions || []).filter((p: string) => p !== permission)
    }));
  };

  const getModeIcon = () => {
    switch (mode) {
      case "add": return <Plus className="w-5 h-5" />;
      case "edit": return <Edit3 className="w-5 h-5" />;
      case "view": return <Eye className="w-5 h-5" />;
    }
  };

  const getModeTitle = () => {
    switch (mode) {
      case "add": return "Thêm người dùng mới";
      case "edit": return "Chỉnh sửa người dùng";
      case "view": return "Chi tiết người dùng";
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case "add": return "text-green-600";
      case "edit": return "text-blue-600";
      case "view": return "text-purple-600";
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role) {
      case 'ADMIN': return <Crown className="w-4 h-4 text-red-500" />;
      case 'STAFF': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'CUSTOMER': return <UserIcon className="w-4 h-4 text-green-500" />;
      default: return <UserIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200';
      case 'STAFF': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CUSTOMER': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'INACTIVE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'BANNED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const showPermissions = form.role === 'ADMIN' || form.role === 'STAFF';

  const toggleEmailVisibility = (userId: string) => {
    setVisibleEmails(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };
  const togglePhoneVisibility = (userId: string) => {
    setVisiblePhones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId); // Hide phone (remove from visible set)
      } else {
        newSet.add(userId); // Show phone (add to visible set)
      }
      return newSet;
    });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden z-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${getModeColor()} bg-opacity-10`}>
                {getModeIcon()}
              </div>
              <div>
                <h2 className={`text-xl font-bold ${getModeColor()}`}>
                  {getModeTitle()}
                </h2>
                <p className="text-sm text-slate-500">
                  {isAdd && "Điền thông tin để thêm người dùng mới"}
                  {isEdit && "Cập nhật thông tin người dùng"}
                  {isView && "Xem chi tiết thông tin người dùng"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors duration-200"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Tabs (for view mode) */}
        {isView && (
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("info")}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "info"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Thông tin cá nhân
                </div>
              </button>
              {showPermissions && (
                <button
                  onClick={() => setActiveTab("permissions")}
                  className={`py-3 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "permissions"
                      ? "border-purple-500 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Phân quyền
                  </div>
                </button>
              )}
              <button
                onClick={() => setActiveTab("activity")}
                className={`py-3 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "activity"
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Hoạt động
                </div>
              </button>
            </nav>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {/* Basic Information Tab */}
          {(activeTab === "info" || !isView) && (
            <div className="space-y-6">
              {/* User Avatar & Basic Info */}
              {isView && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                        {form.avatar ? (
                          <img src={form.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          getUserInitials(form.fullName)
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{form.fullName}</h3>
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(form.role)}
                          <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getRoleBadgeColor(form.role)}`}>
                            {form.role === 'ADMIN' ? 'Quản trị viên' : 
                             form.role === 'STAFF' ? 'Nhân viên' : 'Khách hàng'}
                          </span>
                        </div>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusBadgeColor(form.status)}`}>
                          {form.status === 'ACTIVE' ? 'Hoạt động' : 
                           form.status === 'INACTIVE' ? 'Không hoạt động' : 'Bị khóa'}
                        </span>
                      </div>
                      <p className="text-gray-600">{form.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Thông tin cá nhân
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      Họ và tên *
                    </label>
                    {isView ? (
                      <div className="w-full border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600">
                        {form.fullName}
                      </div>
                    ) : (
                      <input
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        className={`w-full px-3 py-3 border rounded-lg transition-all duration-200 ${
                          errors.fullName
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="Nhập họ và tên"
                      />
                    )}
                    {errors.fullName && (
                      <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email *
                    </label>
                    {isView ? (
                      <div className="w-full border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600 relative">
                          {visibleEmails && visibleEmails.has(form.id) ? form.email : "••••••••••••••••••••••••"}
                        <button
                        onClick={() => toggleEmailVisibility(form.id)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors duration-200 absolute right-2 top-3"
                        title={visibleEmails && visibleEmails.has(form.id) ? "Ẩn email" : "Hiện email"}
                        type="button"
                      >
                        {visibleEmails && visibleEmails.has(form.id) ? (
                          <Eye className="w-4 h-4 text-gray-400" />
                        ) : (
                          <EyeOffIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      </div>
                    ) : (
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className={`w-full px-3 py-3 border rounded-lg transition-all duration-200 ${
                          errors.email
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="example@email.com"
                      />
                    )}
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Số điện thoại
                    </label>
                    {isView ? (
                      <div className="w-full border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600 relative">
                        {visiblePhones && visiblePhones.has(form.id) ? form.phone : "••••••••••••"}
                        <button
                          onClick={() => togglePhoneVisibility(form.id)}
                          className="p-1 hover:bg-gray-100 rounded transition-colors duration-200 absolute right-2 top-3"
                          title={visiblePhones && visiblePhones.has(form.id) ? "Ẩn email" : "Hiện email"}
                          type="button"
                        >
                          {visiblePhones && visiblePhones.has(form.id) ? (
                            <Eye className="w-4 h-4 text-gray-400" />
                          ) : (
                            <EyeOffIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone || ""}
                        onChange={handleChange}
                        className={`w-full px-3 py-3 border rounded-lg transition-all duration-200 ${
                          errors.phone
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="0901234567"
                      />
                    )}
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Vai trò
                    </label>
                    {isView ? (
                      <div className="w-full border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600">
                        {form.role === 'ADMIN' ? 'Quản trị viên' : 
                         form.role === 'STAFF' ? 'Nhân viên' : 'Khách hàng'}
                      </div>
                    ) : (
                      <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="CUSTOMER">Khách hàng</option>
                        <option value="STAFF">Nhân viên</option>
                        <option value="ADMIN">Quản trị viên</option>
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Trạng thái
                    </label>
                    {isView ? (
                      <div className="w-full border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600">
                        {form.status === 'ACTIVE' ? 'Hoạt động' : 
                         form.status === 'INACTIVE' ? 'Không hoạt động' : 'Bị khóa'}
                      </div>
                    ) : (
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Không hoạt động</option>
                        <option value="BANNED">Bị khóa</option>
                      </select>
                    )}
                  </div>

                  {/* Join Date (view only) */}
                  {isView && form.joinDate && (
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Ngày tham gia
                      </label>
                      <div className="w-full border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600">
                        {formatDate(form.joinDate)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Permissions (for Admin and Staff) */}
              {!isView && showPermissions && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Phân quyền
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PERMISSIONS.map((permission) => (
                      <label
                        key={permission.key}
                        className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={form.permissions?.includes(permission.key) || false}
                          onChange={(e) => handlePermissionChange(permission.key, e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mt-1"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{permission.label}</div>
                          <div className="text-sm text-gray-500">{permission.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Stats (view only) */}
              {isView && form.role === 'CUSTOMER' && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" />
                    Thống kê khách hàng
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Tổng vé đã mua</div>
                          <div className="text-xl font-bold text-gray-900">{form.totalBookings || 0}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Tổng chi tiêu</div>
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(form.totalSpent || 0)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Chi tiêu TB/vé</div>
                          <div className="text-lg font-bold text-gray-900">
                            {form.totalBookings ? formatCurrency((form.totalSpent || 0) / form.totalBookings) : formatCurrency(0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Permissions Tab (view mode) */}
          {isView && activeTab === "permissions" && showPermissions && (
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Quyền hiện tại
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PERMISSIONS.map((permission) => {
                    const hasPermission = form.permissions?.includes(permission.key) || false;
                    return (
                      <div
                        key={permission.key}
                        className={`p-3 rounded-lg border ${
                          hasPermission 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            hasPermission ? 'bg-green-500' : 'bg-gray-300'
                          }`}>
                            {hasPermission && <CheckCircle className="w-3 h-3 text-white" />}
                          </div>
                          <div>
                            <div className={`font-medium ${hasPermission ? 'text-green-900' : 'text-gray-600'}`}>
                              {permission.label}
                            </div>
                            <div className={`text-sm ${hasPermission ? 'text-green-700' : 'text-gray-500'}`}>
                              {permission.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab (view mode) */}
          {isView && activeTab === "activity" && (
            <div className="space-y-6">
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Hoạt động gần đây
                </h3>
                
                <div className="space-y-3">
                  {/* Mock activity data */}
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Đăng nhập hệ thống</div>
                        <div className="text-xs text-gray-500">2 giờ trước</div>
                      </div>
                    </div>
                  </div>

                  {form.role === 'CUSTOMER' && (
                    <>
                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">Đặt vé xem phim "Spider-Man"</div>
                            <div className="text-xs text-gray-500">1 ngày trước</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <Settings className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">Cập nhật thông tin cá nhân</div>
                            <div className="text-xs text-gray-500">{form.updatedAt && formatDate(form.updatedAt)}</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Key className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Tạo tài khoản</div>
                        <div className="text-xs text-gray-500">{form.joinDate && formatDate(form.joinDate)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isView && (
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors duration-200"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className={`flex-1 px-6 py-3 text-white rounded-lg font-semibold transition-colors duration-200 ${
                  isAdd 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isAdd ? "Thêm người dùng" : "Lưu thay đổi"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserModal;
