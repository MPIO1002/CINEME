import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faMapMarkerAlt, faCreditCard, faCalendarAlt, faStar } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../../../../components/api-config';
import ProgressBar from '../../components/progress-bar';
import io from 'socket.io-client';

interface MovieDetail {
  id: string;
  nameVn: string;
  nameEn: string;
  director: string;
  countryVn: string;
  format: string;
  releaseDate: string;
  endDate: string;
  briefVn: string;
  briefEn: string;
  image: string;
  time: number;
  limitageNameVn: string;
  languageNameVn: string;
  ratings: string;
}

interface Theater {
  id: string;
  nameEn: string;
  nameVn: string;
}

interface Showtime {
  id: string;
  movieNameVn: string;
  movieNameEn: string;
  startTime: string;
  endTime: string;
  roomId: string;
  roomName: string;
}

interface Seat {
  id: string;
  seatNumber: string;
  seatType: string;
  status: string;
  isSelected?: boolean;
}

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [lockedSeats, setLockedSeats] = useState<string[]>([]);
  const wsRef = useRef<SocketIOClient.Socket | null>(null);

  // Generate next 7 days
  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        day: date.getDate().toString().padStart(2, '0'),
        name: date.toLocaleDateString('en', { weekday: 'short' }).toUpperCase(),
        month: date.toLocaleDateString('en', { month: 'short' })
      });
    }
    return dates;
  };

  const dates = generateDates();

  // Fetch movie details
  useEffect(() => {
    const fetchMovieDetail = async () => {
      if (!id) return;
      try {
        const response = await fetch(`${API_BASE_URL}/movies/${id}/detail`);
        const data = await response.json();
        if (data.statusCode === 200) {
          setMovie(data.data);
          setSelectedDate(dates[0].value); // Set default to today
        }
      } catch (error) {
        console.error('Error fetching movie detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetail();
  }, [id]);

  // Fetch theaters when date is selected
  useEffect(() => {
    const fetchTheaters = async () => {
      if (!id || !selectedDate) return;
      try {
        const response = await fetch(`${API_BASE_URL}/theaters/search?movieId=${id}&date=${selectedDate}`);
        const data = await response.json();
        if (data.statusCode === 200) {
          setTheaters(data.data);
          setSelectedTheater(null);
          setShowtimes([]);
          setSeats([]);
          setSelectedSeats([]);
        }
      } catch (error) {
        console.error('Error fetching theaters:', error);
      }
    };

    fetchTheaters();
  }, [id, selectedDate]);

  // Fetch showtimes when theater is selected
  useEffect(() => {
    const fetchShowtimes = async () => {
      if (!id || !selectedTheater || !selectedDate) return;
      try {
        const response = await fetch(`${API_BASE_URL}/showtimes?movieId=${id}&theaterId=${selectedTheater.id}&date=${selectedDate}`);
        const data = await response.json();
        if (data.statusCode === 200) {
          setShowtimes(data.data);
          setSelectedShowtime(null);
          setSeats([]);
          setSelectedSeats([]);
        }
      } catch (error) {
        console.error('Error fetching showtimes:', error);
      }
    };

    fetchShowtimes();
  }, [id, selectedTheater, selectedDate]);

  // Fetch seats when showtime is selected
  useEffect(() => {
    const fetchSeats = async () => {
      if (!selectedShowtime) return;
      try {
        const response = await fetch(`${API_BASE_URL}/showtimes/${selectedShowtime.id}/seats`);
        const data = await response.json();
        if (data.statusCode === 200) {
          setSeats(data.data.map((seat: any) => ({ ...seat, isSelected: false })));
          setSelectedSeats([]);
        }
      } catch (error) {
        console.error('Error fetching seats:', error);
      }
    };

    fetchSeats();
  }, [selectedShowtime]);

  // WebSocket connection for real-time seat locking
  useEffect(() => {
    if (!selectedShowtime) return;

    // Close existing connection
    // if (wsRef.current) {
    //   wsRef.current.close();
    // }

    // Create new WebSocket connection
    
    wsRef.current = io('ws://172.29.80.1:8085', {
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

    wsRef.current.on('seat_locked', (data: any) => {
      console.log('Seats locked by another user:', data.seatIds);
      setLockedSeats(prev => [...prev, ...data.seatIds]);
    });

    wsRef.current.on('seat_locked_failed', (data: any) => {
      console.log('Seat locking failed:', data.message);
    });
  }, [selectedShowtime]);

  // Cleanup WebSocket on component unmount
  // useEffect(() => {
  //   return () => {
  //     if (wsRef.current) {
  //       wsRef.current.close();
  //     }
  //   };
  // }, []);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== 'AVAILABLE' || lockedSeats.includes(seat.id)) return;
    
    const isSelected = selectedSeats.find(s => s.id === seat.id);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const getSeatColor = (seat: Seat) => {
    if (selectedSeats.find(s => s.id === seat.id)) return '#ffd700'; // Yellow for selected
    if (lockedSeats.includes(seat.id)) return '#ff8c00'; // Orange for locked by others
    if (seat.status !== 'AVAILABLE') return '#666'; // Gray for booked/unavailable
    if (seat.seatType === 'VIP') return '#ff6b6b'; // Red for VIP
    return '#4CAF50'; // Green for standard available
  };

  const getSeatPrice = (seatType: string) => {
    return seatType === 'VIP' ? 150000 : 100000;
  };

  const handleBooking = async () => {
    if (!selectedShowtime || selectedSeats.length === 0) return;

    setIsBooking(true);
    
    try {
      const bookingData = {
        userId: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d", // Temporary hardcoded userId
        showtimeId: selectedShowtime.id,
        listSeatId: selectedSeats.map(seat => seat.id),
        amount: totalPrice
      };

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();
      
      if (data.statusCode === 200 && data.data) {
        // Booking request successful - got payment URL
        window.location.href = data.data;
        
      } else {
        // Booking failed
        alert('Không thể tiến thành thanh toán: ' + (data.message || 'Vui lòng thử lại'));
        
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      
      // Send seat_locked_failed event via WebSocket
      // if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      //   wsRef.current.send(JSON.stringify({
      //     event: 'seat_locked_failed',
      //     message: 'Network error',
      //     seatIds: selectedSeats.map(seat => seat.id),
      //     showtimeId: selectedShowtime.id
      //   }));
      // }
    } finally {
      setIsBooking(false);
    }
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat.seatType), 0);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Group seats by row
  const groupSeatsByRow = (seats: Seat[]) => {
    const rows: { [key: string]: Seat[] } = {};
    seats.forEach(seat => {
      const row = seat.seatNumber.charAt(0);
      if (!rows[row]) rows[row] = [];
      rows[row].push(seat);
    });
    
    // Sort seats within each row by number
    Object.keys(rows).forEach(row => {
      rows[row].sort((a, b) => {
        const aNum = parseInt(a.seatNumber.slice(1));
        const bNum = parseInt(b.seatNumber.slice(1));
        return aNum - bNum;
      });
    });
    
    return rows;
  };

  if (loading || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: 'var(--color-secondary)' }}></div>
      </div>
    );
  }

  const seatRows = groupSeatsByRow(seats);

  return (
    <div className="min-h-screen relative" style={{ color: 'var(--color-text)' }}>
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${movie.image})` }}
      >
        <div className="absolute inset-0" style={{ 
          background: 'linear-gradient(to bottom, rgba(36, 34, 30, 0.85), rgba(36, 34, 30, 0.95))'
        }}></div>
      </div>
      
      <div className="relative z-10 container pt-20 mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left Side - Movie Info & Selection */}
          <div className="lg:col-span-1 space-y-6">
            {/* Movie Info */}
            <div className="rounded-2xl shadow-xl overflow-hidden" style={{ 
              backgroundColor: 'var(--custom-300)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {/* Movie Poster */}
              <div className="relative">
                <img
                  src={movie.image}
                  alt={movie.nameVn}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                {/* Movie Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {movie.nameVn}
                  </h2>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-center gap-2">
                    <div className="flex text-amber-200">
                      {Array(5).fill(0).map((_, i) => (
                        <FontAwesomeIcon key={i} icon={faStar} className="w-3 h-3" />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
                    <span>{formatTime(movie.time)}</span>
                  </div>
                  <span>•</span>
                  <span>{movie.format}</span>
                  <span>•</span>
                  <span>{movie.limitageNameVn}</span>
                </div>
                
                <div className="text-sm">
                  <span className="font-medium">Đạo diễn: </span>
                  <span>{movie.director}</span>
                </div>
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendarAlt} className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                Chọn Ngày
              </h3>
              <div 
                className="flex gap-2 overflow-x-auto pb-2"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--color-accent) transparent'
                }}
              >
                <style dangerouslySetInnerHTML={{
                  __html: `
                    .date-scroll::-webkit-scrollbar {
                      height: 6px;
                    }
                    .date-scroll::-webkit-scrollbar-track {
                      background: rgba(255, 255, 255, 0.1);
                      border-radius: 3px;
                    }
                    .date-scroll::-webkit-scrollbar-thumb {
                      background: var(--color-accent);
                      border-radius: 3px;
                    }
                    .date-scroll::-webkit-scrollbar-thumb:hover {
                      background: var(--color-secondary);
                    }
                  `
                }} />
                <div className="flex gap-2 date-scroll" style={{ overflowX: 'auto', paddingBottom: '8px' }}>
                  {dates.map((date) => (
                    <button
                      key={date.value}
                      onClick={() => setSelectedDate(date.value)}
                      className={`flex flex-col items-center p-3 rounded-lg transition-colors border-2 text-sm flex-shrink-0 min-w-[70px] ${
                        selectedDate === date.value ? 'border-accent' : 'border-transparent'
                      }`}
                      style={{
                        backgroundColor: selectedDate === date.value ? 'var(--color-accent)' : 'var(--custom-300)',
                        color: selectedDate === date.value ? 'white' : 'var(--color-text)',
                        borderColor: selectedDate === date.value ? 'var(--color-accent)' : 'transparent'
                      }}
                    >
                      <span className="text-xs font-medium">{date.name}</span>
                      <span className="text-lg font-bold">{date.day}</span>
                      <span className="text-xs">{date.month}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Theater Selection */}
            {theaters.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                  Chọn Rạp Chiếu
                </h3>
                <div className="space-y-2">
                  {theaters.map((theater) => (
                    <button
                      key={theater.id}
                      onClick={() => setSelectedTheater(theater)}
                      className={`w-full p-3 rounded-lg text-left transition-colors border-2 ${
                        selectedTheater?.id === theater.id ? 'border-accent' : 'border-transparent'
                      }`}
                      style={{
                        backgroundColor: selectedTheater?.id === theater.id ? 'var(--color-accent)' : 'var(--custom-300)',
                        color: selectedTheater?.id === theater.id ? 'white' : 'var(--color-text)',
                        borderColor: selectedTheater?.id === theater.id ? 'var(--color-accent)' : 'transparent'
                      }}
                    >
                      <div className="font-medium">{theater.nameVn}</div>
                      <div className="text-sm opacity-75">{theater.nameEn}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Showtime Selection */}
            {showtimes.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <FontAwesomeIcon icon={faClock} className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                  Chọn Suất Chiếu
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {showtimes.map((showtime) => (
                    <button
                      key={showtime.id}
                      onClick={() => setSelectedShowtime(showtime)}
                      className={`p-3 rounded-lg text-center transition-colors border-2 ${
                        selectedShowtime?.id === showtime.id ? 'border-accent' : 'border-transparent'
                      }`}
                      style={{
                        backgroundColor: selectedShowtime?.id === showtime.id ? 'var(--color-accent)' : 'var(--custom-300)',
                        color: selectedShowtime?.id === showtime.id ? 'white' : 'var(--color-text)',
                        borderColor: selectedShowtime?.id === showtime.id ? 'var(--color-accent)' : 'transparent'
                      }}
                    >
                      <div className="font-medium">{showtime.startTime.slice(0, 5)}</div>
                      <div className="text-xs opacity-75">Phòng {showtime.roomName}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Center - Seat Selection */}
          <div className="lg:col-span-3">
            <ProgressBar currentStep="booking" />
            {selectedShowtime && seats.length > 0 ? (
              <div className="p-8 rounded-2xl shadow-xl" style={{ 
                backgroundColor: 'var(--custom-300)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h3 className="text-2xl font-bold mb-8 text-center">Chọn Ghế Ngồi</h3>
                {/* Screen */}
                <div className="mb-10">
                  <div 
                    className="h-3 rounded-full mx-auto mb-3"
                    style={{ 
                      width: '70%',
                      background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)'
                    }}
                  ></div>
                  <p className="text-center text-lg font-semibold" style={{ color: 'var(--color-primary)' }}>Màn Hình</p>
                </div>

                {/* Seat Map */}
                <div className="space-y-3 mb-8">
                  {Object.keys(seatRows).sort().map((row) => (
                    <div key={row} className="flex items-center gap-3 justify-center">
                      <span className="w-8 text-center font-bold text-lg" style={{ color: 'var(--color-text)' }}>
                        {row}
                      </span>
                      <div className="flex gap-2 flex-wrap justify-center">
                        {seatRows[row].map((seat) => (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.status !== 'AVAILABLE' || lockedSeats.includes(seat.id)}
                            className="w-8 h-8 rounded text-sm font-bold transition-all duration-200 hover:scale-110"
                            style={{
                              backgroundColor: getSeatColor(seat),
                              color: (seat.status !== 'AVAILABLE' || lockedSeats.includes(seat.id)) ? '#999' : 'white',
                              cursor: (seat.status !== 'AVAILABLE' || lockedSeats.includes(seat.id)) ? 'not-allowed' : 'pointer',
                              opacity: (seat.status !== 'AVAILABLE' || lockedSeats.includes(seat.id)) ? 0.5 : 1,
                              fontSize: '12px'
                            }}
                          >
                            {seat.seatNumber.slice(1)}
                          </button>
                        ))}
                      </div>
                      <span className="w-8 text-center font-bold text-lg" style={{ color: 'var(--color-text)' }}>
                        {row}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-6 text-base flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded" style={{ backgroundColor: '#4CAF50' }}></div>
                    <span>Có thể chọn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded" style={{ backgroundColor: '#666' }}></div>
                    <span>Đã bán</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded" style={{ backgroundColor: '#ffd700' }}></div>
                    <span>Đã chọn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded" style={{ backgroundColor: '#ff8c00' }}></div>
                    <span>Đang được đặt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded" style={{ backgroundColor: '#ff6b6b' }}></div>
                    <span>VIP</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl shadow-xl text-center" style={{ 
                backgroundColor: 'var(--custom-300)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <h3 className="text-2xl font-bold mb-6">Chọn Ghế Ngồi</h3>
                <p className="text-lg" style={{ color: 'var(--color-primary)' }}>
                  Vui lòng chọn ngày, rạp chiếu và suất chiếu trước
                </p>
              </div>
            )}
          </div>

          {/* Right Side - Ticket Info */}
          <div className="lg:col-span-1">
            <div 
              className="p-6 rounded-2xl shadow-xl relative overflow-hidden"
              style={{ 
                backgroundColor: 'var(--custom-300)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'linear-gradient(135deg, var(--custom-300) 0%, rgba(255, 255, 255, 0.05) 100%)'
              }}
            >
              {/* Ticket Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">VÉ XEM PHIM</h3>
                <div className="w-full h-px border-t-2 border-dashed" style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}></div>
              </div>
              
              {/* Movie & Theater Info */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{selectedTheater?.nameVn || 'PVR'}</span>
                  <span style={{ color: 'var(--color-primary)' }} className="text-sm">
                    {selectedTheater?.nameEn || 'Chọn Rạp'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Ngày</span>
                  <span style={{ color: 'var(--color-primary)' }} className="text-sm">
                    {selectedDate ? formatDate(selectedDate) : 'Chọn Ngày'}
                  </span>
                </div>

                {selectedShowtime && (
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Giờ</span>
                    <span style={{ color: 'var(--color-primary)' }} className="text-sm">
                      {selectedShowtime.startTime.slice(0, 5)}
                    </span>
                  </div>
                )}

                {selectedShowtime && (
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Phòng</span>
                    <span style={{ color: 'var(--color-primary)' }} className="text-sm">
                      {selectedShowtime.roomName}
                    </span>
                  </div>
                )}
              </div>

              {/* Seat Selection */}
              <div className="mb-6">
                <div className="w-full h-px border-t-2 border-dashed mb-4" style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}></div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Hàng</span>
                    <span>Ghế</span>
                    <span>Giá</span>
                  </div>
                  {selectedSeats.length > 0 ? selectedSeats.map((seat) => (
                    <div key={seat.id} className="flex justify-between text-sm">
                      <span>{seat.seatNumber.charAt(0)}</span>
                      <span>{seat.seatNumber.slice(1)}</span>
                      <span>{getSeatPrice(seat.seatType).toLocaleString('vi-VN')}đ</span>
                    </div>
                  )) : (
                    <div className="text-center py-4" style={{ color: 'var(--color-primary)' }}>
                      Chưa chọn ghế
                    </div>
                  )}
                </div>
              </div>

              {/* Total & Payment */}
              {selectedSeats.length > 0 && (
                <div className="space-y-4">
                  <div className="w-full h-px border-t-2 border-dashed" style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}></div>
                  
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Tổng Cộng</span>
                    <span style={{ color: 'var(--color-accent)' }}>{totalPrice.toLocaleString('vi-VN')}đ</span>
                  </div>

                  <button 
                    onClick={handleBooking}
                    disabled={isBooking || selectedSeats.length === 0}
                    className="w-full py-4 rounded-lg font-semibold transition-colors text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: 'var(--color-accent)',
                      color: 'white'
                    }}
                  >
                    {isBooking ? 'Đang xử lý...' : 'Thanh Toán'}
                  </button>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--color-primary)' }}>
                      <FontAwesomeIcon icon={faCreditCard} className="w-4 h-4" />
                      <span>Thanh Toán Bảo Mật</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Ticket Perforations */}
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full" 
                   style={{ backgroundColor: 'var(--color-background)', marginLeft: '-8px' }}></div>
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full" 
                   style={{ backgroundColor: 'var(--color-background)', marginRight: '-8px' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
