import { Calendar, Edit3, Eye, FileText, Film, Plus, Star, User, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { actorApiService, type Actor } from '../../../../../services/actorApi';

interface ActorModalProps {
  open: boolean;
  mode: "add" | "edit" | "view";
  actor?: string; // actorId as string
  onClose: () => void;
  onSubmit: (actor: Actor) => void;
}

const ActorModal: React.FC<ActorModalProps> = ({
  open,
  mode,
  actor, // actorId as string
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<Actor>({
    name: "",
    img: "",
    dateOfBirth: "",
    nationality: "",
    biography: "",
    listMovie: [],
  });

  const [avatarError, setAvatarError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  // Fetch actor detail when actorId is provided
  useEffect(() => {
    const fetchActorDetail = async () => {
      if (actor && (mode === "edit" || mode === "view")) {
        setLoading(true);
        try {
          const actorDetail: Actor = await actorApiService.getActorDetail(actor);
          setForm(actorDetail);
        } catch (error) {
          console.error('Error fetching actor detail:', error);
        }
        setLoading(false);
      } else if (mode === "add") {
        // Reset form for add mode
        setForm({
          name: "",
          img: "",
          dateOfBirth: "",
          nationality: "",
          biography: "",
          listMovie: [],
        });
      }
    };

    if (open) {
      fetchActorDetail();
    }
    
    setAvatarError(false);
    setErrors({});
  }, [actor, mode, open]);

  if (!open) return null;

  // Show loading spinner while fetching actor detail
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
          <p className="text-center text-slate-600 mt-4">Đang tải thông tin diễn viên...</p>
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
    if (!form.name.trim()) {
      newErrors.name = "Tên diễn viên là bắt buộc";
    }

    // Validate img - only required when adding
    if (!form.img && mode === "add") {
      newErrors.img = "Ảnh đại diện là bắt buộc";
    } else if (form.img instanceof File) {
      if (form.img.size === 0) {
        newErrors.img = "File ảnh không hợp lệ hoặc không tồn tại";
      } else if (!form.img.type.startsWith('image/')) {
        newErrors.img = "File phải là định dạng ảnh";
      }
    }

    // Validate date of birth
    if (form.dateOfBirth) {
      const birthDate = new Date(form.dateOfBirth);
      const today = new Date();
      if (birthDate > today) {
        newErrors.dateOfBirth = "Ngày sinh không thể là tương lai";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm() && onSubmit) {
      onSubmit(form);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      case "add": return "Thêm diễn viên mới";
      case "edit": return "Chỉnh sửa diễn viên";
      case "view": return "Chi tiết diễn viên";
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case "add": return "text-green-600";
      case "edit": return "text-blue-600";
      case "view": return "text-purple-600";
    }
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden z-20">
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
                  {isAdd && "Điền thông tin để thêm diễn viên mới"}
                  {isEdit && "Cập nhật thông tin diễn viên"}
                  {isView && "Xem chi tiết thông tin diễn viên"}
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
          {/* Left Side - Avatar Preview */}
          <div className="w-1/3 bg-slate-50 p-6 border-r border-slate-200">
            <div className="sticky top-0">
              <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Ảnh đại diện
              </label>

              {!isView && (
                <div className="mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setForm(prev => ({ ...prev, img: file }));
                        setAvatarError(false);
                        if (errors.img) {
                          setErrors(prev => ({ ...prev, img: "" }));
                        }
                      }
                    }}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:border-transparent transition-all duration-200 cursor-pointer"
                  />
                  {errors.img && (
                    <p className="text-red-500 text-xs mt-1">{errors.img}</p>
                  )}
                </div>
              )}

              <div className="relative">
                {form.img && !avatarError ? (
                  <div className="group relative">
                    <img 
                      src={form.img instanceof File ? URL.createObjectURL(form.img) : form.img} 
                      alt="Actor img" 
                      className="w-full aspect-square object-cover rounded-xl shadow-lg"
                      onError={() => setAvatarError(true)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 rounded-xl" />
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-slate-200 rounded-xl flex items-center justify-center">
                    <div className="text-center text-slate-400">
                      <User className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Chưa có ảnh</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Actor Names */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Tên diễn viên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={isView}
                    className={`w-full border rounded-lg px-4 py-3 transition-all duration-200 ${
                      isView 
                        ? 'bg-slate-50 border-slate-200 text-slate-600' 
                        : errors.name
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-slate-300'
                    }`}
                    placeholder={!isView ? "Nhập tên diễn viên..." : ""}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>
                
              </div>

              {/* Date of Birth and Nationality */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formatDateForInput(form.dateOfBirth || '')}
                    onChange={handleChange}
                    disabled={isView}
                    className={`w-full border rounded-lg px-4 py-3 transition-all duration-200 ${
                      isView 
                        ? 'bg-slate-50 border-slate-200 text-slate-600' 
                        : errors.dateOfBirth
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-slate-300'
                    }`}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
                  )}
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Quốc tịch
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    value={form.nationality || ''}
                    onChange={handleChange}
                    disabled={isView}
                    className={`w-full border rounded-lg px-4 py-3 transition-all duration-200 ${
                      isView 
                        ? 'bg-slate-50 border-slate-200 text-slate-600' 
                        : 'border-slate-300'
                    }`}
                    placeholder={!isView ? "Nhập quốc tịch..." : ""}
                  />
                </div>
              </div>

              {/* Biography */}
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Tiểu sử
                </label>
                <textarea
                  name="biography"
                  value={form.biography || ''}
                  onChange={handleChange}
                  disabled={isView}
                  rows={6}
                  className={`w-full border rounded-lg px-4 py-3 transition-all duration-200 resize-none ${
                    isView 
                      ? 'bg-slate-50 border-slate-200 text-slate-600' 
                      : 'border-slate-300'
                  }`}
                  placeholder={!isView ? "Nhập tiểu sử diễn viên..." : ""}
                />
              </div>

              {/* Movies List - Only show in view mode and if there are movies */}
              {isView && form.listMovie && form.listMovie.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    Phim đã tham gia ({form.listMovie.length})
                  </label>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {form.listMovie.map((movie) => (
                      <div key={movie.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="w-16 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={movie.image} 
                            alt={movie.nameVn}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA2NCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjE2IiB5PSIyNCIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjOUNBM0FGIi8+PC9zdmc+';
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-slate-800 truncate">{movie.nameVn}</h4>
                          {movie.nameEn && (
                            <p className="text-xs text-slate-500 truncate mt-1">{movie.nameEn}</p>
                          )}
                          <p className="text-xs text-slate-400 mt-1">ID: {movie.id}</p>
                        </div>
                      </div>
                    ))}
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
                    {isAdd ? "Thêm diễn viên" : "Lưu thay đổi"}
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

export default ActorModal;
