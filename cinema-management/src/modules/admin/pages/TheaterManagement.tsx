import {
    Building2,
    ChevronRight,
    Edit,
    Eye,
    Filter,
    Globe,
    Grid,
    List,
    Loader2,
    MapPin,
    Plus,
    Search,
    Trash2,
    Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { theaterApi, type Theater } from '../../../services/theaterApi';
import { Pagination } from "../components/pagination";
import type { Column } from "../components/tableProps";
import { Table } from "../components/tableProps";
import TheaterModal from '../components/TheaterModal';

const TheaterManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedTheater, setSelectedTheater] = useState<Theater | undefined>(undefined);
  
  // View mode - 'cards' or 'list'
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  
  // Filters
  const [selectedStatus, setSelectedStatus] = useState('');
  const [roomCountRange, setRoomCountRange] = useState('');
  
  const itemsPerPage = viewMode === 'cards' ? 12 : 10;

  // API calls
  useEffect(() => {
    fetchTheaters();
  }, []);

  const fetchTheaters = async () => {
    setLoading(true);
    try {
      // Add a small delay to show loading state (remove in production)
    //   await new Promise(resolve => setTimeout(resolve, 800));
      
      const result = await theaterApi.getAllTheaters();
      
      if (result.statusCode === 200) {
        // Fetch rooms for each theater
        const theatersWithRooms = await Promise.all(
          result.data.map(async (theater: Theater) => {
            if (!theater.id) return theater;
            
            try {
              const roomsResult = await theaterApi.getTheaterRooms(theater.id);
              
              return {
                ...theater,
                status: 'ACTIVE' as const,
                totalRooms: roomsResult.statusCode === 200 ? roomsResult.data.length : 0,
                rooms: roomsResult.statusCode === 200 ? roomsResult.data : [],
                utilization: Math.floor(Math.random() * 40) + 60, // Mock data
                monthlyRevenue: Math.floor(Math.random() * 500000000) + 100000000, // Mock data
              };
            } catch (error) {
              console.error(`Error fetching rooms for theater ${theater.id}:`, error);
              return {
                ...theater,
                status: 'ACTIVE' as const,
                totalRooms: 0,
                rooms: [],
                utilization: 0,
                monthlyRevenue: 0,
              };
            }
          })
        );
        
        setTheaters(theatersWithRooms);
      } else {
        console.error('Error fetching theaters:', result.message);
        setTheaters([]);
      }
    } catch (error) {
      console.error('Error fetching theaters:', error);
      setTheaters([]);
    }
    setLoading(false);
  };

  const handleSaveTheater = async (theater: Theater) => {
    setLoading(true);
    
    try {
      if (modalMode === "add") {
        // Add new theater
        const result = await theaterApi.createTheater({
          nameEn: theater.nameEn,
          nameVn: theater.nameVn,
          address: theater.address,
          phone: theater.phone,
          email: theater.email,
        });
        
        if (result.statusCode === 200) {
          alert('Thêm rạp chiếu phim thành công!');
          fetchTheaters(); // Refresh list
        } else {
          throw new Error(result.message || 'Failed to add theater');
        }
      } else if (modalMode === "edit" && theater.id) {
        // Update existing theater
        const result = await theaterApi.updateTheater(theater.id, {
          nameEn: theater.nameEn,
          nameVn: theater.nameVn,
          address: theater.address,
          phone: theater.phone,
          email: theater.email,
        });
        
        if (result.statusCode === 200) {
          alert('Cập nhật rạp chiếu phim thành công!');
          fetchTheaters(); // Refresh list
        } else {
          throw new Error(result.message || 'Failed to update theater');
        }
      }
    } catch (error) {
      console.error('Error saving theater:', error);
      
      // Fallback to local update for demo
      if (modalMode === "add") {
        const newTheater: Theater = {
          ...theater,
          id: Date.now().toString(),
          totalRooms: 0,
          status: 'ACTIVE',
          utilization: 0,
          monthlyRevenue: 0,
        };
        setTheaters(prev => [...prev, newTheater]);
        alert('Thêm rạp chiếu phim thành công! (Demo mode)');
      } else if (modalMode === "edit" && theater.id) {
        setTheaters(prev => prev.map(t => 
          t.id === theater.id ? { ...t, ...theater } : t
        ));
        alert('Cập nhật rạp chiếu phim thành công! (Demo mode)');
      }
    }
    
    setModalOpen(false);
    setLoading(false);
  };

  const handleDeleteTheater = async (theaterId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa rạp chiếu phim này? Tất cả phòng chiếu sẽ bị xóa.')) {
      setLoading(true);
      try {
        const result = await theaterApi.deleteTheater(theaterId);
        
        if (result.statusCode === 200) {
          setTheaters(prev => prev.filter(t => t.id !== theaterId));
          alert('Xóa rạp chiếu phim thành công!');
        } else {
          throw new Error(result.message || 'Failed to delete theater');
        }
      } catch (error) {
        console.error('Error deleting theater:', error);
        // Fallback to local delete for demo
        setTheaters(prev => prev.filter(t => t.id !== theaterId));
        alert('Xóa rạp chiếu phim thành công! (Demo mode)');
      }
      setLoading(false);
    }
  };

  // Helper functions
  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'ACTIVE': return 'Hoạt động';
      case 'MAINTENANCE': return 'Bảo trì';
      case 'CLOSED': return 'Đã đóng';
      default: return 'Không xác định';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'MAINTENANCE': return 'bg-orange-100 text-orange-800';
      case 'CLOSED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatRevenue = (revenue: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(revenue);
  };

  // Apply filters
  const filteredTheaters = theaters.filter(theater => {
    const matchesSearch = theater.nameVn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         theater.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (theater.address?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = !selectedStatus || theater.status === selectedStatus;
    
    let matchesRoomCount = true;
    if (roomCountRange) {
      const total = theater.totalRooms || 0;
      switch (roomCountRange) {
        case 'small': matchesRoomCount = total <= 5; break;
        case 'medium': matchesRoomCount = total > 5 && total <= 10; break;
        case 'large': matchesRoomCount = total > 10; break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesRoomCount;
  });

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTheaters = filteredTheaters.slice(startIndex, endIndex);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setRoomCountRange('');
  };

  // Table columns for list view
  const columns: Column<Theater>[] = [
    {
      key: 'name',
      title: 'Rạp chiếu phim',
      render: (_, theater) => (
        <div className="flex items-center">
          <div className="text-2xl mr-3">🎬</div>
          <div>
            <p className="text-sm font-medium text-gray-900">{theater.nameVn}</p>
            <p className="text-xs text-gray-500">{theater.nameEn}</p>
          </div>
        </div>
      )
    },
    {
      key: 'address',
      title: 'Địa chỉ',
      render: (_, theater) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{theater.address || 'Chưa cập nhật'}</div>
          <div className="text-xs text-gray-500">{theater.phone || 'Chưa có SĐT'}</div>
        </div>
      )
    },
    {
      key: 'rooms',
      title: 'Phòng chiếu',
      render: (_, theater) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{theater.totalRooms || 0} phòng</div>
          <div className="text-xs text-gray-500">
            {theater.rooms && theater.rooms.length > 0 
              ? `${theater.rooms.filter(r => r.type === 'Standard').length} Standard, ${theater.rooms.filter(r => r.type === 'VIP').length} VIP`
              : 'Chưa có phòng'}
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      title: 'Liên hệ',
      render: (_, theater) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{theater.email || 'Chưa có email'}</div>
          <div className="text-xs text-gray-500">{theater.phone || 'Chưa có SĐT'}</div>
        </div>
      )
    },
    {
      key: 'utilization',
      title: 'Hiệu suất',
      render: (_, theater) => (
        <div className="text-sm">
          <div className="flex items-center mb-1">
            <span className="font-medium text-gray-900">{theater.utilization || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                (theater.utilization || 0) >= 90 ? 'bg-green-500' :
                (theater.utilization || 0) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${theater.utilization || 0}%` }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (_, theater) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(theater.status)}`}>
          {getStatusLabel(theater.status)}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (_, theater) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setSelectedTheater(theater);
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
              setSelectedTheater(theater);
              setModalMode("edit");
              setModalOpen(true);
            }}
            className="text-green-600 hover:text-green-900 transition-colors"
            title="Chỉnh sửa"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => theater.id && handleDeleteTheater(theater.id)}
            className="text-red-600 hover:text-red-900 transition-colors"
            title="Xóa"
            disabled={!theater.id}
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
                    <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Quản lý rạp chiếu phim</h1>
                    <p className="text-slate-600">Quản lý rạp chiếu phim và cơ sở vật chất</p>
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
                setSelectedTheater(undefined);
                setModalOpen(true);
              }}
            >
              <Plus size={16} />
              <span>Thêm rạp mới</span>
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
                  placeholder="Tìm theo tên rạp hoặc địa chỉ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
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

            {/* Room Count Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số phòng chiếu</label>
              <select
                value={roomCountRange}
                onChange={(e) => setRoomCountRange(e.target.value)}
                className="w-50 h-11 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Tất cả</option>
                <option value="small">Nhỏ (≤5 phòng)</option>
                <option value="medium">Vừa (6-10 phòng)</option>
                <option value="large">Lớn ({">"}10 phòng)</option>
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
            {paginatedTheaters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedTheaters.map((theater) => (
                  <div key={theater.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      <div>
                        {/* Card Header */}
                        <div className="p-4 border-b-2 border-gray-100">
                            {/* <div className="flex items-center justify-between mb-2"> */}
                            <div className="flex items-center space-x-2">
                                <span className="text-2xl">🎬</span>
                                <h3 className="text-lg font-semibold text-gray-900 truncate">{theater.nameVn}</h3>
                            </div>
                            {/* </div> */}
                            <div className="flex items-center justify-between">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                    <Globe className="w-3 h-3 mr-1" />
                                    {theater.nameEn}
                                    </span>
                                <div className="flex space-x-1">
                                    <button
                                    onClick={() => {
                                        setSelectedTheater(theater);
                                        setModalMode("edit");
                                        setModalOpen(true);
                                    }}
                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
                                    title="Chỉnh sửa"
                                    >
                                    <Edit size={14} />
                                    </button>
                                    <button
                                    onClick={() => theater.id && handleDeleteTheater(theater.id)}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                    title="Xóa"
                                    >
                                    <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <span className={`inline-flex mt-3 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(theater.status)}`}>
                                {getStatusLabel(theater.status)}
                            </span>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 space-y-3">
                            {/* Address & Contact */}
                            <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                                <MapPin className="w-4 h-4 mr-2" />
                                <span className="truncate">{theater.address || 'Chưa cập nhật địa chỉ'}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <Users className="w-4 h-4 mr-2" />
                                {theater.totalRooms || 0} phòng chiếu
                            </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600">
                                <span className="w-4 h-4 mr-2">📞</span>
                                <span className="truncate">{theater.phone || 'Chưa có SĐT'}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                                <span className="w-4 h-4 mr-2">📧</span>
                                <span className="truncate">{theater.email || 'Chưa có email'}</span>
                            </div>
                            </div>

                            {/* Revenue */}
                            <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">Doanh thu tháng</div>
                            <div className="text-sm font-semibold text-gray-900">
                                {theater.monthlyRevenue ? formatRevenue(theater.monthlyRevenue) : 'Chưa có dữ liệu'}
                            </div>
                            </div>

                            {/* Utilization */}
                            {theater.status === 'ACTIVE' && (
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs text-gray-500">Hiệu suất:</span>
                                        <span className="text-xs font-medium text-gray-700">{theater.utilization}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full ${
                                            (theater.utilization || 0) >= 90 ? 'bg-green-500' :
                                            (theater.utilization || 0) >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                            style={{ width: `${theater.utilization || 0}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                  {/* Card Footer */}
                    <button
                      onClick={() => {
                        setSelectedTheater(theater);
                        setModalMode("view");
                        setModalOpen(true);
                      }}
                      className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium bg-gray-100 px-4 py-3 border-t border-gray-100 cursor-pointer flex items-center justify-center gap-2"
                    >
                      Xem chi tiết
                      <ChevronRight size={14} />
                    </button>
                </div>
              ))}
            </div>
            ) : (
              /* Empty State for Cards */
              <div className="flex flex-col items-center justify-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Không có rạp chiếu phim</h3>
                <p className="text-gray-500 text-center mb-6 max-w-md">
                  {filteredTheaters.length === 0 && theaters.length > 0 
                    ? "Không tìm thấy rạp nào phù hợp với bộ lọc hiện tại. Hãy thử điều chỉnh bộ lọc."
                    : "Chưa có rạp chiếu phim nào trong hệ thống. Hãy thêm rạp mới để bắt đầu."
                  }
                </p>
              </div>
            )}
          </>
        ) : (
          /* List View */
          <>
            <Table 
              columns={columns}
              data={paginatedTheaters}
              loading={loading}
              emptyText="Không tìm thấy rạp chiếu phim nào"
            />
          </>
        )}

        {/* Pagination */}
        {!loading && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalItems={filteredTheaters.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Theater Modal */}
        <TheaterModal
          open={modalOpen}
          mode={modalMode}
          theater={selectedTheater}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSaveTheater}
        />
      </div>
  );
};

export default TheaterManagement;
