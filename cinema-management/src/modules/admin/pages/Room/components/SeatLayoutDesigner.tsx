import Loading from '@/modules/admin/components/loading';
import {
    Armchair,
    Crown,
    EllipsisVertical,
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
import React, { useCallback, useEffect, useState, type JSX } from 'react';
import { toast } from 'sonner';
import { roomApiService, type Seat, type SeatType } from '../../../../../services/roomApi';
import SeatTypeDialog from './SeatTypeDialog';

interface SeatLayoutDesignerProps {
  open: boolean;
  roomName: string;
    row: number;
    col: number;
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
  maxColumns = 30,
  onSave,
  onClose,
}) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('Standard');
  const [gridSize, setGridSize] = useState({ rows: 10, columns: 12 });
  const [isDragging, setIsDragging] = useState(false);
  const [listSeatsType, setListSeatsType] = useState<SeatType[]>([]);
  const [showSeatTypeDialog, setShowSeatTypeDialog] = useState(false);
  const [selectedSeatType, setSelectedSeatType] = useState<SeatType | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-adjust grid size
  useEffect(() => {
    if (initialSeats.length > 0) {
        const rows = Math.max(...initialSeats.map(seat => seat.row ?? 0)) + 1;
        const columns = Math.max(...initialSeats.map(seat => {
                          const type = listSeatsType.find(t => t.name === seat.seatType);
                          const cap = type?.capacity || 1;
                          return (Number(seat.column ?? 0) + Number(cap) - 1);
                        })) + 1;

      setGridSize({
        rows: Math.max(rows, 5),
        columns: Math.max(columns, 6),
      });
      console.log("Initial seats: ", initialSeats);
      setSeats(initialSeats);
    }
  }, [initialSeats, listSeatsType, open]);
