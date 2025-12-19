import { rolePermissionApiService, type Role } from '@/services/rolePermissionApi';
import { theaterApi, type Theater } from '@/services/theaterApi';
import {
    Crown,
    Edit3,
    Eye,
    Plus,
    Shield,
    UserIcon,
    X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { type Employee } from '../../../../../services/employeeApi';

interface EmployeeModalProps {
  open: boolean;
  mode: "add" | "edit" | "view";
  employee?: Employee;
  onClose: () => void;
  onSubmit: (employee: Employee) => void;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({
  open,
  mode,
  employee,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<Employee>(
    employee || {
      id: "",
      email: "",
      fullName: "",
      phone: "",
      roleName: "",
      theaterName: "",
      theaterId: "",
      roleId: "",
      password: "",
      status: "ACTIVE",
    }
  );

  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employee) {
      setForm(employee);
    } else if (mode === "add") {
      setForm({
        id: "",
        email: "",
        fullName: "",
        phone: "",
        roleName: "",
        theaterName: "",
        theaterId: "",
        roleId: "",
        password: "",
        status: "ACTIVE",
      });
    }
    setErrors({});
  }, [employee, mode, open]);


  const fetchData = async () => {
    try{
        const [theaterData, roleData] = await Promise.all([
            theaterApi.getAllTheaters(),
            rolePermissionApiService.getAllRoles()
        ]);
        setTheaters(theaterData.data);
        setRoles(roleData);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
  }

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

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

    if (!form.phone.trim()) {
      newErrors.phone = "Số điện thoại là bắt buộc";
    } else if (!/^[0-9]{10,11}$/.test(form.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    if (isAdd && !form.password?.trim()) {
      newErrors.password = "Mật khẩu là bắt buộc";
    }

    if (!form.theaterId?.trim()) {
      newErrors.theaterId = "Rạp là bắt buộc";
    }

    if (!form.roleId?.trim()) {
      newErrors.roleId = "Vai trò là bắt buộc";
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
    const { name, value } = e.target;
    
    setForm((prev: Employee) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
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
      case "add": return "Thêm nhân viên mới";
      case "edit": return "Chỉnh sửa nhân viên";
      case "view": return "Chi tiết nhân viên";
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case "add": return "text-green-600";
      case "edit": return "text-blue-600";
      case "view": return "text-purple-600";
    }
  };

  const getRoleIcon = (roleName?: string) => {
    switch (roleName) {
      case 'Admin': return <Crown className="w-4 h-4 text-red-500" />;
      case 'Staff': return <Shield className="w-4 h-4 text-blue-500" />;
      default: return <UserIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (roleName?: string) => {
    switch (roleName) {
      case 'Admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'Staff': return 'bg-blue-100 text-blue-800 border-blue-200';
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

  const getEmployeeInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
                  {isAdd && "Điền thông tin để thêm nhân viên mới"}
                  {isEdit && "Cập nhật thông tin nhân viên"}
                  {isView && "Xem chi tiết thông tin nhân viên"}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {/* Basic Information */}
          <div className="space-y-6">
            {/* Employee Avatar & Basic Info */}
            {isView && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                      {getEmployeeInitials(form.fullName)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{form.fullName}</h3>
                    <p className="text-gray-600">{form.email}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(form.roleName)}`}>
                        {getRoleIcon(form.roleName)}
                        {form.roleName}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(form.status)}`}>
                        {form.status === 'ACTIVE' ? 'Hoạt động' : form.status === 'INACTIVE' ? 'Không hoạt động' : 'Bị cấm'}
                      </span>
                    </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    disabled={isView}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      isView ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                    } ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Nhập họ tên"
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={isView}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      isView ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                    } ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Nhập email"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    disabled={isView}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      isView ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                    } ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>

                {isAdd && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu *</label>
                    <input
                      type="password"
                      name="password"
                      value={form.password || ''}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nhập mật khẩu"
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rạp *</label>
                  <select
                    name="theaterId"
                    value={form.theaterId}
                    onChange={handleChange}
                    disabled={isView}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      isView ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                    } ${errors.theaterId ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Chọn rạp</option>
                    {theaters.map(theater => (
                      <option key={theater.id} value={theater.id}>
                        {theater.nameEn}
                      </option>
                    ))}
                    {/* Add more theater options as needed */}
                  </select>
                  {errors.theaterId && <p className="text-red-500 text-xs mt-1">{errors.theaterId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò *</label>
                  <select
                    name="roleId"
                    value={form.roleId}
                    onChange={handleChange}
                    disabled={isView}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      isView ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                    } ${errors.roleId ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Chọn vai trò</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {errors.roleId && <p className="text-red-500 text-xs mt-1">{errors.roleId}</p>}
                </div>

                {isView && form.createdAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày tạo</label>
                    <input
                      type="text"
                      value={new Date(form.createdAt).toLocaleDateString('vi-VN')}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

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
                {isAdd ? "Thêm nhân viên" : "Lưu thay đổi"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;