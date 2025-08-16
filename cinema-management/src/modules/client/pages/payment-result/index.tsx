import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, Home } from 'lucide-react';


interface PaymentResultData {
  movieName: string;
  theaterName: string;
  image: string;
  duration: string | number;
  roomName: string;
  showtime: string;
  seatNumbers: string[];
  qrcode: string;
}

interface BookingInfoResponse {
  statusCode: number;
  message: string;
  data: PaymentResultData;
}

const PaymentResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentResultData | null>(null);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      time: date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      date: date.toLocaleDateString('vi-VN')
    };
  };

  useEffect(() => {
    const fetchBookingInfo = async () => {
      try {
        setIsLoading(true);
        
        // Get status and booking ID from URL parameters
        const status = searchParams.get('status');
        const bookingId = searchParams.get('booking');

        if (status === 'success' && bookingId) {
          // Call API to get booking information
          const response = await fetch(
            `http://localhost:8080/api/v1/bookings/${bookingId}/info`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.ok) {
            const result: BookingInfoResponse = await response.json();
            
            if (result.statusCode === 200 && result.data) {
              setPaymentData(result.data);
              setIsSuccess(true);
            } else {
              console.log('API returned error:', result.message);
              setIsSuccess(false);
            }
          } else {
            console.log('Failed to fetch booking info:', response.status, response.statusText);
            setIsSuccess(false);
          }
        } else {
          console.log('Payment failed or missing booking ID');
          setIsSuccess(false);
        }
      } catch (error) {
        console.log('Error fetching booking info:', error);
        setIsSuccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingInfo();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="flex items-center justify-center min-h-[80vh] relative z-10">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-t-4 border-orange-500 mx-auto mb-6"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-4 border-orange-400/20 mx-auto"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Đang xử lý kết quả thanh toán...</h2>
            <p className="text-gray-400">Vui lòng chờ trong giây lát</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {isSuccess ? (
            // Success Page with Animation
            <div className="flex flex-col items-center justify-center min-h-screen">
              {/* Success Animation */}
              <div className="mb-8 text-center mt-20">
                <div className="relative inline-block mb-6">
                  {/* Animated checkmark */}
                  <div className="w-32 h-32 mx-auto relative">
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="relative w-32 h-32 bg-green-500 rounded-full flex items-center justify-center shadow-2xl">
                      <svg 
                        className="w-16 h-16 text-white" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={3} 
                          d="M5 13l4 4L19 7" 
                        />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Confetti effect */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="absolute top-4 right-1/4 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                    <div className="absolute top-8 left-1/3 w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute top-2 right-1/3 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.7s'}}></div>
                  </div>
                </div>
                
                <h1 className="text-4xl font-bold text-white mb-4 animate-fade-in">
                  THANH TOÁN THÀNH CÔNG!
                </h1>
                <p className="text-xl text-white/80 mb-2">
                  Chúc mừng bạn đã đặt vé thành công!
                </p>
                <p className="text-lg text-white/60 mb-8">
                  Dưới đây là chi tiết vé của bạn
                </p>
              </div>

              {paymentData && (
                <div className="relative overflow-hidden rounded-3xl max-w-6xl w-full mx-auto mb-8">
                  {/* Movie Ticket Design - Updated layout */}
                  <div 
                    className="relative min-h-[500px] flex"
                    style={{
                      background: `url('${paymentData.image}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundBlendMode: 'overlay'
                    }}
                  >
                    {/* Additional dark overlay matching page background */}
                    <div className="absolute inset-0 bg-[var(--color-background)]/60 backdrop-blur-[2px]"></div>
                    
                    {/* Perforated line separating sections */}
                    <div className="absolute left-1/3 top-0 bottom-0 w-6 transform -translate-x-1/2 z-20">
                      {/* Top half circle */}
                      <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 w-18 h-18 bg-[var(--color-background)] rounded-full"></div>
                      
                      {/* Perforated dots */}
                      <div className="h-full flex flex-col items-center justify-center space-y-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                          <div 
                            key={i} 
                            className="w-4 h-4 bg-[var(--color-background)] rounded-full"
                          />
                        ))}
                      </div>
                      
                      {/* Bottom half circle */}
                      <div className="absolute -bottom-9 left-1/2 transform -translate-x-1/2 w-18 h-18 bg-[var(--color-background)] rounded-full"></div>
                    </div>
                    
                    {/* Left side - QR Code only */}
                    <div className="w-1/3 p-8 flex flex-col justify-center items-center relative z-10">
                      <div className="text-center">
                        <h3 className="text-white text-lg font-bold mb-8 tracking-wide">
                          MÃ QR CỦA BẠN
                        </h3>
                        
                        {/* QR Code */}
                        <div className="rounded-lg shadow-lg inline-block">
                          <img 
                            src={paymentData.qrcode}
                            alt="QR Code"
                            className="w-60 h-60 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.src = `https://api.qrserver.com/v1/create-qr-code/?size=208x208&data=BOOKING_${searchParams.get('booking')}`;
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Right side - Movie info and poster */}
                    <div className="w-2/3 p-8 flex items-center relative z-10">
                      <div className="w-full flex items-center gap-8">
                        {/* Booking Information */}
                        <div className="flex-1 space-y-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-white/20 pb-3">
                              <span className="text-white/80 text-lg">Người đặt</span>
                              <span className="text-white font-bold text-lg">NGUYỄN DUY AN</span>
                            </div>
                            
                            <div className="flex justify-between items-center border-b border-white/20 pb-3">
                              <span className="text-white/80 text-lg">Rạp</span>
                              <span className="text-white font-bold text-right text-lg">{paymentData.theaterName}</span>
                            </div>
                            
                            <div className="flex justify-between items-center border-b border-white/20 pb-3">
                              <span className="text-white/80 text-lg">Phim</span>
                              <span className="text-white font-bold text-right text-lg">{paymentData.movieName}</span>
                            </div>
                            
                            <div className="flex justify-between items-center border-b border-white/20 pb-3">
                              <span className="text-white/80 text-lg">Suất chiếu</span>
                              <span className="text-white font-bold text-lg">
                                {formatDateTime(paymentData.showtime).time} {formatDateTime(paymentData.showtime).date}
                              </span>
                            </div>
                            
                            <div className="flex justify-between items-center border-b border-white/20 pb-3">
                              <span className="text-white/80 text-lg">Số vé</span>
                              <span className="text-white font-bold text-2xl">{paymentData.seatNumbers.length}</span>
                            </div>

                            <div className="flex justify-between items-center border-b border-white/20 pb-3">
                              <span className="text-white/80 text-lg">Ghế</span>
                              <span className="text-white font-bold text-lg">{paymentData.seatNumbers.join(', ')}</span>
                            </div>
                          </div>
                          
                          {/* Buttons */}
                          <div className="flex gap-4 mt-8">
                            <button 
                              onClick={() => window.location.href = '/'}
                              className="bg-[var(--color-secondary)] hover:bg-[var(--color-accent)] text-white px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105"
                            >
                              VỀ TRANG CHỦ
                            </button>
                            <button className="bg-[var(--color-accent)] hover:bg-[var(--color-secondary)] text-white px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105">
                              LƯU ẢNH
                            </button>
                          </div>
                        </div>
                        
                        {/* Movie Poster */}
                        <div className="flex-shrink-0">
                          <img 
                            src={paymentData.image}
                            alt={paymentData.movieName}
                            className="w-72 h-96 object-cover rounded-lg shadow-2xl border-4 border-white/20"
                            onError={(e) => {
                              e.currentTarget.src = "https://image.tmdb.org/t/p/w300/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg";
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Error Page with Animation
            <div className="text-center flex flex-col items-center justify-center min-h-screen">
              {/* Failure Animation */}
              <div className="mb-8">
                <div className="relative inline-block mb-6">
                  {/* Animated X mark */}
                  <div className="w-32 h-32 mx-auto relative">
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                    <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="relative w-32 h-32 bg-red-500 rounded-full flex items-center justify-center shadow-2xl">
                      <svg 
                        className="w-16 h-16 text-white" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={3} 
                          d="M6 18L18 6M6 6l12 12" 
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <h1 className="text-4xl text-white font-bold mb-4">
                  THANH TOÁN THẤT BẠI
                </h1>
                <p className="text-xl text-white/80 mb-8">
                  Đã xảy ra lỗi trong quá trình thanh toán
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => window.history.back()}
                  className="bg-[var(--color-secondary)] hover:bg-[var(--color-accent)] text-white px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105"
                >
                  THỬ LẠI
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="bg-[var(--color-accent)] hover:bg-[var(--color-secondary)] text-white px-8 py-3 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
                >
                  <span>VỀ TRANG CHỦ</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
