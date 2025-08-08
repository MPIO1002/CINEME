import {
    Edit,
    Eye,
    Filter,
    Grid,
    List,
    MapPin,
    Monitor,
    Plus,
    Search,
    Thermometer,
    Trash2,
    Users,
    Volume2
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Pagination } from "../components/pagination";
import RoomModal from '../components/RoomModal.tsx';
import type { Column } from "../components/tableProps";
import { Table } from "../components/tableProps";

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
}

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
  
  const itemsPerPage = viewMode === 'cards' ? 12 : 10;

  // Mock data - replace with API calls
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockRooms: Room[] = [
        {
          id: '1',
          name: 'Phòng 1',
          type: '2D',
          location: 'Tầng 1',
          totalSeats: 120,
          vipSeats: 20,
          regularSeats: 100,
          coupleSeats: 0,
          status: 'ACTIVE',
          screenSize: '15m x 8m',
          screenResolution: '4K',
          audioSystem: 'Dolby Atmos',
          hasAirCondition: true,
          hasEmergencyExit: true,
          hasDolbyAtmos: true,
          has4K: true,
          description: 'Phòng chiếu tiêu chuẩn với chất lượng âm thanh tốt',
          utilization: 85,
          monthlyRevenue: 150000000
        },
        {
          id: '2',
          name: 'Phòng VIP 1',
          type: 'IMAX',
          location: 'Tầng 2',
          totalSeats: 80,
          vipSeats: 60,
          regularSeats: 20,
          coupleSeats: 10,
          status: 'ACTIVE',
          screenSize: '20m x 12m',
          screenResolution: '8K IMAX',
          audioSystem: 'IMAX Sound System',
          hasAirCondition: true,
          hasEmergencyExit: true,
          hasDolbyAtmos: true,
          has4K: true,
          description: 'Phòng IMAX cao cấp với trải nghiệm tuyệt vời',
          utilization: 92,
          monthlyRevenue: 280000000
        },
        {
          id: '3',
          name: 'Phòng 3D Elite',
          type: '3D',
          location: 'Tầng 1',
          totalSeats: 100,
          vipSeats: 30,
          regularSeats: 70,
          coupleSeats: 5,
          status: 'MAINTENANCE',
          screenSize: '18m x 10m',
          screenResolution: '4K',
          audioSystem: 'DTS:X',
          hasAirCondition: true,
          hasEmergencyExit: true,
          hasDolbyAtmos: false,
          has4K: true,
          description: 'Phòng 3D chuyên dụng đang bảo trì',
          utilization: 0,
          monthlyRevenue: 0
        },
        {
          id: '4',
          name: 'Phòng 4DX Adventure',
          type: '4DX',
          location: 'Tầng 3',
          totalSeats: 60,
          vipSeats: 40,
          regularSeats: 20,
          coupleSeats: 0,
          status: 'ACTIVE',
          screenSize: '16m x 9m',
          screenResolution: '4K',
          audioSystem: '4DX Motion Sound',
          hasAirCondition: true,
          hasEmergencyExit: true,
          hasDolbyAtmos: true,
          has4K: true,
          description: 'Phòng 4DX với hiệu ứng chuyển động',
          utilization: 78,
          monthlyRevenue: 320000000
        }
      ];
      setRooms(mockRooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    }
    setLoading(false);
  };

  const handleSaveRoom = (room: Room) => {
    setLoading(true);
    
    console.log('Saving room:', room);
    
    if (modalMode === "add") {
      // Add new room with generated ID
      const newRoom: Room = {
        ...room,
        id: Date.now().toString(),
        utilization: 0,
        monthlyRevenue: 0,
      };
      setRooms(prev => [...prev, newRoom]);
      alert('Thêm phòng chiếu thành công!');
    } else if (modalMode === "edit" && room.id) {
      // Update existing room
      setRooms(prev => prev.map(r => 
        r.id === room.id ? { ...r, ...room } : r
      ));
      alert('Cập nhật phòng chiếu thành công!');
    }
    
    setModalOpen(false);
    setLoading(false);
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng chiếu này?')) {
      setLoading(true);
      try {
        console.log('Deleting room:', roomId);
        setRooms(prev => prev.filter(r => r.id !== roomId));
        alert('Xóa phòng chiếu thành công!');
      } catch (error) {
        console.error('Error deleting room:', error);
        alert('Có lỗi xảy ra khi xóa phòng chiếu!');
      }
      setLoading(false);
    }
  };

  // Helper functions
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Hoạt động';
      case 'MAINTENANCE': return 'Bảo trì';
      case 'CLOSED': return 'Đã đóng';
      default: return 'Không xác định';
    }
  };

  const getStatusColor = (status: string) => {
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
      case 'IMAX': return 'bg-gold-100 text-gold-800';
      case '4DX': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Apply filters
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (room.location?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesType = !selectedType || room.type === selectedType;
    const matchesStatus = !selectedStatus || room.status === selectedStatus;
    
    let matchesCapacity = true;
    if (capacityRange) {
      const total = room.totalSeats;
      switch (capacityRange) {
        case 'small': matchesCapacity = total <= 60; break;
        case 'medium': matchesCapacity = total > 60 && total <= 100; break;
        case 'large': matchesCapacity = total > 100; break;
      }
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesCapacity;
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý phòng chiếu</h1>
            <p className="text-gray-600 mt-1">Quản lý các phòng chiếu và trang thiết bị</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'cards' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
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
                    : 'text-gray-600 hover:text-gray-900'
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
              <Plus size={16} />
              <span>Thêm phòng mới</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc vị trí..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại phòng</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Tất cả</option>
                <option value="small">Nhỏ (≤60 ghế)</option>
                <option value="medium">Vừa (61-100 ghế)</option>
                <option value="large">Lớn ({">"}100 ghế)</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end mt-4">
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Filter size={16} />
              <span>Xóa bộ lọc</span>
            </button>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'cards' ? (
          /* Cards View */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedRooms.map((room) => (
                <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
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
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => room.id && handleDeleteRoom(room.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
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

                  {/* Card Footer */}
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setSelectedRoom(room);
                        setModalMode("view");
                        setModalOpen(true);
                      }}
                      className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Xem chi tiết
                    </button>
                  </div>
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
          room={selectedRoom}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSaveRoom}
        />
      </div>
    </div>
  );
};

export default RoomManagement;
