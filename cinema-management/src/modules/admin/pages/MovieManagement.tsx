import axios from 'axios';
import { Edit, Eye, Filter, Plus, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import MovieModal from "../components/MovieModal";
import { Pagination } from "../components/pagination";
import { Column, Table } from "../components/tableProps";

interface Movie {
  id?: string;
  nameVn: string;
  nameEn: string;
  director: string;
  countryId: string;
  formatId: string;
  releaseDate: string;
  endDate: string;
  briefVn: string;
  briefEn: string;
  image: string | File | ""; // API returns string, but form accepts File or empty
  trailer: string | File | ""; // API returns string, but form accepts File or empty
  time: number;
  limitageId: string;
  languageId: string;
  ratings?: string;
  status: string;
  sortorder?: number;
}

// Main Movie Management Component
const MovieManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedMovie, setSelectedMovie] = useState<Movie | undefined>(undefined);
  const itemsPerPage = 5;

  // Fetch movies from API
  useEffect(() => {
    
    fetchMovies();
  }, []);
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:8080/api/v1/movies");
        // Nếu API trả về { data: [...] }
        setMovies(res.data.data || []);
      } catch (error) {
        setMovies([]);
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
    const requiredFields = ['nameVn', 'director', 'countryId', 'formatId', 'limitageId', 'languageId', 'releaseDate', 'endDate'];
    const missingFields = requiredFields.filter(field => !movie[field as keyof Movie]);
    
    if (missingFields.length > 0) {
      alert(`Thiếu các trường bắt buộc: ${missingFields.join(', ')}`);
      return;
    }

    // Validate UUID format for foreign keys
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const uuidFields = ['countryId', 'formatId', 'limitageId', 'languageId'];
    
    for (const field of uuidFields) {
      const value = movie[field as keyof Movie] as string;
      if (value && !uuidRegex.test(value)) {
        alert(`${field} không đúng định dạng UUID`);
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
    
    console.log('Original dates:', { releaseDate: movie.releaseDate, endDate: movie.endDate });
    console.log('Formatted dates:', { releaseDate: formattedReleaseDate, endDate: formattedEndDate });

    if (!formattedReleaseDate || !formattedEndDate) {
      alert('Định dạng ngày không hợp lệ. Vui lòng kiểm tra lại ngày phát hành và ngày kết thúc.');
      return;
    }

    // Check file sizes before processing (only for new files)
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
    
    if (movie.image instanceof File) {
      if (!movie.image.type.startsWith('image/')) {
        alert('File ảnh không hợp lệ. Chỉ chấp nhận file ảnh.');
        return;
      }
      if (movie.image.size > MAX_IMAGE_SIZE) {
        alert(`File ảnh quá lớn (${(movie.image.size / 1024 / 1024).toFixed(2)}MB). Giới hạn tối đa là 10MB.`);
        return;
      }
    } else if (modalMode === "add") {
      // Chỉ bắt buộc file khi thêm mới
      alert('Vui lòng chọn file ảnh để upload');
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
    formData.append('formatId', movie.formatId || '');
    formData.append('releaseDate', formattedReleaseDate);
    formData.append('endDate', formattedEndDate);
    formData.append('briefVn', movie.briefVn?.trim() || '');
    formData.append('briefEn', movie.briefEn?.trim() || '');
    // image and trailer will be added below as files
    formData.append('time', Math.max(1, movie.time || 90).toString());
    formData.append('limitageId', movie.limitageId || '');
    formData.append('languageId', movie.languageId || '');

    // Add optional fields
    if (movie.ratings !== undefined && movie.ratings !== '') {
      formData.append('ratings', movie.ratings.toString());
    }
    
    if (movie.status !== undefined && movie.status !== '') {
      formData.append('status', movie.status.toString());
    }
    
    if (movie.sortorder !== undefined) {
      formData.append('sortorder', movie.sortorder.toString());
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

    // Debug FormData content
    console.log('=== FormData Debug Info ===');
    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}:`, {
          type: 'File',
          name: value.name,
          size: value.size,
          lastModified: value.lastModified,
          mimeType: value.type
        });
      } else {
        console.log(`${key}: ${value}`);
      }
    }
    
    // Calculate total size
    let totalSize = 0;
    for (const [, value] of formData.entries()) {
      if (value instanceof File) {
        totalSize += value.size;
      } else {
        totalSize += new Blob([value.toString()]).size;
      }
    }
    console.log('Estimated total FormData size:', totalSize, 'bytes', `(${(totalSize/1024/1024).toFixed(2)}MB)`);
    console.log('=== End FormData Debug ===');

    console.log('=== Final Data Check ===');
    console.log('Required fields check:');
    console.log('- nameVn:', movie.nameVn);
    console.log('- director:', movie.director);
    console.log('- countryId:', movie.countryId);
    console.log('- formatId:', movie.formatId);
    console.log('- limitageId:', movie.limitageId);
    console.log('- languageId:', movie.languageId);
    console.log('- formattedReleaseDate:', formattedReleaseDate);
    console.log('- formattedEndDate:', formattedEndDate);
    console.log('========================');

    // Request configuration for multipart/form-data
    const config = {
      headers: {
        // Let browser automatically set Content-Type with boundary
        // 'Content-Type': 'multipart/form-data' - Don't set this manually
      },
      timeout: 120000, // 2 minutes timeout for large files
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        }
      }
    };

    let response;
    if (modalMode === "add") {
      console.log('Making POST request to add movie');
      response = await axios.post("http://localhost:8080/api/v1/movies", formData, config);
    } else if (modalMode === "edit" && selectedMovie?.id) {
      console.log(`Making PUT request to edit movie, ID: ${selectedMovie.id}`);
      response = await axios.put(`http://localhost:8080/api/v1/movies/${selectedMovie.id}`, formData, config);
    } else {
      throw new Error('Invalid operation mode or missing movie ID for edit');
    }

    console.log('API Response:', response?.data);
    console.log('Response status:', response?.status);
    console.log('Response headers:', response?.headers);
    
    // Success feedback
    alert(modalMode === "add" ? "Thêm phim thành công!" : "Cập nhật phim thành công!");
    
    // Refresh data and close modal
    await fetchMovies();
    setModalOpen(false);
    
  } catch (error) {
    console.error("Error saving movie:", error);
    
    if (axios.isAxiosError(error)) {
      console.error('=== Axios Error Details ===');
      console.error('Error code:', error.code);
      console.error('Response status:', error.response?.status);
      console.error('Response statusText:', error.response?.statusText);
      console.error('Response data:', error.response?.data);
      console.error('Response headers:', error.response?.headers);
      console.error('Request URL:', error.config?.url);
      console.error('Request method:', error.config?.method);
      console.error('Request headers:', error.config?.headers);
      console.error('============================');
      
      let errorMessage = 'Có lỗi xảy ra khi lưu phim.';
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Yêu cầu bị timeout. File có thể quá lớn hoặc kết nối mạng chậm.';
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
        errorMessage = 'Lỗi kết nối mạng. Kiểm tra kết nối internet và thử lại.';
      } else if (error.response?.status === 413) {
        errorMessage = 'Dữ liệu hoặc file quá lớn. Server không thể xử lý.';
      } else if (error.response?.status === 415) {
        errorMessage = 'Định dạng dữ liệu không được hỗ trợ bởi server.';
      } else if (error.response?.status === 400) {
        const backendMessage = error.response?.data?.message || 
                              error.response?.data?.error || 
                              error.response?.data;
        errorMessage = `Dữ liệu không hợp lệ: ${backendMessage || 'Kiểm tra lại thông tin đã nhập'}`;
      } else if (error.response?.status === 422) {
        const backendMessage = error.response?.data?.message || error.response?.data?.error;
        errorMessage = `Lỗi validation: ${backendMessage || 'Dữ liệu không đúng định dạng yêu cầu'}`;
      } else if (error.response?.status === 500) {
        const backendMessage = error.response?.data?.message || 
                              error.response?.data?.error || 
                              'Internal server error';
        errorMessage = `Lỗi server: ${backendMessage}`;
        
        console.error('Data sent to server:');
        console.error('- modalMode:', modalMode);
        console.error('- selectedMovie ID:', selectedMovie?.id);
        console.error('========================');
      }
      
      alert(errorMessage);
    } else {
      console.error('Non-Axios error:', error);
      alert("Có lỗi không xác định xảy ra. Vui lòng kiểm tra console và thử lại.");
    }
  } finally {
    setLoading(false);
  }
};
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "1": return "Đang chiếu";
      case "2": return "Sắp chiếu";
      case "3": return "Ngừng chiếu";
      default: return "Không xác định";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "1": return "bg-green-100 text-green-800";
      case "2": return "bg-blue-100 text-blue-800";
      case "3": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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

  const handleAction = (action: string, movie: Movie) => {
    console.log(`${action} movie:`, movie);
    // Implement your action logic here
  };

  const filteredMovies = movies.filter(movie =>
    movie.nameVn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.director?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      key: 'format',
      title: 'Định dạng',
      render: (format) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 whitespace-nowrap">
          {format}
        </span>
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
        <div className="text-sm text-gray-600">
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
      render: (status) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusColor(status)}`}>
          {getStatusLabel(status)}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Hành động',
      render: (_, movie) => (
        <div className="flex items-center space-x-2">
          <button 
            className="text-blue-600 hover:text-blue-900 transition-colors" 
            title="Xem chi tiết"
            onClick={() => { setModalMode("view"); setSelectedMovie(movie); setModalOpen(true); }}
          >
            <Eye size={16} />
          </button>
          <button 
            className="text-green-600 hover:text-green-900 transition-colors" 
            title="Chỉnh sửa"
            onClick={() => { setModalMode("edit"); setSelectedMovie(movie); setModalOpen(true); }}
          >
            <Edit size={16} />
          </button>
          <button 
            className="text-red-600 hover:text-red-900 transition-colors" 
            title="Xóa"
            onClick={() => handleAction('delete', movie)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];
  return (
      <div className="flex-1 p-2">
        <div className="max-w-8xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý phim</h1>
            <button 
              className="text-blue-600 hover:text-blue-900 transition-colors flex items-center space-x-2 px-4 py-2 border border-blue-600 rounded-lg hover:bg-blue-50 cursor-pointer"
              onClick={() => { setModalMode("add"); setSelectedMovie(undefined); setModalOpen(true); }}
            >
              Them <Plus size={16} />
            </button>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
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
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter size={16} />
                <span>Lọc</span>
              </button>
            </div>
          </div>

          {/* Movies Table */}
          <Table 
            columns={columns}
            data={paginatedMovies}
            loading={loading}
            emptyText="Không tìm thấy phim nào"
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredMovies.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />

          {/* Movie Modal */}
          <MovieModal
            open={modalOpen}
            mode={modalMode}
            movie={selectedMovie}
            onClose={() => setModalOpen(false)}
            onSubmit={(movie) => {
                handleSaveMovie(movie);
            }}
          />
        </div>
      </div>
  );
};

export default MovieManagement;