import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import axios from 'axios';
import { Edit, Eye, Filter, Popcorn, Search, TicketPlus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { movieApiService, type Movie } from '../../../../services/movieApi';
import { Pagination } from "../../components/pagination";
import { Table, type Column } from "../../components/tableProps";
import { hasPermission } from '../../utils/authUtils';
import MovieModal from "./components/MovieModal";

// Main Movie Management Component
const MovieManagement: React.FC = () => {
const [searchTerm, setSearchTerm] = useState('');
const [currentPage, setCurrentPage] = useState(1);
const [loading, setLoading] = useState(false);
const [movies, setMovies] = useState<Movie[]>([]);
const [modalOpen, setModalOpen] = useState(false);
const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
const [selectedMovie, setSelectedMovie] = useState<Movie | undefined>(undefined);

// Alert state
const [alertState, setAlertState] = useState<{
    show: boolean;
    severity: 'error' | 'warning' | 'info' | 'success';
    title: string;
    message: string;
}>({
    show: false,
    severity: 'info',
    title: '',
    message: ''
});

// Filter states
const [selectedStatus, setSelectedStatus] = useState('');
const [selectedFormat, setSelectedFormat] = useState('');
const [selectedLanguage, setSelectedLanguage] = useState('');
const [selectedCountry, setSelectedCountry] = useState('');
const [ratingFilter, setRatingFilter] = useState('');
const [durationRange, setDurationRange] = useState('');
const [releaseDateFrom, setReleaseDateFrom] = useState('');
const [releaseDateTo, setReleaseDateTo] = useState('');

const itemsPerPage = 5;

// Helper function to calculate movie status based on dates
const getMovieStatus = (releaseDate: string, endDate: string): { key: string; label: string; color: string } => {
    if (!releaseDate || !endDate) {
        return { key: "unknown", label: "Không xác định", color: "bg-gray-100 text-gray-800" };
    }

    const now = new Date();
    const release = new Date(releaseDate);
    const end = new Date(endDate);

    // Set time to start of day for accurate comparison
    now.setHours(0, 0, 0, 0);
    release.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    if (now < release) {
        return { key: "upcoming", label: "Sắp chiếu", color: "bg-blue-100 text-blue-800" };
    } else if (now >= release && now <= end) {
        return { key: "showing", label: "Đang chiếu", color: "bg-green-100 text-green-800" };
    } else {
        return { key: "ended", label: "Đã kết thúc", color: "bg-red-100 text-red-800" };
    }
};

// Helper function to show alert
const showAlert = (severity: 'error' | 'warning' | 'info' | 'success', title: string, message: string) => {
    setAlertState({
        show: true,
        severity,
        title,
        message
    });
    // Auto hide alert after 5 seconds
    setTimeout(() => {
        setAlertState(prev => ({ ...prev, show: false }));
    }, 8000);
};

// Fetch movies from API
useEffect(() => {
    fetchMovies();
}, []); // eslint-disable-line react-hooks/exhaustive-deps

// Debug: Log movies state when it changes
useEffect(() => {
    console.log('Movies state updated:', movies);
    console.log('Current movies count:', movies.length);
}, [movies]);

const fetchMovies = async () => {
    if(!hasPermission('movie.view')) {
        showAlert('error', 'Lỗi phân quyền', 'Bạn không có quyền xem danh sách phim.');
        return;
    }
    setLoading(true);
    try {
        const moviesData = await movieApiService.getAllMovies();
        setMovies(moviesData);
        showAlert('success', 'Thành công', `Đã tải ${moviesData.length} phim thành công.`);
        // Note: movies state won't be updated immediately here due to React's asynchronous state updates
    } catch (error) {
        console.error('Error fetching movies:', error);
        setMovies([]);
        showAlert('error', 'Lỗi', 'Không thể tải danh sách phim. Vui lòng thử lại!');
    }
    setLoading(false);
};

const handleSaveMovie = async (movie: Movie) => {
    setLoading(true);
    try {
        console.log('Movie data to save:', movie);
        console.log('Modal mode:', modalMode);
        console.log('Selected movie:', selectedMovie);

        // Validate required fields before sending
        const requiredFields = ['nameVn', 'director', 'countryId', 'limitageId', 'releaseDate', 'endDate'];
        const missingFields = requiredFields.filter(field => !movie[field as keyof Movie]);
        
        // Special validation for listActor - commented out for now since it might not be required
        // if (!movie.listActor || movie.listActor.length === 0) {
        //     missingFields.push('listActor');
        // }
        
        if (missingFields.length > 0) {
        showAlert('error', 'Lỗi xác thực', `Thiếu các trường bắt buộc: ${missingFields.join(', ')}`);
        return;
        }

        // Validate UUID format for foreign keys
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const uuidFields = ['countryId', 'limitageId'];
        
        for (const field of uuidFields) {
        const value = movie[field as keyof Movie] as string;
        if (value && !uuidRegex.test(value)) {
            showAlert('error', 'Lỗi xác thực', `${field} không đúng định dạng UUID`);
            return;
        }
        }

        // Format dates for Java LocalDateTime (without timezone)
        const formatDateTimeForBackend = (dateString: string) => {
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            
            // Check if date is valid
            if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateString);
            return '';
            }
            
            // Format as YYYY-MM-DDTHH:mm:ss (without timezone)
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            
            return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
        };

        const formattedReleaseDate = formatDateTimeForBackend(movie.releaseDate);
        const formattedEndDate = formatDateTimeForBackend(movie.endDate);
        
        if (!formattedReleaseDate || !formattedEndDate) {
        showAlert('error', 'Lỗi xác thực', 'Định dạng ngày không hợp lệ. Vui lòng kiểm tra lại ngày phát hành và ngày kết thúc.');
        return;
        }

        // Check file sizes before processing (only for new files)
        const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
        const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
        
        if (movie.image instanceof File) {
        if (!movie.image.type.startsWith('image/')) {
            showAlert('error', 'Lỗi tập tin', 'File ảnh không hợp lệ. Chỉ chấp nhận file ảnh.');
            return;
        }
        if (movie.image.size > MAX_IMAGE_SIZE) {
            showAlert('error', 'Lỗi tập tin', `File ảnh quá lớn (${(movie.image.size / 1024 / 1024).toFixed(2)}MB). Giới hạn tối đa là 10MB.`);
            return;
        }
        } else if (modalMode === "add") {
        // Chỉ bắt buộc file khi thêm mới
        showAlert('error', 'Thiếu tập tin', 'Vui lòng chọn file ảnh để upload');
        return;
        }
        
        if (movie.trailer instanceof File) {
        if (!movie.trailer.type.startsWith('video/')) {
            alert('File trailer không hợp lệ. Chỉ chấp nhận file video.');
            return;
        }
        if (movie.trailer.size > MAX_VIDEO_SIZE) {
            alert(`File trailer quá lớn (${(movie.trailer.size / 1024 / 1024).toFixed(2)}MB). Giới hạn tối đa là 100MB.`);
            return;
        }
        } else if (modalMode === "add") {
        // Chỉ bắt buộc file khi thêm mới
        alert('Vui lòng chọn file trailer để upload');
        return;
        }

        // Use FormData exactly matching SwaggerUI structure
        const formData = new FormData();
        
        // Add all fields as shown in SwaggerUI (in same order for consistency)
        formData.append('nameVn', movie.nameVn?.trim() || '');
        formData.append('nameEn', movie.nameEn?.trim() || '');
        formData.append('director', movie.director?.trim() || '');
        formData.append('countryId', movie.countryId || '');
        formData.append('releaseDate', formattedReleaseDate);
        formData.append('endDate', formattedEndDate);
        formData.append('briefVn', movie.briefVn?.trim() || '');
        formData.append('briefEn', movie.briefEn?.trim() || '');
        // image and trailer will be added below as files
        formData.append('time', Math.max(1, movie.time || 90).toString());
        formData.append('limitageId', movie.limitageId || '');
        formData.append('ratings', movie.ratings?.trim() || '0'); // Default to 0 if not provided
        // Note: status is now calculated automatically based on releaseDate and endDate
        
        // Backend expects listActorId (array of UUIDs), not listActor (array of Actor objects)
        const actorIds = (movie.listActor || []).map(actor => actor.id).filter(id => id !== undefined);
        console.log('Actor IDs to send:', actorIds);
        
        // For FormData with @ModelAttribute, send each UUID separately with the same field name
        // This allows Spring Boot to automatically convert to List<UUID>
        if (actorIds.length > 0) {
            actorIds.forEach(actorId => {
                if (actorId) {
                    formData.append('listActorId', actorId);
                }
            });
        } else {
            // Send empty array - some backends require at least one entry
            // We'll send an empty string that backend can handle
            console.log('No actors selected, sending empty listActorId');
            // Actually don't append anything for empty list - let backend handle missing field
        }
        // Handle image field - smart upload logic
        if (modalMode === "add") {
        // Khi thêm mới: bắt buộc phải có file
        if (movie.image instanceof File) {
            console.log('Adding new image file to FormData:', movie.image.name);
            formData.append('image', movie.image);
        } else {
            console.error('Image must be a File object when adding new movie');
            alert('Vui lòng chọn file ảnh để upload');
            return;
        }
        } else if (modalMode === "edit") {
        // Khi sửa: chỉ upload nếu user chọn file mới
        if (movie.image instanceof File) {
            console.log('Adding new image file to FormData for update:', movie.image.name);
            formData.append('image', movie.image);
        } else {
            console.log('Keeping existing image (no new file selected)');
            // Không append image vào FormData - backend sẽ giữ nguyên file cũ
        }
        }

        // Handle trailer field - smart upload logic
        if (modalMode === "add") {
        // Khi thêm mới: bắt buộc phải có file
        if (movie.trailer instanceof File) {
            console.log('Adding new trailer file to FormData:', movie.trailer.name);
            formData.append('trailer', movie.trailer);
        } else {
            console.error('Trailer must be a File object when adding new movie');
            alert('Vui lòng chọn file trailer để upload');
            return;
        }
        } else if (modalMode === "edit") {
        // Khi sửa: chỉ upload nếu user chọn file mới
        if (movie.trailer instanceof File) {
            console.log('Adding new trailer file to FormData for update:', movie.trailer.name);
            formData.append('trailer', movie.trailer);
        } else {
            console.log('Keeping existing trailer (no new file selected)');
            // Không append trailer vào FormData - backend sẽ giữ nguyên file cũ
        }
        }

        let response;
        if (modalMode === "add") {
        console.log('Making POST request to add movie');
        response = await movieApiService.createMovie(formData);
        } else if (modalMode === "edit" && selectedMovie?.id) {
        console.log(`Making PUT request to edit movie, ID: ${selectedMovie.id}`);
        response = await movieApiService.updateMovie(selectedMovie.id, formData);
        } else {
        throw new Error('Invalid operation mode or missing movie ID for edit');
        }

        console.log('API Response:', response);
        
        // Success feedback
        alert(modalMode === "add" ? "Thêm phim thành công!" : "Cập nhật phim thành công!");
        
        // Refresh data and close modal
        await fetchMovies();
        setModalOpen(false);
        
    } catch (error) {
        console.error("Error saving movie:", error);
        alert("Có lỗi không xác định xảy ra. Vui lòng kiểm tra console và thử lại.");
    } finally {
        setLoading(false);
    }
};

