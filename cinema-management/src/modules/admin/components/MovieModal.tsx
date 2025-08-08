import { Calendar, CheckCircle, Clock, Edit3, Eye, FileText, Film, Image, Plus, Star, User, X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Movie {
  id?: string;
  nameVn: string;
  nameEn: string;
  director: string;
  countryId: string;
  formatId: string;
  releaseDate: string;
  endDate: string;
  briefVn: string;
  briefEn: string;
  image: string | File | ""; // API returns string, but form accepts File or empty
  trailer: string | File | ""; // API returns string, but form accepts File or empty
  time: number;
  limitageId: string;
  languageId: string;
  ratings?: string;
  status: string;
  sortorder?: number;
}

interface DropdownOption {
  id: string;
  name: string;
}

interface MovieModalProps {
  open: boolean;
  mode: "add" | "edit" | "view";
  movie?: Movie;
  onClose: () => void;
  onSubmit: (movie: Movie) => void;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  error?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ options, value, onChange, placeholder, disabled = false, error = false }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`mt-1 block w-full h-12 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
        error 
          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
          : 'border-gray-300 focus:ring-black-500 focus:border-black-500'
      } ${disabled ? 'bg-gray-50 text-gray-500' : ''}`}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  );
};

const MovieModal: React.FC<MovieModalProps> = ({
  open,
  mode,
  movie,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<Movie>(
    movie || {
      nameVn: "",
      nameEn: "",
      director: "",
      countryId: "",
      formatId: "",
      releaseDate: "",
      endDate: "",
      briefVn: "",
      briefEn: "",
      image: "",
      trailer: "",
      time: 90,
      limitageId: "",
      languageId: "",
      status: "2",
      sortorder: 2,
    }
  );

  const [imageError, setImageError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock data for dropdowns - you should replace with API calls
  const countries: DropdownOption[] = [
    { id: "e05acda1-df71-4578-a40b-6766a1ba8e23", name: "Việt Nam" },
    { id: "550e8400-e29b-41d4-a716-446655440001", name: "Hoa Kỳ" },
    { id: "550e8400-e29b-41d4-a716-446655440002", name: "Nhật Bản" },
  ];

  const formats: DropdownOption[] = [
    { id: "7835de0f-c073-43d4-a086-e1d9ae8dbed4", name: "2D" },
    { id: "f2345678-2345-2345-2345-234567890123", name: "3D" },
    { id: "f3456789-3456-3456-3456-345678901234", name: "IMAX" },
  ];

  const limitages: DropdownOption[] = [
    { id: "16e1ac95-3413-4069-8852-3df676ee17e6", name: "T13 - Phim dành cho khán giả từ đủ 13 tuổi trở lên" },
    { id: "26e1ac95-3413-4069-8852-3df676ee17e7", name: "T16 - Phim dành cho khán giả từ đủ 16 tuổi trở lên" },
    { id: "36e1ac95-3413-4069-8852-3df676ee17e8", name: "T18 - Phim dành cho khán giả từ đủ 18 tuổi trở lên" },
  ];

  const languages: DropdownOption[] = [
    { id: "1db4ab93-0c22-44d5-96f1-f78f8e3a0ecb", name: "Tiếng Việt" },
    { id: "2db4ab93-0c22-44d5-96f1-f78f8e3a0ecc", name: "Tiếng Anh" },
    { id: "3db4ab93-0c22-44d5-96f1-f78f8e3a0ecd", name: "Tiếng Nhật" },
  ];

  const statuses: DropdownOption[] = [
    { id: "1", name: "Đang chiếu" },
    { id: "2", name: "Sắp chiếu" },
    { id: "3", name: "Đã kết thúc" },
    { id: "0", name: "Tạm ngưng" },
  ];

  useEffect(() => {
    if (movie) setForm(movie);
    else if (mode === "add") setForm({
      nameVn: "",
      nameEn: "",
      director: "",
      countryId: "",
      formatId: "",
      releaseDate: "",
      endDate: "",
      briefVn: "",
      briefEn: "",
      image: "",
      trailer: "",
      time: 90,
      limitageId: "",
      languageId: "",
      status: "2",
      sortorder: 2,
    });
    setImageError(false);
    setErrors({});
  }, [movie, mode, open]);

  if (!open) return null;

  const isView = mode === "view";
  const isAdd = mode === "add";
  const isEdit = mode === "edit";

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!form.nameVn.trim()) {
      newErrors.nameVn = "Tên phim (Tiếng Việt) là bắt buộc";
    }

    if (!form.director.trim()) {
      newErrors.director = "Đạo diễn là bắt buộc";
    }

    if (!form.formatId.trim()) {
      newErrors.formatId = "Định dạng là bắt buộc";
    }

    if (!form.countryId.trim()) {
      newErrors.countryId = "Quốc gia là bắt buộc";
    }

    if (!form.limitageId.trim()) {
      newErrors.limitageId = "Giới hạn tuổi là bắt buộc";
    }

    if (!form.languageId.trim()) {
      newErrors.languageId = "Ngôn ngữ là bắt buộc";
    }

    if (!form.releaseDate) {
      newErrors.releaseDate = "Ngày phát hành là bắt buộc";
    }

    if (!form.endDate) {
      newErrors.endDate = "Ngày kết thúc là bắt buộc";
    }

    // Validate dates
    if (form.releaseDate && form.endDate) {
      const releaseDate = new Date(form.releaseDate);
      const endDate = new Date(form.endDate);
      
      if (endDate <= releaseDate) {
        newErrors.endDate = "Ngày kết thúc phải sau ngày phát hành";
      }
    }

    // Validate time
    if (form.time <= 0) {
      newErrors.time = "Thời lượng phải lớn hơn 0";
    }

    // Validate trailer - chấp nhận File mới hoặc string từ DB (chỉ bắt buộc khi add)
    if (!form.trailer && mode === "add") {
      newErrors.trailer = "File trailer là bắt buộc";
    } else if (form.trailer instanceof File) {
      if (form.trailer.size === 0) {
        newErrors.trailer = "File trailer không hợp lệ hoặc không tồn tại";
      } else if (!form.trailer.type.startsWith('video/')) {
        newErrors.trailer = "File trailer phải là định dạng video";
      }
    }
    // If trailer is string (from existing movie) or empty in edit mode, it's valid

    // Validate image - chấp nhận File mới hoặc string từ DB (chỉ bắt buộc khi add)
    if (!form.image && mode === "add") {
      newErrors.image = "File poster phim là bắt buộc";
    } else if (form.image instanceof File) {
      if (form.image.size === 0) {
        newErrors.image = "File ảnh không hợp lệ hoặc không tồn tại";
      } else if (!form.image.type.startsWith('image/')) {
        newErrors.image = "File poster phải là định dạng ảnh";
      }
    }
    // If image is string (from existing movie) or empty in edit mode, it's valid

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm() && onSubmit) {
      onSubmit(form);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
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
      case "add": return "Thêm phim mới";
      case "edit": return "Chỉnh sửa phim";
      case "view": return "Chi tiết phim";
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case "add": return "text-green-600";
      case "edit": return "text-blue-600";
      case "view": return "text-purple-600";
    }
  };

  // Helper function to get name from dropdown options
  const getOptionName = (options: DropdownOption[], id: string) => {
    const option = options.find(opt => opt.id === id);
    return option ? option.name : id;
  };

  const formatDateForInput = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // Vẫn giữ YYYY-MM-DD cho input
};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden z-20">
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
                  {isAdd && "Điền thông tin để thêm phim mới"}
                  {isEdit && "Cập nhật thông tin phim"}
                  {isView && "Xem chi tiết thông tin phim"}
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
        <div className="flex max-h-[calc(90vh-80px)]">
          {/* Left Side - Image Preview */}
          <div className="w-1/3 bg-slate-50 p-6 border-r border-slate-200">
            <div className="sticky top-0">
              <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Image className="w-4 h-4" />
                Poster phim (Upload File)
              </label>

              {!isView && (
                <div className="mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setForm(prev => ({ ...prev, image: file }));
                        setImageError(false);
                        // Clear error when file is selected
                        if (errors.image) {
                          setErrors(prev => ({ ...prev, image: "" }));
                        }
                      }
                    }}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:border-transparent transition-all duration-200 cursor-pointer"
                  />
                  {errors.image && (
                    <p className="text-red-500 text-xs mt-1">{errors.image}</p>
                  )}
                </div>
              )}
              {imageError && (
                <p className="text-red-500 text-xs mt-1">Không thể tải ảnh</p>
              )}

              <div className="relative">
                {form.image && !imageError ? (
                  <div className="group relative">
                    <img 
                      src={form.image instanceof File ? URL.createObjectURL(form.image) : form.image} 
                      alt="Movie poster" 
                      className="w-full aspect-[2/3] object-cover rounded-xl shadow-lg"
                      onError={() => setImageError(true)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 rounded-xl" />
                  </div>
                ) : (
                  <div className="w-full aspect-[2/3] bg-slate-200 rounded-xl flex items-center justify-center">
                    <div className="text-center text-slate-400">
                      <Film className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Chưa có poster</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Movie Titles */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    Tên phim (Tiếng Việt) *
                  </label>
                  <input
                    type="text"
                    name="nameVn"
                    value={form.nameVn}
                    onChange={handleChange}
                    disabled={isView}
                    className={`w-full border rounded-lg px-4 py-3 transition-all duration-200 ${
                      isView 
                        ? 'bg-slate-50 border-slate-200 text-slate-600' 
                        : errors.nameVn
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-slate-300'
                    }`}
                    required
                    placeholder={!isView ? "Nhập tên phim bằng tiếng Việt..." : ""}
                  />
                  {errors.nameVn && (
                    <p className="text-red-500 text-xs mt-1">{errors.nameVn}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tên phim (Tiếng Anh)
                  </label>
                  <input
                    type="text"
                    name="nameEn"
                    value={form.nameEn}
                    onChange={handleChange}
                    disabled={isView}
                    className={`w-full border rounded-lg px-4 py-3 transition-all duration-200 ${
                      isView 
                        ? 'bg-slate-50 border-slate-200 text-slate-600' 
                        : 'border-slate-300 focus:border-transparent'
                    }`}
                    placeholder={!isView ? "Nhập tên phim bằng tiếng Anh..." : ""}
                  />
                </div>
              </div>

              {/* Director and Format */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Đạo diễn *
                  </label>
                  <input
                    type="text"
                    name="director"
                    value={form.director}
                    onChange={handleChange}
                    disabled={isView}
                    className={`w-full border rounded-lg px-4 py-3 transition-all duration-200 ${
                      isView 
                        ? 'bg-slate-50 border-slate-200 text-slate-600' 
                        : errors.director
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-slate-300 focus:border-transparent'
                    }`}
                    placeholder="Tên đạo diễn..."
                  />
                  {errors.director && (
                    <p className="text-red-500 text-xs mt-1">{errors.director}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    Định dạng *
                  </label>
                  
                    {isView ? (
                        <input
                        type="text"
                        value={getOptionName(formats, form.formatId)}
                        readOnly
                        className="w-full border rounded-lg px-4 py-3 bg-slate-50 border-slate-200 text-slate-600"
                        />
                    ) : (
                        <Dropdown
                        options={formats}
                        value={form.formatId}
                        onChange={(value) => setForm({ ...form, formatId: value })}
                        placeholder="Chọn định dạng"
                        error={!!errors.formatId}
                        />
                    )}
                  {errors.formatId && (
                    <p className="text-red-500 text-xs mt-1">{errors.formatId}</p>
                  )}
                </div>
              </div>

              {/* Dates and Duration */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Ngày phát hành *
                  </label>
                  <input
                    type="date"
                    name="releaseDate"
                    value={formatDateForInput(form.releaseDate)}
                    onChange={handleChange}
                    disabled={isView}
                    className={`w-full border rounded-lg px-4 py-3 transition-all duration-200 ${
                      isView 
                        ? 'bg-slate-50 border-slate-200 text-slate-600' 
                        : errors.releaseDate
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-slate-300 focus:border-transparent'
                    }`}
                  />
                  {errors.releaseDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.releaseDate}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Ngày kết thúc *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formatDateForInput(form.endDate)}
                    onChange={handleChange}
                    disabled={isView}
                    className={`w-full border rounded-lg px-4 py-3 transition-all duration-200 ${
                      isView 
                        ? 'bg-slate-50 border-slate-200 text-slate-600' 
                        : errors.endDate
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-slate-300 focus:border-transparent'
                    }`}
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Thời lượng (phút) *
                  </label>
                  <input
                    type="number"
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                    disabled={isView}
                    min="1"
                    className={`w-full border rounded-lg px-4 py-3 transition-all duration-200 ${
                      isView 
                        ? 'bg-slate-50 border-slate-200 text-slate-600' 
                        : errors.time
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-slate-300 focus:border-transparent'
                    }`}
                    placeholder="90"
                  />
                  {errors.time && (
                    <p className="text-red-500 text-xs mt-1">{errors.time}</p>
                  )}
                </div>
              </div>

              {/* Country and Language */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Quốc gia *
                  </label>

                  {isView ? (
                    <input
                      type="text"
                      value={getOptionName(countries, form.countryId)}
                      readOnly
                      className="w-full border rounded-lg px-4 py-3 bg-slate-50 border-slate-200 text-slate-600"
                    />
                  ) : (
                    <Dropdown
                      options={countries}
                      value={form.countryId}
                      onChange={(value) => setForm({ ...form, countryId: value })}
                      placeholder="Chọn quốc gia"
                      error={!!errors.countryId}
                    />
                  )}
                  {errors.countryId && (
                    <p className="text-red-500 text-xs mt-1">{errors.countryId}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Ngôn ngữ *
                  </label>
                  {isView ? (
                    <input
                      type="text"
                      value={getOptionName(languages, form.languageId)}
                      readOnly
                      className="w-full border rounded-lg px-4 py-3 bg-slate-50 border-slate-200 text-slate-600"
                    />
                  ) : (
                    <Dropdown
                      options={languages}
                      value={form.languageId}
                      onChange={(value) => setForm({ ...form, languageId: value })}
                      placeholder="Chọn ngôn ngữ"
                      error={!!errors.languageId}
                    />
                  )}
                  {errors.languageId && (
                    <p className="text-red-500 text-xs mt-1">{errors.languageId}</p>
                  )}
                </div>
              </div>

              {/* Age Limit and sortorder */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Giới hạn tuổi *
                  </label>
                  {isView ? (
                    <input
                      type="text"
                      value={getOptionName(limitages, form.limitageId)}
                      readOnly
                      className="w-full border rounded-lg px-4 py-3 bg-slate-50 border-slate-200 text-slate-600"
                    />
                  ) : (
                    <Dropdown
                      options={limitages}
                      value={form.limitageId}
                      onChange={(value) => setForm({ ...form, limitageId: value })}
                      placeholder="Chọn giới hạn tuổi"
                      error={!!errors.limitageId}
                    />
                    )}
                  {errors.limitageId && (
                    <p className="text-red-500 text-xs mt-1">{errors.limitageId}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Trạng thái
                  </label>
                  {isView ? (
                    <input
                      type="text"
                      value={getOptionName(statuses, form.status?.toString() || "")}
                      readOnly
                      className="w-full border rounded-lg px-4 py-3 bg-slate-50 border-slate-200 text-slate-600"
                    />
                  ) : (
                    <Dropdown
                      options={statuses}
                      value={form.status?.toString() || ""}
                      onChange={(value) => setForm({ ...form, status: value })}
                      placeholder="Chọn trạng thái phim"
                      error={!!errors.status}
                    />
                  )}
                </div>
              </div>

              {/* Trailer Upload */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2">
                  Trailer (Upload File)
                </label>
                
                {!isView && (
                  <div>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setForm(prev => ({ ...prev, trailer: file }));
                          if (errors.trailer) {
                            setErrors(prev => ({ ...prev, trailer: "" }));
                          }
                        }
                      }}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:border-transparent transition-all duration-200 cursor-pointer"
                    />
                    {errors.trailer && (
                      <p className="text-red-500 text-xs mt-1">{errors.trailer}</p>
                    )}
                  </div>
                )}
                
                {isView && (
                  <div className="w-full border rounded-lg px-4 py-3 bg-slate-50 border-slate-200 text-slate-600">
                    {form.trailer instanceof File ? 'File đã upload' : form.trailer || 'Chưa có file'}
                  </div>
                )}
                
                {/* Display current trailer info */}
                {form.trailer && (
                  <div className="mt-2 text-xs text-slate-500">
                    {form.trailer instanceof File 
                      ? `File: ${form.trailer.name} (${(form.trailer.size / 1024 / 1024).toFixed(2)} MB)`
                      : `URL: ${form.trailer}`
                    }
                  </div>
                )}
                
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Mô tả phim (Tiếng Việt)
                </label>
                <textarea
                  name="briefVn"
                  value={form.briefVn}
                  onChange={handleChange}
                  disabled={isView}
                  rows={4}
                  className={`w-full border rounded-lg px-4 py-3 transition-all duration-200 resize-none ${
                    isView 
                      ? 'bg-slate-50 border-slate-200 text-slate-600' 
                      : 'border-slate-300 focus:border-transparent'
                  }`}
                  placeholder="Nhập mô tả nội dung phim..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Mô tả phim (Tiếng Anh)
                </label>
                <textarea
                  name="briefEn"
                  value={form.briefEn}
                  onChange={handleChange}
                  disabled={isView}
                  rows={4}
                  className={`w-full border rounded-lg px-4 py-3 transition-all duration-200 resize-none ${
                    isView 
                      ? 'bg-slate-50 border-slate-200 text-slate-600' 
                      : 'border-slate-300 focus:border-transparent'
                  }`}
                  placeholder="Nhập mô tả nội dung phim..."
                />
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
                    {isAdd ? "Thêm phim" : "Lưu thay đổi"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieModal;
// Demo Component
