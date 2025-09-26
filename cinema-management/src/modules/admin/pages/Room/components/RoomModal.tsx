import { type Format, formatApiService as formatApi } from "@/services/formatApi";
import { type Theater, theaterApi } from "@/services/theaterApi";
import {
    CheckCircle,
    Edit3,
    Eye,
    Grid,
    MapPin,
    Plus,
    Settings,
    Users,
    X
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { type Room, roomApiService, type RoomLayout, type Seat } from '../../../../../services/roomApi';
import SeatLayoutDesigner from './SeatLayoutDesigner';

interface RoomModalProps {
    open: boolean;
    mode: "add" | "edit" | "view";
    room?: Room;
    onClose: () => void;
    onSubmit: (room: Room, roomLayout?: RoomLayout) => void;
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
        type: "",
        theaterId: '',
    });

    const [form, setForm] = useState<Room>(getDefaultForm());
    const [testForm, setTestForm] = useState<RoomLayout>({
        col: 0,
        row: 0,
        specialSeats: {},
        walkways: [],
        coupleSeatQuantity: 0,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showSeatDesigner, setShowSeatDesigner] = useState(false);
    const [theaters, setTheaters] = useState<Theater[]>([]);
    const [formats, setFormats] = useState<Format[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingSeatData, setLoadingSeatData] = useState(false);

    useEffect(() => {
        const loadRoomData = async () => {
            if (room) {
                setForm(room);
                
                if (room.id && (mode === "edit" || mode === "view")) {
                    setLoadingSeatData(true);
                    try {
                        const seats = await roomApiService.getRoomSeats(room.id);
                        if (seats && seats.length > 0) {
                        const mappedSeats = seats.map(seat => {
                            const parsed = parseSeatNumberSimple(seat.seatNumber);
                            return {
                                id: seat.id || `${parsed.row}-${parsed.column}`,
                                row: parsed.row,
                                column: parsed.column,
                                seatType: seat.seatType,
                                seatNumber: seat.seatNumber,
                                color: seat.color,
                                isAvailable: true
                            };
                        });

                        const vipCount = mappedSeats.filter(s => s.seatType === 'VIP').length;
                        const standardCount = mappedSeats.filter(s => s.seatType === 'Standard').length;
                        const coupleCount = mappedSeats.filter(s => s.seatType === 'Couple').length / 2;

                        setForm(prev => ({
                            ...prev,
                            seatLayout: mappedSeats,
                            totalSeats: mappedSeats.length,
                            vipSeats: vipCount,
                            standardSeats: standardCount,
                            coupleSeats: coupleCount
                        }));
                        }
                    } catch (error) {
                        console.error('Error loading seat data:', error);
                    }
                    setLoadingSeatData(false);
                }
            } else if (mode === "add") {
                setForm(getDefaultForm());
                setShowSeatDesigner(false);
                setLoadingSeatData(false);
                setLoading(false);
            }
            setErrors({});
        };
        if (open) {
            loadRoomData();
            fetchData();
        }
    }, [room, mode, open]);

  if (!open) return null;

  const fetchData = async () => {
    try {
        const [theatersResponse, formatsResponse] = await Promise.all([
            theaterApi.getAllTheaters(),
            formatApi.getAllFormats(),
        ]);
        setTheaters(theatersResponse.data);
        setFormats(formatsResponse);
      return { theaters, formats };
    } catch (error) {
      console.error('Error fetching theaters:', error);
      return [];
    }
  };

  const isView = mode === "view";
  const isAdd = mode === "add";
  const isEdit = mode === "edit";

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) {
      newErrors.name = "Tên phòng là bắt buộc";
    }
    if (!form.theaterId?.trim()) {
      newErrors.theaterId = "Rạp là bắt buộc";
    }
    if (!form.type?.trim()) {
      newErrors.type = "Loại phòng là bắt buộc";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm() && onSubmit) {
      setLoading(true);
      try {
        if (isAdd) {
            onSubmit(form);
        } else {
            onSubmit(form, testForm);
        }
        onClose();
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setLoading(false);
      }
    }

    // console.log("Form data to submit:", testForm);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      const numValue = parseInt(value) || 0;
      setForm((prev) => ({ ...prev, [name]: numValue }));
      if (name === 'vipSeats' || name === 'standardSeats' || name === 'coupleSeats') {
        const updatedForm = { ...form, [name]: numValue };
        const newTotal = (updatedForm.vipSeats ?? 0) + (updatedForm.standardSeats ?? 0) + (updatedForm.coupleSeats ?? 0);
        setForm((prev) => ({ ...prev, [name]: numValue, totalSeats: newTotal }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const parseSeatNumber = (seatNumber: string) => {
    if (!seatNumber) return { rowLetter: 'A', columnNumber: 1, isCouple: false };

    if (seatNumber.startsWith('W_')) {
      const rowLetter = seatNumber[2];
      const colStr = seatNumber.substring(3);
      return {
        rowLetter,
        columnNumber: parseInt(colStr),
        isCouple: false
      };
    }

    if (seatNumber.includes('+')) {
      const parts = seatNumber.split('+');
      if (parts.length === 2) {
        const match = parts[0].match(/^([A-Z]+)(\d+)$/);
        if (match) {
          return {
            rowLetter: match[1],
            columnNumber: parseInt(match[2]),
            isCouple: true
          };
        }
      }
    }

    const match = seatNumber.match(/^([A-Z]+)(\d+)$/);
    if (match) {
      return {
        rowLetter: match[1],
        columnNumber: parseInt(match[2]),
        isCouple: false
      };
    }
    return { rowLetter: 'A', columnNumber: 1, isCouple: false };
  };

  const parseSeatNumberSimple = (seatNumber: string): { row: number, column: number } => {
    if (seatNumber.startsWith('W_')) {
      const rowLetter = seatNumber[2];
      const colStr = seatNumber.substring(3);
      const row = rowLetter.charCodeAt(0) - 65;
      const column = parseInt(colStr) - 1;
      return { row, column };
    } else if (seatNumber.includes('+')) {
      const parts = seatNumber.split('+');
      const rowLetter = parts[0][0];
      const col1 = parseInt(parts[0].substring(1)) - 1;
      const row = rowLetter.charCodeAt(0) - 65;
      return { row, column: col1 };
    } else {
      const rowLetter = seatNumber[0];
      const colStr = seatNumber.substring(1);
      const row = rowLetter.charCodeAt(0) - 65;
      const column = parseInt(colStr) - 1;
      return { row, column };
    }
  };

  const convertAPISeatsToDesignerFormat = (apiSeats: Seat[]): Seat[] => {
    if (!apiSeats || apiSeats.length === 0) return [];
    
    return apiSeats.map(seat => {
      const parsed = parseSeatNumber(seat.seatNumber || '');
      const rowNumber = parsed.rowLetter.charCodeAt(0) - 65;
      let seatType: 'Standard' | 'VIP' | 'Couple' | 'Disabled' | 'Blocked' | 'Empty' = 'Standard';
      if (seat.seatType && ['Standard', 'VIP', 'Couple', 'Disabled', 'Blocked', 'Empty'].includes(seat.seatType)) {
        seatType = seat.seatType as 'Standard' | 'VIP' | 'Couple' | 'Disabled' | 'Blocked' | 'Empty';
      }
      
      return {
        id: `${rowNumber}-${parsed.columnNumber - 1}`,
        row: rowNumber,
        column: parsed.columnNumber - 1,
        seatType: seatType,
        seatNumber: seat.seatNumber,
        color: seat.color,
        status: seat.status
      };
    });
  };

  const convertDesignerSeatsToAPIFormat = (designerSeats: Seat[]): Seat[] => {
    return designerSeats
      .filter(seat => seat.row !== undefined && seat.column !== undefined)
      .map(seat => {
        const rowLetter = String.fromCharCode(65 + seat.row!);
        const seatNumber = `${rowLetter}${seat.column! + 1}`;
        return {
          ...seat,
          seatNumber: seatNumber,
          color: seat.color,
          id: seat.id || `${seat.row}-${seat.column}`
        };
      });
  };

  const handleSeatLayoutSave = (seats: Seat[]) => {
    // const apiFormatSeats = convertDesignerSeatsToAPIFormat(seats);
    console.log(seats);
    setForm(prev => ({ ...prev, seatLayout: seats }));
    setShowSeatDesigner(false);
    
    const actualSeats = seats.filter(s => s.seatType !== 'Empty' && s.seatType !== 'Blocked');
    const counts = {
      standard: actualSeats.filter(s => s.seatType === 'Standard').length,
      vip: actualSeats.filter(s => s.seatType === 'VIP').length,
      couple: actualSeats.filter(s => s.seatType === 'Couple').length / 2,
      disabled: actualSeats.filter(s => s.seatType === 'Disabled').length,
    };
    
    const total = counts.standard + counts.vip + counts.couple + counts.disabled;
    
    setForm(prev => ({
      ...prev,
      totalSeats: total,
      vipSeats: counts.vip,
      standardSeats: counts.standard,
      coupleSeats: counts.couple,
    }));
  };

    const testSave = (seats: Seat[], columnCount: number, rowCount: number, coupleSeatQuantity: number) => {
        setForm(prev => ({ ...prev, seatLayout: seats }));
        setShowSeatDesigner(false);

        const specialSeats: { [key: string]: string } = {};
        const rowsWithSpecialSeats = new Set<number>();

        // Tìm các dãy có ghế đặc biệt (VIP hoặc Disabled)
        seats.forEach(seat => {
        if (seat.seatType === 'VIP' || seat.seatType === 'Disabled') {
            rowsWithSpecialSeats.add(seat.row ?? 0);
        }
        });

        // Gán specialSeats cho mỗi dãy có ghế đặc biệt
        rowsWithSpecialSeats.forEach(row => {
            const rowLetter = String.fromCharCode(65 + row);
            console.log("Row with special seat:", rowLetter);
            // Tìm ghế VIP/Disabled trong row này để lấy id
            const specialSeatInRow = seats.find(seat => 
                (seat.seatType === 'VIP' || seat.seatType === 'Disabled') && 
                seat.row === row && 
                seat.id
            );
            
            // Nếu có ghế với id sẵn thì dùng id đó, nếu không thì tạo UUID
            const seatId = specialSeatInRow?.id || `row-${row}-${crypto.randomUUID()}`;
            
            // Khởi tạo giá trị nếu chưa tồn tại, sau đó cộng chuỗi
            if (!specialSeats[seatId]) {
                specialSeats[seatId] = '';
            }
            specialSeats[seatId] += rowLetter;
        });

        const walkways = seats
            .filter(seat => seat.seatType === 'Empty' || seat.seatType === 'Blocked' || seat.seatType === undefined)
            .map(seat => ({ columnIndex: seat.column ?? -1, rowIndex: seat.row ?? -1 }));

        setTestForm({
            col: columnCount,
            row: rowCount,
            specialSeats,
            walkways,
            coupleSeatQuantity
        });
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

  const renderSeatLayoutFromAPI = () => {
    if (!form.seatLayout || form.seatLayout.length === 0) return null;

    const seatsByRow: { [key: string]: Seat[] } = {};
    let maxColumn = 0;

    form.seatLayout.forEach(seat => {
      const parsed = parseSeatNumber(seat.seatNumber || '');
      const rowKey = parsed.rowLetter;

      if (!seatsByRow[rowKey]) {
        seatsByRow[rowKey] = [];
      }

      seatsByRow[rowKey].push({
        ...seat,
        row: parsed.rowLetter.charCodeAt(0) - 65,
        column: parsed.columnNumber
      });
    //   console.log("Seats by Row:", seatsByRow);
      maxColumn = Math.max(maxColumn, parsed.isCouple ? parsed.columnNumber + 1 : parsed.columnNumber);
    });

    const sortedRows = Object.keys(seatsByRow).sort();

    return (
      <div className="space-y-1 max-w-4xl mx-auto overflow-x-auto md:*:justify-center *:justify-start">
        {sortedRows.map((rowLetter) => {
          const rowSeats = seatsByRow[rowLetter].sort((a, b) => (a.column || 0) - (b.column || 0));

          return (
            <div key={rowLetter} className="flex items-center justify-center space-x-1">
              <div className="w-6 text-xs font-semibold text-gray-600 text-center">
                {rowLetter}
              </div>
              <div className="flex space-x-1">
                {(() => {
                  const renderedColumns = new Set<number>();
                  return Array.from({ length: maxColumn }, (_, colIndex) => {
                    const columnNumber = colIndex + 1;

                    if (renderedColumns.has(columnNumber)) {
                      return null;
                    }

                    const seat = rowSeats.find(s => s.column === columnNumber);
                    // console.log("Seat:",seat);

                    if (seat) {
                      const parsed = parseSeatNumber(seat.seatNumber || '');
                      const isCouple = parsed.isCouple;

                      if (!seat.seatType || seat.seatType === 'Empty') {
                        // Render as empty space for walkways or undefined seatType
                        return (
                          <div key={`${rowLetter}${columnNumber}`} className="w-7 h-7 bg-white border-dashed border-2 border-gray-300">
                            {/* Empty space */}
                          </div>
                        );
                      }

                      if (isCouple) {
                        renderedColumns.add(columnNumber);
                        renderedColumns.add(columnNumber + 1);
                      } else {
                        renderedColumns.add(columnNumber);
                      }

                      return (
                        <div
                          key={`${rowLetter}${columnNumber}`}
                          className={`h-7 rounded-lg border-2 text-xs flex items-center justify-center font-semibold text-white ${isCouple ? 'w-15' : 'w-7'}`}
                          style={{ backgroundColor: seat.color || '#722ed1' }}
                          title={`${seat.seatNumber}`}
                        >
                          {seat.seatNumber}
                        </div>
                      );
                    } else {
                      return (
                        <div key={`${rowLetter}${columnNumber}`} className="w-7 h-7">
                          {/* Empty space */}
                        </div>
                      );
                    }
                  }).filter(Boolean);
                })()}
              </div>
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
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Thông tin cơ bản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    {/* <span className="text-lg">{getTypeIcon(form.type)}</span> */}
                    Tên phòng <span className="text-red-600">*</span>
                  </label>
                  {isView ? (
                    <div className="w-full h-13 border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600">
                      {form.name}
                    </div>
                  ) : (
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={`w-full h-13 px-3 py-3 border rounded-lg transition-all duration-200 ${
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
                    Rạp <span className="text-red-600">*</span>
                  </label>
                  {isView ? (
                    <div className="w-full h-13 border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600">
                      {form.theaterId}
                    </div>
                  ) : (
                    <select
                      name="theaterId"
                      value={form.theaterId}
                      onChange={handleChange}
                      className="w-full h-13 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Hãy chọn rạp</option>
                        {theaters.map(theater => (
                            <option key={theater.id} value={theater.id}>{theater.nameVn}</option>
                        ))}
                    </select>
                  )}
                  {errors.theaterId && (
                    <p className="text-red-500 text-xs mt-1">{errors.theaterId}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    Loại phòng <span className="text-red-600">*</span>
                  </label>
                  {isView ? (
                    <div className="w-full h-13 border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600">
                      {form.type}
                    </div>
                  ) : (
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full h-13 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Hãy chọn loại phòng</option>
                        {formats.map(format => (
                            <option key={format.id} value={format.id}>{format.nameVn}</option>
                        ))}
                    </select>
                  )}
                </div>
                {!isAdd && (
                    <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Trạng thái
                    </label>
                    {isView ? (
                        <div className="w-full h-13 border rounded-lg px-4 py-3 bg-white border-slate-200 text-slate-600">
                            {form.status === 'ACTIVE' ? 'Hoạt động' : 
                            form.status === 'MAINTENANCE' ? 'Bảo trì' : 'Đã đóng'}
                        </div>
                    ) : (
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full h-13 px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            >
                            <option value="ACTIVE">Hoạt động</option>
                            <option value="MAINTENANCE">Bảo trì</option>
                            <option value="CLOSED">Đã đóng</option>
                        </select>
                    )}
                    </div>)}
              </div>
            </div>
            {!isAdd && (
                <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Cấu hình ghế ngồi
                </h3>
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
                        Đã thiết kế: {form.seatLayout.filter(s => s.seatType !== undefined && s.seatType !== 'Blocked').length} ghế
                        </div>
                        {renderSeatLayoutFromAPI()}
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs font-semibold text-gray-700 mb-2">Chú thích:</div>
                        <div className="flex justify-center flex-wrap gap-4 text-xs">
                            <div className="flex items-center space-x-1">
                            <div className="w-5 h-5 bg-gray-300 border-gray-400 border-2 rounded flex items-center justify-center">💺</div>
                            <span>Thường ({form.seatLayout.filter(s => s.seatType === 'Standard').length})</span>
                            </div>
                            <div className="flex items-center space-x-1">
                            <div className="w-5 h-5 bg-yellow-300 border-yellow-400 border-2 rounded flex items-center justify-center">👑</div>
                            <span>VIP ({form.seatLayout.filter(s => s.seatType === 'VIP').length})</span>
                            </div>
                            <div className="flex items-center space-x-1">
                            <div className="w-10 h-5 bg-pink-300 border-pink-400 border-2 rounded flex items-center justify-center">❤️</div>
                            <span>Đôi ({form.seatLayout.filter(s => s.seatType === 'Couple').length} cặp)</span>
                            </div>
                            <div className="flex items-center space-x-1">
                            <div className="w-5 h-5 bg-blue-300 border-blue-400 border-2 rounded flex items-center justify-center">♿</div>
                            <span>Khuyết tật ({form.seatLayout.filter(s => s.seatType === 'Disabled').length})</span>
                            </div>
                            <div className="flex items-center space-x-1">
                            <div className="w-5 h-5 bg-white border-gray-300 border-2 border-dashed rounded"></div>
                            <span>Lối đi ({form.seatLayout.filter(s => s.seatType === undefined).length})</span>
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
                        <div className="text-gray-500">Chưa có bố cục ghế. Vui lòng thiết kế trước khi lưu.</div>
                    </div>
                    )}
                </div>
                </div>)}
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
                      {formatRevenue((form.monthlyRevenue || 0) / (form.totalSeats ?? 1))}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
            : (form.seatLayout || [])
        }
        onSave={testSave}
        onClose={() => setShowSeatDesigner(false)}
      />
    </div>
  );
};

export default RoomModal;