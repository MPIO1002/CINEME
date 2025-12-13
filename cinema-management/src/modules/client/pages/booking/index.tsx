import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faMapMarkerAlt, faCreditCard, faCalendarAlt, faStar, faTimes, faPlus, faMinus, faUtensils } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL, WEBSOCKET_URL } from '../../../../components/api-config';
import ProgressBar from '../../components/progress-bar';
import { useToast } from '../../../../hooks/useToast';
import userApiService from '../../../../services/userApi';
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
  seatType?: string;
  price: number;
  status: string;
  color?: string;
  isSelected?: boolean;
}

interface UserData {
  id: string;
  email: string;
  fullName: string;
  accessToken: string;
  refreshToken: string;
}

interface ComboItem {
  itemId: string;
  itemName: string;
  quantity: number;
}

interface Combo {
  id: string;
  name: string;
  price: number;
  img: string;
  listItems: ComboItem[];
}

interface SelectedCombo extends Combo {
  selectedQuantity: number;
}

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [user, setUser] = useState<UserData | null>(null);
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
  const [combos, setCombos] = useState<Combo[]>([]);
  const [selectedCombos, setSelectedCombos] = useState<SelectedCombo[]>([]);
  const [showComboModal, setShowComboModal] = useState(false);
  const [loadingCombos, setLoadingCombos] = useState(false);
  const [rankLoading, setRankLoading] = useState(false);
  const [rankInfo, setRankInfo] = useState<any>(null);
  const [rankDiscountPercent, setRankDiscountPercent] = useState<number>(0);
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

  // Check for user authentication
  useEffect(() => {
    const checkUserData = () => {
      const savedUserData = localStorage.getItem('userData');
      if (savedUserData) {
        try {
          const userData = JSON.parse(savedUserData);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing saved user data:', error);
          localStorage.removeItem('userData');
        }
      } else {
        setUser(null);
      }
    };

    // Check initially
    checkUserData();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userData') {
        checkUserData();
      }
    };

    // Listen for window focus (in case user logged in from another tab)
    const handleFocus = () => {
      checkUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

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
          // Sort showtimes by startTime and filter out past showtimes
          const now = new Date();
          const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
          const today = now.toISOString().split('T')[0];
          
          const filteredAndSorted = data.data
            .filter((showtime: Showtime) => {
              // If selected date is today, filter out past showtimes
              if (selectedDate === today) {
                return showtime.startTime >= currentTime;
              }
              // For future dates, show all showtimes
              return true;
            })
            .sort((a: Showtime, b: Showtime) => {
              return a.startTime.localeCompare(b.startTime);
            });
          
          setShowtimes(filteredAndSorted);
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

    wsRef.current.on('seat_locked', (data: any) => {
      console.log('Seats locked by another user:', data.seatIds);
      setLockedSeats(prev => [...prev, ...data.seatIds]);
    });

    wsRef.current.on('seat_locked_failed', (data: any) => {
      console.log('Seat locking failed:', data.message);
    });
  }, [selectedShowtime]);

  const handleSeatClick = (seat: Seat) => {
    // Can't click on walkway seats or seats that aren't available or locked
    if (seat.seatNumber.startsWith('W_') || seat.status !== 'AVAILABLE' || lockedSeats.includes(seat.id)) return;

    const isSelected = selectedSeats.find(s => s.id === seat.id);
    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const getSeatColor = (seat: Seat) => {
    // Handle walkway seats (invisible)
    if (seat.seatNumber.startsWith('W_')) {
      return 'transparent';
    }

    if (selectedSeats.find(s => s.id === seat.id)) {
      // Darken the color by 50% when selected
      const baseColor = seat.color || (seat.seatType === 'VIP' ? '#ff6b6b' : seat.seatType === 'Couple' ? '#9c27b0' : '#4CAF50');

      // Convert hex to RGB, then darken by 50%
      const hex = baseColor.replace('#', '');
      const r = Math.floor(parseInt(hex.substr(0, 2), 16) * 0.5);
      const g = Math.floor(parseInt(hex.substr(2, 2), 16) * 0.5);
      const b = Math.floor(parseInt(hex.substr(4, 2), 16) * 0.5);

      return `rgb(${r}, ${g}, ${b})`;
    }

    if (lockedSeats.includes(seat.id)) return '#ff8c00'; // Orange for locked by others
    if (seat.status !== 'AVAILABLE') return '#666'; // Gray for booked/unavailable

    // Use backend color if provided, otherwise fallback to old logic
    if (seat.color) return seat.color;

    // Fallback colors based on seatType
    if (seat.seatType === 'VIP') return '#ff6b6b'; // Red for VIP
    if (seat.seatType === 'Couple') return '#9c27b0'; // Purple for couple
    return '#4CAF50'; // Green for standard available
  };

  const getSeatPrice = (seatType: string, price: number) => {
    // Use the price from backend if provided and not 0
    if (price > 0) return price;

    // Fallback to hardcoded prices
    switch (seatType) {
      case 'VIP': return 100000;
      case 'Couple': return 200000;
      default: return 50000;
    }
  };

  const getSeatWidth = (seatNumber: string) => {
    if (seatNumber.includes('+')) {
      // Couple seats should be roughly double width
      // Each single seat is 32px (w-8), so couple seat should be around 72px (double + gap)
      return 72;
    }
    return 32; // Default single seat width (32px = w-8)
  };

  // Fetch combos from API
  const fetchCombos = async () => {
    setLoadingCombos(true);
    try {
      const response = await fetch(`${API_BASE_URL}/combos`);
      const data = await response.json();
      // Backend returns { statusCode, message, data: [...] }
      if (response.ok && data && data.statusCode === 200) {
        setCombos(Array.isArray(data.data) ? data.data : []);
      } else if (response.ok && Array.isArray(data)) {
        // Some endpoints might return raw array directly
        setCombos(data);
      } else {
        setCombos([]);
        showToast('error', 'Không thể tải danh sách combo');
      }
    } catch (error) {
      console.error('Error fetching combos:', error);
      showToast('error', 'Có lỗi xảy ra khi tải combo');
    } finally {
      setLoadingCombos(false);
    }
  };

  // Fetch rank info for current user
  const fetchRank = async () => {
    try {
      const savedUserData = localStorage.getItem('userData');
      if (!savedUserData) return;
      const parsed: UserData = JSON.parse(savedUserData);
      if (!parsed || !parsed.id) return;

      setRankLoading(true);

      const data = await userApiService.getUserRank(parsed.id);
      setRankInfo(data);
      setRankDiscountPercent(data?.rank?.discountPercentage || 0);
    } catch (error) {
      console.error('Error fetching rank:', error);
      setRankInfo(null);
      setRankDiscountPercent(0);
    } finally {
      setRankLoading(false);
    }
  };

  // Call fetchRank when user changes
  useEffect(() => {
    if (user) {
      fetchRank();
    } else {
      setRankInfo(null);
      setRankDiscountPercent(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Handle combo selection
  const handleComboSelect = (combo: Combo, quantity: number) => {
    if (quantity === 0) {
      setSelectedCombos(prev => prev.filter(c => c.id !== combo.id));
    } else {
      setSelectedCombos(prev => {
        const existing = prev.find(c => c.id === combo.id);
        if (existing) {
          return prev.map(c =>
            c.id === combo.id ? { ...c, selectedQuantity: quantity } : c
          );
        } else {
          return [...prev, { ...combo, selectedQuantity: quantity }];
        }
      });
    }
  };

  // Open combo modal and fetch combos
  const openComboModal = () => {
    setShowComboModal(true);
    if (combos.length === 0) {
      fetchCombos();
    }
  };

  // Generate legend items from actual seat data
  const generateLegendItems = () => {
    const legendItems: Array<{ color: string; label: string; type: string }> = [];
    const seenTypes = new Set<string>();

    // Get unique seat types with their colors from the seat data
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

    // Add status-based legend items
    legendItems.push(
      { color: '#666', label: 'Đã bán', type: 'unavailable' },
    );

    return legendItems;
  };

  const handleBooking = async () => {
    if (!selectedShowtime || selectedSeats.length === 0) return;

    // Check if user is logged in
    if (!user) {
      showToast('warning', 'Vui lòng đăng nhập để đặt vé');
      return;
    }

    setIsBooking(true);

    try {
      const bookingData: any = {
        userId: user.id,
        showtimeId: selectedShowtime.id,
        listSeatId: selectedSeats.map(seat => seat.id),
        paymentMethod: 'VNPAY'
      };

      // Add combos if any selected
      if (selectedCombos.length > 0) {
        bookingData.listCombo = selectedCombos.reduce((acc, combo) => {
          acc[combo.id] = combo.selectedQuantity;
          return acc;
        }, {} as { [key: string]: number });
      }

      // Log booking data being sent to API
      console.log('=== BOOKING API DATA ===');
      console.log('URL:', `${API_BASE_URL}/payments/client`);
      console.log('Booking Data:', JSON.stringify(bookingData, null, 2));
      console.log('========================');

      const response = await fetch(`${API_BASE_URL}/payments/client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();

      if (data.statusCode === 200 && data.data) {
        window.location.href = data.data;

      } else {
        // Booking failed
        showToast('error', 'Không thể tiến thành thanh toán: ' + (data.message || 'Vui lòng thử lại'));

      }
    } catch (error) {
      console.error('Error creating booking:', error);
      showToast('error', 'Có lỗi xảy ra khi đặt vé. Vui lòng thử lại!');
    } finally {
      setIsBooking(false);
    }
  };

  const seatPrice = selectedSeats.reduce((sum, seat) => sum + getSeatPrice(seat.seatType || 'Standard', seat.price), 0);
  const comboPrice = selectedCombos.reduce((sum, combo) => sum + (combo.price * combo.selectedQuantity), 0);
  const totalPrice = seatPrice + comboPrice;
  const discountedTotalPrice = rankDiscountPercent > 0 ? Math.round(totalPrice * (1 - rankDiscountPercent / 100)) : totalPrice;
  const discountSaved = Math.max(0, totalPrice - discountedTotalPrice);



  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Group seats by row and create proper alignment with walkways
  const groupSeatsByRow = (seats: Seat[]) => {
    const rows: { [key: string]: Seat[] } = {};
    seats.forEach(seat => {
      let row: string;
      if (seat.seatNumber.startsWith('W_')) {
        // Extract row from walkway format like "W_C3" -> "C"
        row = seat.seatNumber.substring(2, 3);
      } else {
        row = seat.seatNumber.charAt(0);
      }
      if (!rows[row]) rows[row] = [];
      rows[row].push(seat);
    });

    // Sort seats within each row by their position number
    Object.keys(rows).forEach(row => {
      rows[row].sort((a, b) => {
        const getPosition = (seatNumber: string) => {
          if (seatNumber.startsWith('W_')) {
            // For walkway like "W_C3", get position 3
            return parseInt(seatNumber.substring(3));
          } else if (seatNumber.includes('+')) {
            // For couple seats like "G12+G34", get starting position 12
            const firstSeat = seatNumber.split('+')[0];
            return parseInt(firstSeat.slice(1));
          } else {
            // For regular seats like "A1", get position 1
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

  if (loading || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: 'var(--color-secondary)' }}></div>
      </div>
    );
  }

  const seatRows = groupSeatsByRow(seats);

  // ComboModal component
  const ComboModal = () => {
    if (!showComboModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div
          className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
          style={{ backgroundColor: 'var(--custom-300)', color: 'var(--color-text)' }}
        >
          {/* Custom Scrollbar Styles */}
          <style dangerouslySetInnerHTML={{
            __html: `
              .combo-content-scroll::-webkit-scrollbar {
                width: 8px;
              }
              .combo-content-scroll::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
              }
              .combo-content-scroll::-webkit-scrollbar-thumb {
                background: linear-gradient(45deg, var(--color-accent), var(--color-secondary));
                border-radius: 4px;
                border: 1px solid rgba(255, 255, 255, 0.2);
              }
              .combo-content-scroll::-webkit-scrollbar-thumb:hover {
                background: linear-gradient(45deg, var(--color-secondary), var(--color-accent));
                box-shadow: 0 0 8px rgba(var(--color-accent-rgb), 0.3);
              }
              .combo-card {
                background: linear-gradient(135deg, var(--color-background) 0%, rgba(255, 255, 255, 0.05) 100%);
                backdrop-filter: blur(10px);
                transition: all 0.3s ease;
              }
              .combo-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
              }
            `
          }} />

          {/* Modal Header - Fixed */}
          <div className="flex-shrink-0 p-6 border-b border-gray-200 rounded-lg" style={{ backgroundColor: 'var(--custom-300)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FontAwesomeIcon icon={faUtensils} style={{ color: 'var(--color-accent)' }} />
                Chọn Combo Bắp Nước
              </h2>
              <button
                onClick={() => setShowComboModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                style={{ color: 'var(--color-text)' }}
              >
                <FontAwesomeIcon icon={faTimes} className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Modal Content - Scrollable */}
          <div className="flex-1 overflow-y-auto combo-content-scroll p-6">
            {loadingCombos ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--color-accent)' }}></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {combos.map((combo) => {
                  const selectedCombo = selectedCombos.find(c => c.id === combo.id);
                  const currentQuantity = selectedCombo?.selectedQuantity || 0;

                  return (
                    <div
                      key={combo.id}
                      className="combo-card rounded-xl shadow-lg overflow-hidden border"
                      style={{
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      {/* Combo Image */}
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img
                          src={combo.img}
                          alt={combo.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/public/logo_cinema_new.PNG'; // Fallback image
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                      </div>

                      {/* Combo Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2">{combo.name}</h3>
                        <div className="text-sm mb-3" style={{ color: 'var(--color-primary)' }}>
                          {combo.listItems.map((item) => (
                            <div key={item.itemId}>
                              {item.quantity}x {item.itemName}
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>
                            {combo.price.toLocaleString('vi-VN')}đ
                          </span>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleComboSelect(combo, Math.max(0, currentQuantity - 1))}
                              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                              style={{
                                backgroundColor: currentQuantity > 0 ? 'var(--color-accent)' : '#666',
                                color: 'white'
                              }}
                              disabled={currentQuantity === 0}
                            >
                              <FontAwesomeIcon icon={faMinus} className="w-3 h-3" />
                            </button>

                            <span className="w-8 text-center font-bold">{currentQuantity}</span>

                            <button
                              onClick={() => handleComboSelect(combo, currentQuantity + 1)}
                              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                              style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
                            >
                              <FontAwesomeIcon icon={faPlus} className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Modal Footer - Fixed */}
          <div className="flex-shrink-0 p-6 border-t border-gray-200" style={{ backgroundColor: 'var(--custom-300)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-lg">Tổng combo: </span>
                <span className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>
                  {comboPrice.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <button
                onClick={() => setShowComboModal(false)}
                className="px-6 py-3 rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
              >
                Xác Nhận
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
                      className={`flex flex-col items-center p-3 rounded-lg transition-colors border-2 text-sm flex-shrink-0 min-w-[70px] ${selectedDate === date.value ? 'border-accent' : 'border-transparent'
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
                      className={`w-full p-3 rounded-lg text-left transition-colors border-2 ${selectedTheater?.id === theater.id ? 'border-accent' : 'border-transparent'
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
                      className={`p-3 rounded-lg text-center transition-colors border-2 ${selectedShowtime?.id === showtime.id ? 'border-accent' : 'border-transparent'
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
                  {Object.keys(seatRows).sort().map((row) => {
                    // Calculate if this is a couple seat row (like row G)
                    const hasCoupleSeats = seatRows[row].some(seat => seat.seatNumber.includes('+'));
                    
                    return (
                      <div key={row} className="flex items-center gap-3 justify-center">
                        <span className="w-8 text-center font-bold text-lg" style={{ color: 'var(--color-text)' }}>
                          {row}
                        </span>
                        <div className="flex justify-center items-center" style={{ minWidth: '400px' }}>
                          {hasCoupleSeats ? (
                            // Special layout for couple seats (Row G)
                            <div className="flex justify-center items-center gap-3">
                              {seatRows[row].map((seat, index) => (
                                <button
                                  key={seat.id}
                                  onClick={() => handleSeatClick(seat)}
                                  disabled={seat.status !== 'AVAILABLE' || lockedSeats.includes(seat.id)}
                                  className="rounded text-sm font-bold transition-all duration-200 hover:scale-110 h-8 flex-shrink-0"
                                  style={{
                                    width: `${getSeatWidth(seat.seatNumber)}px`,
                                    minWidth: `${getSeatWidth(seat.seatNumber)}px`,
                                    backgroundColor: getSeatColor(seat),
                                    color: (seat.status !== 'AVAILABLE' || lockedSeats.includes(seat.id)) ? '#999' : 'white',
                                    cursor: (seat.status !== 'AVAILABLE' || lockedSeats.includes(seat.id)) ? 'not-allowed' : 'pointer',
                                    opacity: (seat.status !== 'AVAILABLE' || lockedSeats.includes(seat.id)) ? 0.5 : 1,
                                    fontSize: '10px'
                                  }}
                                >
                                  {seat.seatNumber.replace(/[A-Z]/g, '').replace('+', '-')}
                                </button>
                              ))}
                            </div>
                          ) : (
                            // Regular layout for standard seats
                            <div className="flex gap-2 justify-center">
                              {seatRows[row].map((seat) =>
                                seat.seatNumber.startsWith('W_') ? (
                                  // Render walkway as empty space
                                  <div
                                    key={seat.id}
                                    className="h-8"
                                    style={{ width: `${getSeatWidth(seat.seatNumber)}px` }}
                                  >
                                    {/* Empty walkway space */}
                                  </div>
                                ) : (
                                  <button
                                    key={seat.id}
                                    onClick={() => handleSeatClick(seat)}
                                    disabled={seat.status !== 'AVAILABLE' || lockedSeats.includes(seat.id)}
                                    className="rounded text-sm font-bold transition-all duration-200 hover:scale-110 h-8"
                                    style={{
                                      width: `${getSeatWidth(seat.seatNumber)}px`,
                                      backgroundColor: getSeatColor(seat),
                                      color: (seat.status !== 'AVAILABLE' || lockedSeats.includes(seat.id)) ? '#999' : 'white',
                                      cursor: (seat.status !== 'AVAILABLE' || lockedSeats.includes(seat.id)) ? 'not-allowed' : 'pointer',
                                      opacity: (seat.status !== 'AVAILABLE' || lockedSeats.includes(seat.id)) ? 0.5 : 1,
                                      fontSize: '10px'
                                    }}
                                  >
                                    {seat.seatNumber.slice(1)}
                                  </button>
                                )
                              )}
                            </div>
                          )}
                        </div>
                        <span className="w-8 text-center font-bold text-lg" style={{ color: 'var(--color-text)' }}>
                          {row}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-6 text-base flex-wrap">
                  {generateLegendItems().map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded" style={{ backgroundColor: item.color }}></div>
                      <span>{item.label}</span>
                    </div>
                  ))}
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

              {/* Combo Section */}
              <div className="mb-6">
                <button
                  onClick={openComboModal}
                  className="w-full py-3 rounded-lg font-semibold transition-colors text-center flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: 'var(--color-secondary)',
                    color: 'white',
                    border: '2px solid var(--color-secondary)'
                  }}
                >
                  <FontAwesomeIcon icon={faUtensils} />
                  Mua Bắp Nước
                </button>

                {/* Display selected combos */}
                {selectedCombos.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {selectedCombos.map((combo) => (
                      <div key={combo.id} className="flex justify-between text-sm">
                        <span>{combo.selectedQuantity}x {combo.name.substring(0, 25)}...</span>
                        <span>{(combo.price * combo.selectedQuantity).toLocaleString('vi-VN')}đ</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Seat Selection */}
              <div className="mb-6">
                <div className="w-full h-px border-t-2 border-dashed mb-4" style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }}></div>
                <div className="space-y-2">
                  <div className="flex text-sm font-semibold">
                    <span className="w-12 text-center">Hàng</span>
                    <span className="flex-1 text-center">Ghế</span>
                    <span className="w-20 text-right">Giá</span>
                  </div>
                  {selectedSeats.length > 0 ? selectedSeats.map((seat) => (
                    <div key={seat.id} className="flex text-sm">
                      <span className="w-12 text-center">{seat.seatNumber.charAt(0)}</span>
                      <span className="flex-1 text-center">
                        {seat.seatNumber.includes('+')
                          ? seat.seatNumber.replace(/[A-Z]/g, '').replace('+', '-')
                          : seat.seatNumber.slice(1)
                        }
                      </span>
                      <span className="w-20 text-right">{getSeatPrice(seat.seatType || 'Standard', seat.price).toLocaleString('vi-VN')}đ</span>
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

                  {/* Price breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>Tiền vé</span>
                      <span>{seatPrice.toLocaleString('vi-VN')}đ</span>
                    </div>
                    {comboPrice > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span>Tiền combo</span>
                        <span>{comboPrice.toLocaleString('vi-VN')}đ</span>
                      </div>
                    )}
                  </div>

                  {/* Membership discount info (if any) */}
                  {rankLoading ? (
                    <div className="flex justify-between items-center text-sm">
                      <span>Ưu đãi</span>
                      <span style={{ color: 'var(--color-primary)' }}>Đang tải ưu đãi...</span>
                    </div>
                  ) : rankDiscountPercent > 0 ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold">Ưu đãi</span>
                          <span className="px-2 py-1 rounded text-sm" style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}>
                            {rankInfo?.rank?.name || 'Hạng'} • {rankDiscountPercent}%
                          </span>
                      </div>

                      <div className="flex justify-between items-center text-lg font-bold mt-5">
                        <span>Tổng Cộng</span>
                        <div className="text-right">
                          <div style={{ textDecoration: 'line-through', fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)' }}>
                            {totalPrice.toLocaleString('vi-VN')}đ
                          </div>
                          <div style={{ color: 'var(--color-accent)' }}>{discountedTotalPrice.toLocaleString('vi-VN')}đ</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Tổng Cộng</span>
                      <span style={{ color: 'var(--color-accent)' }}>{totalPrice.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}

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

      {/* Combo Modal */}
      <ComboModal />
    </div>
  );
};

export default BookingPage;
