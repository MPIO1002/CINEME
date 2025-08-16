import { Calendar, Clock, Edit, Eye, Film, Filter, List, MapPin, ClockPlus, Search, Trash2, CalendarClock } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Pagination } from "../components/pagination";
import ShowtimeCalendar from "../components/ShowtimeCalendar";
import ShowtimeModal from "../components/ShowtimeModal";
import type { Column } from "../components/tableProps";
import { Table } from "../components/tableProps";
import { theaterApi, type Theater } from '../../../services/theaterApi';
// import { movieApi, type Movie } from '../../../services/movieApi';
interface Showtime {
id?: string;
movieId: string;
movieName?: string;
movieImage?: string;
roomId: string;
roomName?: string;
showDate: string;
startTime: string;
endTime: string;
ticketPrice: number;
status: 'ACTIVE' | 'SOLD_OUT' | 'CANCELLED';
bookedSeats?: number;
totalSeats?: number;
}

interface Movie {
id: string;
nameVn: string;
nameEn: string;
image: string;
time: number;
}

interface Room {
id: string;
name: string;
totalSeats: number;
type: '2D' | '3D' | 'IMAX';
}

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

// View mode - 'list' or 'calendar'
const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

// Filters
const [selectedMovie, setSelectedMovie] = useState('');
const [selectedTheater, setSelectedTheater] = useState('');
const [selectedRoom, setSelectedRoom] = useState('');

const [dateFrom, setDateFrom] = useState('');
const [dateTo, setDateTo] = useState('');

const itemsPerPage = 10;

// Mock data - replace with API calls
useEffect(() => {
    fetchShowtimes();
    fetchMovies();
    fetchRooms();
    fetchTheaters();
}, []);

const fetchShowtimes = async () => {
    setLoading(true);
    try {
    // Mock data - replace with actual API call
    const mockShowtimes: Showtime[] = [
        {
        id: '1',
        movieId: 'movie1',
        movieName: 'Avatar: The Way of Water',
        movieImage: 'https://via.placeholder.com/100x150',
        roomId: 'room1',
        roomName: 'Phòng 1',
        showDate: '2025-08-08',
        startTime: '14:00',
        endTime: '17:30',
        ticketPrice: 120000,
        status: 'ACTIVE',
        bookedSeats: 45,
        totalSeats: 120
        },
        {
        id: '2',
        movieId: 'movie2',
        movieName: 'Fast & Furious X',
        movieImage: 'https://via.placeholder.com/100x150',
        roomId: 'room2',
        roomName: 'Phòng 2',
        showDate: '2025-08-08',
        startTime: '16:30',
        endTime: '19:00',
        ticketPrice: 150000,
        status: 'ACTIVE',
        bookedSeats: 80,
        totalSeats: 100
        },
        {
        id: '3',
        movieId: 'movie1',
        movieName: 'Avatar: The Way of Water',
        movieImage: 'https://via.placeholder.com/100x150',
        roomId: 'room1',
        roomName: 'Phòng 1',
        showDate: '2025-08-08',
        startTime: '19:00',
        endTime: '22:30',
        ticketPrice: 120000,
        status: 'SOLD_OUT',
        bookedSeats: 120,
        totalSeats: 120
        },
        {
        id: '4',
        movieId: 'movie2',
        movieName: 'Fast & Furious X',
        movieImage: 'https://via.placeholder.com/100x150',
        roomId: 'room3',
        roomName: 'Phòng 3',
        showDate: '2025-08-09',
        startTime: '15:00',
        endTime: '17:30',
        ticketPrice: 180000,
        status: 'ACTIVE',
        bookedSeats: 25,
        totalSeats: 80
        },
        {
        id: '5',
        movieId: 'movie1',
        movieName: 'Avatar: The Way of Water',
        movieImage: 'https://via.placeholder.com/100x150',
        roomId: 'room2',
        roomName: 'Phòng 2',
        showDate: '2025-08-09',
        startTime: '20:00',
        endTime: '23:30',
        ticketPrice: 150000,
        status: 'CANCELLED',
        bookedSeats: 0,
        totalSeats: 100
        }
    ];
    setShowtimes(mockShowtimes);
    } catch (error) {
    console.error('Error fetching showtimes:', error);
    setShowtimes([]);
    }
    setLoading(false);
};

const fetchMovies = async () => {
    try {
    // Mock data - replace with actual API call
    const mockMovies: Movie[] = [
        { id: 'movie1', nameVn: 'Avatar: The Way of Water', nameEn: 'Avatar: The Way of Water', image: 'https://via.placeholder.com/100x150', time: 192 },
        { id: 'movie2', nameVn: 'Fast & Furious X', nameEn: 'Fast & Furious X', image: 'https://via.placeholder.com/100x150', time: 141 }
    ];
    setMovies(mockMovies);
    } catch (error) {
    console.error('Error fetching movies:', error);
    }
};

