import { Calendar, CheckCircle, Clock, Edit3, Eye, Film, MapPin, Plus, X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Showtime {
  id?: string;
  movieId: string;
  movieName?: string;
  movieImage?: string;
  roomId: string;
  roomName?: string;
  showDate: string;
  startTime: string;
  endTime: string;
  ticketPrice: number;
  status: 'ACTIVE' | 'SOLD_OUT' | 'CANCELLED';
  bookedSeats?: number;
  totalSeats?: number;
}

interface Movie {
  id: string;
  nameVn: string;
  nameEn: string;
  image: string;
  time: number;
}

interface Room {
  id: string;
  name: string;
  totalSeats: number;
  type: '2D' | '3D' | 'IMAX';
}

interface ShowtimeModalProps {
  open: boolean;
  mode: "add" | "edit" | "view";
  showtime?: Showtime;
  movies: Movie[];
  rooms: Room[];
  onClose: () => void;
  onSubmit: (showtime: Showtime) => void;
}

const ShowtimeModal: React.FC<ShowtimeModalProps> = ({
  open,
  mode,
  showtime,
  movies,
  rooms,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<Showtime>(
    showtime || {
      movieId: "",
      roomId: "",
      showDate: "",
      startTime: "",
      endTime: "",
      ticketPrice: 120000,
      status: "ACTIVE",
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (showtime) {
      setForm(showtime);
    } else if (mode === "add") {
      setForm({
        movieId: "",
        roomId: "",
        showDate: "",
        startTime: "",
        endTime: "",
        ticketPrice: 120000,
        status: "ACTIVE",
      });
    }
    setErrors({});
  }, [showtime, mode, open]);

  if (!open) return null;

  const isView = mode === "view";
  const isAdd = mode === "add";
  const isEdit = mode === "edit";

  const selectedMovie = movies.find(m => m.id === form.movieId);
  const selectedRoom = rooms.find(r => r.id === form.roomId);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!form.movieId.trim()) {
      newErrors.movieId = "Phim là bắt buộc";
    }

    if (!form.roomId.trim()) {
      newErrors.roomId = "Phòng chiếu là bắt buộc";
    }

    if (!form.showDate) {
      newErrors.showDate = "Ngày chiếu là bắt buộc";
    }

    if (!form.startTime) {
      newErrors.startTime = "Giờ bắt đầu là bắt buộc";
    }

    if (!form.endTime) {
      newErrors.endTime = "Giờ kết thúc là bắt buộc";
    }

    // Validate start time < end time
    if (form.startTime && form.endTime) {
      const start = new Date(`2000-01-01T${form.startTime}:00`);
      const end = new Date(`2000-01-01T${form.endTime}:00`);
      
      if (end <= start) {
        newErrors.endTime = "Giờ kết thúc phải sau giờ bắt đầu";
      }
    }

    // Validate price
    if (form.ticketPrice <= 0) {
      newErrors.ticketPrice = "Giá vé phải lớn hơn 0";
    }

    // Validate date (not in the past for new showtimes)
    if (mode === "add" && form.showDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const showDate = new Date(form.showDate);
      
      if (showDate < today) {
        newErrors.showDate = "Ngày chiếu không thể là ngày trong quá khứ";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm() && onSubmit) {
      // Auto-calculate end time based on movie duration
      if (selectedMovie && form.startTime && !form.endTime) {
        const startTime = new Date(`2000-01-01T${form.startTime}:00`);
        const endTime = new Date(startTime.getTime() + selectedMovie.time * 60000);
        const endTimeStr = endTime.toTimeString().substring(0, 5);
        setForm(prev => ({ ...prev, endTime: endTimeStr }));
      }

      const submitData: Showtime = {
        ...form,
        movieName: selectedMovie?.nameVn,
        movieImage: selectedMovie?.image,
        roomName: selectedRoom?.name,
        totalSeats: selectedRoom?.totalSeats,
        bookedSeats: form.bookedSeats || 0,
      };

      onSubmit(submitData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Auto-calculate end time when movie or start time changes
    if (name === 'movieId' || name === 'startTime') {
      const movie = name === 'movieId' ? movies.find(m => m.id === value) : selectedMovie;
      const startTime = name === 'startTime' ? value : form.startTime;
      
      if (movie && startTime) {
        const start = new Date(`2000-01-01T${startTime}:00`);
        const end = new Date(start.getTime() + movie.time * 60000);
        const endTimeStr = end.toTimeString().substring(0, 5);
        setForm(prev => ({ ...prev, endTime: endTimeStr }));
      }
    }
    
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
      case "add": return "Thêm suất chiếu mới";
      case "edit": return "Chỉnh sửa suất chiếu";
      case "view": return "Chi tiết suất chiếu";
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case "add": return "text-green-600";
      case "edit": return "text-blue-600";
      case "view": return "text-purple-600";
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden z-20">
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
                  {isAdd && "Điền thông tin để thêm suất chiếu mới"}
                  {isEdit && "Cập nhật thông tin suất chiếu"}
                  {isView && "Xem chi tiết thông tin suất chiếu"}
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
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {/* Movie & Room Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Film className="w-4 h-4" />
                  Phim *
                </label>
                {isView ? (
                  <div className="w-full border rounded-lg px-4 py-3 bg-slate-50 border-slate-200 text-slate-600">
                    {selectedMovie?.nameVn || form.movieName || 'Chưa chọn phim'}
                  </div>
                ) : (
                  <select
                    name="movieId"
                    value={form.movieId}
                    onChange={handleChange}
                    className={`w-full px-3 py-3 border rounded-lg transition-all duration-200 ${
                      errors.movieId
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  >
                    <option value="">Chọn phim</option>
                    {movies.map((movie) => (
                      <option key={movie.id} value={movie.id}>
                        {movie.nameVn} ({movie.time} phút)
                      </option>
                    ))}
                  </select>
                )}
                {errors.movieId && (
                  <p className="text-red-500 text-xs mt-1">{errors.movieId}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Phòng chiếu *
                </label>
                {isView ? (
                  <div className="w-full border rounded-lg px-4 py-3 bg-slate-50 border-slate-200 text-slate-600">
                    {selectedRoom?.name || form.roomName || 'Chưa chọn phòng'}
                    {selectedRoom && ` (${selectedRoom.totalSeats} ghế, ${selectedRoom.type})`}
                  </div>
                ) : (
                  <select
                    name="roomId"
                    value={form.roomId}
                    onChange={handleChange}
                    className={`w-full px-3 py-3 border rounded-lg transition-all duration-200 ${
                      errors.roomId
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  >
                    <option value="">Chọn phòng</option>
                    {rooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name} ({room.totalSeats} ghế, {room.type})
                      </option>
                    ))}
                  </select>
                )}
                {errors.roomId && (
                  <p className="text-red-500 text-xs mt-1">{errors.roomId}</p>
                )}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Ngày chiếu *
                </label>
                {isView ? (
                  <div className="w-full border rounded-lg px-4 py-3 bg-slate-50 border-slate-200 text-slate-600">
                    {formatDateDisplay(form.showDate)}
                  </div>
                ) : (
                  <input
                    type="date"
                    name="showDate"
                    value={formatDateForInput(form.showDate)}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-3 transition-all duration-200 ${
                      errors.showDate
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-slate-300 focus:border-transparent'
                    }`}
                  />
                )}
                {errors.showDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.showDate}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Giờ bắt đầu *
                </label>
                {isView ? (
                  <div className="w-full border rounded-lg px-4 py-3 bg-slate-50 border-slate-200 text-slate-600">
                    {form.startTime}
                  </div>
                ) : (
                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                    className={`w-full border rounded-lg px-4 py-3 transition-all duration-200 ${
                      errors.startTime
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-slate-300 focus:border-transparent'
                    }`}
                  />
                )}
                {errors.startTime && (
                  <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Giờ kết thúc *
                </label>
                <div className="w-full border rounded-lg px-4 py-3 bg-slate-50 border-slate-200 text-slate-600">
                  {form.endTime || 'Tự động tính'}
                  {selectedMovie && form.startTime && (
                    <div className="text-xs text-slate-500 mt-1">
                      Dựa trên thời lượng phim: {selectedMovie.time} phút
                    </div>
                  )}
                </div>
                {errors.endTime && (
                  <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>
                )}
              </div>
            </div>

            {/* Price & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2">
                  Giá vé (VND) *
                </label>
                {isView ? (
                  <div className="w-full border rounded-lg px-4 py-3 bg-slate-50 border-slate-200 text-slate-600">
                    {formatPrice(form.ticketPrice)} VND
                  </div>
                ) : (
                  <input
                    type="number"
                    name="ticketPrice"
                    value={form.ticketPrice}
                    onChange={handleChange}
                    min="0"
                    step="1000"
                    className={`w-full border rounded-lg px-4 py-3 transition-all duration-200 ${
                      errors.ticketPrice
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-slate-300 focus:border-transparent'
                    }`}
                    placeholder="120000"
                  />
                )}
                {errors.ticketPrice && (
                  <p className="text-red-500 text-xs mt-1">{errors.ticketPrice}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Trạng thái
                </label>
                {isView ? (
                  <div className="w-full border rounded-lg px-4 py-3 bg-slate-50 border-slate-200 text-slate-600">
                    {form.status === 'ACTIVE' ? 'Mở bán' : 
                     form.status === 'SOLD_OUT' ? 'Hết vé' : 'Đã hủy'}
                  </div>
                ) : (
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="ACTIVE">Mở bán</option>
                    <option value="SOLD_OUT">Hết vé</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                )}
              </div>
            </div>

            {/* Seat Info (View mode only) */}
            {isView && form.bookedSeats !== undefined && form.totalSeats && (
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Thông tin ghế</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Tổng ghế:</span>
                    <div className="font-medium text-slate-900">{form.totalSeats} ghế</div>
                  </div>
                  <div>
                    <span className="text-slate-600">Đã đặt:</span>
                    <div className="font-medium text-slate-900">{form.bookedSeats} ghế</div>
                  </div>
                  <div>
                    <span className="text-slate-600">Còn trống:</span>
                    <div className="font-medium text-slate-900">{form.totalSeats - form.bookedSeats} ghế</div>
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
                  {isAdd ? "Thêm suất chiếu" : "Lưu thay đổi"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowtimeModal;