const getRatingStars = (rating: string) => {
    const stars = Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`text-sm ${i < parseInt(rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
        ⭐
    </span>
    ));
    return stars;
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
};

const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
};

const handleDelete = async (movie: Movie) => {
    if (!movie.id) {
        console.error('Cannot delete movie: movie.id is undefined');
        alert('Không thể xóa phim: ID không hợp lệ');
        return;
    }

    // Confirm deletion
    const confirmDelete = window.confirm(
        `Bạn có chắc chắn muốn xóa phim "${movie.nameVn}"?\nHành động này không thể hoàn tác.`
    );
    
    if (!confirmDelete) {
        return;
    }

    try {
        setLoading(true);
        await movieApiService.deleteMovie(movie.id);
        
        // Success
        alert(`Đã xóa phim "${movie.nameVn}" thành công!`);
        
        // Refresh movie list
        fetchMovies();
        
    } catch (error) {
        console.error(`Error deleting movie:`, error);
        
        // Handle specific error cases
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const message = error.response?.data?.message;
            
            switch (status) {
                case 404:
                    alert(`Phim "${movie.nameVn}" không tồn tại hoặc đã được xóa trước đó.\nDanh sách sẽ được làm mới.`);
                    // Refresh list to remove the non-existent movie from UI
                    await fetchMovies();
                    break;
                case 403:
                    alert('Bạn không có quyền xóa phim này.');
                    break;
                case 409:
                    alert('Không thể xóa phim này vì đang có dữ liệu liên quan (vé đã bán, lịch chiếu, v.v...)');
                    break;
                default:
                    alert(`Có lỗi xảy ra khi xóa phim: ${message || error.message || 'Lỗi không xác định'}`);
            }
        } else {
            alert(`Có lỗi xảy ra khi xóa phim: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
        }
    } finally {
        setLoading(false);
    }
};

