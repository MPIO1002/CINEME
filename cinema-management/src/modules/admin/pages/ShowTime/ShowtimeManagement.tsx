import { Calendar, CalendarClock, Clock, ClockPlus, Edit, Eye, Film, Filter, List, MapPin, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { movieApiService, type Movie } from '../../../../services/movieApi';
import { type Room } from '../../../../services/roomApi';
import { createShowtime, deleteShowtime, getAllShowtimes, updateShowtime, validateShowtimeEdit, type Showtime } from '../../../../services/showtimeApi';
import { theaterApi, type Theater } from '../../../../services/theaterApi';
import { Pagination } from "../../components/pagination";
import ShowtimeCalendar from "./components/ShowtimeCalendar";
import ShowtimeModal from "./components/ShowtimeModal";
import CreateShowtimeModal from "./components/CreateShowtimeModal";
import type { Column } from "../../components/tableProps";
import { Table } from "../../components/tableProps";
import { hasPermission } from "../../utils/authUtils";

const ShowtimeManagement: React.FC = () => {
const [searchTerm, setSearchTerm] = useState('');
const [currentPage, setCurrentPage] = useState(1);
const [loading, setLoading] = useState(false);
const [showtimes, setShowtimes] = useState<Showtime[]>([]);
const [movies, setMovies] = useState<Movie[]>([]);
const [rooms, setRooms] = useState<Room[]>([]);
const [theaters, setTheaters] = useState<Theater[]>([]);
const [modalOpen, setModalOpen] = useState(false);
const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
const [selectedShowtime, setSelectedShowtime] = useState<Showtime | undefined>(undefined);
const [createModalOpen, setCreateModalOpen] = useState(false);

// View mode - 'list' or 'calendar'
const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

// Filters
const [selectedTheater, setSelectedTheater] = useState('');
const [selectedRoom, setSelectedRoom] = useState('');
const [selectedFormat, setSelectedFormat] = useState('');
const [selectedLanguage, setSelectedLanguage] = useState('');
const [selectedStatus, setSelectedStatus] = useState('');

const [dateFrom, setDateFrom] = useState('');
const [dateTo, setDateTo] = useState('');

const itemsPerPage = 5;

// Mock data - replace with API calls
useEffect(() => {
    fetchShowtimes();
    fetchMovies();
    fetchTheaters();
}, []);

// Load rooms when theater is selected
useEffect(() => {
    if (selectedTheater) {
        fetchRooms(selectedTheater);
        // Reset room selection when theater changes
        setSelectedRoom('');
    } else {
        // Clear rooms when no theater is selected
        setRooms([]);
        setSelectedRoom('');
    }
}, [selectedTheater]);

const fetchShowtimes = async () => {
    setLoading(true);
    try {
        const response = await getAllShowtimes();
        if (response.statusCode === 200) {
            setShowtimes(response.data);
            console.table(response.data);
        }
    } catch (error) {
        console.error('Error fetching showtimes:', error);
        setShowtimes([]);
    }
    setLoading(false);
};

const fetchMovies = async () => {
    try {
        const apiMovies = await movieApiService.getAllMovies();
        setMovies(apiMovies);
    } catch (error) {
        console.error('Error fetching movies:', error);
        setMovies([]);
    }
};

const fetchRooms = async (theaterId: string) => {
    try {
        const response = await theaterApi.getTheaterRooms(theaterId);
        if (response.statusCode === 200) {
            // Transform API data to match UI interface
            const transformedRooms: Room[] = response.data.map((apiRoom: { id: string; name: string; type: string; totalSeats?: number; theaterId?: string }) => ({
                id: apiRoom.id || '',
                name: apiRoom.name,
                totalSeats: apiRoom.totalSeats || 0,
                type: (apiRoom.type === 'Standard' ? '2D' : apiRoom.type) as '2D' | '3D' | 'IMAX',
                theaterId: apiRoom.theaterId || theaterId // Ensure theaterId is present
            }));
            setRooms(transformedRooms);
        }
    } catch (error) {
        console.error('Error fetching rooms:', error);
        setRooms([]);
    }
};

const fetchTheaters = async () => {
    try {
        const response = await theaterApi.getAllTheaters();
        if (response.statusCode === 200) {
            setTheaters(response.data);
        }
    } catch (error) {
        console.error('Error fetching theaters:', error);
    }
};

const handleSaveShowtime = async (showtime: Showtime) => {
    setLoading(true);
    
    try {
        if (modalMode === "add") {
            // Create new showtime
            const showtimeData = {
                movieId: showtime.movieId || '',
                theaterId: showtime.theaterId || selectedTheater || theaters[0]?.id || '',
                roomId: showtime.roomId,
                date: showtime.date,
                startTime: showtime.startTime, // keep as string - API will convert
                endTime: showtime.endTime, // keep as string - API will convert
                languageVn: showtime.languageVn || 'Lồng Tiếng',
                languageEn: showtime.languageEn || 'VN',
                formatVn: showtime.formatVn || '2D',
                formatEn: showtime.formatEn || '2D'
            };

            // Validate required fields before sending
            if (!showtimeData.movieId || !showtimeData.theaterId || !showtimeData.roomId || 
                !showtimeData.date || !showtimeData.startTime || !showtimeData.endTime ||
                !showtimeData.languageVn || !showtimeData.formatVn) {
                alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
                setLoading(false);
                return;
            }
            console.table(showtimeData);
            const response = await createShowtime(showtimeData);
            if (response.statusCode === 200 || response.statusCode === 201) {
                alert('Thêm suất chiếu thành công!');
                await fetchShowtimes(); // Refresh the list
            }
        } else if (modalMode === "edit" && showtime.id) {
            // Validate edit permissions first
            try {
                const validationResponse = await validateShowtimeEdit(showtime.id);
                if (!validationResponse.data.canEdit) {
                    const reasons = validationResponse.data.reasons.join('\n');
                    alert(`Không thể chỉnh sửa suất chiếu này:\n${reasons}`);
                    setLoading(false);
                    return;
                }

                // Show warnings if any
                if (validationResponse.data.warnings.length > 0) {
                    const warnings = validationResponse.data.warnings.join('\n');
                    const confirmed = window.confirm(`Cảnh báo:\n${warnings}\n\nBạn có muốn tiếp tục?`);
                    if (!confirmed) {
                        setLoading(false);
                        return;
                    }
                }
            } catch (validationError) {
                console.error('Error validating edit permissions:', validationError);
                // Continue with edit if validation endpoint is not available
            }

            // Update existing showtime
            const updateData = {
                movieId: showtime.movieId,
                theaterId: showtime.theaterId,
                roomId: showtime.roomId,
                date: showtime.date,
                startTime: showtime.startTime?.substring(0, 5), // Convert to HH:mm format
                endTime: showtime.endTime?.substring(0, 5), // Convert to HH:mm format
                languageVn: showtime.languageVn,
                languageEn: showtime.languageEn,
                formatVn: showtime.formatVn,
                formatEn: showtime.formatEn
            };

            console.log('Updating showtime:', updateData);
            const response = await updateShowtime(showtime.id, updateData);
            if (response.statusCode === 200) {
                alert('Cập nhật suất chiếu thành công!');
                await fetchShowtimes(); // Refresh the list
            }
        }
        
        setModalOpen(false);
    } catch (error) {
        console.error('Error saving showtime:', error);
        
        // Check if error has specific message from backend
        if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { data?: { message?: string } } };
            const errorMessage = axiosError.response?.data?.message || 'Có lỗi xảy ra khi lưu suất chiếu!';
            alert(errorMessage);
        } else {
            alert('Có lỗi xảy ra khi lưu suất chiếu!');
        }
    }
    
    setLoading(false);
};

