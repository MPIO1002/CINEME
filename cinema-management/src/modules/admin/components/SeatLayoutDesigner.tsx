import {
    Armchair,
    Crown,
    Grid,
    Heart,
    Monitor,
    Plus,
    Save,
    Square,
    Trash2,
    X,
    Zap
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState, type JSX } from 'react';
import type { Seat } from '../../../services/roomApi';

interface SeatLayoutDesignerProps {
  open: boolean;
  roomName: string;
  initialSeats?: Seat[];
  maxRows?: number;
  maxColumns?: number;
  onSave: (seats: Seat[], columnCount: number, rowCount: number, coupleSeatQuantity: number) => void;
  onClose: () => void;
}

const SeatLayoutDesigner: React.FC<SeatLayoutDesignerProps> = ({
  open,
  roomName,
  initialSeats = [],
  maxRows = 20,
  maxColumns = 30,
  onSave,
  onClose,
}) => {
  const [seats, setSeats] = useState<Seat[]>(initialSeats);
  const [selectedTool, setSelectedTool] = useState<string>('Standard');
  const [gridSize, setGridSize] = useState({ rows: 10, columns: 12 });
  const [isDragging, setIsDragging] = useState(false);
  const [coupleSeatQuantity, setCoupleSeatQuantity] = useState<number>(0);
  const initialCoupleCountRef = useRef<number>(0);

  // Auto-adjust grid size and initialize couple count
  useEffect(() => {
    if (initialSeats.length > 0) {
      const maxRow = Math.max(...initialSeats.map(seat => seat.row ?? 0)) + 1;
      const maxCol = Math.max(...initialSeats.map(seat => seat.column ?? 0)) + 1;
      const coupleCount = initialSeats.filter(s => s.seatType === 'Couple').length; // Đếm số seats Couple (1 seat/cặp theo API)

      setGridSize({
        rows: Math.max(maxRow, 5),
        columns: Math.max(maxCol, 6),
      });
      console.log("Initial seats: ", initialSeats);
      setSeats(initialSeats);
      setCoupleSeatQuantity(coupleCount); // Set đúng số seats Couple ban đầu (số cặp)
      initialCoupleCountRef.current = coupleCount;
    }
  }, [initialSeats]);

  const listSeatsType = [
    { id: '217c7f69-2127-406e-9af6-e07e1358491c', seatType: 'VIP'},
    { id: 'standardId', seatType: 'Standard'},
    { id: 'coupleId', seatType: 'Couple'},
    { id: 'disabledId', seatType: 'Disabled'},
  ]
  // Render couple seats only when coupleSeatQuantity changes
  useEffect(() => {
    const lastRow = gridSize.rows - 1;
    if (coupleSeatQuantity !== initialCoupleCountRef.current) {
      // Xóa couple seats cũ ở last row
      setSeats(prev => prev.filter(seat => !(seat.row === lastRow && seat.seatType === 'Couple')));

      // Thêm couple seats mới, mỗi cặp là 1 seat
      const newCoupleSeats: Seat[] = [];
      const maxCouples = Math.floor(gridSize.columns / 2); // Số cặp tối đa
      const coupleCount = Math.min(coupleSeatQuantity, maxCouples);

      for (let i = 0; i < coupleCount; i++) {
        const col = i * 2; // Cột đầu tiên của cặp
        newCoupleSeats.push({
          id: listSeatsType.find(type => type.seatType === 'Couple')?.id || '',
          color: '#ec2f96',
          row: lastRow,
          column: col,
          seatType: 'Couple',
          seatNumber: `${String.fromCharCode(65 + lastRow)}${col + 1}+${String.fromCharCode(65 + lastRow)}${col + 2}`,
          status: 'AVAILABLE',
        });
      }

      setSeats(prev => [...prev, ...newCoupleSeats]);
    }
  }, [coupleSeatQuantity, gridSize]);

  const findSeat = useCallback((row: number, column: number): Seat | undefined => {
    return seats.find(seat => seat.row === row && seat.column === column);
  }, [seats]);

  const generateSeatNumber = useCallback((row: number, column: number, seatType: string): string => {
    if (seatType === 'Empty') {
      return `W_${String.fromCharCode(65 + row)}${column + 1}`;
    }
    const rowLetter = String.fromCharCode(65 + row);
    return `${rowLetter}${column + 1}`;
  }, []);

  const addSeat = useCallback((row: number, column: number, seatType: string, color: string) => {
    const existingSeat = findSeat(row, column);
    if (existingSeat) {
      setSeats(prev => prev.map(seat =>
        seat.row === row && seat.column === column
          ? { ...seat, seatType, seatNumber: generateSeatNumber(row, column, seatType), color }
          : seat
      ));
    } else {
      const newSeat: Seat = {
        id: listSeatsType.find(type => type.seatType === seatType)?.id || '',
        color,
        row,
        column,
        seatType,
        seatNumber: generateSeatNumber(row, column, seatType),
        status: 'AVAILABLE',
      };
      setSeats(prev => [...prev, newSeat]);
    }
  }, [findSeat, generateSeatNumber, listSeatsType]);

  const removeSeat = useCallback((row: number, column: number) => {
    setSeats(prev => prev.filter(seat => !(seat.row === row && seat.column === column)));
  }, []);

  const handleCellClick = (row: number, column: number) => {
    if (selectedTool === 'Standard' || selectedTool === 'VIP') {
      for (let col = 0; col < gridSize.columns; col++) {
        addSeat(row, col, selectedTool, selectedTool === 'Standard' ? '#722ed1' : '#f5222d');
      }
    } else if (selectedTool !== 'Couple') {
      const existingSeat = findSeat(row, column);
      if (selectedTool === 'Blocked' && existingSeat) {
        removeSeat(row, column);
        return;
      }
      addSeat(row, column, selectedTool, selectedTool === 'Disabled' ? 'blue' : selectedTool === 'Empty' ? 'transparent' : '#722ed1');
    }
  };

  const handleMouseDown = (row: number, column: number) => {
    setIsDragging(true);
    handleCellClick(row, column);
  };

  const handleMouseEnter = (row: number, column: number) => {
    if (isDragging && selectedTool !== 'Standard' && selectedTool !== 'VIP' && selectedTool !== 'Couple') {
      handleCellClick(row, column);
    }
  };
  if(!open) return null;
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const clearLayout = () => {
    setSeats([]);
    setCoupleSeatQuantity(0);
  };

  const generateAutoLayout = () => {
    const newSeats: Seat[] = [];
    const { rows, columns } = gridSize;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const centerAisle = Math.floor(columns / 2);
        if (col === centerAisle || col === centerAisle - 1) {
          newSeats.push({
            id: `${row}-${col}`,
            color: 'blue',
            row,
            column: col,
            seatType: 'Empty',
            seatNumber: `W_${String.fromCharCode(65 + row)}${col + 1}`,
            status: 'BLOCKED',
          });
          continue;
        }
        
        const isVipRow = row >= rows - 2 && row < rows - 1;
        const seatType: string = isVipRow ? 'VIP' : 'Standard';
        
        newSeats.push({
          id: listSeatsType.find(type => type.seatType === seatType)?.id || '',
          color: isVipRow ? '#f5222d' : '#722ed1',
          row,
          column: col,
          seatType,
          seatNumber: generateSeatNumber(row, col, seatType),
          status: 'AVAILABLE',
        });
      }
    }
    
    setSeats(newSeats);
  };

  const getSeatStats = () => {
    const stats = {
      Standard: 0,
      VIP: 0,
      Couple: 0,
      Disabled: 0,
      Empty: 0,
      total: 0
    };
    
    seats.forEach(seat => {
      if (seat.seatType !== 'Blocked' && seat.seatType !== 'Empty') {
        if (seat.seatType === 'Standard' || seat.seatType === 'VIP' || seat.seatType === 'Disabled' || seat.seatType === 'Couple') {
          stats[seat.seatType]++;
          stats.total++;
        } else if (seat.seatType === undefined) {
        stats.Empty++;
        }
      }
    });
    
    return stats;
  };

  const getSeatIcon = (type: string) => {
    if(!type) return '⬜';
    switch (type.toUpperCase()) {
      case 'STANDARD': return '💺';
      case 'VIP': return '👑';
      case 'COUPLE': return '❤️';
      case 'DISABLED': return '♿';
      case 'BLOCKED': return '❌';
      case 'EMPTY': return '⬜';
      default: return '💺';
    }
  };

  const getSeatColor = (type: string) => {
    if (!type) return 'bg-white hover:bg-gray-50 border-gray-300 border-dashed';
    switch (type.toUpperCase()) {
      case 'STANDARD': return 'bg-gray-300 border-gray-400 text-gray-800';
      case 'VIP': return 'bg-yellow-200 hover:bg-yellow-300 border-yellow-400';
      case 'COUPLE': return 'bg-pink-200 hover:bg-pink-300 border-pink-400';
      case 'DISABLED': return 'bg-blue-300 border-blue-400 text-blue-800';
      case 'BLOCKED': return 'bg-gray-300 hover:bg-gray-400 border-gray-500';
      case 'EMPTY': return 'bg-white hover:bg-gray-50 border-gray-300 border-dashed';
      default: return 'bg-gray-300 border-gray-400 text-gray-800';
    }
  };

  const getToolIcon = (type: string) => {
    if (!type) return <Square className="w-4 h-4" />;
    switch (type.toUpperCase()) {
      case 'STANDARD': return <Armchair className="w-4 h-4" />;
      case 'VIP': return <Crown className="w-4 h-4" />;
      case 'COUPLE': return <Heart className="w-4 h-4" />;
      case 'DISABLED': return <Zap className="w-4 h-4" />;
      case 'BLOCKED': return <X className="w-4 h-4" />;
      case 'EMPTY': return <Square className="w-4 h-4" />;
      default: return <Armchair className="w-4 h-4" />;
    }
  };

  const stats = getSeatStats();

    // Hàm thu thập dữ liệu layout
    const getLayoutData = () => {
        const specialSeats: { [key: string]: string } = {};
        seats.forEach(seat => {
        if (seat.seatType === 'VIP' || seat.seatType === 'Disabled') {
            specialSeats[seat.id] = seat.seatType; // Gán loại ghế làm value
        }
        });

        const walkways = seats
        .filter(seat => seat.seatType === 'Empty' || seat.seatType === 'Blocked')
        .map(seat => ({ columnIndex: seat.column, rowIndex: seat.row }));

        return {
        col: gridSize.columns,
        row: gridSize.rows,
        specialSeats,
        walkways,
        coupleSeatQuantity,
        };
    };
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
                  {roomName} - Click để thêm dãy, nhập số ghế đôi, kéo thả cho lối đi
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
                      onChange={(e) => {
                        const newRows = parseInt(e.target.value);
                        setGridSize(prev => ({ ...prev, rows: newRows }));
                        setSeats(prevSeats => prevSeats.filter(seat => (seat.row ?? 0) < newRows));
                      }}
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
                      onChange={(e) => {
                        const newColumns = parseInt(e.target.value);
                        setGridSize(prev => ({ ...prev, columns: newColumns }));
                        setSeats(prevSeats => prevSeats.filter(seat => (seat.column ?? 0) < newColumns));
                        setCoupleSeatQuantity(prev => Math.min(prev, Math.floor(newColumns / 2)));
                      }}
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
                  {(['Standard', 'VIP', 'Disabled', 'Empty', 'Blocked'] as const).map(type => (
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
                        {type === 'Standard' ? 'Thường' :
                         type === 'VIP' ? 'VIP' :
                         type === 'Disabled' ? 'Khuyết tật' :
                         type === 'Empty' ? 'Khoảng trống' : 'Xóa/Chặn'}
                      </span>
                    </button>
                  ))}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedTool('Couple')}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${
                        selectedTool === 'Couple'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {getToolIcon('Couple')}
                      <span className="text-lg">{getSeatIcon('Couple')}</span>
                      <span className="text-sm font-medium">Đôi</span>
                    </button>
                    <input
                      type="number"
                      min="0"
                      max={Math.floor(gridSize.columns / 2)}
                      value={coupleSeatQuantity}
                      onChange={(e) => setCoupleSeatQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 h-14 p-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="Số cặp"
                    />
                  </div>
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
                    <span className="font-medium">{stats.Standard}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>👑 Ghế VIP:</span>
                    <span className="font-medium">{stats.VIP}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>❤️ Ghế đôi:</span>
                    <span className="font-medium">{stats.Couple} cặp</span>
                  </div>
                  <div className="flex justify-between">
                    <span>♿ Khuyết tật:</span>
                    <span className="font-medium">{stats.Disabled}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>⬜ Khoảng trống:</span>
                    <span className="font-medium">{stats.Empty}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Tổng ghế:</span>
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
                  {(() => {
                    const elems: JSX.Element[] = [];
                    for (let row = 0; row < gridSize.rows; row++) {
                      for (let column = 0; column < gridSize.columns; column++) {
                        const seat = findSeat(row, column);

                        // If this column is the start of a couple seat, render it spanning 2 columns
                        if (seat?.seatType === 'Couple') {
                          elems.push(
                            <div
                              key={`${row}-${column}`}
                              className={`w-17 h-8 border-2 rounded cursor-pointer transition-all duration-150 flex items-center justify-center text-xs select-none ${getSeatColor(seat.seatType ?? '')}`}
                              style={{ gridColumn: `${column + 1} / span 2` }}
                              onMouseDown={() => handleMouseDown(row, column)}
                              onMouseEnter={() => handleMouseEnter(row, column)}
                              title={`${seat.seatNumber} - ${seat.seatType}`}
                            >
                              <span className="text-xs">{getSeatIcon(seat.seatType)}</span>
                            </div>
                          );
                          // Skip the next column because couple occupies two columns
                          column++;
                          continue;
                        }

                        elems.push(
                          <div
                            key={`${row}-${column}`}
                            className={`w-8 h-8 border-2 rounded cursor-pointer transition-all duration-150 flex items-center justify-center text-xs select-none ${
                              seat ? getSeatColor(seat.seatType ?? '') : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                            }`}
                            onMouseDown={() => handleMouseDown(row, column)}
                            onMouseEnter={() => handleMouseEnter(row, column)}
                            title={seat ? `${seat.seatNumber} - ${seat.seatType}` : `${generateSeatNumber(row, column, 'Standard')} - Trống`}
                          >
                            {seat && (
                              <span className="text-xs">{getSeatIcon(seat.seatType)}</span>
                            )}
                          </div>
                        );
                      }
                    }
                    return elems;
                  })()}
                </div>
                
                {/* Row labels */}
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
                    <div className="w-6 h-6 bg-gray-300 border-gray-400 rounded flex items-center justify-center">💺</div>
                    <span className="text-sm">Ghế thường</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-#f5222d-200 border-#f5222d-400 rounded flex items-center justify-center">👑</div>
                    <span className="text-sm">Ghế VIP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-6 bg-#ec2f96-200 border-#ec2f96-400 rounded flex items-center justify-center">❤️</div>
                    <span className="text-sm">Ghế đôi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-300 border-blue-400 rounded flex items-center justify-center">♿</div>
                    <span className="text-sm">Khuyết tật</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white border-gray-300 border-dashed rounded flex items-center justify-center">⬜</div>
                    <span className="text-sm">Khoảng trống</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-50 border-gray-200 rounded"></div>
                    <span className="text-sm">Chưa sử dụng</span>
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
              💡 Click để thêm dãy Standard/VIP, nhập số ghế đôi cho hàng cuối, kéo thả cho lối đi
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => onSave(seats, gridSize.columns, gridSize.rows, coupleSeatQuantity)}
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