//   const listSeatsType = [
//     { id: '217c7f69-2127-406e-9af6-e07e1358491c', seatType: 'VIP'},
//     { id: 'standardId', seatType: 'Standard'},
//     { id: 'coupleId', seatType: 'Couple'},
//     { id: 'disabledId', seatType: 'Disabled'},
//   ]

  const fetchSeatTypes = async () => {
    setLoading(true);
    try {
      const response = await roomApiService.getSeatTypes();
      setListSeatsType(response);
    } catch (error) {
      console.error('Error fetching seat types:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSeatTypes();
  }, []);

  const findSeat = useCallback((row: number, column: number): Seat | undefined => {
    return seats.find(seat => seat.row === row && seat.column === column);
  }, [seats]);

  const generateSeatNumber = useCallback((row: number, column: number, seatType: string, capacity: number): string => {
    if (seatType === 'Empty') {
      return `W_${String.fromCharCode(65 + row)}${column + 1}`;
    }
    if (!capacity) return '';
    const rowLetter = String.fromCharCode(65 + row);
    const seatNumbers: string[] = [];
    for (let i = 0; i < capacity; i++) {
       seatNumbers.push(`${rowLetter}${column + 1 + i}`);
    }
    return seatNumbers.join('+');

  }, []);

  const addSeat = useCallback((row: number, column: number, seatType: string, color: string) => {
    const existingSeat = findSeat(row, column);
    const seatName = listSeatsType.find(type => type.name === seatType);
    if (existingSeat) {
      setSeats(prev => prev.map(seat =>
        seat.row === row && seat.column === column
          ? { ...seat, seatType, seatNumber: generateSeatNumber(row, column, seatType, seatName?.capacity || 1), color }
          : seat
      ));
    } else {
      const newSeat: Seat = {
        id: seatName?.id || '',
        color,
        row,
        column,
        seatType,
        seatNumber: generateSeatNumber(row, column, seatType, seatName?.capacity || 1),
        status: 'AVAILABLE',
      };
      setSeats(prev => [...prev, newSeat]);
    console.log("Seats after addSeat: ", newSeat);
    }
  }, [findSeat, generateSeatNumber, listSeatsType]);

  const removeSeat = useCallback((row: number, column: number) => {
    setSeats(prev => prev.filter(seat => !(seat.row === row && seat.column === column)));
  }, []);

  const handleCellClick = (row: number, column: number) => {
    const selectedType = listSeatsType.find(type => type.name === selectedTool);
    if (selectedTool === 'Empty') {
        const existingSeat = findSeat(row, column);
        // if ( existingSeat && existingSeat.seatType === 'Couple') return;
        console.log("Existing seat to block: ", existingSeat, row, column);
        if (existingSeat) {
            removeSeat(row, column);
            return;
        } else {
            // Thêm ghế Empty
            addSeat(row, column, selectedTool, selectedType?.color || '#722ed1');
            return;
        }
    } else if (selectedType?.capacity == 1) {
        for (let col = 0; col < gridSize.columns; col++) {
            addSeat(row, col, selectedTool, selectedType?.color || '#722ed1');
        }
    } else {
        // for (let col = 0; col < gridSize.columns; col++) {
        //     removeSeat(row, col);
        // }
        for (let i = 0; i < Math.floor(gridSize.columns / selectedType!.capacity); i ++) {
            for (let col = 1; col < selectedType!.capacity; col++) {
                removeSeat(row, i * selectedType!.capacity + col);
            }
            const col = i * selectedType!.capacity;
            addSeat(row, col, selectedTool, selectedType?.color || '#722ed1');
        }
    }
  };
  const handleMouseDown = (row: number, column: number) => {
    setIsDragging(true);
    console.log("Mouse down at: ", row, column);
    handleCellClick(row, column);
  };

  const handleMouseEnter = (row: number, column: number) => {
    if (isDragging && selectedTool !== 'Standard' && selectedTool !== 'VIP' && selectedTool !== 'Couple') {
        console.log("Mouse enter at: ", row, column);
      handleCellClick(row, column);
    }
  };
  if(!open) return null;
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const clearLayout = () => {
    setSeats([]);
  };

  const handleOpenEditSeatType = (seatType: SeatType) => {
    setSelectedSeatType(seatType);
    setShowSeatTypeDialog(true);
  };

  const handleAddSeatType = () => {
    setSelectedSeatType(null);
    setShowSeatTypeDialog(true);
  };

    const handleEditSeatType = async (seatType: SeatType) => {
        // TODO: Implement edit functionality
        setLoading(true);
        try {
            const updatedSeatType = await roomApiService.updateSeatType(seatType.id || '', seatType);
            console.log('Updated seat type:', updatedSeatType, seatType);
            setListSeatsType(prev => prev.map(type => type.id === updatedSeatType.id ? updatedSeatType : type));
            setSelectedSeatType(null);
            setSeats(prev => prev.filter(seat => {
                console.log("exist seat", (seat.id === seatType.id))
                return !(seat.id === seatType.id)
            }));
            toast.success(`Đã cập nhật loại ghế "${seatType.name}" thành công.`);
            setShowSeatTypeDialog(false);
        } catch (error) {
            console.error('Error editing seat type:', error);
            // setSelectedSeatType(null);
            // setShowSeatTypeDialog(false);
            toast.error(`Có lỗi xảy ra khi cập nhật loại ghế "${seatType.name}".`);
        } finally {
            setLoading(false);
        }
    };

  const handleDeleteSeatType = async (seatType: SeatType) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa loại ghế "${seatType.name}" không? Hành động này không thể hoàn tác.`)) return;
    
    setLoading(true);
    try {
        await roomApiService.deleteSeatType(seatType.id || '');
        setListSeatsType(prev => prev.filter(type => type.id !== seatType.id));
        setSelectedSeatType(null);
        setSeats(prev => prev.filter(seat => !(seat.id === seatType.id)));
        toast.success(`Đã xóa loại ghế "${seatType.name}" thành công.`);
        setShowSeatTypeDialog(false);
    } catch (error) {
        console.error('Error deleting seat type:', error);
        // setSelectedSeatType(null);
        toast.error(`Có lỗi xảy ra khi xóa loại ghế "${seatType.name}".`);
    } finally {
        setLoading(false);
    }
  };

  const handleAddNewSeatType = async (newSeatType: Omit<SeatType, 'id'>) => {
    try {
        const createdSeatType = await roomApiService.createSeatType(newSeatType);
        console.log('Created new seat type:', createdSeatType);
        setListSeatsType(prev => [...prev, createdSeatType]);
        setShowSeatTypeDialog(false);
        toast.success(`Đã tạo loại ghế "${newSeatType.name}" thành công.`);
    } catch (error) {
        console.error('Error creating new seat type:', error);
        toast.error(`Có lỗi xảy ra khi tạo loại ghế "${newSeatType.name}".`);
    }
  };

  const generateAutoLayout = () => {
    const newSeats: Seat[] = [];
    const { rows, columns } = gridSize;
    
    for (let row = 0; row < rows - 1; row++) {
      for (let col = 0; col < columns; col++) {
        const centerAisle = Math.floor(columns / 4);
        if (col === centerAisle || col === columns - centerAisle - 1) {
          newSeats.push({
            id: ``,
            color: 'blue',
            row,
            column: col,
            seatType: 'Empty',
            seatNumber: `W_${String.fromCharCode(65 + row)}${col + 1}`,
            status: 'BLOCKED',
          });
          continue;
        }
        
        const isVipRow = row >= rows - 3 && row < rows - 1;
        const seatType: string = isVipRow ? 'VIP' : 'Standard';
        
        newSeats.push({
          id: listSeatsType.find(type => type.name === seatType)?.id || '',
          color: isVipRow ? '#f5222d' : '#722ed1',
          row,
          column: col,
          seatType,
          seatNumber: generateSeatNumber(row, col, seatType, listSeatsType.find(type => type.name === seatType)?.capacity || 1),
          status: 'AVAILABLE',
        });
      }
    }
    setSeats(newSeats);
  };

  const getSeatStats = () => {
    const seatTypeNames = listSeatsType.map(type => type.name);
    const stats = { total: 0 } as { [key: string]: number };
    seatTypeNames.forEach(name => stats[name] = 0);
    stats.Empty = 0;

    seats.forEach(seat => {
      if (seat.seatType !== 'Empty') {
        if (seat.seatType && Object.prototype.hasOwnProperty.call(stats, seat.seatType)) {
          stats[seat.seatType as keyof typeof stats]++;
          stats.total++;
        } else if (seat.seatType === undefined) {
        stats.Empty++;
        }
      } else {
        stats.Empty++;
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
      case 'EMPTY': return <Square className="w-4 h-4" />;
      default: return <Armchair className="w-4 h-4" />;
    }
  };

  const stats = getSeatStats();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-8xl max-h-[95vh] overflow-hidden z-20">
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
        {loading ? (
            <Loading />
        ) : (
        <div className="flex h-[calc(88vh-100px)]">
          {/* Toolbar */}
          <div className="w-90 bg-gray-50 border-r border-gray-200 overflow-y-auto">
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
                        setSeats(prevSeats => prevSeats.filter(seat => Number(seat.row ?? 0) < newRows));
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
                        setSeats(prevSeats => prevSeats.filter(seat => {
                          const type = listSeatsType.find(t => t.name === seat.seatType);
                          const cap = type?.capacity || 1;
                          return (Number(seat.column ?? 0) + Number(cap) - 1)  < newColumns;
                        }));
                      }}
                      className="w-full mt-1"
                    />
                    <div className="text-xs text-gray-500 text-center">{gridSize.columns}</div>
                  </div>
                </div>
              </div>

              {/* Seat Tools */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <button className='p-3 bg-purple-200 w-full rounded-lg border border-purple-500 text-purple-600 mb-3 cursor-pointer hover:bg-fuchsia-50 duration-200' onClick={handleAddSeatType}>Them loai ghe</button>
                <h3 className="font-semibold text-gray-700 mb-3">Công cụ vẽ</h3>
                <div className="space-y-2">
                  {listSeatsType.filter(type => type.name !== 'Couple').map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedTool(type.name)}
                      className={`w-full p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-between gap-3 relative ${
                        selectedTool === type.name
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                        title={type.desc}
                    >
                        <div className='flex items-center gap-3'>
                            <div className={`min-h-4 min-w-4 rounded-full`} style={{ backgroundColor: type.color }}></div>
                            {/* <span className="text-lg">{getSeatIcon(type.name)}</span> */}
                            <span className="text-sm text-left font-medium capitalize">
                                {type.name} - {type.capacity} ghế
                            </span>
                        </div>
                      <div className="text-gray-400 hover:bg-gray-200 rounded-full p-1 cursor-pointer" onClick={() => handleOpenEditSeatType(type)}>
                        <EllipsisVertical className='w-4 h-4'/>
                      </div>
                    </button>
                  ))}
                  { listSeatsType.find(type => type.name === 'Couple') && (
                    <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedTool('Couple')}
                      className={`flex-1 p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${
                        selectedTool === 'Couple'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                      title={listSeatsType.find(type => type.name === 'Couple')?.desc}
                    >
                       <div className={`min-h-4 min-w-4 rounded-full`} style={{ backgroundColor: listSeatsType.find(type => type.name === 'Couple')?.color }}></div>
                      <span className="text-sm text-left font-medium capitalize">Đôi - {listSeatsType.find(type => type.name === 'Couple')?.capacity} ghế</span>
                    </button>
                  </div>)}
                  <button
                      onClick={() => setSelectedTool('Empty')}
                      className={`w-full p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${
                        selectedTool === 'Empty'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                      title='Them loi di'
                    >
                      {getToolIcon('Empty')}
                      <span className="text-lg">{getSeatIcon('Empty')}</span>
                      <span className="text-sm text-left font-medium capitalize">
                        Lối đi / Xóa
                      </span>
                    </button>
                  {/* <button
                      onClick={() => setSelectedTool('Blocked')}
                      className={`w-full p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${
                        selectedTool === 'Blocked'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {getToolIcon('Blocked')}
                      <span className="text-lg">{getSeatIcon('Blocked')}</span>
                      <span className="text-sm font-medium capitalize">
                        Xoa
                      </span>
                    </button> */}
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
                  {listSeatsType.map(type => (
                  <div key={type.id} className="flex justify-between">
                    <span>{getSeatIcon(type.name)} {type.name}:</span>
                    <span className="font-medium">{stats[type.name]}</span>
                  </div>
                  ))}
                  <div className="flex justify-between">
                    <span>⬜ Lối đi:</span>
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

                        const selectedType = listSeatsType.find(type => type.name === seat?.seatType);
                        if (selectedType?.capacity) {
                          elems.push(
                            <div
                              key={`${row}-${column}`}
                              className={`h-8 border-2 rounded cursor-pointer transition-all duration-150 flex items-center justify-center text-xs select-none`}
                              style={{ gridColumn: `${column + 1} / span ${selectedType.capacity}`, backgroundColor: selectedType.color, borderColor: '#ccc', width: `calc(${selectedType.capacity * 2.25}rem - 4px)` }}
                              onMouseDown={() => handleMouseDown(row, (selectedType?.capacity === 1 ? column : column - (selectedType.capacity - 1)))}
                            //   onMouseEnter={() => handleMouseEnter(row, (selectedType?.capacity === 1 ? column : column - (selectedType.capacity - 1)))}
                            //   title={`${seat.seatNumber} - ${seat.seatType}`}
                            >
                              <span className="text-xs text-white">{seat?.seatNumber}</span>
                            </div>
                          );
                          // Skip the next column because couple occupies two columns
                          column += selectedType.capacity - 1;
                          continue;
                        } else {
                            elems.push(
                          <div
                            key={`${row}-${column}`}
                            className={`w-8 h-8 border-2 rounded cursor-pointer transition-all duration-150 flex items-center justify-center text-xs select-none hover:bg-gray-100 border-gray-200`}
                            onMouseDown={() => handleMouseDown(row, column)}
                            // onMouseEnter={() => handleMouseEnter(row, column)}
                            title={seat && `${seat.seatNumber} - ${seat.seatType}` }
                          >
                            {seat && (
                              <span className="text-xs">{getSeatIcon(seat.seatType)}</span>
                            )}
                          </div>
                        );
                    }
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
                <div className="flex flex-wrap gap-4 max-w-2xl">
                  {listSeatsType.map(type => (
                    <div key={type.id} className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded flex items-center justify-center text-white`}
                        style={{ backgroundColor: type.color }}
                      ></div>
                        <span className="text-sm">{type.name}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white border-gray-300 border-dashed border rounded flex items-center justify-center">⬜</div>
                    <span className="text-sm">Lối đi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-50 border-gray-400 border rounded"></div>
                    <span className="text-sm">Chưa sử dụng</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>)}

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
      {/* Seat Type Dialog */}
      <SeatTypeDialog
        open={showSeatTypeDialog}
        seatType={selectedSeatType}
        mode={selectedSeatType ? "view" : "add"}
        onClose={() => setShowSeatTypeDialog(false)}
        onEdit={handleEditSeatType}
        onDelete={handleDeleteSeatType}
        onAdd={handleAddNewSeatType}
        loading={loading}
      />
    </div>
  );
};

export default SeatLayoutDesigner;