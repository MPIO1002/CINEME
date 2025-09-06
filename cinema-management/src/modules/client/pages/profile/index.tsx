import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Eye, MessageSquare, Badge } from 'lucide-react';
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

const Profile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bookingHistory, setBookingHistory] = useState<BookingHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
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
            backgroundImage: 'url(/gold.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
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
                    <Badge className="w-5 h-5 text-white" />
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
          <h2 className="text-2xl font-bold text-[var(--color-text)] mb-6">LỊCH SỬ VÉ XEM PHIM</h2>
          
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
            <div className="space-y-6 max-w-6xl mx-auto">
              {bookingHistory.map((booking) => (
                <div key={booking.id} className="relative overflow-hidden rounded-2xl">
                  {/* Ticket Design - Similar to Payment Result */}
                  <div 
                    className="relative min-h-[300px] flex"
                    style={{
                      background: `url('${booking.movieImg}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundBlendMode: 'overlay'
                    }}
                  >
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-[var(--color-background)]/80 backdrop-blur-[2px]"></div>
                    
                    {/* Perforated line separating sections */}
                    <div className="absolute left-1/3 top-0 bottom-0 w-6 transform -translate-x-1/2 z-20">
                      {/* Top half circle */}
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full" style={{ backgroundColor: '#292722' }}></div>
                      
                      {/* Perforated dots */}
                      <div className="h-full flex flex-col items-center justify-center space-y-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                          <div 
                            key={i} 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: '#292722' }}
                          />
                        ))}
                      </div>
                      
                      {/* Bottom half circle */}
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full" style={{ backgroundColor: '#292722' }}></div>
                    </div>
                    
                    {/* Left side - Movie Poster */}
                    <div className="w-1/3 p-6 flex flex-col justify-center items-center relative z-10">
                      <img 
                        src={booking.movieImg}
                        alt={booking.movieName}
                        className="w-full max-w-[200px] h-[250px] object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = "https://image.tmdb.org/t/p/w300/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg";
                        }}
                      />
                    </div>
                    
                    {/* Right side - Booking details */}
                    <div className="w-2/3 p-6 flex items-center relative z-10">
                      <div className="w-full space-y-4">
                        <div className="flex justify-between items-center border-b border-white/20 pb-3">
                          <span className="text-white/80 text-base">Phim</span>
                          <span className="text-white font-bold text-right text-base max-w-[60%]">{booking.movieName}</span>
                        </div>
                        
                        <div className="flex justify-between items-center border-b border-white/20 pb-3">
                          <span className="text-white/80 text-base">Rạp</span>
                          <span className="text-white font-bold text-right text-base max-w-[60%]">{booking.theaterName}</span>
                        </div>
                        
                        <div className="flex justify-between items-center border-b border-white/20 pb-3">
                          <span className="text-white/80 text-base">Phòng</span>
                          <span className="text-white font-bold text-base">{booking.roomName}</span>
                        </div>
                        
                        <div className="flex justify-between items-center border-b border-white/20 pb-3">
                          <span className="text-white/80 text-base">Ngày chiếu</span>
                          <span className="text-white font-bold text-base">{formatDate(booking.date)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center border-b border-white/20 pb-3">
                          <span className="text-white/80 text-base">Giờ chiếu</span>
                          <span className="text-white font-bold text-base">
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center border-b border-white/20 pb-3">
                          <span className="text-white/80 text-base">Ghế</span>
                          <span className="text-white font-bold text-base">{booking.listSeats.join(', ')}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-white/80 text-base">Trạng thái</span>
                          <span className={`font-bold text-base px-3 py-1 rounded-full ${
                            booking.status === 'CONFIRMED' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {booking.status === 'CONFIRMED' ? 'Đã xác nhận' : booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
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
    </div>
  );
};

export default Profile;
