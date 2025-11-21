import useDebounce from '@/hooks/useDebounce';
import comboApiService, { type Combo } from '@/services/comboApi';
import { type MovieDetail, movieApiService } from '@/services/movieApi';
import type { Seat } from '@/services/roomApi';
import { type Showtime, showtimeApiService } from '@/services/showtimeApi';
import type { Theater } from '@/services/theaterApi';
import { type User, userApiService } from '@/services/userApi';
import { faCalendarAlt, faClock, faSearch, faTimes, faUtensils } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import { Calendar1Icon, CircleCheckBig, CircleDollarSign, CreditCard, MoveLeft } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { toast } from 'sonner';
import { API_BASE_URL, WEBSOCKET_URL } from '../../../../components/api-config';
import Loading from '../../components/loading';
import ComboModal from './components/ComboModal';


// interface Theater {
//   id: string;
//   nameEn: string;
//   nameVn: string;
// }

// interface Showtime {
//   id: string;
//   movieNameVn: string;
//   movieNameEn: string;
//   startTime: string;
//   endTime: string;
//   roomId: string;
//   roomName: string;
// }

// interface Seat {
//   id: string;
//   seatNumber: string;
//   seatType?: string;
//   price: number;
//   status: string;
//   color?: string;
//   isSelected?: boolean;
// }

const BookingManagement: React.FC = () => {
  const [movies, setMovies] = useState<MovieDetail[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieDetail | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTheater, setSelectedTheater] = useState<Theater>({
      id: "8f3a5832-8340-4a43-89bc-6653817162f1",
      nameVn: "Cinestar Quốc Thanh (TP.HCM)",
      nameEn: "Cinestar Quốc Thanh (TP.HCM)",
    });
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
//   const [theaters, setTheaters] = useState<Theater[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [lockedSeats, setLockedSeats] = useState<string[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [selectedCombos, setSelectedCombos] = useState<SelectedCombo[]>([]);
  const [showComboModal, setShowComboModal] = useState(false);
  const [loadingCombos, setLoadingCombos] = useState(false);
  const [customer, setCustomer] = useState<User | null>(null);
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'MOMO' | 'CASH'>();
  const [activeStep, setActiveStep] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('vi-VN'));
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const wsRef = useRef<SocketIOClient.Socket | null>(null);

  const steps = ['Chọn phim & suất chiếu', 'Chọn ghế & thanh toán'];
//   const generateDates = () => {
//     const dates = [];
//     for (let i = 0; i < 7; i++) {
//       const date = new Date();
//       date.setDate(date.getDate() + i);
//       dates.push({
//         value: date.toISOString().split('T')[0],
//         day: date.getDate().toString().padStart(2, '0'),
//         name: date.toLocaleDateString('vi', { weekday: 'short' }).toUpperCase(),
//         month: date.toLocaleDateString('vi', { month: 'short' }),
//       });
//     }
//     return dates;
//   };