const fetchRooms = async () => {
    try {
    // Mock data - replace with actual API call
    const mockRooms: Room[] = [
        { id: 'room1', name: 'Phòng 1', totalSeats: 120, type: '2D' },
        { id: 'room2', name: 'Phòng 2', totalSeats: 100, type: '3D' },
        { id: 'room3', name: 'Phòng 3', totalSeats: 80, type: 'IMAX' }
    ];
    setRooms(mockRooms);
    } catch (error) {
    console.error('Error fetching rooms:', error);
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

const handleSaveShowtime = (showtime: Showtime) => {
    setLoading(true);
    
    console.log('Saving showtime:', showtime);
    
    if (modalMode === "add") {
    // Add new showtime with generated ID
    const newShowtime: Showtime = {
        ...showtime,
        id: Date.now().toString(),
        bookedSeats: 0,
    };
    setShowtimes(prev => [...prev, newShowtime]);
    alert('Thêm suất chiếu thành công!');
    } else if (modalMode === "edit" && showtime.id) {
    // Update existing showtime
    setShowtimes(prev => prev.map(s => 
        s.id === showtime.id ? { ...s, ...showtime } : s
    ));
    alert('Cập nhật suất chiếu thành công!');
    }
    
    setModalOpen(false);
    setLoading(false);
};

const handleDeleteShowtime = async (showtimeId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa suất chiếu này?')) {
    setLoading(true);
    try {
        console.log('Deleting showtime:', showtimeId);
        alert('Xóa suất chiếu thành công!');
        await fetchShowtimes();
    } catch (error) {
        console.error('Error deleting showtime:', error);
        alert('Có lỗi xảy ra khi xóa suất chiếu!');
    }
    setLoading(false);
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
    case 'ACTIVE': return 'Mở bán';
    case 'SOLD_OUT': return 'Hết vé';
    case 'CANCELLED': return 'Đã hủy';
    default: return 'Không xác định';
    }
};

const getStatusColor = (status: string) => {
    switch (status) {
    case 'ACTIVE': return 'bg-green-100 text-green-800';
    case 'SOLD_OUT': return 'bg-red-100 text-red-800';
    case 'CANCELLED': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
    }
};

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
    }).format(price);
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

// Apply filters
const filteredShowtimes = showtimes.filter(showtime => {
    const matchesSearch = (showtime.movieName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                        (showtime.roomName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesMovie = !selectedMovie || showtime.movieId === selectedMovie;
    const matchesRoom = !selectedRoom || showtime.roomId === selectedRoom;
    const matchesTheater = !selectedTheater || showtime.id === selectedTheater;
    const matchesDateFrom = !dateFrom || showtime.showDate >= dateFrom;
    const matchesDateTo = !dateTo || showtime.showDate <= dateTo;

    return matchesSearch && matchesMovie && matchesRoom && matchesTheater && matchesDateFrom && matchesDateTo;
});

// Pagination
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedShowtimes = filteredShowtimes.slice(startIndex, endIndex);

// Clear all filters
const clearFilters = () => {
    setSearchTerm('');
    setSelectedMovie('');
    setSelectedRoom('');
    setSelectedTheater('');
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
        <div className="w-12 h-16 bg-gray-200 rounded-lg mr-3 flex-shrink-0 overflow-hidden">
            <img 
            src={showtime.movieImage} 
            alt={showtime.movieName}
            className="w-full h-full object-cover"
            onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA0OCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCAzMkgyNFYzNkgyOFYzMkgyOFYyOEgyNFYzMloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
            }}
            />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{showtime.movieName}</p>
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
            {showtime.roomName}
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
            {formatDate(showtime.showDate)}
        </div>
        <div className="flex items-center text-gray-600 mt-1">
            <Clock className="w-3 h-3 mr-1" />
            {formatTime(showtime.startTime)} - {formatTime(showtime.endTime)}
        </div>
        </div>
    )
    },
    {
    key: 'price',
    title: 'Giá vé',
    render: (_, showtime) => (
        <div className="text-sm font-medium text-gray-900">
        {formatPrice(showtime.ticketPrice)}
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
    render: (_, showtime) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusColor(showtime.status)}`}>
        {getStatusLabel(showtime.status)}
        </span>
    )
    },
    {
    key: 'actions',
    title: 'Thao tác',
    render: (_, showtime) => (
        <div className="flex items-center space-x-2">
        <button
            onClick={() => {
            setSelectedShowtime(showtime);
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
            setSelectedShowtime(showtime);
            setModalMode("edit");
            setModalOpen(true);
            }}
            className="text-green-600 hover:text-green-900 transition-colors"
            title="Chỉnh sửa"
        >
            <Edit size={16} />
        </button>
        <button
            onClick={() => showtime.id && handleDeleteShowtime(showtime.id)}
            className="text-red-600 hover:text-red-900 transition-colors"
            title="Xóa"
            disabled={!showtime.id}
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
            <button
            className="text-blue-600 hover:text-blue-900 transition-colors flex items-center space-x-2 px-4 py-2 border border-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer"
            onClick={() => {
                setModalMode("add");
                setSelectedShowtime(undefined);
                setModalOpen(true);
            }}
            >
            <ClockPlus size={16} />
            <span>Thêm suất chiếu</span>
            </button>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mt-4 pt-4 border-t-2 border-gray-200">
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
                className="w-full h-11 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                <option value="">Tất cả phòng</option>
                {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                    {room.name}
                    </option>
                ))}
                </select>
            </div>

            {/* Movie Filter */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phim</label>
                <select
                value={selectedMovie}
                onChange={(e) => setSelectedMovie(e.target.value)}
                className="w-full h-11 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                <option value="">Tất cả phim</option>
                {movies.map(movie => (
                    <option key={movie.id} value={movie.id}>
                    {movie.nameVn}
                    </option>
                ))}
                </select>
            </div>

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
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveShowtime}
        />
    </div>
);
};

export default ShowtimeManagement;
