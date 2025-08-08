import {
    CheckCircle,
    Edit3,
    Eye,
    Grid,
    MapPin,
    Monitor,
    Plus,
    Settings,
    Users,
    Volume2,
    X,
    Zap
} from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Seat } from './SeatLayoutDesigner';
import SeatLayoutDesigner from './SeatLayoutDesigner';

interface Room {
  id?: string;
  name: string;
  type: '2D' | '3D' | 'IMAX' | '4DX';
  location?: string;
  totalSeats: number;
  vipSeats: number;
  regularSeats: number;
  coupleSeats?: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
  screenSize: string;
  screenResolution: string;
  audioSystem: string;
  hasAirCondition: boolean;
  hasEmergencyExit: boolean;
  hasDolbyAtmos: boolean;
  has4K: boolean;
  description?: string;
  utilization?: number;
  monthlyRevenue?: number;
  seatLayout?: Seat[];
}

interface RoomModalProps {
  open: boolean;
  mode: "add" | "edit" | "view";
  room?: Room;
  onClose: () => void;
  onSubmit: (room: Room) => void;
}

const RoomModal: React.FC<RoomModalProps> = ({
  open,
  mode,
  room,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<Room>(
    room || {
      name: "",
      type: "2D",
      location: "",
      totalSeats: 100,
      vipSeats: 20,
      regularSeats: 80,
      coupleSeats: 0,
      status: "ACTIVE",
      screenSize: "15m x 8m",
      screenResolution: "4K",
      audioSystem: "Dolby Digital",
      hasAirCondition: true,
      hasEmergencyExit: true,
      hasDolbyAtmos: false,
      has4K: true,
      description: "",
      seatLayout: [],
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSeatDesigner, setShowSeatDesigner] = useState(false);

  useEffect(() => {
    if (room) {
      setForm(room);
    } else if (mode === "add") {
      setForm({
        name: "",
        type: "2D",
        location: "",
        totalSeats: 100,
        vipSeats: 20,
        regularSeats: 80,
        coupleSeats: 0,
        status: "ACTIVE",
        screenSize: "15m x 8m",
        screenResolution: "4K",
        audioSystem: "Dolby Digital",
        hasAirCondition: true,
        hasEmergencyExit: true,
        hasDolbyAtmos: false,
        has4K: true,
        description: "",
        seatLayout: [],
      });
    }
    setErrors({});
  }, [room, mode, open]);

  if (!open) return null;

  const isView = mode === "view";
  const isAdd = mode === "add";
  const isEdit = mode === "edit";

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!form.name.trim()) {
      newErrors.name = "Tên phòng là bắt buộc";
    }

    if (!form.location?.trim()) {
      newErrors.location = "Vị trí là bắt buộc";
    }

    if (!form.screenSize.trim()) {
      newErrors.screenSize = "Kích thước màn hình là bắt buộc";
    }

    // Validate seat numbers
    if (form.totalSeats <= 0) {
      newErrors.totalSeats = "Tổng số ghế phải lớn hơn 0";
    }

    if (form.vipSeats < 0) {
      newErrors.vipSeats = "Số ghế VIP không thể âm";
    }

    if (form.regularSeats < 0) {
      newErrors.regularSeats = "Số ghế thường không thể âm";
    }

    if ((form.coupleSeats || 0) < 0) {
      newErrors.coupleSeats = "Số ghế đôi không thể âm";
    }

    // Validate total seats calculation
    const calculatedTotal = form.vipSeats + form.regularSeats + (form.coupleSeats || 0);
    if (calculatedTotal !== form.totalSeats) {
      newErrors.seatMismatch = `Tổng ghế (${form.totalSeats}) không khớp với tổng phân loại (${calculatedTotal})`;
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
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      const numValue = parseInt(value) || 0;
      setForm((prev) => ({ ...prev, [name]: numValue }));
      
      // Auto-update total seats when individual seat types change
      if (name === 'vipSeats' || name === 'regularSeats' || name === 'coupleSeats') {
        const updatedForm = { ...form, [name]: numValue };
        const newTotal = updatedForm.vipSeats + updatedForm.regularSeats + (updatedForm.coupleSeats || 0);
        setForm((prev) => ({ ...prev, [name]: numValue, totalSeats: newTotal }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSeatLayoutSave = (seats: Seat[]) => {
    setForm(prev => ({ ...prev, seatLayout: seats }));
    setShowSeatDesigner(false);
    
    // Auto-calculate seat counts from layout
    const counts = {
      regular: seats.filter(s => s.type === 'regular').length,
      vip: seats.filter(s => s.type === 'vip').length,
      couple: seats.filter(s => s.type === 'couple').length,
      disabled: seats.filter(s => s.type === 'disabled').length,
    };
    
    const total = counts.regular + counts.vip + counts.couple + counts.disabled;
    
    setForm(prev => ({
      ...prev,
      totalSeats: total,
      vipSeats: counts.vip,
      regularSeats: counts.regular,
      coupleSeats: counts.couple,
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
      case "add": return "Thêm phòng chiếu mới";
      case "edit": return "Chỉnh sửa phòng chiếu";
      case "view": return "Chi tiết phòng chiếu";
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case '2D': return '📺';
      case '3D': return '🥽';
      case 'IMAX': return '🎬';
      case '4DX': return '🎢';
      default: return '🎭';
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
                  {isAdd && "Điền thông tin để thêm phòng chiếu mới"}
                  {isEdit && "Cập nhật thông tin phòng chiếu"}
                  {isView && "Xem chi tiết thông tin phòng chiếu"}
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
                    <span className="text-lg">{getTypeIcon(form.type)}</span>
                    Tên phòng *
                  </label>
                  {isView ? (
                    <div className="w-full border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600">
                      {form.name}
                    </div>
                  ) : (
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={`w-full px-3 py-3 border rounded-lg transition-all duration-200 ${
                        errors.name
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="Ví dụ: Phòng VIP 1"
                    />
                  )}
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Vị trí *
                  </label>
                  {isView ? (
                    <div className="w-full border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600">
                      {form.location}
                    </div>
                  ) : (
                    <input
                      type="text"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      className={`w-full px-3 py-3 border rounded-lg transition-all duration-200 ${
                        errors.location
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      placeholder="Ví dụ: Tầng 2"
                    />
                  )}
                  {errors.location && (
                    <p className="text-red-500 text-xs mt-1">{errors.location}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2">
                    Loại phòng *
                  </label>
                  {isView ? (
                    <div className="w-full border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600">
                      {form.type}
                    </div>
                  ) : (
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="2D">2D</option>
                      <option value="3D">3D</option>
                      <option value="IMAX">IMAX</option>
                      <option value="4DX">4DX</option>
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
                       form.status === 'MAINTENANCE' ? 'Bảo trì' : 'Đã đóng'}
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

            {/* Seating Configuration */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Cấu hình ghế ngồi
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2">
                    Tổng số ghế *
                  </label>
                  {isView ? (
                    <div className="w-full border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600">
                      {form.totalSeats} ghế
                    </div>
                  ) : (
                    <input
                      type="number"
                      name="totalSeats"
                      value={form.totalSeats}
                      onChange={handleChange}
                      min="1"
                      className={`w-full px-3 py-3 border rounded-lg transition-all duration-200 ${
                        errors.totalSeats
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-slate-300 focus:border-blue-500'
                      }`}
                    />
                  )}
                  {errors.totalSeats && (
                    <p className="text-red-500 text-xs mt-1">{errors.totalSeats}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2">
                    Ghế VIP
                  </label>
                  {isView ? (
                    <div className="w-full border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600">
                      {form.vipSeats} ghế
                    </div>
                  ) : (
                    <input
                      type="number"
                      name="vipSeats"
                      value={form.vipSeats}
                      onChange={handleChange}
                      min="0"
                      className={`w-full px-3 py-3 border rounded-lg transition-all duration-200 ${
                        errors.vipSeats
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-slate-300 focus:border-blue-500'
                      }`}
                    />
                  )}
                  {errors.vipSeats && (
                    <p className="text-red-500 text-xs mt-1">{errors.vipSeats}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2">
                    Ghế thường
                  </label>
                  {isView ? (
                    <div className="w-full border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600">
                      {form.regularSeats} ghế
                    </div>
                  ) : (
                    <input
                      type="number"
                      name="regularSeats"
                      value={form.regularSeats}
                      onChange={handleChange}
                      min="0"
                      className={`w-full px-3 py-3 border rounded-lg transition-all duration-200 ${
                        errors.regularSeats
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-slate-300 focus:border-blue-500'
                      }`}
                    />
                  )}
                  {errors.regularSeats && (
                    <p className="text-red-500 text-xs mt-1">{errors.regularSeats}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2">
                    Ghế đôi
                  </label>
                  {isView ? (
                    <div className="w-full border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600">
                      {form.coupleSeats || 0} ghế
                    </div>
                  ) : (
                    <input
                      type="number"
                      name="coupleSeats"
                      value={form.coupleSeats || 0}
                      onChange={handleChange}
                      min="0"
                      className={`w-full px-3 py-3 border rounded-lg transition-all duration-200 ${
                        errors.coupleSeats
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-slate-300 focus:border-blue-500'
                      }`}
                    />
                  )}
                  {errors.coupleSeats && (
                    <p className="text-red-500 text-xs mt-1">{errors.coupleSeats}</p>
                  )}
                </div>
              </div>

              {errors.seatMismatch && (
                <p className="text-red-500 text-sm mt-2">{errors.seatMismatch}</p>
              )}

              {/* Seat Layout Preview */}
              <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-semibold text-slate-700">Bố cục ghế</h4>
                  {!isView && (
                    <button
                      type="button"
                      onClick={() => setShowSeatDesigner(true)}
                      className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-2"
                    >
                      <Grid className="w-4 h-4" />
                      Thiết kế bố cục
                    </button>
                  )}
                </div>
                
                {form.seatLayout && form.seatLayout.length > 0 ? (
                  <div className="text-center">
                    <div className="bg-gray-800 text-white py-2 px-4 rounded-lg mb-4 inline-block">
                      🎬 MÀN HÌNH
                    </div>
                    <div className="text-sm text-slate-600 mb-2">
                      Đã thiết kế: {form.seatLayout.length} ghế
                    </div>
                    <div className="text-xs text-gray-500 flex justify-center space-x-4">
                      <span>💺 Thường: {form.seatLayout.filter(s => s.type === 'regular').length}</span>
                      <span>👑 VIP: {form.seatLayout.filter(s => s.type === 'vip').length}</span>
                      <span>❤️ Đôi: {form.seatLayout.filter(s => s.type === 'couple').length}</span>
                      <span>♿ Khuyết tật: {form.seatLayout.filter(s => s.type === 'disabled').length}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="bg-gray-800 text-white py-2 px-4 rounded-lg mb-4 inline-block">
                      🎬 MÀN HÌNH
                    </div>
                    <div className="space-y-2">
                      {/* Sample seat layout visualization */}
                      <div className="flex justify-center space-x-1">
                        {Array.from({ length: Math.min(10, Math.ceil(form.totalSeats / 8)) }).map((_, i) => (
                          <div key={i} className="w-6 h-6 bg-blue-200 rounded border text-xs flex items-center justify-center">
                            💺
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-center space-x-1">
                        {Array.from({ length: Math.min(8, Math.ceil(form.vipSeats / 4)) }).map((_, i) => (
                          <div key={i} className="w-6 h-6 bg-yellow-200 rounded border text-xs flex items-center justify-center">
                            👑
                          </div>
                        ))}
                        <div className="w-6"></div>
                        {Array.from({ length: Math.min(8, Math.ceil(form.regularSeats / 4)) }).map((_, i) => (
                          <div key={i} className="w-6 h-6 bg-gray-200 rounded border text-xs flex items-center justify-center">
                            💺
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-gray-500 flex justify-center space-x-4">
                      <span>💺 Thường</span>
                      <span>👑 VIP</span>
                      <span>❤️ Đôi</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Thông số kỹ thuật
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2">
                    Kích thước màn hình *
                  </label>
                  {isView ? (
                    <div className="w-full border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600">
                      {form.screenSize}
                    </div>
                  ) : (
                    <input
                      type="text"
                      name="screenSize"
                      value={form.screenSize}
                      onChange={handleChange}
                      className={`w-full px-3 py-3 border rounded-lg transition-all duration-200 ${
                        errors.screenSize
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-slate-300 focus:border-blue-500'
                      }`}
                      placeholder="Ví dụ: 15m x 8m"
                    />
                  )}
                  {errors.screenSize && (
                    <p className="text-red-500 text-xs mt-1">{errors.screenSize}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2">
                    Độ phân giải
                  </label>
                  {isView ? (
                    <div className="w-full border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600">
                      {form.screenResolution}
                    </div>
                  ) : (
                    <select
                      name="screenResolution"
                      value={form.screenResolution}
                      onChange={handleChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="HD">HD (1080p)</option>
                      <option value="4K">4K</option>
                      <option value="8K IMAX">8K IMAX</option>
                    </select>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    Hệ thống âm thanh
                  </label>
                  {isView ? (
                    <div className="w-full border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600">
                      {form.audioSystem}
                    </div>
                  ) : (
                    <select
                      name="audioSystem"
                      value={form.audioSystem}
                      onChange={handleChange}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="Stereo">Stereo</option>
                      <option value="Dolby Digital">Dolby Digital</option>
                      <option value="Dolby Atmos">Dolby Atmos</option>
                      <option value="DTS:X">DTS:X</option>
                      <option value="IMAX Sound System">IMAX Sound System</option>
                      <option value="4DX Motion Sound">4DX Motion Sound</option>
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Features & Facilities */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Tính năng & Tiện ích
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  {isView ? (
                    <div className="flex items-center space-x-2">
                      <span className={form.has4K ? "text-green-600" : "text-gray-400"}>
                        {form.has4K ? "✅" : "❌"}
                      </span>
                      <span className="text-sm text-slate-700">4K</span>
                    </div>
                  ) : (
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="has4K"
                        checked={form.has4K}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">4K</span>
                    </label>
                  )}
                </div>

                <div className="flex items-center">
                  {isView ? (
                    <div className="flex items-center space-x-2">
                      <span className={form.hasDolbyAtmos ? "text-green-600" : "text-gray-400"}>
                        {form.hasDolbyAtmos ? "✅" : "❌"}
                      </span>
                      <span className="text-sm text-slate-700">Dolby Atmos</span>
                    </div>
                  ) : (
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="hasDolbyAtmos"
                        checked={form.hasDolbyAtmos}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">Dolby Atmos</span>
                    </label>
                  )}
                </div>

                <div className="flex items-center">
                  {isView ? (
                    <div className="flex items-center space-x-2">
                      <span className={form.hasAirCondition ? "text-green-600" : "text-gray-400"}>
                        {form.hasAirCondition ? "✅" : "❌"}
                      </span>
                      <span className="text-sm text-slate-700">Điều hòa</span>
                    </div>
                  ) : (
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="hasAirCondition"
                        checked={form.hasAirCondition}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">Điều hòa</span>
                    </label>
                  )}
                </div>

                <div className="flex items-center">
                  {isView ? (
                    <div className="flex items-center space-x-2">
                      <span className={form.hasEmergencyExit ? "text-green-600" : "text-gray-400"}>
                        {form.hasEmergencyExit ? "✅" : "❌"}
                      </span>
                      <span className="text-sm text-slate-700">Lối thoát khẩn cấp</span>
                    </div>
                  ) : (
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="hasEmergencyExit"
                        checked={form.hasEmergencyExit}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-slate-700">Lối thoát khẩn cấp</span>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2">
                Mô tả
              </label>
              {isView ? (
                <div className="w-full border rounded-lg px-4 py-3 bg-slate-50 border-slate-200 text-slate-600 min-h-[80px]">
                  {form.description || "Không có mô tả"}
                </div>
              ) : (
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Mô tả về phòng chiếu..."
                />
              )}
            </div>

            {/* Performance Stats (View mode only) */}
            {isView && form.utilization !== undefined && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Thống kê hiệu suất</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Tỷ lệ sử dụng:</span>
                    <div className="font-medium text-slate-900">{form.utilization}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${
                          form.utilization >= 90 ? 'bg-green-500' :
                          form.utilization >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${form.utilization}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-600">Doanh thu tháng:</span>
                    <div className="font-medium text-slate-900">
                      {formatRevenue(form.monthlyRevenue || 0)}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-600">Doanh thu/ghế:</span>
                    <div className="font-medium text-slate-900">
                      {formatRevenue((form.monthlyRevenue || 0) / form.totalSeats)}
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
                  {isAdd ? "Thêm phòng chiếu" : "Lưu thay đổi"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Seat Layout Designer */}
      <SeatLayoutDesigner
        open={showSeatDesigner}
        roomName={form.name || "Phòng chiếu"}
        initialSeats={form.seatLayout || []}
        onSave={handleSeatLayoutSave}
        onClose={() => setShowSeatDesigner(false)}
      />
    </div>
  );
};

export default RoomModal;