//   const dates = generateDates();

    const fetchUsers = async () => {
        try {
            const userResponse = await userApiService.getAllUsers();
            setUsers(userResponse);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchMovies = async () => {
        if (!selectedTheater || !selectedDate) return; // Tránh gọi API nếu thiếu data
        setLoading(true); // Set loading khi bắt đầu fetch
        try {
            const movieResponse = await movieApiService.getMoviesByTheaterAndDate(
                selectedTheater.id!,
                selectedDate
            );
            setMovies(movieResponse);
            // Reset các state liên quan nếu cần (ví dụ: reset phim/showtime đã chọn khi date thay đổi)
            setSelectedMovie(null);
            setShowtimes([]);
            setSelectedShowtime(null);
            setSeats([]);
            setSelectedSeats([]);
            setPaymentMethod(undefined);
        } catch (error) {
            console.error('Error fetching movies:', error);
            setMovies([]); // Reset nếu lỗi
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchMovies();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('vi-VN'));
        }, 1000); // Cập nhật mỗi 1000ms (1 giây)

        return () => clearInterval(interval); // Dọn dẹp khi component unmount
    }, []);

    useEffect(() => {
        const fetchShowtimes = async () => {
        if (!selectedTheater || !selectedDate || !selectedMovie) return;
        setLoadingShowtimes(true);
        try {
            const response = await showtimeApiService.getShowtimesByMovieTheaterDate(
                selectedTheater.id!,
                selectedDate,
                selectedMovie.movieId
            );
            setShowtimes(response);
            setSelectedShowtime(null);
            setSeats([]);
            setSelectedSeats([]);
            
        } catch (error) {
            console.error('Error fetching showtimes:', error);
        } finally {
            setLoadingShowtimes(false);
            setSeats([]);
            setSelectedSeats([]);
            setPaymentMethod(undefined);
        }
        };

        fetchShowtimes();
    }, [selectedMovie]);

    useEffect(() => {
        const fetchSeats = async () => {
            if (!selectedShowtime) return;
            setLoadingSeats(true);
            try {
                const response = await showtimeApiService.getSeatByShowtimeId(selectedShowtime.id!);
                setSeats(response.map((seat: Seat) => ({ ...seat, isSelected: false })));
                console.log(response);
                setSelectedSeats([]);
            } catch (error) {
                console.error('Error fetching seats:', error);
            } finally {
                setLoadingSeats(false);
            }
        };

        fetchSeats();
    }, [selectedShowtime]);

  useEffect(() => {
    if (!selectedShowtime) return;
    wsRef.current = io(WEBSOCKET_URL, {
      reconnection: false,
      transports: ['polling', 'websocket'],
      query: {
        showtime: selectedShowtime.id
      }
    });

    wsRef.current.on('connect', () => {
      console.log('WebSocket connected for showtime:', selectedShowtime.id);
    });

    wsRef.current.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    wsRef.current.on('seat_locked', (data: { seatIds: string[] }) => {
      console.log('Seats locked by another user:', data.seatIds);
      setLockedSeats(prev => [...prev, ...data.seatIds]);
    });

    wsRef.current.on('seat_locked_failed', (data: { message: string }) => {
      console.log('Seat locking failed:', data.message);
    });
  }, [selectedShowtime]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.seatNumber.startsWith('W_') || seat.status !== 'AVAILABLE' || lockedSeats.includes(seat.id)) return;

    const isSelected = selectedSeats.find(s => s.id === seat.id);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else if (selectedSeats.length >= 8) {
      toast.warning('Bạn chỉ có thể chọn tối đa 8 ghế cho mỗi lần đặt vé.');
      return;
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const getSeatColor = (seat: Seat) => {
    if (seat.seatNumber.startsWith('W_')) {
      return 'transparent';
    }

    if (selectedSeats.find(s => s.id === seat.id)) {
      const baseColor = seat.color || (seat.seatType === 'VIP' ? '#ff6b6b' : seat.seatType === 'Couple' ? '#9c27b0' : '#4CAF50');
      const hex = baseColor.replace('#', '');
      const r = Math.floor(parseInt(hex.substr(0, 2), 16) * 0.5);
      const g = Math.floor(parseInt(hex.substr(2, 2), 16) * 0.5);
      const b = Math.floor(parseInt(hex.substr(4, 2), 16) * 0.5);
      return `rgb(${r}, ${g}, ${b})`;
    }

    if (lockedSeats.includes(seat.id)) return '#ff8c00';
    if (seat.status !== 'AVAILABLE') return '#666';

    if (seat.color) return seat.color;
    if (seat.seatType === 'VIP') return '#ff6b6b';
    if (seat.seatType === 'Couple') return '#9c27b0';
    return '#4CAF50';
  };

  const getSeatPrice = (seatType: string, price: number) => {
    if (price > 0) return price;
    switch (seatType) {
      case 'VIP': return 100000;
      case 'Couple': return 200000;
      default: return 50000;
    }
  };

  const getSeatWidth = (seatNumber: string) => {
    if (seatNumber.includes('+')) {
      const seatCount = seatNumber.split('+').length;
      return (seatCount * 48) + ((seatCount - 1) * 8);
    }
    return 50;
  };

    const fetchCombos = async () => {
        setLoadingCombos(true);
        try {
            const response = await comboApiService.getAllCombos();
            setCombos(response);
        } catch (error) {
            console.error('Error fetching combos:', error);
            toast.error('Có lỗi xảy ra khi tải combo');
        } finally {
            setLoadingCombos(false);
        }
    };

  const openComboModal = () => {
    setShowComboModal(true);
    if (combos.length === 0) {
      fetchCombos();
    }
  };

  const generateLegendItems = () => {
    const legendItems: Array<{ color: string; label: string; type: string }> = [];
    const seenTypes = new Set<string>();

    seats.forEach(seat => {
      if (seat.seatType && seat.color && !seat.seatNumber.startsWith('W_')) {
        const typeKey = seat.seatType;
        if (!seenTypes.has(typeKey)) {
          seenTypes.add(typeKey);
          legendItems.push({
            color: seat.color,
            label: seat.seatType,
            type: typeKey
          });
        }
      }
    });

    legendItems.push(
      { color: '#666', label: 'Đã bán', type: 'unavailable' },
    );

    return legendItems;
  };

  const handlePhoneNumberSearch = async () => {
    if (!customerPhone.trim()) {
      toast.warning('Vui lòng nhập số điện thoại!');
      return;
    }

    try {
        const foundUsers = users.filter(user => user.phone === customerPhone.trim());
        if (foundUsers.length > 0) {
            const user = foundUsers[0];
            setCustomer(user || null);
            toast.success(`Tìm thấy khách hàng: ${user.fullName}`);
            console.log('Found user:', user);
        } else {
            setCustomer(null);
            toast.error('Không tìm thấy khách hàng với số điện thoại này.');
        }
    } catch (error) {
        console.error('Error searching user by phone:', error);
        toast.error('Có lỗi xảy ra khi tìm kiếm khách hàng.');
    }
  };

  const handleBooking = async () => {
    if (!selectedShowtime || selectedSeats.length === 0) return;

    setIsBooking(true);

    try {
      const bookingData: {
        userId: string;
        employeeId?: string;
        showtimeId: string;
        paymentMethod: 'MOMO' | 'CASH';
        listSeatId: string[];
        listCombo?: { [key: string]: number };
      } = {
        userId: customer?.id || 'e4651591-9f9b-4f86-9027-ba968e6550b9',
        employeeId: localStorage.getItem("admin_employeeId") || undefined,
        showtimeId: selectedShowtime.id || '',
        paymentMethod: paymentMethod!,
        listSeatId: selectedSeats.map(seat => seat.id)
      };

      if (selectedCombos.length > 0) {
        bookingData.listCombo = selectedCombos.reduce((acc, combo) => {
          acc[combo.id] = combo.selectedQuantity;
          return acc;
        }, {} as { [key: string]: number });
      }

      console.log('=== ADMIN BOOKING API DATA ===');
      console.log('Booking Data:', JSON.stringify(bookingData, null, 2));
      console.log('========================');

      let data;
    //   if (paymentMethod === "MOMO") {
        const response = await fetch(`${API_BASE_URL}/payments/admin`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });

        data = await response.json();
    //   } else {
    //     console.log('Cash booking data:', bookingData);
    //   }

      if (data.statusCode === 200 && data.data) {
        alert('Đặt vé thành công!');
        setSelectedMovie(null);
        setSelectedShowtime(null);
        setSelectedSeats([]);
        setSelectedCombos([]);
        setCustomerPhone('');
        setCustomer(null);
        window.location.href = data.data;
      } else {
        alert('Không thể đặt vé: ' + (data.message || 'Vui lòng thử lại'));
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Có lỗi xảy ra khi đặt vé. Vui lòng thử lại!');
    } finally {
      setIsBooking(false);
    }
  };

  const handleBack = () => {
    setActiveStep(0);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setSelectedCombos([]);
    setCustomerPhone('');
    setCustomer(null);
    setSelectedMovie(null);
    setShowtimes([]);
  }
  const seatPrice = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat.seatType || 'Standard', seat.price), 0);
  const comboPrice = selectedCombos.reduce((sum, combo) => sum + (combo.price * combo.selectedQuantity), 0);
  const totalPrice = seatPrice + comboPrice;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const groupSeatsByRow = (seats: Seat[]) => {
    const rows: { [key: string]: Seat[] } = {};
    seats.forEach(seat => {
      let row: string;
      if (seat.seatNumber.startsWith('W_')) {
        row = seat.seatNumber.substring(2, 3);
      } else {
        row = seat.seatNumber.charAt(0);
      }
      if (!rows[row]) rows[row] = [];
      rows[row].push(seat);
    });

    Object.keys(rows).forEach(row => {
      rows[row].sort((a, b) => {
        const getPosition = (seatNumber: string) => {
          if (seatNumber.startsWith('W_')) {
            return parseInt(seatNumber.substring(3));
          } else if (seatNumber.includes('+')) {
            const firstSeat = seatNumber.split('+')[0];
            return parseInt(firstSeat.slice(1));
          } else {
            return parseInt(seatNumber.slice(1));
          }
        };

        const posA = getPosition(a.seatNumber);
        const posB = getPosition(b.seatNumber);

        return posA - posB;
      });
    });

    return rows;
  };

  const seatRows = groupSeatsByRow(seats);

  const filteredMovies = movies.filter(movie => {
    const normalizedSearch = debouncedSearchTerm.toLowerCase();
    const normalizedNameVn = movie.movieNameVn.toLowerCase();
    const normalizedNameEn = movie.movieNameEn.toLowerCase();
    return normalizedNameVn.includes(normalizedSearch) || normalizedNameEn.includes(normalizedSearch);
  });

  useEffect(() => {
    // Fetch movies when debouncedSearchTerm changes
    // fetchMovies();
    setSelectedMovie(null);
    setShowtimes([]);
  }, [debouncedSearchTerm]);

    return (
        <div className="bg-gray-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                        <Calendar1Icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Đặt Vé Tại Rạp</h1>
                        <p className="text-slate-600">Quản lý đặt vé xem phim tại quầy bán vé</p>
                    </div>
                </div>
                <div>
                    <div className="text-2xl text-black">{new Date().toLocaleDateString('vi-VN')}</div>
                    <div className="text-2xl text-black">{currentTime}</div>
                </div>
            </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                    ))}
                </Stepper>
                {activeStep === 1 && (<button onClick={handleBack} className='bg-transparent text-blue-500 border border-blue-500 hover:bg-blue-500 duration-300 hover:text-white p-2 rounded-lg cursor-pointer flex gap-2'><MoveLeft /> Quay lai</button>)}
                
            </div>
            {activeStep === 0 ? (<div>
                <div className="grid grid-cols-7 gap-6 mt-6">
                    <div className='col-span-5'>
                        {/* Movie Selection */}
                        <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-lg">
                            <div className='flex items-center justify-between'>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="text-blue-600" />
                                    Chọn Phim
                                </h3>
                                <div className={`relative w-1/4 ${loading ? 'hidden' : ''}`}>
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm phim..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="border border-gray-300 rounded-lg p-2 w-full px-8"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Escape') {
                                                setSearchTerm('');
                                            }
                                        }}
                                    />
                                    <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                                    <FontAwesomeIcon 
                                        icon={faTimes} 
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer hover:text-gray-700" 
                                        onClick={() => setSearchTerm('')} 
                                    />
                                </div>
                            </div>
                            {loading ? (
                                <Loading />
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 max-h-[60vh] overflow-y-auto p-3">
                                {filteredMovies.length > 0 ? filteredMovies.map(movie => (
                                    <div key={movie.movieId} className={`cursor-pointer p-2 rounded-lg shadow-xl border-4 relative h-full ${selectedMovie?.movieId === movie.movieId ? 'border-blue-500' : 'border-slate-200'} `} onClick={() => { setSelectedMovie(movie) }}>
                                        <CircleCheckBig className={`absolute top-0 right-0 text-blue-500 size-14 p-2 bg-white rounded-bl-2xl ${selectedMovie?.movieId === movie.movieId ? 'block' : 'hidden'}`} />
                                        <img src={ movie.img || ''} alt={movie.movieNameVn} className="w-full object-cover h-[300px] rounded-md mb-2" onError={(e) => { const t = e.target as HTMLImageElement; t.src = '/public/logo_cinema_new.PNG'; }} />
                                        <div className="text-sm font-semibold text-center">{movie.movieNameVn}</div>
                                    </div>
                                )) : (
                                    <div className="text-sm text-gray-500">Không có phim chiếu trong ngày này</div>
                                )}
                            </div>)}
                            
                        </div>
                    </div>
                    <div className='col-span-2'>
                        {/* Showtime Selection */}
                        
                        <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FontAwesomeIcon icon={faClock} className="text-blue-600" />
                                Chọn Suất Chiếu
                            </h3>
                            {loadingShowtimes ? (
                                <Loading />
                            ) : (
                                showtimes.length > 0 && selectedMovie ? (
                                <div className="grid grid-cols-2 gap-2">
                                    {showtimes.map((showtime) => {
                                        // So sánh thời gian bắt đầu của suất chiếu với thời gian hiện tại
                                        const showtimeDate = new Date(`${selectedDate}T${showtime.startTime}`);
                                        const now = new Date();
                                        const isPast = showtimeDate < now;

                                        return (
                                            <button
                                                key={showtime.id}
                                                onClick={() => [setSelectedShowtime(showtime), setActiveStep(1)]}
                                                className={`p-3 rounded-lg text-center transition-all border-2 font-medium  border-gray-200 text-gray-700
                                                ${isPast ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 cursor-pointer'}`}
                                                disabled={isPast}
                                            >
                                                <div className="font-bold">{showtime.startTime.slice(0, 5)}</div>
                                                <div className="text-xs text-gray-500">Phòng: {showtime.roomName}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500">Vui lòng chọn phim để xem suất chiếu</div>
                            ))}
                        </div>
                        
                    </div>
                </div>
            </div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                <div className="lg:col-span-5">
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Chọn Ghế Ngồi</h3>

                        {/* Screen */}
                        <div className="mb-8 flex flex-col items-center w-full">
                            <div className="h-3 rounded-full mx-auto mb-3" style={{ width: '70%', background: 'linear-gradient(90deg, transparent, gray, transparent)' }}></div>
                            <p className="text-sm font-semibold text-gray-600">Màn Hình</p>
                        </div>

                        {/* Seat Map */}
                        {loadingSeats ? (
                            <Loading />
                        ) : (
                            <div className="w-full overflow-x-auto flex flex-col 2xl:items-center">
                                <div className="space-y-2 mb-6">
                                {Object.keys(seatRows).sort().map((row) => {
                                const hasCoupleSeats = seatRows[row].some(seat => seat.seatNumber.includes('+'));

                                return (
                                    <div key={row} className="flex items-center gap-2 ">
                                        <span className="w-6 text-center font-bold text-sm">{row}</span>
                                        <div className="flex justify-center items-center">
                                            {hasCoupleSeats ? (
                                            <div className="flex justify-between items-center gap-1">
                                                {seatRows[row].map((seat) => (
                                                <button
                                                    key={seat.id}
                                                    onClick={() => handleSeatClick(seat)}
                                                    disabled={seat.status !== 'AVAILABLE' || lockedSeats.includes(seat.id)}
                                                    className="rounded text-lg font-bold transition-all duration-200 hover:scale-110 h-12"
                                                    style={{
                                                    width: `${getSeatWidth(seat.seatNumber)}px`,
                                                    backgroundColor: getSeatColor(seat),
                                                    color: (seat.status !== 'AVAILABLE' || lockedSeats.includes(seat.id)) ? '#999' : 'white',
                                                    cursor: (seat.status !== 'AVAILABLE' || lockedSeats.includes(seat.id)) ? 'not-allowed' : 'pointer',
                                                    }}
                                                >
                                                    {seat.seatNumber.replace(/[A-Z]/g, '').replace('+', '-')}
                                                </button>
                                                ))}
                                            </div>
                                            ) : (
                                            <div className="flex gap-1 justify-center">
                                                {seatRows[row].map((seat) =>
                                                seat.seatNumber.startsWith('W_') ? (
                                                    <div
                                                    key={seat.id}
                                                    className="h-6"
                                                    style={{ width: `${getSeatWidth(seat.seatNumber)}px` }}
                                                    ></div>
                                                ) : (
                                                    <button
                                                    key={seat.id}
                                                    onClick={() => handleSeatClick(seat)}
                                                    disabled={seat.status !== 'AVAILABLE' || lockedSeats.includes(seat.id)}
                                                    className="rounded text-lg font-bold transition-all duration-200 hover:scale-110 h-12"
                                                    style={{
                                                        width: `${getSeatWidth(seat.seatNumber)}px`,
                                                        backgroundColor: getSeatColor(seat),
                                                        color: (seat.status !== 'AVAILABLE' || lockedSeats.includes(seat.id)) ? '#999' : 'white',
                                                        cursor: (seat.status !== 'AVAILABLE' || lockedSeats.includes(seat.id)) ? 'not-allowed' : 'pointer',
                                                    }}
                                                    >
                                                    {seat.seatNumber.slice(1)}
                                                    </button>
                                                )
                                                )}
                                            </div>
                                            )}
                                        </div>
                                        <span className="w-6 text-center font-bold text-sm">{row}</span>
                                    </div>
                                );
                                })}
                                </div>
                            </div>)}

                        {/* Legend */}
                        <div className="flex justify-center gap-4 text-xs flex-wrap p-4 bg-gray-50 rounded-lg w-full">
                            {generateLegendItems().map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-gray-700">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-2">
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 sticky top-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tóm Tắt Đặt Vé</h3>
                        <div className="max-h-[40vh] overflow-y-auto space-y-4">

                            {/* Movie Info */}
                            {selectedMovie && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-gray-600">Phim:</p>
                                <p className="font-semibold text-gray-900">{selectedMovie.movieNameVn}</p>
                                <p className="text-xs text-gray-500">{selectedMovie.movieNameEn}</p>
                            </div>
                            )}

                            {/* Theater & Showtime */}
                            {selectedTheater && selectedShowtime && (
                            <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                                <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Rạp:</span>
                                <span className="font-semibold text-gray-900">{selectedTheater.nameVn}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Ngày:</span>
                                <span className="font-semibold text-gray-900">{selectedDate ? formatDate(selectedDate) : ''}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Giờ:</span>
                                <span className="font-semibold text-gray-900">{selectedShowtime.startTime.slice(0, 5)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Phòng:</span>
                                <span className="font-semibold text-gray-900">{selectedShowtime.roomName}</span>
                                </div>
                            </div>
                            )}

                            {/* Customer Info */}
                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                <p className="text-sm text-gray-600 mb-2">Số điện thoại khách hàng:</p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Nhập SĐT"
                                        value={customerPhone}
                                        onChange={(e) => setCustomerPhone(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handlePhoneNumberSearch();
                                            }
                                        }}
                                        className=" border border-gray-300 rounded-lg p-2 text-sm w-full"
                                    />
                                    <button
                                        onClick={handlePhoneNumberSearch}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                                    >
                                        Tìm
                                    </button>
                                </div>
                                {customer?.fullName && (
                                    <div className="mt-2 p-2 bg-green-100 rounded border border-green-300">
                                        <p className="text-xs text-gray-600">Khách hàng:</p>
                                        <p className="font-semibold text-gray-900 text-sm">{customer.fullName}</p>
                                        <p className="text-xs text-gray-600">SĐT: {customer.phone}</p>
                                    </div>
                                )}
                            </div>

                            {/* Seats */}
                            {selectedSeats.length > 0 && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-semibold text-gray-900 mb-2">Ghế đã chọn:</p>
                                <div className="space-y-1">
                                {selectedSeats.map((seat) => (
                                    <div key={seat.id} className="flex justify-between text-sm">
                                    <span className="text-gray-700">{seat.seatNumber}</span>
                                    <span className="font-semibold text-gray-900">{getSeatPrice(seat.seatType || 'Standard', seat.price).toLocaleString('vi-VN')}đ</span>
                                    </div>
                                ))}
                                </div>
                            </div>
                            )}

                            {/* Combos */}
                            {selectedCombos.length > 0 && (
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-semibold text-gray-900 mb-2">Combo:</p>
                                <div className="space-y-1">
                                {selectedCombos.map((combo) => (
                                    <div key={combo.id} className="flex justify-between text-sm">
                                    <span className="text-gray-700">{combo.selectedQuantity}x {combo.name}</span>
                                    <span className="font-semibold text-gray-900">{(combo.price * combo.selectedQuantity).toLocaleString('vi-VN')}đ</span>
                                    </div>
                                ))}
                                </div>
                            </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-200 my-4"></div>

                        {/* Combo Button */}
                        <button
                            onClick={openComboModal}
                            className="w-full py-2 mb-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2 font-medium"
                        >
                            <FontAwesomeIcon icon={faUtensils} />
                            Thêm Combo
                        </button>

                        {/* Total */}
                        {(selectedSeats.length > 0 || selectedCombos.length > 0) && (
                            <div className="space-y-3">
                            <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                                <div className="flex justify-between">
                                <span className="text-gray-700">Tiền vé:</span>
                                <span className="font-semibold text-gray-900">{seatPrice.toLocaleString('vi-VN')}đ</span>
                                </div>
                                {comboPrice > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Tiền combo:</span>
                                    <span className="font-semibold text-gray-900">{comboPrice.toLocaleString('vi-VN')}đ</span>
                                </div>
                                )}
                            </div>
                            <div className="flex justify-between text-lg font-bold p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-gray-900">Tổng cộng:</span>
                                <span className="text-green-600">{totalPrice.toLocaleString('vi-VN')}đ</span>
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-2">Phương thức thanh toán:</p>
                                <div className="flex flex-col gap-2">
                                    <label className={`flex items-center justify-between gap-2 cursor-pointer border rounded-lg p-2 transition-all duration-200 ${
                                        paymentMethod === 'MOMO'
                                            ? 'bg-indigo-50 text-indigo-900 border-blue-300 ring-indigo-200'
                                            : 'border-transparent hover:bg-slate-200 text-gray-700'
                                    }`}>
                                        <span className="text-sm flex items-center justify-center gap-2"><CreditCard /> Momo</span>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="MOMO"
                                            checked={paymentMethod === 'MOMO'}
                                            onChange={() => setPaymentMethod('MOMO')}
                                            className="w-4 h-4"
                                        />
                                    </label>
                                    <label className={`flex items-center justify-between gap-2 cursor-pointer border rounded-lg p-2 transition-all duration-200 ${
                                        paymentMethod === 'CASH'
                                            ? 'bg-indigo-50 text-indigo-900 border-blue-300 ring-indigo-200'
                                            : 'border-transparent hover:bg-slate-200 text-gray-700'
                                    }`}>
                                        <span className="text-sm flex items-center justify-center gap-2"><CircleDollarSign /> Tiền mặt</span>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cash"
                                            checked={paymentMethod === 'CASH'}
                                            onChange={() => setPaymentMethod('CASH')}
                                            className="w-4 h-4"
                                        />
                                    </label>
                                </div>
                            </div>

                            <button
                                onClick={handleBooking}
                                disabled={isBooking || selectedSeats.length === 0 || !paymentMethod}
                                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
                            >
                                {isBooking ? 'Đang xử lý...' : 'Thanh Toán'}
                            </button>
                            </div>
                        )}
                        </div>
                    </div>
                </div>
            </div>
            )}
        </div>
      </div>

      {/* Combo Modal */}
      <ComboModal
        showComboModal={showComboModal}
        setShowComboModal={setShowComboModal}
        loadingCombos={loadingCombos}
        combos={combos}
        selectedCombos={selectedCombos}
        onConfirm={setSelectedCombos}
      />
    </div>
  );
};

export default BookingManagement;