const handleDeleteShowtime = async (showtimeId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa suất chiếu này?')) {
        setLoading(true);
        try {
            const response = await deleteShowtime(showtimeId);
            if (response.statusCode === 200) {
                alert('Xóa suất chiếu thành công!');
                await fetchShowtimes(); // Refresh the list
            }
        } catch (error) {
            console.error('Error deleting showtime:', error);
            alert('Có lỗi xảy ra khi xóa suất chiếu!');
        }
        setLoading(false);
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
    case 'UPCOMING': return 'Sắp chiếu';
    case 'ONGOING': return 'Đang chiếu';
    case 'FINISHED': return 'Đã kết thúc';
    default: return 'Không xác định';
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
    case 'UPCOMING': return 'bg-blue-100 text-blue-800';
    case 'ONGOING': return 'bg-yellow-100 text-yellow-800';
    case 'FINISHED': return 'bg-gray-100 text-gray-600';
    default: return 'bg-gray-100 text-gray-800';
    }
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
};

const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM
};

const calculateOccupancy = (bookedSeats: number, totalSeats: number) => {
    const percentage = (bookedSeats / totalSeats) * 100;
    return {
    percentage: percentage.toFixed(1),
    color: percentage >= 90 ? 'text-red-600' : percentage >= 70 ? 'text-yellow-600' : 'text-green-600'
    };
};

