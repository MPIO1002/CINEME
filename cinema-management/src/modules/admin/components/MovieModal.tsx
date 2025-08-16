import { Calendar, CheckCircle, Clock, Edit3, Eye, FileText, Film, Image, Plus, Star, User, UserPlus, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { actorApiService, type Actor } from '../../../services/actorApi';
import { movieApiService, type Movie, type MovieDetail } from '../../../services/movieApi';
import ActorModal from './ActorModal';

import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

interface DropdownOption {
  id: string;
  name: string;
}

interface MovieModalProps {
  open: boolean;
  mode: "add" | "edit" | "view";
  movie?: string;
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
      className={`w-full h-12 border rounded-lg px-4 py-3 transition-all duration-200 ${
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
  movie, // movieId as string
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<Movie>({
    nameVn: "",
    nameEn: "",
    director: "",
    countryId: "",
    releaseDate: "",
    endDate: "",
    briefVn: "",
    briefEn: "",
    image: "",
    trailer: "",
    time: 90,
    limitageId: "",
    status: "2",
  });

  const [imageError, setImageError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Actor selection states
  const [selectedActors, setSelectedActors] = useState<Actor[]>([]);
  const [allActors, setAllActors] = useState<Actor[]>([]);
  const [isActorModalOpen, setIsActorModalOpen] = useState(false);
  const [loadingActors, setLoadingActors] = useState(false);

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
    { id: "8a4524a5-36aa-4354-af88-c56a191592ac", name: "T16 - Phim dành cho khán giả từ đủ 16 tuổi trở lên" },
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

  // Load all actors for autocomplete
  const loadActors = async () => {
    try {
      setLoadingActors(true);
      const actors = await actorApiService.getAllActors();
      setAllActors(actors);
    } catch (error) {
      console.error('Error loading actors:', error);
    } finally {
      setLoadingActors(false);
    }
  };

  // Fetch movie detail when movieId is provided
  useEffect(() => {
    const fetchMovieDetail = async () => {
      if (movie && (mode === "edit" || mode === "view")) {
        setLoading(true);
        try {
          const movieDetail: MovieDetail = await movieApiService.getMovieDetail(movie);
          // Convert MovieDetail to Movie interface
          setForm({
            id: movieDetail.id,
            nameVn: movieDetail.nameVn,
            nameEn: movieDetail.nameEn,
            director: movieDetail.director,
            releaseDate: movieDetail.releaseDate,
            endDate: movieDetail.endDate,
            briefVn: movieDetail.briefVn,
            briefEn: movieDetail.briefEn,
            image: movieDetail.image,
            trailer: movieDetail.trailer,
            time: movieDetail.time,
            ratings: movieDetail.ratings,
            status: movieDetail.status,
            // Use mapped fields from API (you'll need to map these IDs later)
            countryId: movieDetail.countryVn, // Temporary - should map to ID
            limitageId: movieDetail.limitageNameVn, // Temporary - should map to ID  
          });
          
          // Load actors for this movie if available
          // TODO: Load movie actors from API when endpoint is available
          setSelectedActors(movieDetail.listActor || []);
          console.log('Fetched movie detail:', movieDetail);
        } catch (error) {
          console.error('Error fetching movie detail:', error);
        }
        setLoading(false);
      } else if (mode === "add") {
        // Reset form for add mode
        setForm({
          nameVn: "",
          nameEn: "",
          director: "",
          countryId: "",
          releaseDate: "",
          endDate: "",
          briefVn: "",
          briefEn: "",
          image: "",
          trailer: "",
          time: 90,
          limitageId: "",
          status: "2",
        });
        setSelectedActors([]);
      }
    };

    if (open) {
      fetchMovieDetail();
      loadActors(); // Load actors for autocomplete
    }
    
    setImageError(false);
    setErrors({});
  }, [movie, mode, open]);

  // Remove actor from selection
  const removeActor = (actorId: string) => {
    setSelectedActors(prev => prev.filter(actor => actor.id !== actorId));
  };

  // Handle new actor creation
  const handleNewActorSubmit = (newActor: Actor) => {
    // Add the new actor to selection
    setSelectedActors(prev => [...prev, newActor]);
    setIsActorModalOpen(false);
  };

  if (!open) return null;

  // Show loading spinner while fetching movie detail
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="bg-white rounded-2xl shadow-2xl p-8 z-20">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <p className="text-center text-slate-600 mt-4">Đang tải thông tin phim...</p>
        </div>
      </div>
    );
  }

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

    if (!form.countryId?.trim()) {
      newErrors.countryId = "Quốc gia là bắt buộc";
    }

    if (!form.limitageId?.trim()) {
      newErrors.limitageId = "Giới hạn tuổi là bắt buộc";
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

    // if (!form.listActor || form.listActor.length === 0) {
    //   newErrors.listActor = "Danh sách diễn viên là bắt buộc";
    // }

    setErrors(newErrors);
    
    // Log validation results for debugging
    if (Object.keys(newErrors).length > 0) {
      console.log('Validation errors found:', newErrors);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    console.log('Submit clicked');
    console.log('Form data:', form);
    console.log('Selected actors:', selectedActors);
    
    const isValid = validateForm();
    console.log('Validation result:', isValid);
    console.log('Validation errors:', errors);
    
    if (isValid && onSubmit) {
      console.log('Calling onSubmit with form data');
      // Add selected actors to form before submitting
      const formWithActors = {
        ...form,
        listActor: selectedActors
      };
      console.log('Final form data:', formWithActors);
      onSubmit(formWithActors);
    } else {
      console.log('Validation failed or onSubmit not provided');
      console.log('onSubmit:', onSubmit);
      
      // Show validation errors to user
      if (Object.keys(errors).length > 0) {
        const errorMessages = Object.entries(errors).map(([field, message]) => `${field}: ${message}`).join('\n');
        alert('Vui lòng kiểm tra các lỗi sau:\n\n' + errorMessages);
      } else if (!onSubmit) {
        alert('onSubmit function is not provided');
      }
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
                  <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    Tên phim (Tiếng Việt)<span className="text-red-500 font-">*</span>
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
                  <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Đạo diễn *
                  </label>
                  <input
                    type="text"
                    name="director"
                    value={form.director}
                    onChange={handleChange}
                    disabled={isView}
                    className={`w-full h-12 border rounded-lg px-4 py-3 transition-all duration-200 ${
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
                    <Star className="w-4 h-4" />
                    Quốc gia *
                  </label>

                  {isView ? (
                    <input
                      type="text"
                      value={getOptionName(countries, form.countryId || '')}
                      readOnly
                      className="w-full border rounded-lg px-4 py-3 bg-slate-50 border-slate-200 text-slate-600"
                    />
                  ) : (
                    <Dropdown
                      options={countries}
                      value={form.countryId || ''}
                      onChange={(value) => setForm({ ...form, countryId: value })}
                      placeholder="Chọn quốc gia"
                      error={!!errors.countryId}
                    />
                  )}
                  {errors.countryId && (
                    <p className="text-red-500 text-xs mt-1">{errors.countryId}</p>
                  )}
                </div>
              </div>

              {/* Dates and Duration */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
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
                  <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
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
                      value={getOptionName(limitages, form.limitageId || '')}
                      readOnly
                      className="w-full border rounded-lg px-4 py-3 bg-slate-50 border-slate-200 text-slate-600"
                    />
                  ) : (
                    <Dropdown
                      options={limitages}
                      value={form.limitageId || ''}
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

              {/* Actor Selection */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Diễn viên
                </label>

                {!isView && (
                  <div className="space-y-3">
                    {/* Actor Search with MUI Autocomplete */}
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Autocomplete
                          multiple
                          id="actor-autocomplete"
                          options={allActors}
                          loading={loadingActors}
                          value={selectedActors}
                          onChange={(_event, newValue) => {
                            setSelectedActors(newValue);
                          }}
                          getOptionLabel={(option) => option.name}
                          getOptionKey={(option) => option.id ? option.id : option.name}
                          isOptionEqualToValue={(option, value) => {
                            // Handle comparison when ids might be missing
                            if (option.id && value.id) {
                              return option.id === value.id;
                            }
                            // Fallback to name comparison if no IDs
                            return option.name === value.name;
                          }}
                          renderOption={(props, option, { selected }) => (
                            <li {...props}>
                              <Checkbox
                                icon={icon}
                                checkedIcon={checkedIcon}
                                style={{ marginRight: 8 }}
                                checked={selected}
                              />
                              <div className="flex items-center gap-2">
                                {option.img && typeof option.img === 'string' ? (
                                  <img 
                                    src={`http://127.0.0.1:9000/${option.img}`}
                                    alt={option.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-slate-400" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium">{option.name}</p>
                                  {option.nationality && (
                                    <p className="text-xs text-slate-500">{option.nationality}</p>
                                  )}
                                </div>
                              </div>
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField 
                              {...params} 
                              label="Chọn diễn viên" 
                              placeholder="Tìm kiếm và chọn diễn viên..."
                              variant="outlined"
                            />
                          )}
                          renderTags={(tagValue, getTagProps) => (
                            tagValue.map((option, index) => (
                              <div
                                {...getTagProps({ index })}
                                className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1 rounded-lg border border-blue-200 m-1"
                              >
                                {option.img && typeof option.img === 'string' ? (
                                  <img 
                                    src={`http://127.0.0.1:9000/${option.img}`}
                                    alt={option.name}
                                    className="w-5 h-5 rounded-full object-cover"
                                  />
                                ) : (
                                  <User className="w-4 h-4" />
                                )}
                                <span className="text-sm font-medium">{option.name}</span>
                                <button
                                  type="button"
                                  onClick={() => removeActor(option.id || '')}
                                  className="ml-1 text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))
                          )}
                          sx={{ width: '100%' }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsActorModalOpen(true)}
                        className="px-4 h-12 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
                        title="Thêm diễn viên mới"
                      >
                        <UserPlus className="w-4 h-4" />
                        Thêm mới
                      </button>
                    </div>
                  </div>
                )}

                {/* View Mode - Show selected actors */}
                {isView && selectedActors.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedActors.map((actor) => (
                      <div
                        key={actor.id}
                        className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 px-3 py-2 rounded-lg"
                      >
                        {actor.img && typeof actor.img === 'string' ? (
                          <img 
                            src={`http://127.0.0.1:9000/${actor.img}`}
                            alt={actor.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                        <span className="text-sm font-medium">{actor.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {isView && selectedActors.length === 0 && (
                  <div className="text-slate-500 text-sm">Chưa có diễn viên nào được chọn</div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
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
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
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

      {/* Actor Modal for adding new actors */}
      <ActorModal
        open={isActorModalOpen}
        mode="add"
        onClose={() => setIsActorModalOpen(false)}
        onSubmit={handleNewActorSubmit}
      />
    </div>
  );
};

export default MovieModal;
// Demo Component
