import {
    Armchair,
    Crown,
    Grid,
    Heart,
    Monitor,
    Plus,
    Save,
    Trash2,
    X,
    Zap
} from 'lucide-react';
import React, { useCallback, useState } from 'react';

export type SeatType = 'regular' | 'vip' | 'couple' | 'disabled' | 'blocked';

export interface Seat {
  id: string;
  row: number;
  column: number;
  type: SeatType;
  label: string;
  isAvailable: boolean;
}

interface SeatLayoutDesignerProps {
  open: boolean;
  roomName: string;
  initialSeats?: Seat[];
  maxRows?: number;
  maxColumns?: number;
  onSave: (seats: Seat[]) => void;
  onClose: () => void;
}

const SeatLayoutDesigner: React.FC<SeatLayoutDesignerProps> = ({
  open,
  roomName,
  initialSeats = [],
  maxRows = 20,
  maxColumns = 20,
  onSave,
  onClose,
}) => {
  const [seats, setSeats] = useState<Seat[]>(initialSeats);
  const [selectedTool, setSelectedTool] = useState<SeatType>('regular');
  const [gridSize, setGridSize] = useState({ rows: 10, columns: 12 });
  const [isDragging, setIsDragging] = useState(false);

  const findSeat = useCallback((row: number, column: number): Seat | undefined => {
    return seats.find(seat => seat.row === row && seat.column === column);
  }, [seats]);

  const generateSeatLabel = useCallback((row: number, column: number): string => {
    const rowLetter = String.fromCharCode(65 + row); // A, B, C...
    return `${rowLetter}${column + 1}`;
  }, []);

  const addSeat = useCallback((row: number, column: number, type: SeatType) => {
    const existingSeat = findSeat(row, column);
    if (existingSeat) {
      // Update existing seat
      setSeats(prev => prev.map(seat => 
        seat.row === row && seat.column === column 
          ? { ...seat, type }
          : seat
      ));
    } else {
      // Add new seat
      const newSeat: Seat = {
        id: `${row}-${column}`,
        row,
        column,
        type,
        label: generateSeatLabel(row, column),
        isAvailable: true
      };
      setSeats(prev => [...prev, newSeat]);
    }
  }, [findSeat, generateSeatLabel]);

  const removeSeat = useCallback((row: number, column: number) => {
    setSeats(prev => prev.filter(seat => !(seat.row === row && seat.column === column)));
  }, []);

  if (!open) return null;

  const getSeatIcon = (type: SeatType) => {
    switch (type) {
      case 'regular': return '💺';
      case 'vip': return '👑';
      case 'couple': return '❤️';
      case 'disabled': return '♿';
      case 'blocked': return '❌';
      default: return '💺';
    }
  };

  const getSeatColor = (type: SeatType) => {
    switch (type) {
      case 'regular': return 'bg-blue-200 hover:bg-blue-300 border-blue-400';
      case 'vip': return 'bg-yellow-200 hover:bg-yellow-300 border-yellow-400';
      case 'couple': return 'bg-pink-200 hover:bg-pink-300 border-pink-400';
      case 'disabled': return 'bg-green-200 hover:bg-green-300 border-green-400';
      case 'blocked': return 'bg-gray-300 hover:bg-gray-400 border-gray-500';
      default: return 'bg-gray-100 hover:bg-gray-200 border-gray-300';
    }
  };

  const getToolIcon = (type: SeatType) => {
    switch (type) {
      case 'regular': return <Armchair className="w-4 h-4" />;
      case 'vip': return <Crown className="w-4 h-4" />;
      case 'couple': return <Heart className="w-4 h-4" />;
      case 'disabled': return <Zap className="w-4 h-4" />;
      case 'blocked': return <X className="w-4 h-4" />;
      default: return <Armchair className="w-4 h-4" />;
    }
  };

  const handleCellClick = (row: number, column: number) => {
    const existingSeat = findSeat(row, column);
    
    if (selectedTool === 'blocked' && !existingSeat) {
      // Don't add blocked seats, just ignore
      return;
    }
    
    if (existingSeat) {
      if (selectedTool === 'blocked') {
        removeSeat(row, column);
      } else {
        addSeat(row, column, selectedTool);
      }
    } else {
      addSeat(row, column, selectedTool);
    }
  };

  const handleMouseDown = (row: number, column: number) => {
    setIsDragging(true);
    handleCellClick(row, column);
  };

  const handleMouseEnter = (row: number, column: number) => {
    if (isDragging) {
      handleCellClick(row, column);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const clearLayout = () => {
    setSeats([]);
  };

  const generateAutoLayout = () => {
    const newSeats: Seat[] = [];
    const { rows, columns } = gridSize;
    
    // Auto-generate a typical cinema layout
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        // Skip middle aisle
        if (col === Math.floor(columns / 2)) continue;
        
        // Last 2 rows are VIP
        const isVipRow = row >= rows - 2;
        // Couple seats on sides for VIP rows
        const isCouplePosition = isVipRow && (col <= 1 || col >= columns - 2);
        
        let seatType: SeatType;
        if (isCouplePosition) {
          seatType = 'couple';
        } else if (isVipRow) {
          seatType = 'vip';
        } else {
          seatType = 'regular';
        }
        
        newSeats.push({
          id: `${row}-${col}`,
          row,
          column: col,
          type: seatType,
          label: generateSeatLabel(row, col),
          isAvailable: true
        });
      }
    }
    
    setSeats(newSeats);
  };

  const getSeatStats = () => {
    const stats = {
      regular: 0,
      vip: 0,
      couple: 0,
      disabled: 0,
      total: 0
    };
    
    seats.forEach(seat => {
      if (seat.type !== 'blocked') {
        stats[seat.type]++;
        stats.total++;
      }
    });
    
    return stats;
  };

  const stats = getSeatStats();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden z-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-600 text-white">
                <Grid className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-purple-600">
                  Thiết kế bố cục ghế ngồi
                </h2>
                <p className="text-sm text-purple-500">
                  {roomName} - Kéo thả để vẽ, click để thêm/sửa ghế
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-lg">
                Tổng: {stats.total} ghế
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-purple-200 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5 text-purple-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(88vh-100px)]">
          {/* Toolbar */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Grid Size Controls */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Grid className="w-4 h-4" />
                  Kích thước lưới
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Số hàng</label>
                    <input
                      type="range"
                      min="5"
                      max={maxRows}
                      value={gridSize.rows}
                      onChange={(e) => setGridSize(prev => ({ ...prev, rows: parseInt(e.target.value) }))}
                      className="w-full mt-1"
                    />
                    <div className="text-xs text-gray-500 text-center">{gridSize.rows}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Số cột</label>
                    <input
                      type="range"
                      min="6"
                      max={maxColumns}
                      value={gridSize.columns}
                      onChange={(e) => setGridSize(prev => ({ ...prev, columns: parseInt(e.target.value) }))}
                      className="w-full mt-1"
                    />
                    <div className="text-xs text-gray-500 text-center">{gridSize.columns}</div>
                  </div>
                </div>
              </div>

              {/* Seat Tools */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-3">Công cụ vẽ</h3>
                <div className="space-y-2">
                  {(['regular', 'vip', 'couple', 'disabled', 'blocked'] as SeatType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedTool(type)}
                      className={`w-full p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${
                        selectedTool === type
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {getToolIcon(type)}
                      <span className="text-lg">{getSeatIcon(type)}</span>
                      <span className="text-sm font-medium capitalize">
                        {type === 'regular' ? 'Thường' :
                         type === 'vip' ? 'VIP' :
                         type === 'couple' ? 'Đôi' :
                         type === 'disabled' ? 'Khuyết tật' : 'Xóa/Chặn'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-3">Thao tác nhanh</h3>
                <div className="space-y-2">
                  <button
                    onClick={generateAutoLayout}
                    className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Tạo bố cục tự động
                  </button>
                  <button
                    onClick={clearLayout}
                    className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa tất cả
                  </button>
                </div>
              </div>

              {/* Statistics */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-3">Thống kê</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>💺 Ghế thường:</span>
                    <span className="font-medium">{stats.regular}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>👑 Ghế VIP:</span>
                    <span className="font-medium">{stats.vip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>❤️ Ghế đôi:</span>
                    <span className="font-medium">{stats.couple}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>♿ Khuyết tật:</span>
                    <span className="font-medium">{stats.disabled}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Tổng cộng:</span>
                    <span>{stats.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Layout Grid */}
          <div className="flex-1 p-6 overflow-auto bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="space-y-6 flex flex-col items-center">
              {/* Screen */}
              <div className="text-center">
                <div className="bg-gray-800 text-white py-4 px-8 rounded-xl inline-flex items-center gap-3 shadow-lg">
                  <Monitor className="w-6 h-6" />
                  <span className="text-lg font-bold">MÀN HÌNH CHIẾU</span>
                </div>
              </div>

              {/* Seat Grid */}
              <div 
                className="inline-block bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200"
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div 
                  className="grid gap-1"
                  style={{ 
                    gridTemplateColumns: `repeat(${gridSize.columns}, 1fr)`,
                    gridTemplateRows: `repeat(${gridSize.rows}, 1fr)`
                  }}
                >
                  {Array.from({ length: gridSize.rows * gridSize.columns }).map((_, index) => {
                    const row = Math.floor(index / gridSize.columns);
                    const column = index % gridSize.columns;
                    const seat = findSeat(row, column);
                    
                    return (
                      <div
                        key={`${row}-${column}`}
                        className={`w-8 h-8 border-2 rounded cursor-pointer transition-all duration-150 flex items-center justify-center text-xs select-none ${
                          seat 
                            ? getSeatColor(seat.type)
                            : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                        }`}
                        onMouseDown={() => handleMouseDown(row, column)}
                        onMouseEnter={() => handleMouseEnter(row, column)}
                        title={seat ? `${seat.label} - ${seat.type}` : `${generateSeatLabel(row, column)} - Trống`}
                      >
                        {seat && (
                          <span className="text-xs">
                            {getSeatIcon(seat.type)}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Row Labels */}
                <div className="flex justify-between mt-4 text-sm text-gray-500">
                  <span>Hàng A → {String.fromCharCode(65 + gridSize.rows - 1)}</span>
                  <span>Cột 1 → {gridSize.columns}</span>
                </div>
              </div>

              {/* Legend */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-3">Chú thích</h4>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-200 border border-blue-400 rounded flex items-center justify-center">💺</div>
                    <span className="text-sm">Ghế thường</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-200 border border-yellow-400 rounded flex items-center justify-center">👑</div>
                    <span className="text-sm">Ghế VIP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-pink-200 border border-pink-400 rounded flex items-center justify-center">❤️</div>
                    <span className="text-sm">Ghế đôi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-200 border border-green-400 rounded flex items-center justify-center">♿</div>
                    <span className="text-sm">Khuyết tật</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-50 border border-gray-200 rounded"></div>
                    <span className="text-sm">Trống</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              💡 Kéo thả để vẽ nhiều ghế cùng lúc, click để thêm/sửa từng ghế
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => onSave(seats)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Lưu bố cục ({stats.total} ghế)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatLayoutDesigner;
