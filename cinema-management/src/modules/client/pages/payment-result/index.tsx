import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, Home } from 'lucide-react';
import { useToast } from '../../../../hooks/useToast';


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
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentResultData | null>(null);
  const hasShownToast = useRef(false);

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
              if (!hasShownToast.current) {
                showToast('success', 'Thanh toán thành công! Chúc bạn xem phim vui vẻ!', 5000);
                hasShownToast.current = true;
              }
            } else {
              console.log('API returned error:', result.message);
              setIsSuccess(false);
              if (!hasShownToast.current) {
                showToast('error', 'Không thể lấy thông tin vé. Vui lòng liên hệ hỗ trợ!');
                hasShownToast.current = true;
              }
            }
          } else {
            console.log('Failed to fetch booking info:', response.status, response.statusText);
            setIsSuccess(false);
            if (!hasShownToast.current) {
              showToast('error', 'Không thể kết nối đến máy chủ. Vui lòng thử lại!');
              hasShownToast.current = true;
            }
          }
        } else {
          console.log('Payment failed or missing booking ID');
          setIsSuccess(false);
          if (!hasShownToast.current) {
            showToast('error', 'Thanh toán thất bại!');
            hasShownToast.current = true;
          }
        }
      } catch (error) {
        console.log('Error fetching booking info:', error);
        setIsSuccess(false);
        if (!hasShownToast.current) {
          showToast('error', 'Đã xảy ra lỗi không mong muốn. Vui lòng liên hệ hỗ trợ!');
          hasShownToast.current = true;
        }
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
          <div className="flex flex-col items-center justify-center min-h-screen">
            {/* Movie Ticket Design */}
            <div className="relative overflow-hidden rounded-3xl max-w-6xl w-full mx-auto mb-8">
              <div 
                className="relative min-h-[500px] flex"
                style={{
                  background: isSuccess 
                    ? (paymentData ? `url('${paymentData.image}')` : 'var(--color-secondary)')
                    : '#fca5a5', // red-300
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundBlendMode: 'overlay'
                }}
              >
                {/* Additional dark overlay for dimmer background */}
                <div className={`absolute inset-0 backdrop-blur-[2px] ${
                  isSuccess ? 'bg-[var(--color-background)]/80' : 'bg-red-900/60'
                }`}></div>
                
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
                
                {/* Left side - QR Code or Error Message */}
                <div className="w-1/3 p-8 flex flex-col justify-center items-center relative z-10">
                  <div className="text-center">
                    {isSuccess ? (
                      <>
                        <h3 className="text-white text-lg font-bold mb-8 tracking-wide">
                          MÃ QR CỦA BẠN
                        </h3>
                        
                        {/* QR Code */}
                        <div className="rounded-lg shadow-lg inline-block">
                          <img 
                            src={paymentData?.qrcode}
                            alt="QR Code"
                            className="w-60 h-60 object-cover rounded-lg"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <div className="w-32 h-32 mx-auto mb-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                          <XCircle className="w-16 h-16 text-white animate-bounce" />
                        </div>
                        <h3 className="text-white text-2xl font-bold mb-4">
                          THANH TOÁN THẤT BẠI
                        </h3>
                        <p className="text-gray-300 text-lg">
                          Đã xảy ra lỗi trong quá trình thanh toán
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right side - Movie info and details */}
                <div className="w-2/3 p-8 flex items-center relative z-10">
                  <div className="w-full flex items-center gap-8">
                    {/* Booking Information */}
                    <div className="flex-1 space-y-6">
                      {isSuccess && paymentData ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center border-b border-white/20 pb-3">
                            <span className="text-white/80 text-lg">Người đặt</span>
                            <span className="text-white font-bold text-lg">KHÁCH HÀNG</span>
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
                      ) : (
                        <div className="space-y-4 text-center">
                          <h2 className="text-3xl font-bold text-white mb-4">
                            Oops! Có vấn đề xảy ra
                          </h2>
                          <p className="text-gray-300 text-lg mb-8">
                            Không thể xử lý thanh toán của bạn. Vui lòng thử lại hoặc liên hệ hỗ trợ khách hàng.
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Movie Poster - only show on success */}
                    {isSuccess && paymentData && (
                      <div className="flex-shrink-0">
                        <img 
                          src={paymentData.image}
                          alt={paymentData.movieName}
                          className="w-72 h-96 object-cover rounded-lg shadow-2xl border-4 border-white/20"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