// Reset current page when filters change
useEffect(() => {
    setCurrentPage(1);
}, [searchTerm, selectedStatus, selectedFormat, selectedLanguage, selectedCountry, 
    ratingFilter, durationRange, releaseDateFrom, releaseDateTo]);

const filteredMovies = movies.filter(movie => {
    // Search filter
    const matchesSearch = movie.nameVn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movie.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movie.director?.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter - now based on calculated status from dates
    let matchesStatus = true;
    if (selectedStatus) {
        const movieStatus = getMovieStatus(movie.releaseDate, movie.endDate);
        matchesStatus = movieStatus.key === selectedStatus;
    }

    // Country filter
    const matchesCountry = !selectedCountry || (movie.countryId && movie.countryId === selectedCountry);

    // Rating filter
    let matchesRating = true;
    if (ratingFilter) {
        const rating = parseFloat(movie.ratings || '0');
        switch (ratingFilter) {
            case 'high': matchesRating = rating >= 4; break;
            case 'medium': matchesRating = rating >= 3 && rating < 4; break;
            case 'low': matchesRating = rating < 3; break;
        }
    }

    // Duration filter
    let matchesDuration = true;
    if (durationRange) {
        const duration = movie.time || 0;
        switch (durationRange) {
            case 'short': matchesDuration = duration <= 90; break;
            case 'medium': matchesDuration = duration > 90 && duration <= 150; break;
            case 'long': matchesDuration = duration > 150; break;
        }
    }

    // Release date filter
    const matchesReleaseFrom = !releaseDateFrom || new Date(movie.releaseDate) >= new Date(releaseDateFrom);
    const matchesReleaseTo = !releaseDateTo || new Date(movie.releaseDate) <= new Date(releaseDateTo);

    return matchesSearch && matchesStatus && 
           matchesCountry && matchesRating && matchesDuration && matchesReleaseFrom && matchesReleaseTo;
});

