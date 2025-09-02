import {
    DoorOpen,
    Edit,
    Eye,
    Filter,
    Grid,
    HousePlus,
    List,
    Loader2,
    MapPin,
    Monitor,
    Search,
    Thermometer,
    Trash2,
    Users,
    Volume2
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { type Room as ApiRoom, roomApiService } from '../../../services/roomApi';
import { Pagination } from "../components/pagination";
import RoomModal from '../components/RoomModal.tsx';
import type { Seat as DesignerSeat } from '../components/SeatLayoutDesigner';
import type { Column } from "../components/tableProps";
import { Table } from "../components/tableProps";

// Create local interfaces that match the component needs while being compatible with API
interface Seat {
  id?: string;
  row?: string; // Changed to string to match API
  column?: number;
  isSelected?: boolean;
  isHovered?: boolean;
  seatNumber: string;
  seatType: 'STANDARD' | 'VIP' | 'COUPLE' | 'DISABLED';
}

interface Room {
  id?: string;
  name: string;
  type: '2D' | '3D' | 'IMAX' | '4DX';
  location?: string;
  totalSeats?: number;
  vipSeats?: number;
  regularSeats?: number;
  coupleSeats?: number;
  status?: 'ACTIVE' | 'MAINTENANCE' | 'CLOSED';
  screenSize?: string;
  screenResolution?: string;
  audioSystem?: string;
  hasAirCondition?: boolean;
  hasEmergencyExit?: boolean;
  hasDolbyAtmos?: boolean;
  has4K?: boolean;
  description?: string;
  utilization?: number;
  monthlyRevenue?: number;
  seatLayout?: Seat[];
}

// Adapter functions to convert between API and component types
const convertApiRoomToLocal = (apiRoom: ApiRoom): Room => ({
  ...apiRoom,
  type: (apiRoom.type as '2D' | '3D' | 'IMAX' | '4DX') || '2D',
  seatLayout: apiRoom.seatLayout?.map(apiSeat => {
    // Map API seatType to component type
    const getTypeFromAPI = (apiType: string): 'STANDARD' | 'VIP' | 'COUPLE' | 'DISABLED' => {
      switch (apiType.toUpperCase()) {
        case 'VIP': return 'VIP';
        case 'COUPLE': return 'COUPLE';
        case 'DISABLED': return 'DISABLED';
        case 'STANDARD': 
        default: return 'STANDARD';
      }
    };
    
    return {
      ...apiSeat,
      row: apiSeat.row || '',
      column: apiSeat.column || 0,
      seatType: getTypeFromAPI(apiSeat.seatType || 'STANDARD'),
      isSelected: false,
      isHovered: false
    };
  })
});

const convertLocalRoomToApi = (room: Room): Partial<ApiRoom> => ({
  ...room,
  seatLayout: room.seatLayout?.map(seat => ({
    ...seat,
    row: seat.row || '',
    seatNumber: seat.seatNumber,
    seatType: seat.seatType
  }))
});

// Interface for RoomModal component
interface ModalRoom {
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
  seatLayout?: DesignerSeat[];
}

// Convert local Room to Modal Room interface
const convertToModalRoom = (room: Room): ModalRoom => ({
  id: room.id, // Ensure ID is preserved
  ...room,
  totalSeats: room.totalSeats || 0,
  vipSeats: room.vipSeats || 0,
  regularSeats: room.regularSeats || 0,
  status: room.status || 'ACTIVE',
  screenSize: room.screenSize || '',
  screenResolution: room.screenResolution || '',
  audioSystem: room.audioSystem || '',
  hasAirCondition: room.hasAirCondition || false,
  hasEmergencyExit: room.hasEmergencyExit || false,
  hasDolbyAtmos: room.hasDolbyAtmos || false,
  has4K: room.has4K || false,
  seatLayout: room.seatLayout?.map(seat => {
    // Map component seatType to modal type
    const getModalTypeFromComponent = (componentType: string): 'regular' | 'vip' | 'couple' | 'disabled' | 'blocked' => {
      switch (componentType.toUpperCase()) {
        case 'VIP': return 'vip';
        case 'COUPLE': return 'couple';
        case 'DISABLED': return 'disabled';
        case 'STANDARD': 
        default: return 'regular';
      }
    };
    
    return {
      id: seat.id || `${seat.row}-${seat.column}`,
      row: parseInt(seat.row || '1'),
      column: seat.column || 1,
      type: getModalTypeFromComponent(seat.seatType || 'STANDARD'),
      label: seat.seatNumber,
      isAvailable: true
    };
  })
});

// Convert Modal Room to local Room interface  
const convertFromModalRoom = (modalRoom: unknown): Room => {
  const room = modalRoom as ModalRoom;
  return {
    ...room,
    utilization: room.utilization || 0,
    monthlyRevenue: room.monthlyRevenue || 0,
    seatLayout: room.seatLayout?.map(seat => {
      // Map modal type back to API type
      const getAPITypeFromModal = (modalType: string): 'STANDARD' | 'VIP' | 'COUPLE' | 'DISABLED' => {
        switch (modalType.toLowerCase()) {
          case 'vip': return 'VIP';
          case 'couple': return 'COUPLE';
          case 'disabled': return 'DISABLED';
          case 'regular': 
          default: return 'STANDARD';
        }
      };
      
      return {
        id: seat.id,
        row: seat.row.toString(),
        column: seat.column,
        seatNumber: seat.label,
        seatType: getAPITypeFromModal(seat.type)
      };
    })
  };
};

const RoomManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedRoom, setSelectedRoom] = useState<Room | undefined>(undefined);
  
  // View mode - 'cards' or 'list'
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  
  // Filters
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [capacityRange, setCapacityRange] = useState('');
  
  const itemsPerPage = viewMode === 'cards' ? 8 : 8;

  // Mock data - replace with API calls
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const roomsData = await roomApiService.getAllRooms();
      // Fetch seats for each room to calculate totals
      const roomsWithSeats = await Promise.all(
        roomsData.map(async (room) => {
          if (room.id) {
            try {
              const roomSeats = await roomApiService.getRoomSeats(room.id);
              return convertApiRoomToLocal({ ...room, seatLayout: roomSeats });
            } catch (error) {
              console.warn(`Failed to fetch seats for room ${room.id}:`, error);
              return convertApiRoomToLocal(room);
            }
          }
          return convertApiRoomToLocal(room);
        })
      );
      
      setRooms(roomsWithSeats);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      alert('Có lỗi xảy ra khi tải danh sách phòng chiếu. Vui lòng thử lại!');
      setRooms([]);
    }
    setLoading(false);
  };

  const handleSaveRoom = async (modalRoom: unknown) => {
    setLoading(true);
    
    console.log('Saving room:', modalRoom);
    
    try {
      const room = convertFromModalRoom(modalRoom);
      
      if (modalMode === "add") {
        // Create new room
        const apiRoom = convertLocalRoomToApi(room);
        const newRoom = await roomApiService.createRoom(apiRoom);
        const localRoom = convertApiRoomToLocal(newRoom);
        setRooms(prev => [...prev, {...localRoom, utilization: 0, monthlyRevenue: 0}]);
        alert('Thêm phòng chiếu thành công!');
      } else if (modalMode === "edit" && room.id) {
        // Update existing room
        const apiRoom = convertLocalRoomToApi(room);
        const updatedRoom = await roomApiService.updateRoom(room.id, apiRoom);
        const localUpdatedRoom = convertApiRoomToLocal(updatedRoom);
        setRooms(prev => prev.map(r => 
          r.id === room.id ? { ...r, ...localUpdatedRoom } : r
        ));
        alert('Cập nhật phòng chiếu thành công!');
      }
    } catch (error) {
      console.error('Error saving room:', error);
      alert('Có lỗi xảy ra khi lưu phòng chiếu. Vui lòng thử lại!');
    }
    
    setModalOpen(false);
    setLoading(false);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng chiếu này?')) {
      setLoading(true);
      try {
        console.log('Deleting room:', roomId);
        await roomApiService.deleteRoom(roomId);
        setRooms(prev => prev.filter(r => r.id !== roomId));
        alert('Xóa phòng chiếu thành công!');
      } catch (error) {
        console.error('Error deleting room:', error);
        alert('Có lỗi xảy ra khi xóa phòng chiếu. Vui lòng thử lại!');
      }
      setLoading(false);
    }
  };

  // Helper functions
  const getStatusLabel = (status: string | undefined) => {
    switch (status) {
      case 'ACTIVE': return 'Hoạt động';
      case 'MAINTENANCE': return 'Bảo trì';
      case 'CLOSED': return 'Đã đóng';
      default: return 'Không xác định';
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'MAINTENANCE': return 'bg-orange-100 text-orange-800';
      case 'CLOSED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case '2D': return 'bg-blue-100 text-blue-800';
      case '3D': return 'bg-purple-100 text-purple-800';
      case 'IMAX': return 'bg-yellow-100 text-yellow-800';
      case '4DX': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Apply filters
    const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === '' || room.status === selectedStatus;
    const matchesType = selectedType === '' || room.type === selectedType;
    
    let matchesCapacity = true;
    if (capacityRange !== '') {
      const total = room.totalSeats || 0;
      switch (capacityRange) {
        case 'small': matchesCapacity = total <= 60; break;
        case 'medium': matchesCapacity = total > 60 && total <= 100; break;
        case 'large': matchesCapacity = total > 100; break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesType && matchesCapacity;
  });

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRooms = filteredRooms.slice(startIndex, endIndex);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedStatus('');
    setCapacityRange('');
  };

  // Table columns for list view
  const columns: Column<Room>[] = [
    {
      key: 'name',
      title: 'Phòng chiếu',
      render: (_, room) => (
        <div className="flex items-center">
          <div className="text-2xl mr-3">{getTypeIcon(room.type)}</div>
          <div>
            <p className="text-sm font-medium text-gray-900">{room.name}</p>
            <p className="text-xs text-gray-500">{room.location}</p>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      title: 'Loại phòng',
      render: (_, room) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(room.type)}`}>
          {room.type}
        </span>
      )
    },
    {
      key: 'capacity',
      title: 'Sức chứa',
      render: (_, room) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{room.totalSeats} ghế</div>
          <div className="text-xs text-gray-500">
            VIP: {room.vipSeats} | Thường: {room.regularSeats}
          </div>
        </div>
      )
    },
    {
      key: 'features',
      title: 'Tính năng',
      render: (_, room) => (
        <div className="flex space-x-1">
          {room.has4K && <span className="text-blue-600" title="4K">📺</span>}
          {room.hasDolbyAtmos && <span className="text-purple-600" title="Dolby Atmos">🎵</span>}
          {room.hasAirCondition && <span className="text-cyan-600" title="Điều hòa">❄️</span>}
          {room.hasEmergencyExit && <span className="text-green-600" title="Lối thoát khẩn cấp">🚪</span>}
        </div>
      )
    },
    {
      key: 'utilization',
      title: 'Hiệu suất',
      render: (_, room) => (
        <div className="text-sm">
          <div className="flex items-center mb-1">
            <span className="font-medium text-gray-900">{room.utilization || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                (room.utilization || 0) >= 90 ? 'bg-green-500' :
                (room.utilization || 0) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${room.utilization || 0}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (_, room) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(room.status)}`}>
          {getStatusLabel(room.status)}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (_, room) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedRoom(room);
              setModalMode("view");
              setModalOpen(true);
            }}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="Xem chi tiết"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => {
              setSelectedRoom(room);
              setModalMode("edit");
              setModalOpen(true);
            }}
            className="text-green-600 hover:text-green-900 transition-colors"
            title="Chỉnh sửa"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => room.id && handleDeleteRoom(room.id)}
            className="text-red-600 hover:text-red-900 transition-colors"
            title="Xóa"
            disabled={!room.id}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="h-full bg-gray-50 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                    <DoorOpen className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Quản lý phòng chiếu</h1>
                    <p className="text-slate-600">Quản lý các phòng chiếu và trang thiết bị</p>
                </div>
            </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'cards' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 cursor-pointer'
                }`}
              >
                <Grid size={16} />
                Thẻ
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900 cursor-pointer'
                }`}
              >
                <List size={16} />
                Danh sách
              </button>
            </div>

            {/* Add Button */}
            <button
              className="text-blue-600 hover:text-blue-900 transition-colors flex items-center space-x-2 px-4 py-2 border border-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer"
              onClick={() => {
                setModalMode("add");
                setSelectedRoom(undefined);
                setModalOpen(true);
              }}
            >
              <HousePlus size={16} />
              <span>Thêm phòng mới</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className='w-full'>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc vị trí..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại phòng</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-50 h-11 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Tất cả loại</option>
                <option value="2D">2D</option>
                <option value="3D">3D</option>
                <option value="IMAX">IMAX</option>
                <option value="4DX">4DX</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-50 h-11 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="MAINTENANCE">Bảo trì</option>
                <option value="CLOSED">Đã đóng</option>
              </select>
            </div>

            {/* Capacity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sức chứa</label>
              <select
                value={capacityRange}
                onChange={(e) => setCapacityRange(e.target.value)}
                className="w-50 h-11 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Tất cả</option>
                <option value="small">Nhỏ (≤60 ghế)</option>
                <option value="medium">Vừa (61-100 ghế)</option>
                <option value="large">Lớn ({">"}100 ghế)</option>
              </select>
            </div>
          {/* Clear Filters */}
          <div className=" flex items-end">
            <button
              onClick={clearFilters}
              className="flex w-36 h-11 items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-200 hover:text-gray-900 transition-colors border border-gray-300 rounded-lg cursor-pointer"
            >
              <Filter size={16} />
              <span>Xóa bộ lọc</span>
            </button>
          </div>
          </div>

        </div>

        {/* Content based on view mode */}
        {loading ? (
                  /* Loading State */
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    {viewMode === 'cards' ? (
                      /* Loading Cards */
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: itemsPerPage }).map((_, index) => (
                          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                            <div className="p-4 border-b border-gray-100">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                                  <div className="h-5 bg-gray-200 rounded w-32"></div>
                                </div>
                                <div className="flex space-x-1">
                                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                                  <div className="w-6 h-6 bg-gray-200 rounded"></div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="h-6 bg-gray-200 rounded w-24"></div>
                                <div className="h-6 bg-gray-200 rounded w-20"></div>
                              </div>
                            </div>
                            <div className="p-4 space-y-3">
                              <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              </div>
                              <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                              </div>
                              <div className="bg-gray-100 rounded-lg p-3">
                                <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-28"></div>
                              </div>
                              <div>
                                <div className="flex justify-between items-center mb-1">
                                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                                  <div className="h-3 bg-gray-200 rounded w-8"></div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2"></div>
                              </div>
                            </div>
                            <div className="h-12 bg-gray-100 border-t border-gray-100"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Loading Table */
                      <div className="animate-pulse">
                        <div className="flex items-center justify-center py-16">
                          <div className="flex flex-col items-center">
                            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                            <div className="text-gray-500 text-lg font-medium">Đang tải dữ liệu rạp chiếu phim...</div>
                            <div className="text-gray-400 text-sm mt-2">Vui lòng chờ trong giây lát</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : viewMode === 'cards' ? (
          /* Cards View */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedRooms.map((room) => (
                <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-7/8">
                        {/* Card Header */}
                        <div className="p-4 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl">{getTypeIcon(room.type)}</span>
                                <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                            </div>
                            <div className="flex space-x-1">
                                <button
                                onClick={() => {
                                    setSelectedRoom(room);
                                    setModalMode("edit");
                                    setModalOpen(true);
                                }}
                                className=" text-gray-400 hover:text-blue-600 transition-colors cursor-pointer p-2 rounded-lg hover:bg-blue-100"
                                title="Chỉnh sửa"
                                >
                                <Edit size={14} />
                                </button>
                                <button
                                onClick={() => room.id && handleDeleteRoom(room.id)}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer rounded-lg hover:bg-red-100"
                                title="Xóa"
                                >
                                <Trash2 size={14} />
                                </button>
                            </div>
                            </div>
                            <div className="flex items-center justify-between">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(room.type)}`}>
                                {room.type}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(room.status)}`}>
                                {getStatusLabel(room.status)}
                            </span>
                            </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 space-y-3">
                            {/* Location & Capacity */}
                            <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mr-2" />
                                {room.location}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Users className="w-4 h-4 mr-2" />
                                {room.totalSeats} ghế ({room.vipSeats} VIP)
                            </div>
                            </div>

                            {/* Screen & Audio */}
                            <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                                <Monitor className="w-4 h-4 mr-2" />
                                {room.screenSize}
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Volume2 className="w-4 h-4 mr-2" />
                                {room.audioSystem}
                            </div>
                            </div>

                            {/* Features */}
                            <div className="flex items-center space-x-3 text-sm">
                            {room.has4K && (
                                <div className="flex items-center text-blue-600">
                                <Monitor className="w-3 h-3 mr-1" />
                                <span>4K</span>
                                </div>
                            )}
                            {room.hasDolbyAtmos && (
                                <div className="flex items-center text-purple-600">
                                <Volume2 className="w-3 h-3 mr-1" />
                                <span>Atmos</span>
                                </div>
                            )}
                            {room.hasAirCondition && (
                                <div className="flex items-center text-cyan-600">
                                <Thermometer className="w-3 h-3 mr-1" />
                                <span>AC</span>
                                </div>
                            )}
                            </div>

                            {/* Utilization */}
                            {room.status === 'ACTIVE' && (
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-gray-500">Hiệu suất:</span>
                                <span className="text-xs font-medium text-gray-700">{room.utilization}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full ${
                                    (room.utilization || 0) >= 90 ? 'bg-green-500' :
                                    (room.utilization || 0) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${room.utilization || 0}%` }}
                                />
                                </div>
                            </div>
                            )}
                        </div>
                    </div>
                  {/* Card Footer */}
                    <button
                      onClick={() => {
                        setSelectedRoom(room);
                        setModalMode("view");
                        setModalOpen(true);
                      }}
                      className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium bg-gray-100 px-4 py-3 border-t border-gray-100 cursor-pointer"
                    >
                      Xem chi tiết
                    </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* List View */
          <>
            <Table 
              columns={columns}
              data={paginatedRooms}
              loading={loading}
              emptyText="Không tìm thấy phòng chiếu nào"
            />
          </>
        )}

        {/* Pagination */}
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredRooms.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Room Modal */}
        <RoomModal
          open={modalOpen}
          mode={modalMode}
          room={selectedRoom ? convertToModalRoom(selectedRoom) : undefined}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSaveRoom}
        />
      </div>
  );
};

export default RoomManagement;