// Calendar handlers
const handleShowtimeClick = (showtime: Showtime) => {
    setSelectedShowtime(showtime);
    setModalMode("view");
    setModalOpen(true);
};

const handleDateClick = (date: string) => {
    // Set date filter and switch to list view to show showtimes for selected date
    setDateFrom(date);
    setDateTo(date);
    setViewMode('list');
};

// Get showtime status based on date and time
const getShowtimeStatus = (date: string, startTime: string, endTime: string): 'UPCOMING' | 'ONGOING' | 'FINISHED' => {
    const now = new Date();
    const showtimeDate = new Date(date);
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startDateTime = new Date(showtimeDate);
    startDateTime.setHours(startHour, startMin, 0, 0);
    
    const endDateTime = new Date(showtimeDate);
    endDateTime.setHours(endHour, endMin, 0, 0);
    
    if (now < startDateTime) {
        return 'UPCOMING';
    } else if (now >= startDateTime && now <= endDateTime) {
        return 'ONGOING';
    } else {
        return 'FINISHED';
    }
};

// Apply filters
const filteredShowtimes = showtimes.filter(showtime => {
    const matchesSearch = (showtime.movieNameVn?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                        (showtime.roomName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesRoom = !selectedRoom || showtime.roomId === selectedRoom;
    const matchesTheater = !selectedTheater || showtime.theaterId === selectedTheater;
    const matchesFormat = !selectedFormat || showtime.formatVn === selectedFormat;
    const matchesLanguage = !selectedLanguage || showtime.languageVn === selectedLanguage;
    const matchesStatus = !selectedStatus || (() => {
        if (['UPCOMING', 'ONGOING', 'FINISHED'].includes(selectedStatus)) {
            // Filter by time-based status
            const calculatedStatus = getShowtimeStatus(showtime.date, showtime.startTime, showtime.endTime);
            return calculatedStatus === selectedStatus;
        }
    })();
    const matchesDateFrom = !dateFrom || showtime.date >= dateFrom;
    const matchesDateTo = !dateTo || showtime.date <= dateTo;

    return matchesSearch && matchesRoom && matchesTheater && matchesFormat && 
           matchesLanguage && matchesStatus && matchesDateFrom && matchesDateTo;
});

// Pagination
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedShowtimes = filteredShowtimes.slice(startIndex, endIndex);

// Clear all filters
const clearFilters = () => {
    setSearchTerm('');
    setSelectedRoom('');
    setSelectedTheater('');
    setSelectedFormat('');
    setSelectedLanguage('');
    setSelectedStatus('');
    setDateFrom('');
    setDateTo('');
};

// Table columns
const columns: Column<Showtime>[] = [
    {
    key: 'movie',
    title: 'Phim',
    render: (_, showtime) => (
        <div className="flex items-center">
        <div className="w-16 h-24 bg-gray-200 rounded-lg mr-3 flex-shrink-0 overflow-hidden">
            <img 
            src={showtime.img?.includes('http') ? showtime.img : `http://127.0.0.1:9000/${showtime.img}`}
            alt={showtime.movieNameVn}
            className="w-full h-full object-cover"
            onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA0OCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkgyNFYzNkgyOFYzMkgyOFYyOEgyNFYzMloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
            }}
            />
        </div>
        <div className="">
            <p className="text-sm font-medium text-gray-900 truncate">{showtime.movieNameVn}</p>
            <div className="flex items-center mt-1 text-xs text-gray-500">
            <Film className="w-3 h-3 mr-1" />
            <span>ID: {showtime.movieId}</span>
            </div>
        </div>
        </div>
    )
    },
    {
    key: 'room',
    title: 'Phòng chiếu',
    render: (_, showtime) => (
        <div className="text-sm">
        <div className="flex items-center font-medium text-gray-900">
            <MapPin className="w-4 h-4 mr-1 text-gray-400" />
            {showtime.roomName}{showtime.theaterName ? ` (Theater: ${showtime.theaterName})` : ' (Theater: Unknown)'}
        </div>
        <div className="text-xs text-gray-500 mt-1">
            {showtime.totalSeats} ghế
        </div>
        </div>
    )
    },
    {
    key: 'datetime',
    title: 'Ngày & Giờ',
    render: (_, showtime) => (
        <div className="text-sm">
        <div className="flex items-center font-medium text-gray-900">
            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
            {formatDate(showtime.date)}
        </div>
        <div className="flex items-center text-gray-600 mt-1">
            <Clock className="w-3 h-3 mr-1" />
            {formatTime(showtime.startTime)} - {formatTime(showtime.endTime)}
        </div>
        </div>
    )
    },
    {
    key: 'format',
    title: 'Định dạng',
    render: (_, showtime) => (
        <div className="text-sm font-medium text-gray-900">
        {showtime.formatVn || '2D'}
        </div>
    )
    },
    {
    key: 'language',
    title: 'Ngôn ngữ',
    render: (_, showtime) => (
        <div className="text-sm font-medium text-gray-900">
        {showtime.languageVn}
        </div>
    )
    },
    {
    key: 'occupancy',
    title: 'Tình trạng ghế',
    render: (_, showtime) => {
        const occupancy = calculateOccupancy(showtime.bookedSeats || 0, showtime.totalSeats || 1);
        return (
        <div className="text-sm">
            <div className="flex justify-between items-center mb-1">
            <span className="text-gray-600">{showtime.bookedSeats || 0}/{showtime.totalSeats || 0}</span>
            <span className={`font-medium ${occupancy.color}`}>{occupancy.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
                className={`h-2 rounded-full ${
                parseFloat(occupancy.percentage) >= 90 ? 'bg-red-500' :
                parseFloat(occupancy.percentage) >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${occupancy.percentage}%` }}
            />
            </div>
        </div>
        );
    }
    },
    {
    key: 'status',
    title: 'Trạng thái',
    render: (_, showtime) => {
        const currentStatus = getShowtimeStatus(showtime.date, showtime.startTime, showtime.endTime);
        return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusColor(currentStatus)}`}>
        {getStatusLabel(currentStatus)}
        </span>
        );
    }
    },
    {
    key: 'actions',
    title: 'Thao tác',
    render: (_, showtime) => (
        <div className="flex items-center space-x-1">
        {hasPermission("showtime.view") && (
          <button
            onClick={() => {
            setSelectedShowtime(showtime);
            setModalMode("view");
            setModalOpen(true);
            }}
            className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-lg cursor-pointer hover:bg-blue-100"
            title="Xem chi tiết"
          >
            <Eye size={16} />
          </button>
        )}
        {hasPermission("showtime.update") && (
          <button
            onClick={() => {
            setSelectedShowtime(showtime);
            setModalMode("edit");
            setModalOpen(true);
            }}
            className="text-green-600 hover:text-green-900 transition-colors p-2 rounded-lg cursor-pointer hover:bg-green-100"
            title="Chỉnh sửa"
          >
            <Edit size={16} />
          </button>
        )}
        {hasPermission("showtime.delete") && (
          <button
            onClick={() => showtime.id && handleDeleteShowtime(showtime.id)}
            className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-lg cursor-pointer hover:bg-red-100"
            title="Xóa"
            disabled={!showtime.id}
          >
            <Trash2 size={16} />
          </button>
        )}
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
                    <CalendarClock className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Quản lý suất chiếu phim</h1>
                    <p className="text-slate-600">Quản lý suất chiếu phim trong hệ thống rạp chiếu phim</p>
                </div>
            </div>
        <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
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
            <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
            >
                <Calendar size={16} />
                Lịch
            </button>
            </div>

            {/* Add Button */}
            {hasPermission("showtime.create") && (
              <button
                className="text-blue-600 hover:text-blue-900 transition-colors flex items-center space-x-2 px-4 py-2 border border-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer"
                onClick={() => {
                    setCreateModalOpen(true);
                }}
              >
                <ClockPlus size={16} />
                <span>Thêm suất chiếu</span>
              </button>
            )}
        </div>
        </div>

        {/* Filters - Only show in list view */}
        {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            {/* First Row - Search and Quick Actions */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo phim hoặc phòng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>
                <button
                    onClick={clearFilters}
                    className="flex w-36 h-11 items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-200 hover:text-gray-900 transition-colors border border-gray-300 rounded-lg cursor-pointer"
                >
                    <Filter size={16} />
                    <span>Xóa bộ lọc</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 mt-4 pt-4 border-t-2 border-gray-200">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rạp</label>
                <select
                value={selectedTheater}
                onChange={(e) => setSelectedTheater(e.target.value)}
                className="w-full h-11 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                <option value="">Tất cả rạp</option>
                {theaters.map(theater => (
                    <option key={theater.id} value={theater.id}>
                    {theater.nameVn}
                    </option>
                ))}
                </select>
            </div>

            {/* Room Filter */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phòng</label>
                <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                disabled={!selectedTheater}
                className="w-full h-11 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                <option value="">
                    {!selectedTheater ? "Chọn rạp trước" : "Tất cả phòng"}
                </option>
                {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                    {room.name}
                    </option>
                ))}
                </select>
            </div>

            {/* Format Filter */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Định dạng</label>
                <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full h-11 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                <option value="">Tất cả định dạng</option>
                <option value="2D">2D</option>
                <option value="3D">3D</option>
                <option value="IMAX">IMAX</option>
                <option value="4DX">4DX</option>
                </select>
            </div>

            {/* Language Filter */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngôn ngữ</label>
                <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full h-11 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                <option value="">Tất cả ngôn ngữ</option>
                <option value="Lồng Tiếng">Lồng Tiếng</option>
                <option value="Phụ Đề">Phụ Đề</option>
                <option value="Tiếng Anh">Tiếng Anh</option>
                </select>
            </div>

            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 mt-4 pt-4 border-t-2 border-gray-200'>
                {/* Date From */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                    <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full h-11 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>

                {/* Date To */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                    <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full h-11 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>
                {/* Status Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                    <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full h-11 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="UPCOMING">Sắp chiếu</option>
                        <option value="ONGOING">Đang chiếu</option>
                        <option value="FINISHED">Đã kết thúc</option>
                    </select>
                </div>
            </div>
        </div>
        )}

        {/* Content based on view mode */}
        {viewMode === 'list' ? (
        <>
            {/* Showtimes Table */}
            <Table 
            columns={columns}
            data={paginatedShowtimes}
            loading={loading}
            emptyText="Không tìm thấy suất chiếu nào"
            />

            {/* Pagination */}
            <Pagination
            currentPage={currentPage}
            totalItems={filteredShowtimes.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            />
        </>
        ) : (
        /* Calendar View */
        <ShowtimeCalendar
            showtimes={showtimes}
            onShowtimeClick={handleShowtimeClick}
            onDateClick={handleDateClick}
        />
        )}

        {/* Showtime Modal */}
        <ShowtimeModal
        open={modalOpen}
        mode={modalMode}
        showtime={selectedShowtime}
        movies={movies}
        rooms={rooms}
        theaters={theaters}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveShowtime}
        onTheaterChange={(theaterId) => {
            if (theaterId) {
                fetchRooms(theaterId);
            } else {
                setRooms([]);
            }
        }}
        />

        {/* Create Showtime Modal */}
        <CreateShowtimeModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        />
    </div>
);
};

export default ShowtimeManagement;
