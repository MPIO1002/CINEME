import {
    BarChart3,
    Building2,
    CheckCircle,
    Edit3,
    Eye,
    Globe,
    Mail,
    MapPin,
    Phone,
    Plus,
    Settings,
    Users,
    X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { type Theater, type Room } from '../../../../../services/theaterApi';

interface TheaterModalProps {
  open: boolean;
  mode: "add" | "edit" | "view";
  theater?: Theater;
  onClose: () => void;
//   onSubmit: (theater: Theater) => void;
}

const TheaterModal: React.FC<TheaterModalProps> = ({
  open,
  mode,
  theater,
  onClose,
//   onSubmit,
}) => {
  const [form, setForm] = useState<Theater>(
    theater || {
      nameEn: "",
      nameVn: "",
      address: "",
      phone: "",
      email: "",
      status: "ACTIVE",
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (theater) {
      setForm(theater);
    } else if (mode === "add") {
      setForm({
        nameEn: "",
        nameVn: "",
        address: "",
        phone: "",
        email: "",
        status: "ACTIVE",
      });
    }
    setErrors({});
  }, [theater, mode, open]);

  if (!open) return null;

  const isView = mode === "view";
  const isAdd = mode === "add";
  const isEdit = mode === "edit";

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!form.nameVn.trim()) {
      newErrors.nameVn = "Tên tiếng Việt là bắt buộc";
    }

    if (!form.nameEn.trim()) {
      newErrors.nameEn = "Tên tiếng Anh là bắt buộc";
    }

    if (!form.address?.trim()) {
      newErrors.address = "Địa chỉ là bắt buộc";
    }

    // Email validation
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    // Phone validation
    if (form.phone && !/^[0-9+\-\s().\s]+$/.test(form.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    // if (validateForm() && onSubmit) {
    //   onSubmit(form);
    // }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setForm((prev: Theater) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev: Record<string, string>) => ({ ...prev, [name]: "" }));
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
      case "add": return "Thêm rạp chiếu phim mới";
      case "edit": return "Chỉnh sửa rạp chiếu phim";
      case "view": return "Chi tiết rạp chiếu phim";
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case "add": return "text-green-600";
      case "edit": return "text-blue-600";
      case "view": return "text-purple-600";
    }
  };

  const formatRevenue = (revenue: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(revenue);
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'ACTIVE': return 'Hoạt động';
      case 'MAINTENANCE': return 'Bảo trì';
      case 'CLOSED': return 'Đã đóng';
      default: return 'Không xác định';
    }
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
                  {isAdd && "Điền thông tin để thêm rạp chiếu phim mới"}
                  {isEdit && "Cập nhật thông tin rạp chiếu phim"}
                  {isView && "Xem chi tiết thông tin rạp chiếu phim"}
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
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Thông tin cơ bản
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Tên tiếng Việt *
                  </label>
                  {isView ? (
                    <div className="w-full border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600">
                      {form.nameVn}
                    </div>
                  ) : (
                    <input
                      type="text"
                      name="nameVn"
                      value={form.nameVn}
                      onChange={handleChange}
                      className={`w-full px-3 py-3 border rounded-lg transition-all duration-200 ${
                        errors.nameVn
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="Ví dụ: Cinestar Huế"
                    />
                  )}
                  {errors.nameVn && (
                    <p className="text-red-500 text-xs mt-1">{errors.nameVn}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Tên tiếng Anh *
                  </label>
                  {isView ? (
                    <div className="w-full border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600">
                      {form.nameEn}
                    </div>
                  ) : (
                    <input
                      type="text"
                      name="nameEn"
                      value={form.nameEn}
                      onChange={handleChange}
                      className={`w-full px-3 py-3 border rounded-lg transition-all duration-200 ${
                        errors.nameEn
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="Ví dụ: Cinestar Hue"
                    />
                  )}
                  {errors.nameEn && (
                    <p className="text-red-500 text-xs mt-1">{errors.nameEn}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Địa chỉ *
                  </label>
                  {isView ? (
                    <div className="w-full border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600">
                      {form.address}
                    </div>
                  ) : (
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className={`w-full px-3 py-3 border rounded-lg transition-all duration-200 ${
                        errors.address
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="Ví dụ: 123 Lê Lợi, TP. Huế"
                    />
                  )}
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Trạng thái
                  </label>
                  {isView ? (
                    <div className="w-full border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600">
                      {getStatusLabel(form.status)}
                    </div>
                  ) : (
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="ACTIVE">Hoạt động</option>
                      <option value="MAINTENANCE">Bảo trì</option>
                      <option value="CLOSED">Đã đóng</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Thông tin liên hệ
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Số điện thoại
                  </label>
                  {isView ? (
                    <div className="w-full border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600">
                      {form.phone || 'Chưa cập nhật'}
                    </div>
                  ) : (
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className={`w-full px-3 py-3 border rounded-lg transition-all duration-200 ${
                        errors.phone
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-slate-300 focus:border-blue-500'
                      }`}
                      placeholder="Ví dụ: 0234.123.456"
                    />
                  )}
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  {isView ? (
                    <div className="w-full border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600">
                      {form.email || 'Chưa cập nhật'}
                    </div>
                  ) : (
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`w-full px-3 py-3 border rounded-lg transition-all duration-200 ${
                        errors.email
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-slate-300 focus:border-blue-500'
                      }`}
                      placeholder="Ví dụ: hue@cinestar.com.vn"
                    />
                  )}
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Rooms Information (View mode only) */}
            {isView && form.rooms && form.rooms.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Phòng chiếu ({form.totalRooms || 0} phòng)
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {form.rooms.map((room: Room) => (
                    <div key={room.id} className="bg-white rounded-lg p-3 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900">Phòng {room.name}</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          room.type === 'VIP' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {room.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Room type summary */}
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {form.rooms.filter((r: Room) => r.type === 'Standard').length}
                    </div>
                    <div className="text-slate-600">Standard</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {form.rooms.filter((r: Room) => r.type === 'VIP').length}
                    </div>
                    <div className="text-slate-600">VIP</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {form.rooms.filter((r: Room) => r.type === 'IMAX').length}
                    </div>
                    <div className="text-slate-600">IMAX</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {form.rooms.filter((r: Room) => r.type === '4DX').length}
                    </div>
                    <div className="text-slate-600">4DX</div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Stats (View mode only) */}
            {isView && form.utilization !== undefined && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Thống kê hiệu suất
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white rounded-lg p-4">
                    <span className="text-slate-600">Tỷ lệ sử dụng:</span>
                    <div className="font-medium text-slate-900 text-lg">{form.utilization}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${
                          form.utilization >= 90 ? 'bg-green-500' :
                          form.utilization >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${form.utilization}%` }}
                      />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <span className="text-slate-600">Doanh thu tháng:</span>
                    <div className="font-medium text-slate-900 text-lg">
                      {form.monthlyRevenue ? formatRevenue(form.monthlyRevenue) : 'Chưa có dữ liệu'}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <span className="text-slate-600">Doanh thu/phòng:</span>
                    <div className="font-medium text-slate-900 text-lg">
                      {form.monthlyRevenue && form.totalRooms 
                        ? formatRevenue(form.monthlyRevenue / form.totalRooms)
                        : 'Chưa có dữ liệu'
                      }
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
                  {isAdd ? "Thêm rạp chiếu phim" : "Lưu thay đổi"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TheaterModal;
