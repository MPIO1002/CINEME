import axios from 'axios';
import { useEffect, useMemo, useState } from 'react';

// Định nghĩa kiểu dữ liệu cho một ghế
interface Seat {
  seatNumber: string;
  seatType: 'STANDARD' | 'VIP' | 'COUPLE';
  status: 'AVAILABLE' | 'BOOKED' | 'RESERVED';
}

// Cập nhật props để điều khiển dialog
interface SeatLayoutProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
  onSeatsSelected?: (selectedSeats: Seat[]) => void;
}

type GroupedSeats = Record<string, Seat[]>;

const SeatLayout = ({
  roomId = "b12d4066-d85a-47d0-b2b3-002211001666",
  isOpen,
  onClose,
  onSeatsSelected
}: SeatLayoutProps) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Chỉ fetch dữ liệu khi dialog được mở
    if (!isOpen) {
      return;
    }

    const fetchSeats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<{ statusCode: number; message: string; data: Seat[] }>(
          `http://localhost:8080/api/v1/rooms/${roomId}/seats`
        );
        if (response.data && response.data.data) {
          setSeats(response.data.data);
        } else {
          setError("Failed to fetch seat data.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeats();
  }, [roomId, isOpen]); // Thêm isOpen vào dependency array

  // Gọi callback khi danh sách ghế thay đổi
  useEffect(() => {
    onSeatsSelected?.(selectedSeats);
  }, [selectedSeats, onSeatsSelected]);

  const groupedSeats = useMemo(() => {
    return seats.reduce((acc, seat) => {
      const row = seat.seatNumber.charAt(0);
      if (!acc[row]) acc[row] = [];
      acc[row].push(seat);
      return acc;
    }, {} as GroupedSeats);
  }, [seats]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status !== 'AVAILABLE') return;
    setSelectedSeats((prev) =>
      prev.some(s => s.seatNumber === seat.seatNumber)
        ? prev.filter(s => s.seatNumber !== seat.seatNumber)
        : [...prev, seat]
    );
  };

  const getSeatClassName = (seat: Seat) => {
    const isSelected = selectedSeats.some(s => s.seatNumber === seat.seatNumber);
    const baseClasses = 'w-6 h-6 sm:w-7 sm:h-7 m-1 rounded flex items-center justify-center text-[10px] sm:text-xs font-bold transition-colors duration-200';

    if (seat.status !== 'AVAILABLE') return `${baseClasses} bg-gray-600 text-gray-400 cursor-not-allowed`;
    if (isSelected) return `${baseClasses} bg-green-500 text-white cursor-pointer ring-2 ring-green-300`;
    if (seat.seatType === 'VIP') return `${baseClasses} bg-yellow-500 hover:bg-yellow-400 text-gray-900 cursor-pointer`;
    if (seat.seatType === 'COUPLE') return `${baseClasses} bg-pink-500 hover:bg-pink-400 text-white cursor-pointer`;
    return `${baseClasses} bg-gray-400 hover:bg-gray-300 text-gray-900 cursor-pointer`;
  };

  // Không render gì nếu dialog không mở
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      aria-labelledby="seat-dialog-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/75 transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      ></div>

      {/* Dialog Panel */}
      <div className="relative z-10 bg-gray-900 text-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] flex flex-col">
        {/* Dialog Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
          <h2 id="seat-dialog-title" className="text-lg sm:text-xl font-bold">Chọn Ghế</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Main Content (Scrollable) */}
        <div className="p-4 flex-grow overflow-y-auto">
          {isLoading ? (
            <div className="text-center p-10">Loading seats...</div>
          ) : error ? (
            <div className="text-center p-10 text-red-500">Error: {error}</div>
          ) : (
            <div className="flex flex-col items-center">
              {/* Màn hình */}
              <div className="w-full max-w-md h-2 bg-white mb-2 shadow-lg shadow-white/30" style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 5% 100%)' }}></div>
              <p className="text-gray-400 text-sm mb-6">Màn hình</p>

              {/* Sơ đồ ghế */}
              <div className="flex flex-col gap-1 sm:gap-2">
                {Object.keys(groupedSeats).sort().map(row => (
                  <div key={row} className="flex items-center gap-1 sm:gap-2">
                    <div className="w-6 text-center font-bold text-gray-400 text-sm">{row}</div>
                    <div className="flex justify-center">
                      {groupedSeats[row].map(seat => (
                        <div
                          key={seat.seatNumber}
                          className={getSeatClassName(seat)}
                          onClick={() => handleSeatClick(seat)}
                        >
                          {seat.seatNumber.substring(1)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chú thích */}
              <div className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gray-400"></div><span>Thường</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-yellow-500"></div><span>VIP</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-pink-500"></div><span>Ghế đôi</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-green-500"></div><span>Đang chọn</span></div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-gray-600"></div><span>Đã đặt</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Dialog Footer */}
        <div className="p-4 border-t border-gray-700 flex-shrink-0">
          <div className="mb-2">
            <h3 className="text-base font-bold">Ghế đã chọn:</h3>
            <div className="h-12 overflow-y-auto bg-gray-800 p-2 rounded mt-1">
              {selectedSeats.length > 0 ? (
                <p className="text-green-400 font-mono text-sm">
                  {selectedSeats.map(s => s.seatNumber).join(', ')}
                </p>
              ) : (
                <p className="text-gray-500 text-sm">Vui lòng chọn ghế</p>
              )}
            </div>
          </div>
          <button
            className="w-full bg-yellow-500 text-gray-900 font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-gray-500 cursor-pointer disabled:cursor-not-allowed"
            disabled={selectedSeats.length === 0}
            onClick={onClose} // Tạm thời đóng dialog, bạn có thể thay bằng hàm xử lý đặt vé
          >
            Xác nhận ({selectedSeats.length} ghế)
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;