import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Eye, MessageSquare, Badge, Info, X } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTicket } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '../../../../hooks/useToast';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
}

interface UserProfileResponse {
  statusCode: number;
  message: string;
  data: UserProfile;
}

interface BookingHistory {
  id: string;
  movieName: string;
  movieImg: string;
  date: string;
  startTime: string;
  endTime: string;
  theaterName: string;
  roomName: string;
  listSeats: string[];
  status: string;
}

interface BookingHistoryResponse {
  statusCode: number;
  message: string;
  data: BookingHistory[];
}

interface BookingDetail {
  movieName: string;
  theaterName: string;
  image: string;
  duration: string;
  roomName: string;
  showtime: string;
  seatNumbers: string[];
  qrcode: string;
}

interface BookingDetailResponse {
  statusCode: number;
  message: string;
  data: BookingDetail;
}

const Profile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bookingHistory, setBookingHistory] = useState<BookingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [isLoadingTicketDetail, setIsLoadingTicketDetail] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = localStorage.getItem('userData');
        if (!userData) {
          showToast('error', 'Bạn cần đăng nhập để xem hồ sơ!');
          navigate('/');
          return;
        }

        const user = JSON.parse(userData);
        const { id, refreshToken } = user;

        if (!id || !refreshToken) {
          showToast('error', 'Thông tin đăng nhập không hợp lệ!');
          navigate('/');
          return;
        }

        // Fetch user profile
        const response = await fetch(
          `http://localhost:8080/api/v1/users/${id}/info`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${refreshToken}`
            },
          }
        );

        if (response.ok) {
          const result: UserProfileResponse = await response.json();
          if (result.statusCode === 200 && result.data) {
            setUserProfile(result.data);
          } else {
            showToast('error', result.message || 'Không thể lấy thông tin hồ sơ!');
          }
        } else {
          if (response.status === 401) {
            showToast('error', 'Phiên đăng nhập đã hết hạn!');
            localStorage.removeItem('userData');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            navigate('/');
          } else {
            showToast('error', 'Không thể kết nối đến máy chủ!');
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        showToast('error', 'Đã xảy ra lỗi không mong muốn!');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchBookingHistory = async () => {
      try {
        const userData = localStorage.getItem('userData');
        if (!userData) return;

        const user = JSON.parse(userData);
        const { id, refreshToken } = user;

        const response = await fetch(
          `http://localhost:8080/api/v1/bookings/${id}/history`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${refreshToken}`
            },
          }
        );

        if (response.ok) {
          const result: BookingHistoryResponse = await response.json();
          if (result.statusCode === 200 && result.data) {
            setBookingHistory(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching booking history:', error);
      } finally {
        setIsLoadingBookings(false);
      }
    };

    fetchUserProfile();
    fetchBookingHistory();
  }, [navigate, showToast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Get HH:MM from HH:MM:SS
  };

  const fetchBookingDetail = async (bookingId: string) => {
    setIsLoadingTicketDetail(true);
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) return;

      const user = JSON.parse(userData);
      const { refreshToken } = user;

      const response = await fetch(
        `http://localhost:8080/api/v1/bookings/${bookingId}/info`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${refreshToken}`
          },
        }
      );

      if (response.ok) {
        const result: BookingDetailResponse = await response.json();
        if (result.statusCode === 200 && result.data) {
          setSelectedBooking(result.data);
          setShowTicketModal(true);
        } else {
          showToast('error', result.message || 'Không thể lấy thông tin vé!');
        }
      } else {
        showToast('error', 'Không thể kết nối đến máy chủ!');
      }
    } catch (error) {
      console.error('Error fetching booking detail:', error);
      showToast('error', 'Đã xảy ra lỗi không mong muốn!');
    } finally {
      setIsLoadingTicketDetail(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-[var(--color-secondary)] mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-[var(--color-text)]">Đang tải hồ sơ...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[var(--color-text)] mb-4">Không thể tải hồ sơ</h2>
            <button
              onClick={() => navigate('/')}
              className="bg-[var(--color-accent)] text-white px-6 py-2 rounded-lg hover:bg-[var(--color-secondary)] transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8">
      <div className="w-full px-6 mt-15">
        {/* Profile Card */}
        <div 
          className="rounded-3xl p-8 mb-8 relative overflow-hidden"
          style={{ 
            backgroundColor: '#ffb300'
          }}
        >
          
          
          <div className="flex items-start gap-6 relative z-10">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0 p-5" style={{ backgroundColor: 'var(--color-background)' }}>
              <img 
                src="/logo_cinema_new.PNG" 
                alt="Cinema Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* User Info */}
            <div className="flex-1">
              <div className="mb-4">
                <p className="text-2xl font-bold text-[var(--color-text)]">{userProfile.fullName}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-lg text-white">{userProfile.email}</p>
              </div>
              
              <div className="mb-6">
                <p className="text-lg text-white">{userProfile.phone || 'Chưa cập nhật số điện thoại'}</p>
              </div>
              
              {/* Rank Section */}
              <div className="border-t border-white pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-white">HẠNG: CUỒNG PHIM</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-white">1500 điểm</span>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div className="bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-accent)] h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="rounded-3xl p-8 mb-8" style={{ backgroundColor: '#292722' }}>
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-3">
                <FontAwesomeIcon icon={faTicket} className="text-2xl text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-[var(--color-text)]">
                {bookingHistory.reduce((total, booking) => total + booking.listSeats.length, 0)}
              </p>
              <p className="text-sm text-gray-400">Vé đã mua</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                <Eye className="w-7 h-7 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-[var(--color-text)]">{bookingHistory.length}</p>
              <p className="text-sm text-gray-400">Phim đã xem</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-3">
                <Star className="w-7 h-7 text-yellow-500" />
              </div>
              <p className="text-3xl font-bold text-[var(--color-text)]">0</p>
              <p className="text-sm text-gray-400">Đánh giá</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-7 h-7 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-[var(--color-text)]">0</p>
              <p className="text-sm text-gray-400">Bình luận</p>
            </div>
          </div>
        </div>

        {/* Tickets History Section */}
        <div className="rounded-3xl p-8" style={{ backgroundColor: '#292722' }}>
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6">VÉ HIỆN CÓ</h2>
          
          {isLoadingBookings ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-t-4 border-[var(--color-secondary)] mx-auto mb-4"></div>
              <p className="text-gray-300">Đang tải lịch sử vé...</p>
            </div>
          ) : bookingHistory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Bạn chưa có vé nào</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {bookingHistory.map((booking) => (
                <div key={booking.id} className="bg-[var(--color-background)] rounded-xl p-6 flex items-center justify-between hover:bg-opacity-90 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <img 
                      src={booking.movieImg}
                      alt={booking.movieName}
                      className="w-16 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = "https://image.tmdb.org/t/p/w300/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg";
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="text-[var(--color-text)] font-semibold text-lg mb-2 line-clamp-1">
                        {booking.movieName}
                      </h3>
                      <div className="space-y-1">
                        <p className="text-gray-300 text-sm">
                          <span className="font-medium">Ngày:</span> {formatDate(booking.date)}
                        </p>
                        <p className="text-gray-300 text-sm">
                          <span className="font-medium">Giờ:</span> {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                        </p>
                        <p className="text-gray-300 text-sm">
                          <span className="font-medium">Rạp:</span> {booking.theaterName}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === 'CONFIRMED' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {booking.status === 'CONFIRMED' ? 'Đã xác nhận' : booking.status}
                    </span>
                    
                    <button
                      onClick={() => fetchBookingDetail(booking.id)}
                      disabled={isLoadingTicketDetail}
                      className="w-10 h-10 rounded-full bg-[var(--color-accent)] hover:bg-[var(--color-secondary)] transition-colors flex items-center justify-center text-white disabled:opacity-50"
                      title="Xem chi tiết vé"
                    >
                      {isLoadingTicketDetail ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <Info className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Movies Section */}
        <div className="rounded-3xl p-8 mt-8" style={{ backgroundColor: '#292722' }}>
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6">PHIM ĐÃ XEM GẦN ĐÂY</h2>
          
          {bookingHistory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">Chưa có phim nào được xem</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* Get unique movies from booking history, sorted by most recent */}
              {bookingHistory
                .filter((booking, index, self) => 
                  index === self.findIndex(b => b.movieName === booking.movieName)
                )
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 6)
                .map((booking, index) => (
                  <div key={index} className="">
                    <div className="relative overflow-hidden rounded-lg aspect-[3/4] mb-3">
                      <img 
                        src={booking.movieImg}
                        alt={booking.movieName}
                        className="w-full h-full object-cover"
                      />
                      {/* Date badge */}
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {formatDate(booking.date)}
                      </div>
                    </div>
                    <h3 className="text-[var(--color-text)] font-medium text-sm line-clamp-2">
                      {booking.movieName}
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">
                      {booking.theaterName}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {showTicketModal && selectedBooking && (
        <div className="fixed inset-0 top-10 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--color-background)] rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-8 border-b border-gray-600">
              <h3 className="text-2xl font-bold text-[var(--color-text)]">CHI TIẾT VÉ XEM PHIM</h3>
              <button
                onClick={() => {
                  setShowTicketModal(false);
                  setSelectedBooking(null);
                }}
                className="w-10 h-10 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors flex items-center justify-center text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Ticket Content */}
            <div className="p-8">
              <div className="relative overflow-hidden rounded-2xl">
                {/* Ticket Design */}
                <div 
                  className="relative min-h-[500px] flex"
                  style={{
                    background: `url('${selectedBooking.image}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundBlendMode: 'overlay'
                  }}
                >
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-[var(--color-background)]/85 backdrop-blur-[2px]"></div>
                  
                  {/* Perforated line separating sections */}
                  <div className="absolute left-1/3 top-0 bottom-0 w-8 transform -translate-x-1/2 z-20">
                    {/* Top half circle */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-[var(--color-background)]"></div>
                    
                    {/* Perforated dots */}
                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div 
                          key={i} 
                          className="w-4 h-4 rounded-full bg-[var(--color-background)]"
                        />
                      ))}
                    </div>
                    
                    {/* Bottom half circle */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-[var(--color-background)]"></div>
                  </div>
                  
                  {/* Left side - Movie Poster */}
                  <div className="w-1/3 p-8 flex flex-col justify-center items-center relative z-10">
                    <img 
                      src={selectedBooking.image}
                      alt={selectedBooking.movieName}
                      className="w-full max-w-[250px] h-[350px] object-cover rounded-lg shadow-xl"
                      onError={(e) => {
                        e.currentTarget.src = "https://image.tmdb.org/t/p/w300/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg";
                      }}
                    />
                  </div>
                  
                  {/* Right side - Ticket details */}
                  <div className="w-2/3 p-8 flex items-center relative z-10">
                    <div className="w-full space-y-6">
                      <div className="flex justify-between items-center border-b border-white/20 pb-4">
                        <span className="text-white/80 text-lg">Phim</span>
                        <span className="text-white font-bold text-right text-lg max-w-[60%]">{selectedBooking.movieName}</span>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-white/20 pb-4">
                        <span className="text-white/80 text-lg">Rạp</span>
                        <span className="text-white font-bold text-right text-lg max-w-[60%]">{selectedBooking.theaterName}</span>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-white/20 pb-4">
                        <span className="text-white/80 text-lg">Phòng</span>
                        <span className="text-white font-bold text-lg">{selectedBooking.roomName}</span>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-white/20 pb-4">
                        <span className="text-white/80 text-lg">Thời lượng</span>
                        <span className="text-white font-bold text-lg">{selectedBooking.duration} phút</span>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-white/20 pb-4">
                        <span className="text-white/80 text-lg">Suất chiếu</span>
                        <span className="text-white font-bold text-lg">
                          {new Date(selectedBooking.showtime).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center border-b border-white/20 pb-4">
                        <span className="text-white/80 text-lg">Ghế</span>
                        <span className="text-white font-bold text-lg">{selectedBooking.seatNumbers.join(', ')}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-white/80 text-lg">QR Code</span>
                        <div className="text-right">
                          <img 
                            src={selectedBooking.qrcode}
                            alt="QR Code"
                            className="w-28 h-28 object-contain rounded border-2 border-white/20 shadow-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
