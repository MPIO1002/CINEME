import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Search } from 'lucide-react';
import { useDebounce } from '../../../../../hooks/exports';

// Custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #d1d5db #f3f4f6;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f9fafb;
    border-radius: 3px;
    margin: 2px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
    transition: background-color 0.2s ease;
    border: 1px solid #f9fafb;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:active {
    background: #6b7280;
  }
  
  .custom-scrollbar::-webkit-scrollbar-corner {
    background: #f3f4f6;
  }
  
  /* Ensure header compensates for scrollbar */
  .calendar-header-compensation {
    box-sizing: border-box;
  }
  
  /* Prevent layout shift when scrollbar appears */
  .schedule-container {
    overflow: hidden;
  }
  
  /* Text truncation utilities */
  .line-clamp-1 {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  

  
  /* Scroll fade effects */
  .scroll-fade-container {
    position: relative;
  }
  
  .scroll-fade-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 6px;
    height: 8px;
    background: linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,0));
    pointer-events: none;
    z-index: 10;
  }
  
  .scroll-fade-container::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 6px;
    height: 8px;
    background: linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0));
    pointer-events: none;
    z-index: 10;
  }

  /* Showtime blocks positioning */
  .showtime-cell {
    position: relative;
    overflow: visible;
  }

  .showtime-block {
    position: absolute;
    left: 4px;
    right: 4px;
    border-radius: 4px;
    padding: 6px;
    border-left-width: 2px;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .showtime-block:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

`;

interface Movie {
  id: string;
  nameVn: string;
  nameEn: string;
  director: string;
  releaseDate: string;
  endDate: string;
  briefVn: string;
  briefEn: string;
  image: string;
  himage: string;
  trailer: string;
  status: string;
  ratings: string;
  time: number;
  sortorder: number;
}

interface ApiResponse {
  statusCode: number;
  message: string;
  data: Movie[];
}

interface Showtime {
  id: string;
  movieId: string;
  movieName: string;
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
  date: string;      // Format: "YYYY-MM-DD"
  room: string;
  color: string;     // Color theme for the showtime block
}

interface CreateShowtimeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateShowtimeModal: React.FC<CreateShowtimeModalProps> = ({ isOpen, onClose }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTheater, setSelectedTheater] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('Phòng 1');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovies, setSelectedMovies] = useState<Set<string>>(new Set());
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);
  const [moviesError, setMoviesError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('22:00');
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use debounce hook với delay 300ms
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const rooms = ['Phòng 1', 'Phòng 2', 'Phòng 3'];

  // Sample showtimes data
  const sampleShowtimes: Showtime[] = [
    {
      id: '1',
      movieId: '1',
      movieName: 'Avengers: Endgame',
      startTime: '09:00',
      endTime: '12:01',
      date: '2025-09-13',
      room: 'Phòng 1',
      color: 'purple'
    },
    {
      id: '2',
      movieId: '2',
      movieName: 'Spider-Man: No Way Home',
      startTime: '10:30',
      endTime: '13:00',
      date: '2025-09-12',
      room: 'Phòng 1',
      color: 'green'
    },
    {
      id: '3',
      movieId: '3',
      movieName: 'The Batman',
      startTime: '14:00',
      endTime: '16:56',
      date: '2025-09-14',
      room: 'Phòng 1',
      color: 'blue'
    },
    {
      id: '4',
      movieId: '4',
      movieName: 'Oppenheimer',
      startTime: '19:30',
      endTime: '22:00',
      date: '2025-09-15',
      room: 'Phòng 1',
      color: 'yellow'
    }
  ];
  
  // Generate time slots based on start and end time
  const generateTimeSlots = (start: string, end: string) => {
    const slots = [];
    const startHour = parseInt(start.split(':')[0]);
    const startMinute = parseInt(start.split(':')[1]);
    const endHour = parseInt(end.split(':')[0]);
    const endMinute = parseInt(end.split(':')[1]);
    
    // Convert to minutes for easier comparison
    const startInMinutes = startHour * 60 + startMinute;
    const endInMinutes = endHour * 60 + endMinute;
    
    // If end time is earlier than start time, assume it's next day
    const actualEndMinutes = endInMinutes < startInMinutes ? endInMinutes + 24 * 60 : endInMinutes;
    
    // Generate hourly slots
    let currentMinutes = startInMinutes;
    while (currentMinutes <= actualEndMinutes) {
      const hour = Math.floor(currentMinutes / 60) % 24;
      slots.push(hour.toString());
      currentMinutes += 60; // Increment by 1 hour
    }
    
    // Remove duplicates and sort
    return [...new Set(slots)].sort((a, b) => {
      const hourA = parseInt(a);
      const hourB = parseInt(b);
      return hourA - hourB;
    });
  };
  
  const timeSlots = generateTimeSlots(startTime, endTime);

  // Generate date range based on selected dates
  const generateDateRange = (startDate: string, endDate: string) => {
    if (!startDate) return [];
    
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(startDate);
    const dates = [];
    
    // If end date is before start date, swap them
    if (end < start) {
      const temp = new Date(start);
      start.setTime(end.getTime());
      end.setTime(temp.getTime());
    }
    
    const current = new Date(start);
    while (current <= end) {
      dates.push({
        date: current.toISOString().split('T')[0],
        dayName: current.toLocaleDateString('vi-VN', { weekday: 'short' }),
        dayNumber: current.getDate(),
        month: current.getMonth() + 1
      });
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  const dateRange = generateDateRange(selectedDate, endDate);

  // Filter movies based on debounced search query
  const filteredMovies = movies.filter(movie => {
    if (!debouncedSearchQuery) return true;
    const query = debouncedSearchQuery.toLowerCase();
    return (
      movie.nameVn.toLowerCase().includes(query) ||
      movie.nameEn.toLowerCase().includes(query) ||
      movie.director.toLowerCase().includes(query)
    );
  });

  // Helper functions for showtime calculations
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getShowtimeHeight = (startTime: string, endTime: string): number => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const durationMinutes = endMinutes - startMinutes;
    // Each hour = 112px (h-28 = 112px), so each minute = 112/60 ≈ 1.87px
    return Math.max(20, (durationMinutes * 112) / 60); // minimum 20px height
  };

  const getShowtimeTopOffset = (showStartTime: string, slotTime: string): number => {
    const showStartMinutes = timeToMinutes(showStartTime);
    const slotStartMinutes = timeToMinutes(slotTime + ':00');
    const offsetMinutes = showStartMinutes - slotStartMinutes;
    return Math.max(0, (offsetMinutes * 112) / 60); // convert to pixels
  };

  const getShowtimesForSlot = (date: string, slotTime: string): Showtime[] => {
    const slotStartMinutes = timeToMinutes(slotTime + ':00');
    const slotEndMinutes = slotStartMinutes + 60; // 1 hour slot
    
    return sampleShowtimes.filter(showtime => {
      if (showtime.date !== date) return false;
      
      const showStartMinutes = timeToMinutes(showtime.startTime);
      
      // Only show showtime in the slot where it actually starts
      // Check if the showtime starts within this time slot
      return (showStartMinutes >= slotStartMinutes && showStartMinutes < slotEndMinutes);
    });
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      purple: { bg: 'bg-purple-50', border: 'border-purple-600', text: 'text-purple-600' },
      green: { bg: 'bg-green-50', border: 'border-green-600', text: 'text-green-600' },
      blue: { bg: 'bg-blue-50', border: 'border-blue-600', text: 'text-blue-600' },
      yellow: { bg: 'bg-yellow-50', border: 'border-yellow-600', text: 'text-yellow-600' },
      red: { bg: 'bg-red-50', border: 'border-red-600', text: 'text-red-600' },
      indigo: { bg: 'bg-indigo-50', border: 'border-indigo-600', text: 'text-indigo-600' }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.purple;
  };

  // Initialize showtimes with sample data
  React.useEffect(() => {
    setShowtimes(sampleShowtimes);
  }, []);

  // Fetch movies from API
  const fetchMovies = async () => {
    try {
      setIsLoadingMovies(true);
      setMoviesError(null);
      
      const response = await fetch('http://localhost:8080/api/v1/movies', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add mode: 'cors' to handle CORS issues
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: ApiResponse = await response.json();
      
      if (result.statusCode === 200) {
        setMovies(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch movies');
      }
    } catch (error) {
      let errorMessage = 'An error occurred while fetching movies';
      
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc server có đang chạy không.';
        } else if (error.message.includes('CORS')) {
          errorMessage = 'Lỗi CORS: Server cần được cấu hình để cho phép truy cập từ ứng dụng này.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setMoviesError(errorMessage);
      console.error('Error fetching movies:', error);
    } finally {
      setIsLoadingMovies(false);
    }
  };

  // Handle movie checkbox change
  const handleMovieSelect = (movieId: string, isSelected: boolean) => {
    setSelectedMovies((prev) => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(movieId);
      } else {
        newSet.delete(movieId);
      }
      return newSet;
    });
  };

  // Handle select all movies
  const handleSelectAllMovies = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedMovies(new Set(movies.map(movie => movie.id)));
    } else {
      setSelectedMovies(new Set());
    }
  };

  // Handle select all filtered movies
  const handleSelectAllFilteredMovies = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedMovies(prev => {
        const newSet = new Set(prev);
        filteredMovies.forEach(movie => newSet.add(movie.id));
        return newSet;
      });
    } else {
      setSelectedMovies(prev => {
        const newSet = new Set(prev);
        filteredMovies.forEach(movie => newSet.delete(movie.id));
        return newSet;
      });
    }
  };

  // Check if all movies are selected
  const isAllMoviesSelected = movies.length > 0 && selectedMovies.size === movies.length;

  // Check if all filtered movies are selected
  const isAllFilteredMoviesSelected = filteredMovies.length > 0 && 
    filteredMovies.every(movie => selectedMovies.has(movie.id));

  // Fetch movies when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchMovies();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div className="fixed inset-0 bg-[#00000071] flex items-center justify-center mt-[-15px] z-50">
      <div className="bg-white rounded-lg w-[98%] h-[95%] max-w-7xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <h2 className="text-xl font-bold text-gray-800">TẠO SUẤT CHIẾU</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Controls */}
        <div className="p-3 bg-stone-50">
          <div className="flex flex-col md:flex-row max-md:gap-3 items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M17 4.50001L17 5.15001L17 4.50001ZM6.99999 4.50002L6.99999 3.85002L6.99999 4.50002ZM8.05078 14.65C8.40977 14.65 8.70078 14.359 8.70078 14C8.70078 13.641 8.40977 13.35 8.05078 13.35V14.65ZM8.00078 13.35C7.6418 13.35 7.35078 13.641 7.35078 14C7.35078 14.359 7.6418 14.65 8.00078 14.65V13.35ZM8.05078 17.65C8.40977 17.65 8.70078 17.359 8.70078 17C8.70078 16.641 8.40977 16.35 8.05078 16.35V17.65ZM8.00078 16.35C7.6418 16.35 7.35078 16.641 7.35078 17C7.35078 17.359 7.6418 17.65 8.00078 17.65V16.35ZM12.0508 14.65C12.4098 14.65 12.7008 14.359 12.7008 14C12.7008 13.641 12.4098 13.35 12.0508 13.35V14.65ZM12.0008 13.35C11.6418 13.35 11.3508 13.641 11.3508 14C11.3508 14.359 11.6418 14.65 12.0008 14.65V13.35ZM12.0508 17.65C12.4098 17.65 12.7008 17.359 12.7008 17C12.7008 16.641 12.4098 16.35 12.0508 16.35V17.65ZM12.0008 16.35C11.6418 16.35 11.3508 16.641 11.3508 17C11.3508 17.359 11.6418 17.65 12.0008 17.65V16.35ZM16.0508 14.65C16.4098 14.65 16.7008 14.359 16.7008 14C16.7008 13.641 16.4098 13.35 16.0508 13.35V14.65ZM16.0008 13.35C15.6418 13.35 15.3508 13.641 15.3508 14C15.3508 14.359 15.6418 14.65 16.0008 14.65V13.35ZM16.0508 17.65C16.4098 17.65 16.7008 17.359 16.7008 17C16.7008 16.641 16.4098 16.35 16.0508 16.35V17.65ZM16.0008 16.35C15.6418 16.35 15.3508 16.641 15.3508 17C15.3508 17.359 15.6418 17.65 16.0008 17.65V16.35ZM8.65 3C8.65 2.64101 8.35898 2.35 8 2.35C7.64102 2.35 7.35 2.64101 7.35 3H8.65ZM7.35 6C7.35 6.35899 7.64102 6.65 8 6.65C8.35898 6.65 8.65 6.35899 8.65 6H7.35ZM16.65 3C16.65 2.64101 16.359 2.35 16 2.35C15.641 2.35 15.35 2.64101 15.35 3H16.65ZM15.35 6C15.35 6.35899 15.641 6.65 16 6.65C16.359 6.65 16.65 6.35899 16.65 6H15.35ZM6.99999 5.15002L17 5.15001L17 3.85001L6.99999 3.85002L6.99999 5.15002ZM20.35 8.50001V17H21.65V8.50001H20.35ZM17 20.35H7V21.65H17V20.35ZM3.65 17V8.50002H2.35V17H3.65ZM7 20.35C6.03882 20.35 5.38332 20.3486 4.89207 20.2826C4.41952 20.2191 4.1974 20.1066 4.04541 19.9546L3.12617 20.8739C3.55996 21.3077 4.10214 21.4881 4.71885 21.571C5.31685 21.6514 6.07557 21.65 7 21.65V20.35ZM2.35 17C2.35 17.9245 2.34862 18.6832 2.42902 19.2812C2.51193 19.8979 2.69237 20.4401 3.12617 20.8739L4.04541 19.9546C3.89341 19.8026 3.78096 19.5805 3.71743 19.108C3.65138 18.6167 3.65 17.9612 3.65 17H2.35ZM20.35 17C20.35 17.9612 20.3486 18.6167 20.2826 19.108C20.219 19.5805 20.1066 19.8026 19.9546 19.9546L20.8738 20.8739C21.3076 20.4401 21.4881 19.8979 21.571 19.2812C21.6514 18.6832 21.65 17.9245 21.65 17H20.35ZM17 21.65C17.9244 21.65 18.6831 21.6514 19.2812 21.571C19.8979 21.4881 20.44 21.3077 20.8738 20.8739L19.9546 19.9546C19.8026 20.1066 19.5805 20.2191 19.1079 20.2826C18.6167 20.3486 17.9612 20.35 17 20.35V21.65ZM17 5.15001C17.9612 5.15 18.6167 5.15138 19.1079 5.21743C19.5805 5.28096 19.8026 5.39341 19.9546 5.54541L20.8738 4.62617C20.44 4.19238 19.8979 4.01194 19.2812 3.92902C18.6831 3.84862 17.9244 3.85001 17 3.85001L17 5.15001ZM21.65 8.50001C21.65 7.57557 21.6514 6.81686 21.571 6.21885C21.4881 5.60214 21.3076 5.05996 20.8738 4.62617L19.9546 5.54541C20.1066 5.6974 20.219 5.91952 20.2826 6.39207C20.3486 6.88332 20.35 7.53882 20.35 8.50001H21.65ZM6.99999 3.85002C6.07556 3.85002 5.31685 3.84865 4.71884 3.92905C4.10214 4.01196 3.55996 4.1924 3.12617 4.62619L4.04541 5.54543C4.1974 5.39344 4.41952 5.28099 4.89207 5.21745C5.38331 5.15141 6.03881 5.15002 6.99999 5.15002L6.99999 3.85002ZM3.65 8.50002C3.65 7.53884 3.65138 6.88334 3.71743 6.39209C3.78096 5.91954 3.89341 5.69743 4.04541 5.54543L3.12617 4.62619C2.69237 5.05999 2.51193 5.60217 2.42902 6.21887C2.34862 6.81688 2.35 7.57559 2.35 8.50002H3.65ZM3 10.65H21V9.35H3V10.65ZM8.05078 13.35H8.00078V14.65H8.05078V13.35ZM8.05078 16.35H8.00078V17.65H8.05078V16.35ZM12.0508 13.35H12.0008V14.65H12.0508V13.35ZM12.0508 16.35H12.0008V17.65H12.0508V16.35ZM16.0508 13.35H16.0008V14.65H16.0508V13.35ZM16.0508 16.35H16.0008V17.65H16.0508V16.35ZM7.35 3V6H8.65V3H7.35ZM15.35 3V6H16.65V3H15.35Z" fill="#111827"></path>
              </svg>
              <div className="flex flex-col">
                <h6 className="text-xl leading-8 font-semibold text-gray-900">
                  {selectedDate && dateRange.length > 0 ? (
                    dateRange.length === 1 
                      ? `${dateRange[0].dayNumber}/${dateRange[0].month} (${dateRange[0].dayName})`
                      : `${dateRange[0].dayNumber}/${dateRange[0].month} - ${dateRange[dateRange.length - 1].dayNumber}/${dateRange[dateRange.length - 1].month} (${dateRange.length} ngày)`
                  ) : 'Chọn ngày để xem lịch chiếu'}
                </h6>
                {timeSlots.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Khung thời gian: {startTime} - {endTime} ({timeSlots.length} khung giờ)
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            {/* First Row - Date Range */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg pr-10 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Từ ngày"
                />
                <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">Từ ngày</label>
              </div>
              <span className="text-gray-400">→</span>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={selectedDate}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg pr-10 bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Đến ngày"
                />
                <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">Đến ngày</label>
              </div>
            </div>

            {/* Second Row - Time Range */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">Giờ bắt đầu</label>
              </div>
              <span className="text-gray-400">→</span>
              <div className="relative">
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  min={startTime}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">Giờ kết thúc</label>
              </div>
            </div>

            {/* Third Row - Theater and Actions */}
            <div className="flex items-center gap-4 lg:ml-auto">
              {/* Theater Dropdown */}
              <div className="relative">
                <select
                  value={selectedTheater}
                  onChange={(e) => setSelectedTheater(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg pr-10 appearance-none min-w-[180px] bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Chọn rạp chiếu</option>
                  <option value="theater1">CGV Vincom</option>
                  <option value="theater2">Lotte Cinema</option>
                  <option value="theater3">Galaxy Cinema</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all duration-300 font-medium">
                  Tạo
                </button>
                <button className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-300 font-medium">
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex bg-stone-50 rounded-b-lg overflow-hidden">
          {/* Left Panel - Movie Selection */}
          <div className="w-64 bg-white border-r border-gray-200 rounded-bl-lg">
            {/* Movie List */}
            <div className="p-3 flex flex-col h-full" style={{ maxHeight: '100%' }}>
              {/* Search Input */}
              <div className="relative mb-3">
                <Search 
                  size={16} 
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                    searchQuery ? 'text-indigo-500' : 'text-gray-400'
                  }`} 
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm phim theo tên, đạo diễn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                    title="Xóa tìm kiếm"
                  >
                    <X size={14} />
                  </button>
                )}
                {debouncedSearchQuery !== searchQuery && searchQuery && (
                  <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-3 w-3 border border-indigo-600 border-t-transparent"></div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-gray-900">
                  Danh sách phim ({filteredMovies.length})
                  {searchQuery && (
                    <span className="text-xs text-gray-500 ml-1">
                      / {movies.length}
                    </span>
                  )}
                </div>
                {filteredMovies.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Chọn tất cả</span>
                    <input
                      type="checkbox"
                      checked={isAllFilteredMoviesSelected}
                      onChange={(e) => handleSelectAllFilteredMovies(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
              
              {selectedMovies.size > 0 && (
                <div className="mb-3 p-2 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-xs text-indigo-700">
                    Đã chọn {selectedMovies.size} phim
                  </p>
                </div>
              )}
              
              {/* Loading State */}
              {isLoadingMovies && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              )}

              {/* Error State */}
              {moviesError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                  <p className="font-medium">Lỗi tải danh sách phim:</p>
                  <p>{moviesError}</p>
                  <button 
                    onClick={fetchMovies}
                    className="mt-2 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                  >
                    Thử lại
                  </button>
                </div>
              )}

              {/* Movies List */}
              {!isLoadingMovies && !moviesError && (
                <div className="flex-1 scroll-fade-container">
                  <div className="h-full overflow-auto custom-scrollbar space-y-2 pr-2" style={{ maxHeight: '500px', minHeight: '300px' }}>
                  {movies.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-xs">
                      Không có phim nào
                    </div>
                  ) : filteredMovies.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 text-xs">
                      <Search size={24} className="mx-auto mb-2 opacity-50" />
                      <p>Không tìm thấy phim nào</p>
                      <p className="text-xs mt-1">Thử từ khóa khác</p>
                    </div>
                  ) : (
                    filteredMovies.map((movie) => (
                      <div 
                        key={movie.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedMovies.has(movie.id)
                            ? 'bg-indigo-50 border-indigo-300'
                            : 'bg-white border-gray-200 hover:bg-indigo-50 hover:border-indigo-300'
                        }`}
                        onClick={() => handleMovieSelect(movie.id, !selectedMovies.has(movie.id))}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-medium text-gray-900 mb-1 line-clamp-2">
                              {movie.nameVn}
                            </h4>
                            <p className="text-xs text-gray-500 mb-2">
                              Thời lượng: {movie.time} phút
                            </p>
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={selectedMovies.has(movie.id)}
                              onChange={(e) => handleMovieSelect(movie.id, e.target.checked)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Schedule Grid */}
          <div className="flex-1 flex flex-col rounded-br-lg overflow-hidden">
            {/* Room Tabs */}
            <div className="flex items-center gap-px px-4 rounded-lg bg-gray-100 p-1 mb-0 w-fit">
              {rooms.map((room) => (
                <button
                  key={room}
                  onClick={() => setSelectedRoom(room)}
                  className={`rounded-lg py-2.5 px-5 text-sm font-medium transition-all duration-300 ${
                    selectedRoom === room
                      ? 'text-indigo-600 bg-white'
                      : 'text-gray-500 hover:bg-white hover:text-indigo-600'
                  }`}
                >
                  {room}
                </button>
              ))}
            </div>

            {/* Schedule Calendar Grid */}
            <div className="flex-1 p-4">
              <div className="relative bg-white rounded-lg shadow-sm border border-gray-200 h-full schedule-container">
                {/* Calendar Header with dynamic date columns */}
                <div className="flex border-b border-gray-200 sticky top-0 left-0 w-full bg-white z-10 calendar-header-compensation" style={{ paddingRight: '8px' }}>
                  <div className="w-16 p-2 flex items-center justify-center text-sm font-medium text-gray-900 border-r border-gray-200 flex-shrink-0">
                    
                  </div>
                  {dateRange.length > 0 ? dateRange.map((dateItem, index) => (
                    <div key={dateItem.date} className={`flex-1 p-3.5 flex flex-col items-center justify-center text-sm font-medium border-gray-200 ${index === 0 ? 'text-indigo-600' : 'text-gray-900'} min-w-[100px]`}>
                      <div className="text-xs text-gray-500">{dateItem.dayName}</div>
                      <div className="font-semibold">{dateItem.dayNumber}/{dateItem.month}</div>
                    </div>
                  )) : (
                    <div className="flex-1 p-3.5 flex items-center justify-center text-sm font-medium text-gray-500">
                      Chọn ngày để hiển thị lịch
                    </div>
                  )}
                </div>

                {/* Scrollable Calendar Grid Container */}
                <div className="h-full overflow-auto custom-scrollbar" style={{ maxHeight: '470px' }}>
                  {/* Calendar Grid with matching column structure */}
                  <div className="w-full min-w-[600px]">
                    {/* Time slots */}
                    {timeSlots.map((time) => (
                      <div key={time} className="flex">
                        {/* Time label with fixed width matching header */}
                        <div className="w-16 h-28 p-2 border-t border-r border-gray-200 flex items-end transition-all hover:bg-stone-100 flex-shrink-0">
                          <span className="text-xs font-semibold text-gray-400">{time}:00</span>
                        </div>
                        
                        {/* Dynamic date cells */}
                        {dateRange.length > 0 ? dateRange.map((dateItem) => {
                          const showtimesInSlot = getShowtimesForSlot(dateItem.date, time);
                          
                          return (
                            <div key={`${dateItem.date}-${time}`} className="flex-1 h-28 border-t border-r last:border-r-0 border-gray-200 transition-all hover:bg-stone-100 cursor-pointer min-w-[100px] relative">
                              {showtimesInSlot.map((showtime) => {
                                const colors = getColorClasses(showtime.color);
                                const height = getShowtimeHeight(showtime.startTime, showtime.endTime);
                                const topOffset = getShowtimeTopOffset(showtime.startTime, time);
                                
                                return (
                                  <div
                                    key={showtime.id}
                                    className={`absolute left-1 right-1 rounded p-1.5 border-l-2 ${colors.bg} ${colors.border}`}
                                    style={{
                                      top: `${topOffset}px`,
                                      height: `${height}px`,
                                      minHeight: '20px',
                                      zIndex: 1
                                    }}
                                  >
                                    <p className="text-xs font-normal text-gray-900 mb-px line-clamp-1">
                                      {showtime.movieName}
                                    </p>
                                    <p className={`text-xs font-semibold ${colors.text}`}>
                                      {showtime.startTime} - {showtime.endTime}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }) : (
                          <div className="flex-1 h-28 p-3.5 border-t border-r border-gray-200 flex items-center justify-center text-gray-400 text-xs">
                            Chọn ngày để hiển thị
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile View */}
                <div className="sm:hidden border-t border-gray-200 custom-scrollbar" style={{ maxHeight: '300px', overflow: 'auto' }}>
                  <div className="flex">
                    <div className="flex flex-col">
                      {timeSlots.map((time) => (
                        <div key={time} className="w-12 h-20 p-1 flex items-end text-xs font-semibold text-gray-400 border-b border-r border-gray-200">
                          {time}:00
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 w-full">
                      {timeSlots.map((time) => {
                        // Get showtimes for the first date in mobile view
                        const firstDate = dateRange.length > 0 ? dateRange[0].date : '';
                        const showtimesInSlot = firstDate ? getShowtimesForSlot(firstDate, time) : [];
                        
                        return (
                          <div key={time} className="w-full h-20 border-b border-gray-200 p-1.5 relative">
                            {showtimesInSlot.map((showtime) => {
                              const colors = getColorClasses(showtime.color);
                              
                              return (
                                <div
                                  key={showtime.id}
                                  className={`w-full h-full rounded p-1.5 border-l-2 ${colors.bg} ${colors.border}`}
                                >
                                  <p className="text-xs font-normal text-gray-900 mb-px line-clamp-1">
                                    {showtime.movieName}
                                  </p>
                                  <p className={`text-xs font-semibold ${colors.text}`}>
                                    {showtime.startTime} - {showtime.endTime}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default CreateShowtimeModal;
