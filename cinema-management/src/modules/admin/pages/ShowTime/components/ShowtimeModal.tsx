import { AlertTriangle, Calendar, CheckCircle, Clock, Edit3, Eye, Film, MapPin, Plus, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { type Movie } from '../../../../../services/movieApi';
import { type Room } from '../../../../../services/roomApi';
import { type Showtime } from '../../../../../services/showtimeApi';
import { type Theater } from '../../../../../services/theaterApi';

interface ShowtimeModalProps {
  open: boolean;
  mode: "add" | "edit" | "view";
  showtime?: Showtime;
  movies: Movie[];
  rooms: Room[];
  theaters: Theater[];
  onClose: () => void;
  onSubmit: (showtime: Showtime) => void;
  onTheaterChange?: (theaterId: string) => void; // New callback for loading rooms
}

const ShowtimeModal: React.FC<ShowtimeModalProps> = ({
  open,
  mode,
  showtime,
  movies,
  rooms,
  theaters,
  onClose,
  onSubmit,
  onTheaterChange,
}) => {
  const [form, setForm] = useState<Showtime>(
    showtime || {
        movieId: "",
        theaterId: "",
        roomId: "",
        date: "",
        startTime: "",
        endTime: "",
        movieNameVn: "",
        movieNameEn: "",
        languageVn: "",
        languageEn: "",
        formatVn: "",
        formatEn: "",
        roomName: "",
        // totalSeats: 0,
        // availableSeats: 0,
        // bookedSeats: 0,
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (showtime) {
      setForm(showtime);
    } else if (mode === "add") {
      setForm({
        movieId: "",
        theaterId: "",
        roomId: "",
        date: "",
        startTime: "",
        endTime: "",
        movieNameVn: "",
        movieNameEn: "",
        languageVn: "",
        languageEn: "",
        formatVn: "",
        formatEn: "",
        roomName: "",
        // totalSeats: 0,
        // availableSeats: 0,
        // bookedSeats: 0,
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
    if (!form.movieId || !form.movieId.trim()) {
      newErrors.movieId = "Phim là bắt buộc";
    }

    if (!form.theaterId || !form.theaterId.trim()) {
      newErrors.theaterId = "Rạp là bắt buộc";
    }

    if (!form.roomId || !form.roomId.trim()) {
      newErrors.roomId = "Phòng chiếu là bắt buộc";
    }

    if (!form.date) {
      newErrors.date = "Ngày chiếu là bắt buộc";
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

    // Validate date (not in the past for new showtimes)
    if (mode === "add" && form.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const showDate = new Date(form.date);
      
      if (showDate < today) {
        newErrors.date = "Ngày chiếu không thể là ngày trong quá khứ";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form is valid for enabling/disabling submit button
  const isFormValid = (): boolean => {
    const requiredFields = ['movieId', 'theaterId', 'roomId', 'date', 'startTime', 'endTime', 'formatVn', 'languageVn'];

    // Check if all required fields are filled
    const hasAllRequiredFields = requiredFields.every(field => {
      const value = form[field as keyof Showtime];
      return value && (typeof value === 'string' ? value.trim() : true);
    });

    // Check if there are no validation errors
    const hasNoErrors = Object.keys(errors).length === 0;

    // Additional date validation for new showtimes
    let isDateValid = true;
    if (mode === "add" && form.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const showDate = new Date(form.date);
      isDateValid = showDate >= today;
    }
    
    return hasAllRequiredFields && hasNoErrors && isDateValid;
  };

  // Get validation message for disabled button
  const getDisabledMessage = (): string => {
    if (!form.movieId) return "Vui lòng chọn phim";
    if (!form.theaterId) return "Vui lòng chọn rạp";
    if (!form.roomId) return "Vui lòng chọn phòng chiếu";
    if (!form.date) return "Vui lòng chọn ngày chiếu";
    if (!form.startTime) return "Vui lòng chọn giờ bắt đầu";
    if (!form.endTime) return "Vui lòng chọn giờ kết thúc";
    if (!form.formatVn) return "Vui lòng chọn định dạng phim";
    if (!form.languageVn) return "Vui lòng chọn ngôn ngữ phim";

    // Time validation (must match logic in isFormValid)
    if (form.startTime && form.endTime) {
      const start = new Date(`2000-01-01T${form.startTime}:00`);
      const end = new Date(`2000-01-01T${form.endTime}:00`);
      if (end <= start) return "Giờ kết thúc phải sau giờ bắt đầu";
    }
    
    // Date validation (must match logic in isFormValid)
    if (mode === "add" && form.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const showDate = new Date(form.date);
      if (showDate < today) return "Ngày chiếu không thể là ngày trong quá khứ";
    }
    
    // Check for validation errors
    if (Object.keys(errors).length > 0) return "Vui lòng sửa các lỗi trước khi tiếp tục";
    
    // This should not happen if the function is called correctly (only when !isFormValid())
    return "Có lỗi không xác định";
  };

  const handleSubmit = () => {
    if (validateForm() && onSubmit) {
      // Auto-calculate end time based on movie duration if not present
      if (selectedMovie && form.startTime && !form.endTime && selectedMovie.time) {
        try {
          const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
          if (timeRegex.test(form.startTime)) {
            const [hours, minutes] = form.startTime.split(':').map(Number);
            const start = new Date();
            start.setHours(hours, minutes, 0, 0);
            
            const end = new Date(start.getTime() + selectedMovie.time * 60000);
            const endTimeStr = end.toTimeString().substring(0, 5);
            setForm(prev => ({ ...prev, endTime: endTimeStr }));
          }
        } catch (error) {
          console.error('Error calculating end time in submit:', error);
        }
      }

      const submitData: Showtime = {
        ...form,
        movieNameVn: selectedMovie?.nameVn || form.movieNameVn,
        roomName: selectedRoom?.name || '',
        // Ensure all required fields are filled
        movieId: form.movieId || '',
        theaterId: form.theaterId || '',
        roomId: form.roomId || '',
        date: form.date || '',
        startTime: form.startTime || '',
        endTime: form.endTime || '',
        languageVn: form.languageVn || 'Lồng Tiếng',
        languageEn: form.languageEn || 'VN',
        formatVn: form.formatVn || '2D',
        formatEn: form.formatEn || '2D',
      };
      onSubmit(submitData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const newForm = { ...prev, [name]: value };
      
      // Auto-set English equivalents
      if (name === 'formatVn') {
        newForm.formatEn = value; // Same format for English
      }
      if (name === 'languageVn') {
        const langMap: Record<string, string> = {
          'Lồng Tiếng': 'VN',
          'Phụ Đề': 'EN',
          'Tiếng Anh': 'EN'
        };
        newForm.languageEn = langMap[value] || value;
      }
      
      return newForm;
    });
    
    // Handle theater change - load rooms for selected theater
    if (name === 'theaterId' && onTheaterChange) {
      onTheaterChange(value);
      // Reset room selection when theater changes
      setForm(prev => ({ ...prev, roomId: '' }));
    }
    
    // Auto-calculate end time when movie or start time changes
    if (name === 'movieId' || name === 'startTime') {
      const movie = name === 'movieId' ? movies.find(m => m.id === value) : selectedMovie;
      const startTime = name === 'startTime' ? value : form.startTime;
      
      if (movie && startTime && movie.time) {
        try {
          // Validate startTime format (HH:MM)
          const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
          if (timeRegex.test(startTime)) {
            const [hours, minutes] = startTime.split(':').map(Number);
            const start = new Date();
            start.setHours(hours, minutes, 0, 0);
            
            const end = new Date(start.getTime() + movie.time * 60000);
            const endTimeStr = end.toTimeString().substring(0, 5);
            setForm(prev => ({ ...prev, endTime: endTimeStr }));
          }
        } catch (error) {
          console.error('Error calculating end time:', error);
          // Don't update endTime if there's an error
        }
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

  // Helper function to check if field can be edited
  const canEditField = (fieldName: string): boolean => {
    if (mode !== "edit" || !showtime) return true;
    
    // Business logic for field editing restrictions
    const hasBookedSeats = (showtime.bookedSeats || 0) > 0;
    const isStartingSoon = showtime.date && showtime.startTime ? (() => {
      const now = new Date();
      const showtimeDate = new Date(showtime.date);
      const [hours, minutes] = showtime.startTime.split(':').map(Number);
      const startDateTime = new Date(showtimeDate);
      startDateTime.setHours(hours, minutes, 0, 0);
      const timeDiff = startDateTime.getTime() - now.getTime();
      return timeDiff < 2 * 60 * 60 * 1000; // Less than 2 hours
    })() : false;

    const currentStatus = getShowtimeStatus(showtime.date, showtime.startTime, showtime.endTime);
    const isOngoingOrFinished = currentStatus.key === 'ongoing' || currentStatus.key === 'finished';

    // Rules for field editing
    switch (fieldName) {
      case 'movieId':
        return !hasBookedSeats && !isOngoingOrFinished;
      case 'roomId':
        return !hasBookedSeats && !isOngoingOrFinished; // Room change affects seat map
      case 'date':
      case 'startTime':
      case 'endTime':
        return !hasBookedSeats && !isStartingSoon && !isOngoingOrFinished;
      case 'languageVn':
      case 'languageEn':
      case 'formatVn':
      case 'formatEn':
        return !isOngoingOrFinished; // Can change language/format with warning
      default:
        return true;
    }
  };

  // Get warning message for field editing
  const getFieldWarning = (fieldName: string): string => {
    if (mode !== "edit" || !showtime) return '';
    
    const hasBookedSeats = (showtime.bookedSeats || 0) > 0;
    
    switch (fieldName) {
      case 'languageVn':
      case 'formatVn':
        return hasBookedSeats ? 'Thay đổi này có thể ảnh hưởng đến khách hàng đã đặt vé' : '';
      default:
        return '';
    }
  };

  // Helper function to calculate showtime status based on date and time
  const getShowtimeStatus = (date: string, startTime: string, endTime: string): { key: string; label: string; color: string } => {
    if (!date || !startTime || !endTime) {
      return { key: "unknown", label: "Không xác định", color: "bg-gray-100 text-gray-800" };
    }

    const now = new Date();
    const showtimeDate = new Date(date);
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startDateTime = new Date(showtimeDate);
    startDateTime.setHours(startHour, startMin, 0, 0);
    
    const endDateTime = new Date(showtimeDate);
    endDateTime.setHours(endHour, endMin, 0, 0);

    if (now < startDateTime) {
      return { key: "upcoming", label: "Sắp chiếu", color: "bg-blue-100 text-blue-800" };
    } else if (now >= startDateTime && now <= endDateTime) {
      return { key: "ongoing", label: "Đang chiếu", color: "bg-yellow-100 text-yellow-800" };
    } else {
      return { key: "finished", label: "Đã kết thúc", color: "bg-gray-100 text-gray-600" };
    }
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
            {/* Movie Selection */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Film className="w-4 h-4" />
                  Phim *
                  {!canEditField('movieId') && (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                      Không thể thay đổi
                    </span>
                  )}
                </label>
                {isView ? (
                  <div className="w-full border rounded-lg px-4 py-3 bg-slate-50 border-slate-200 text-slate-600">
                    {selectedMovie?.nameVn || form.movieNameVn || 'Chưa chọn phim'}
                  </div>
                ) : (
                  <select
                    name="movieId"
                    value={form.movieId || ''}
                    onChange={handleChange}
                    disabled={!canEditField('movieId')}
                    className={`w-full px-3 py-3 border rounded-lg transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${
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
            </div>

            {/* Theater & Room Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Rạp chiếu *
                  {!canEditField('theaterId') && (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                      Không thể thay đổi
                    </span>
                  )}
                </label>
                {isView ? (
                  <div className="w-full border rounded-lg px-4 py-3 bg-slate-50 border-slate-200 text-slate-600">
                    {theaters.find(t => t.id === form.theaterId)?.nameVn || 'Chưa chọn rạp'}
                  </div>
                ) : (
                  <select
                    name="theaterId"
                    value={form.theaterId || ''}
                    onChange={handleChange}
                    disabled={!canEditField('theaterId')}
                    className={`w-full px-3 py-3 border rounded-lg transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors.theaterId
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  >
                    <option value="">Chọn rạp</option>
                    {theaters.map((theater) => (
                      <option key={theater.id} value={theater.id}>
                        {theater.nameVn}
                      </option>
                    ))}
                  </select>
                )}
                {errors.theaterId && (
                  <p className="text-red-500 text-xs mt-1">{errors.theaterId}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Phòng chiếu *
                  {!canEditField('roomId') && (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                      Không thể thay đổi
                    </span>
                  )}
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
                    disabled={!form.theaterId || !canEditField('roomId')}
                    className={`w-full px-3 py-3 border rounded-lg transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors.roomId
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                  >
                    <option value="">
                      {!form.theaterId ? "Chọn rạp trước" : "Chọn phòng"}
                    </option>
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
                  {!canEditField('date') && (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                      Không thể thay đổi
                    </span>
                  )}
                </label>
                {isView ? (
                  <div className="w-full border rounded-lg px-4 py-3 bg-slate-50 border-slate-200 text-slate-600">
                    {form.date ? new Date(form.date).toLocaleDateString('vi-VN') : ''}
                  </div>
                ) : (
                  <input
                    type="date"
                    name="date"
                    value={form.date || ''}
                    onChange={handleChange}
                    disabled={!canEditField('date')}
                    className={`w-full border rounded-lg px-4 py-3 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                      errors.date
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-slate-300 focus:border-transparent'
                    }`}
                  />
                )}
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Giờ bắt đầu *
                  {!canEditField('startTime') && (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                      Không thể thay đổi
                    </span>
                  )}
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
                    disabled={!canEditField('startTime')}
                    className={`w-full border rounded-lg px-4 py-3 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${
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
                  {!canEditField('endTime') && (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                      Không thể thay đổi
                    </span>
                  )}
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

            {/* Format & Language */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  Định dạng phim *
                  {getFieldWarning('formatVn') && (
                    <span title={getFieldWarning('formatVn')}>
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    </span>
                  )}
                </label>
                {isView ? (
                  <div className="w-full border rounded-lg px-4 py-3 bg-slate-50 border-slate-200 text-slate-600">
                    {form.formatVn} / {form.formatEn}
                  </div>
                ) : (
                  <>
                    <select
                      name="formatVn"
                      value={form.formatVn}
                      onChange={handleChange}
                      disabled={!canEditField('formatVn')}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Chọn định dạng</option>
                      <option value="2D">2D</option>
                      <option value="3D">3D</option>
                      <option value="IMAX">IMAX</option>
                      <option value="4DX">4DX</option>
                    </select>
                    {getFieldWarning('formatVn') && (
                      <p className="text-amber-600 text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {getFieldWarning('formatVn')}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  Ngôn ngữ *
                  {getFieldWarning('languageVn') && (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  )}
                </label>
                {isView ? (
                  <div className="w-full border rounded-lg px-4 py-3 bg-slate-50 border-slate-200 text-slate-600">
                    {form.languageVn} / {form.languageEn}
                  </div>
                ) : (
                  <>
                    <select
                      name="languageVn"
                      value={form.languageVn}
                      onChange={handleChange}
                      disabled={!canEditField('languageVn')}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Chọn ngôn ngữ</option>
                      <option value="Lồng Tiếng">Lồng Tiếng</option>
                      <option value="Phụ Đề">Phụ Đề</option>
                      <option value="Tiếng Anh">Tiếng Anh</option>
                    </select>
                    {getFieldWarning('languageVn') && (
                      <p className="text-amber-600 text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {getFieldWarning('languageVn')}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Trạng thái
                </label>
                {(() => {
                    const status = getShowtimeStatus(form.date, form.startTime, form.endTime);
                    return (
                    <div className={`flex justify-center items-center h-12 px-3 py-1 text-md font-semibold rounded-full ${status.color}`}>
                        {status.label}
                    </div>
                    );
                })()}
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
              <div className="flex flex-col gap-3 pt-4 border-t border-slate-200">
                {!isFormValid() && (
                  <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{getDisabledMessage()}</span>
                  </div>
                )}
                <div className="flex gap-3">
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
                    disabled={!isFormValid()}
                    title={!isFormValid() ? getDisabledMessage() : ''}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
                      !isFormValid()
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : isAdd 
                          ? 'bg-green-600 hover:bg-green-700 text-white' 
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isAdd ? "Thêm suất chiếu" : "Lưu thay đổi"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowtimeModal;