// Clear all filters
const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('');
    setSelectedFormat('');
    setSelectedLanguage('');
    setSelectedCountry('');
    setRatingFilter('');
    setDurationRange('');
    setReleaseDateFrom('');
    setReleaseDateTo('');
};

// Pagination logic
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const paginatedMovies = filteredMovies.slice(startIndex, endIndex);

// Table columns configuration
const columns: Column<Movie>[] = [
    {
    key: 'movie',
    title: 'Phim',
    render: (_, movie) => (
        <div className="flex items-center">
        <div className="w-16 h-24 bg-gray-200 rounded-lg mr-4 flex-shrink-0 overflow-hidden">
            <img 
            src={
                movie.image instanceof File 
                ? URL.createObjectURL(movie.image)
                : typeof movie.image === 'string' && movie.image
                    ? movie.image
                    : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA2NCA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCA0MEgyNFY0NEgyOFY0MEgyOFYzNkgyNFY0MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
            } 
            alt={movie.nameVn}
            className="w-full h-full object-cover"
            onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA2NCA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9Ijk2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNCA0MEgyNFY0NEgyOFY0MEgyOFYzNkgyNFY0MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
            }}
            />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{movie.nameVn}</p>
            {movie.nameEn && (
            <p className="text-xs text-gray-500 truncate">{movie.nameEn}</p>
            )}
        </div>
        </div>
    )
    },
    {
    key: 'director',
    title: 'Đạo diễn',
    render: (director) => (
        <span className="text-sm text-gray-600 whitespace-nowrap">{director}</span>
    )
    },
    {
    key: 'time',
    title: 'Thời lượng',
    render: (time) => (
        <span className="text-sm text-gray-600 whitespace-nowrap">{formatDuration(time)}</span>
    )
    },
    {
    key: 'releaseDate',
    title: 'Ngày phát hành',
    render: (_, movie) => (
        <div className="text-sm text-gray-600 w-40">
        <p>Khởi chiếu: {formatDate(movie.releaseDate)}</p>
        <p className="text-xs text-gray-400">Kết thúc: {formatDate(movie.endDate)}</p>
        </div>
    )
    },
    {
    key: 'ratings',
    title: 'Đánh giá',
    render: (ratings) => (
        <div className="flex items-center space-x-1">
        {getRatingStars(ratings)}
        <span className="text-sm text-gray-600 ml-2">({ratings}/5)</span>
        </div>
    )
    },
    {
    key: 'status',
    title: 'Trạng thái',
    render: (_, movie) => {
        const status = getMovieStatus(movie.releaseDate, movie.endDate);
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${status.color}`}>
                {status.label}
            </span>
        );
    }
    },
    {
    key: 'actions',
    title: 'Hành động',
    render: (_, movie) => (
        <div className="flex items-center space-x-1">
            {hasPermission("movie.view") && (
              <button 
                className="text-blue-600 hover:text-blue-900 transition-colors p-2 rounded-lg cursor-pointer hover:bg-blue-100" 
                title="Xem chi tiết"
                onClick={() => { setModalMode("view"); setSelectedMovie(movie); setModalOpen(true); }}
              >
                <Eye size={16} />
              </button>
            )}
            {hasPermission("movie.update") && (
              <button 
                className="text-green-600 hover:text-green-900 transition-colors p-2 rounded-lg cursor-pointer hover:bg-green-100" 
                title="Chỉnh sửa"
                onClick={() => { setModalMode("edit"); setSelectedMovie(movie); setModalOpen(true); }}
              >
                <Edit size={16} />
              </button>
            )}
            {hasPermission("movie.delete") && (
              <button 
                className="text-red-600 hover:text-red-900 transition-colors p-2 rounded-lg cursor-pointer hover:bg-red-100" 
                title="Xóa"
                onClick={() => handleDelete(movie)}
              >
                <Trash2 size={16} />
              </button>
            )}
        </div>
    )
    }
];
return (
    <div className=" bg-gray-50 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Notification */}
        {alertState.show && (
            <div className="absolute bottom-5 right-10 z-100">
                <Alert 
                    severity={alertState.severity}
                    onClose={() => setAlertState(prev => ({ ...prev, show: false }))}
                    sx={{ width: '400px' }}
                >
                    <AlertTitle>{alertState.title}</AlertTitle>
                    {alertState.message}
                </Alert>
            </div>
        )}

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                    <Popcorn className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Quản lý phim</h1>
                    <p className="text-slate-600">Quản lý phim trong hệ thống rạp chiếu phim</p>
                </div>
            </div>
            {hasPermission("movie.create") && (
              <button 
                className="text-blue-600 hover:text-blue-900 transition-colors flex items-center justify-center space-x-2 px-4 py-2 border border-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer"
                onClick={() => { setModalMode("add"); setSelectedMovie(undefined); setModalOpen(true); }}
              >
                <TicketPlus size={16} /> <span>Thêm phim</span>
              </button>
            )}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            {/* First Row - Search and Quick Actions */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm phim theo tên hoặc đạo diễn..."
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

            {/* Second Row - Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                        <option value="">Tất cả</option>
                        <option value="upcoming">Sắp chiếu</option>
                        <option value="showing">Đang chiếu</option>
                        <option value="ended">Đã kết thúc</option>
                    </select>
                </div>

                {/* Rating Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá</label>
                    <select
                        value={ratingFilter}
                        onChange={(e) => setRatingFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                        <option value="">Tất cả</option>
                        <option value="high">Cao (4-5⭐)</option>
                        <option value="medium">Trung bình (3-4⭐)</option>
                        <option value="low">Thấp (&lt;3⭐)</option>
                    </select>
                </div>

                {/* Duration Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thời lượng</label>
                    <select
                        value={durationRange}
                        onChange={(e) => setDurationRange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                        <option value="">Tất cả</option>
                        <option value="short">Ngắn (≤90 phút)</option>
                        <option value="medium">Vừa (90-150 phút)</option>
                        <option value="long">Dài ({">"}150 phút)</option>
                    </select>
                </div>

                {/* Country Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quốc gia</label>
                    <select
                        value={selectedCountry}
                        onChange={(e) => setSelectedCountry(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                        <option value="">Tất cả</option>
                        <option value="VN">Việt Nam</option>
                        <option value="US">Mỹ</option>
                        <option value="KR">Hàn Quốc</option>
                        <option value="JP">Nhật Bản</option>
                        <option value="CN">Trung Quốc</option>
                        <option value="FR">Pháp</option>
                        <option value="UK">Anh</option>
                    </select>
                </div>
            </div>

            {/* Third Row - Date Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày phát hành từ</label>
                    <input
                        type="date"
                        value={releaseDateFrom}
                        onChange={(e) => setReleaseDateFrom(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày phát hành đến</label>
                    <input
                        type="date"
                        value={releaseDateTo}
                        onChange={(e) => setReleaseDateTo(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>
        </div>

        {/* Filter Results Summary */}
        {(searchTerm || selectedStatus || selectedFormat || selectedLanguage || selectedCountry || 
          ratingFilter || durationRange || releaseDateFrom || releaseDateTo) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-blue-800">
                        <span className="font-medium">Kết quả lọc:</span> Tìm thấy <span className="font-bold">{filteredMovies.length}</span> phim 
                        {movies.length > 0 && ` trong tổng số ${movies.length} phim`}
                    </div>
                    <button 
                        onClick={clearFilters}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        Xóa tất cả bộ lọc
                    </button>
                </div>
            </div>
        )}

        {/* Movies Table */}
        <Table 
            columns={columns}
            data={paginatedMovies}
            loading={loading}
            emptyText="Không tìm thấy phim nào"
        />

        {/* Pagination */}
        {!loading && (
            <Pagination
                currentPage={currentPage}
                totalItems={filteredMovies.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
            />
        )}
                
        {/* Movie Modal */}
        <MovieModal
            open={modalOpen}
            mode={modalMode}
            movie={selectedMovie?.id} // Pass movieId instead of movie object
            onClose={() => setModalOpen(false)}
            onSubmit={(movie) => {
                handleSaveMovie(movie);
            }}
        />
        </div>
);
};

export default MovieManagement;