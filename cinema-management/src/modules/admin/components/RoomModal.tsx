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
import { roomApiService } from '../../../services/roomApi';
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
  // Initialize with empty form by default - will be set in useEffect
  const getDefaultForm = (): Room => ({
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

  const [form, setForm] = useState<Room>(getDefaultForm());

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSeatDesigner, setShowSeatDesigner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingSeatData, setLoadingSeatData] = useState(false);

  useEffect(() => {
    const loadRoomData = async () => {
      if (room) {
        // console.log('RoomModal: Loading room data for:', room.name, 'ID:', room.id);
        // Set form data first with room data
        setForm(room);
        
        // Always load seat data from API when room has an ID (for both edit and view modes)
        if (room.id && (mode === "edit" || mode === "view")) {
        //   console.log('RoomModal: Starting to load seat data for room ID:', room.id);
          setLoadingSeatData(true);
          try {
            // console.log('Loading seat data for room:', room.id);
            const seats = await roomApiService.getRoomSeats(room.id);
            // console.log('RoomModal: Received seat data:', seats);
            
            if (seats && seats.length > 0) {
              // Map API seat data to component format
              const mappedSeats = seats.map(seat => {
                // Map API seatType to component type
                const getTypeFromAPI = (apiType: string): 'regular' | 'vip' | 'couple' | 'disabled' | 'blocked' | 'empty' => {
                  switch (apiType.toUpperCase()) {
                    case 'VIP': return 'vip';
                    case 'COUPLE': return 'couple';
                    case 'DISABLED': return 'disabled';
                    case 'BLOCKED': return 'blocked';
                    case 'EMPTY': return 'empty';
                    case 'STANDARD': return 'regular';
                    default: return 'regular';
                  }
                };
                
                return {
                  id: seat.id || `${seat.row}-${seat.column}`,
                  row: parseInt(seat.row || '1'),
                  column: seat.column || 1,
                  type: getTypeFromAPI(seat.seatType || 'STANDARD'),
                  label: seat.seatNumber,
                  isAvailable: true
                };
              });

            //   console.log('RoomModal: Mapped seats:', mappedSeats);

              // Calculate seat counts from actual data
              const vipCount = mappedSeats.filter(s => s.type === 'vip').length;
              const regularCount = mappedSeats.filter(s => s.type === 'regular').length;
              const coupleCount = mappedSeats.filter(s => s.type === 'couple').length;

              setForm(prev => ({
                ...prev,
                seatLayout: mappedSeats,
                totalSeats: mappedSeats.length,
                vipSeats: vipCount,
                regularSeats: regularCount,
                coupleSeats: coupleCount
              }));
            }
          } catch (error) {
            console.error('Error loading seat data:', error);
            // Keep original room data if seat loading fails
          }
          setLoadingSeatData(false);
        }
      } else if (mode === "add") {
        // Reset ALL states for new room
        setForm(getDefaultForm());
        
        // Reset all related states
        setShowSeatDesigner(false);
        setLoadingSeatData(false);
        setLoading(false);
      }
      setErrors({});
    };
    
    if (open) {
      loadRoomData();
    }
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

  const handleSubmit = async () => {
    if (validateForm() && onSubmit) {
      setLoading(true);
      try {
        onSubmit(form);
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setLoading(false);
      }
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

  // Function to convert API seat data to SeatLayoutDesigner format
  const convertAPISeatsToDesignerFormat = (apiSeats: Seat[]): Seat[] => {
    if (!apiSeats || apiSeats.length === 0) return [];
    
    return apiSeats.map(seat => {
      const parsed = parseSeatNumber(seat.label);
      // Convert row letter to number (A=0, B=1, C=2, etc.)
      const rowNumber = parsed.rowLetter.charCodeAt(0) - 65;
      
      // Map seat type properly
      let seatType: 'regular' | 'vip' | 'couple' | 'disabled' | 'blocked' | 'empty' = 'regular';
      if (seat.type && ['regular', 'vip', 'couple', 'disabled', 'blocked', 'empty'].includes(seat.type)) {
        seatType = seat.type as 'regular' | 'vip' | 'couple' | 'disabled' | 'blocked' | 'empty';
      }
      
      return {
        id: `${rowNumber}-${parsed.columnNumber - 1}`,
        row: rowNumber,
        column: parsed.columnNumber - 1, // Convert to 0-based index
        type: seatType,
        label: seat.label,
        isAvailable: seat.isAvailable ?? true
      };
    });
  };

  // Function to convert SeatLayoutDesigner format back to API format
  const convertDesignerSeatsToAPIFormat = (designerSeats: Seat[]): Seat[] => {
    return designerSeats.map(seat => {
      const rowLetter = String.fromCharCode(65 + seat.row); // Convert back to letter
      const seatLabel = `${rowLetter}${seat.column + 1}`; // Convert back to 1-based
      
      return {
        ...seat,
        label: seatLabel,
        id: seat.id || `${seat.row}-${seat.column}`
      };
    });
  };

  const handleSeatLayoutSave = (seats: Seat[]) => {
    // Convert from designer format back to API format
    console.log('Seat layout saved from designer:', seats);
    const apiFormatSeats = convertDesignerSeatsToAPIFormat(seats);
    setForm(prev => ({ ...prev, seatLayout: apiFormatSeats }));
    setShowSeatDesigner(false);
    
    // Auto-calculate seat counts from layout (excluding empty spaces and blocked seats)
    const actualSeats = seats.filter(s => s.type !== 'empty' && s.type !== 'blocked');
    const counts = {
      regular: actualSeats.filter(s => s.type === 'regular').length,
      vip: actualSeats.filter(s => s.type === 'vip').length,
      couple: actualSeats.filter(s => s.type === 'couple').length,
      disabled: actualSeats.filter(s => s.type === 'disabled').length,
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

  // Helper function to parse seat number (e.g., "A1" -> {row: "A", column: 1})
  const parseSeatNumber = (seatNumber: string) => {
    const match = seatNumber.match(/^([A-Z]+)(\d+)$/);
    if (match) {
      return {
        rowLetter: match[1],
        columnNumber: parseInt(match[2])
      };
    }
    return { rowLetter: 'A', columnNumber: 1 };
  };

  // Function to render seat layout from API data
  const renderSeatLayoutFromAPI = () => {
    if (!form.seatLayout || form.seatLayout.length === 0) return null;

    // Group seats by row
    const seatsByRow: { [key: string]: Seat[] } = {};
    let maxColumn = 0;

    form.seatLayout.forEach(seat => {
      const parsed = parseSeatNumber(seat.label);
      const rowKey = parsed.rowLetter;
      
      if (!seatsByRow[rowKey]) {
        seatsByRow[rowKey] = [];
      }
      
      seatsByRow[rowKey].push({
        ...seat,
        row: parsed.columnNumber, // Store column number for sorting
        column: parsed.columnNumber
      });
      
      maxColumn = Math.max(maxColumn, parsed.columnNumber);
    });

    // Sort rows alphabetically and seats within each row by column
    const sortedRows = Object.keys(seatsByRow).sort();
    
    return (
      <div className="space-y-1 max-w-4xl mx-auto overflow-x-auto md:*:justify-center *:justify-start">
        {sortedRows.map((rowLetter) => {
          const rowSeats = seatsByRow[rowLetter].sort((a, b) => (a.column || 0) - (b.column || 0));
          
          return (
            <div key={rowLetter} className="flex items-center justify-center space-x-1">
              {/* Row label */}
              <div className="w-6 text-xs font-semibold text-gray-600 text-center">
                {rowLetter}
              </div>
              
              {/* Seats in this row */}
              <div className="flex space-x-1">
                {Array.from({ length: maxColumn }, (_, colIndex) => {
                  const columnNumber = colIndex + 1;
                  const seat = rowSeats.find(s => s.column === columnNumber);
                  
                  if (seat) {
                    const getSeatStyle = () => {
                      switch (seat.type) {
                        case 'vip': return 'bg-yellow-300 border-yellow-400 text-yellow-800';
                        case 'couple': return 'bg-pink-300 border-pink-400 text-pink-800';
                        case 'disabled': return 'bg-blue-300 border-blue-400 text-blue-800';
                        case 'empty': return 'bg-white border-gray-300 border-dashed';
                        default: return 'bg-gray-300 border-gray-400 text-gray-800';
                      }
                    };

                    const getSeatIcon = () => {
                      switch (seat.type) {
                        case 'vip': return '👑';
                        case 'couple': return '❤️';
                        case 'disabled': return '♿';
                        case 'empty': return '';
                        default: return '💺';
                      }
                    };

                    return (
                      <div
                        key={`${rowLetter}${columnNumber}`}
                        className={`w-7 h-7 rounded border-2 text-xs flex items-center justify-center font-semibold ${getSeatStyle()}`}
                        title={`${seat.label} - ${seat.type.toUpperCase()}`}
                      >
                        {getSeatIcon()}
                      </div>
                    );
                  } else {
                    // Empty space for missing seats
                    return (
                      <div key={`${rowLetter}${columnNumber}`} className="w-7 h-7">
                        {/* Empty space */}
                      </div>
                    );
                  }
                })}
              </div>
              
              {/* Row label (right side) */}
              <div className="w-6 text-xs font-semibold text-gray-600 text-center">
                {rowLetter}
              </div>
            </div>
          );
        })}
      </div>
    );
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
                      Đã thiết kế: {form.seatLayout.filter(s => s.type !== 'empty' && s.type !== 'blocked').length} ghế
                    </div>
                    {/* Render actual seat layout from API data */}
                    {renderSeatLayoutFromAPI()}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs font-semibold text-gray-700 mb-2">Chú thích:</div>
                      <div className="flex justify-center flex-wrap gap-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <div className="w-5 h-5 bg-gray-300 border-gray-400 border-2 rounded flex items-center justify-center">💺</div>
                          <span>Thường ({form.seatLayout.filter(s => s.type === 'regular').length})</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-5 h-5 bg-yellow-300 border-yellow-400 border-2 rounded flex items-center justify-center">👑</div>
                          <span>VIP ({form.seatLayout.filter(s => s.type === 'vip').length})</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-5 h-5 bg-pink-300 border-pink-400 border-2 rounded flex items-center justify-center">❤️</div>
                          <span>Đôi ({form.seatLayout.filter(s => s.type === 'couple').length})</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-5 h-5 bg-blue-300 border-blue-400 border-2 rounded flex items-center justify-center">♿</div>
                          <span>Khuyết tật ({form.seatLayout.filter(s => s.type === 'disabled').length})</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-5 h-5 bg-white border-gray-300 border-2 border-dashed rounded"></div>
                          <span>Lối đi ({form.seatLayout.filter(s => s.type === 'empty').length})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : loadingSeatData ? (
                  <div className="text-center py-8">
                    <svg className="animate-spin h-8 w-8 text-gray-400 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <div className="text-sm text-gray-500">Đang tải dữ liệu ghế...</div>
                  </div>
                ) : (
                  <div className="text-center">
                    {/* <div className="bg-gray-800 text-white py-2 px-4 rounded-lg mb-4 inline-block">
                      🎬 MÀN HÌNH
                    </div>
                    <div className="space-y-2">
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
                    </div> */}
                    <div className="text-gray-500">Chưa có bố cục ghế. Vui lòng thiết kế trước khi lưu.</div>
                  </div>
                )}
              </div>
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
                  disabled={loading}
                  className={`flex-1 px-6 py-3 text-white rounded-lg font-semibold transition-colors duration-200 ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : isAdd 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </span>
                  ) : (
                    isAdd ? "Thêm phòng chiếu" : "Lưu thay đổi"
                  )}
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
        initialSeats={
          loadingSeatData 
            ? [] 
            : mode === "add" 
            ? [] // Always start with empty layout for new rooms
            : convertAPISeatsToDesignerFormat(form.seatLayout || [])
        }
        onSave={handleSeatLayoutSave}
        onClose={() => setShowSeatDesigner(false)}
      />
    </div>
  );
};

export default RoomModal;
