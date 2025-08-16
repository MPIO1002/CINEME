import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Film } from 'lucide-react';
import React, { useState } from 'react';

interface Showtime {
  id?: string;
  movieId: string;
  movieName?: string;
  movieImage?: string;
  roomId: string;
  roomName?: string;
  showDate: string;
  startTime: string;
  endTime: string;
  ticketPrice: number;
  status: 'ACTIVE' | 'SOLD_OUT' | 'CANCELLED';
  bookedSeats?: number;
  totalSeats?: number;
}

interface ShowtimeCalendarProps {
  showtimes: Showtime[];
  onShowtimeClick: (showtime: Showtime) => void;
  onDateClick: (date: string) => void;
}

const ShowtimeCalendar: React.FC<ShowtimeCalendarProps> = ({
  showtimes,
  onShowtimeClick,
  onDateClick,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Get showtimes for a specific date
  const getShowtimesForDate = (date: Date | null) => {
    if (!date) return [];
    
    // Format date to YYYY-MM-DD without timezone conversion
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    
    return showtimes.filter(showtime => showtime.showDate === dateString);
  };

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  // Format month/year for display
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Check if date is today
  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is in the past
  const isPast = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  // Get status color for showtime
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'SOLD_OUT': return 'bg-red-500';
      case 'CANCELLED': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Lịch chiếu phim
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-semibold text-gray-700 min-w-[200px] text-center">
            {formatMonthYear(currentMonth)}
          </h3>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const dayShowtimes = getShowtimesForDate(date);
          const isEmpty = !date;
          const isCurrentDay = isToday(date);
          const isPastDay = isPast(date);

          return (
            <div
              key={index}
              className={`min-h-[120px] border border-gray-200 rounded-lg p-2 transition-colors ${
                isEmpty 
                  ? 'bg-gray-50' 
                  : isPastDay 
                    ? 'bg-gray-50' 
                    : 'bg-white hover:bg-gray-50 cursor-pointer'
              } ${isCurrentDay ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => {
                if (date && !isPastDay) {
                  // Format date consistently without timezone conversion
                  const year = date.getFullYear();
                  const month = String(date.getMonth() + 1).padStart(2, '0');
                  const day = String(date.getDate()).padStart(2, '0');
                  const dateString = `${year}-${month}-${day}`;
                  onDateClick(dateString);
                }
              }}
            >
              {date && (
                <>
                  {/* Date Number */}
                  <div className={`text-sm font-semibold mb-2 ${
                    isCurrentDay 
                      ? 'text-blue-600' 
                      : isPastDay 
                        ? 'text-gray-400' 
                        : 'text-gray-900'
                  }`}>
                    {date.getDate()}
                  </div>

                  {/* Showtimes */}
                  <div className="space-y-1">
                    {dayShowtimes.slice(0, 3).map(showtime => (
                      <div
                        key={showtime.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onShowtimeClick(showtime);
                        }}
                        className={`text-xs p-1 rounded cursor-pointer transition-colors ${
                          isPastDay 
                            ? 'bg-gray-200 text-gray-500' 
                            : `${getStatusColor(showtime.status)} text-white hover:opacity-80`
                        }`}
                        title={`${showtime.movieName || 'Unknown Movie'} - ${showtime.roomName || 'Unknown Room'} - ${showtime.startTime}`}
                      >
                        <div className="flex items-center gap-1 truncate">
                          <Film className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{showtime.movieName || 'Unknown Movie'}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span>{showtime.startTime}</span>
                          <span className="ml-auto">{showtime.roomName || 'Unknown Room'}</span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Show more indicator */}
                    {dayShowtimes.length > 3 && (
                      <div className="text-xs text-gray-500 text-center py-1">
                        +{dayShowtimes.length - 3} suất khác
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-600">Mở bán</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-600">Hết vé</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 bg-gray-500 rounded"></div>
          <span className="text-gray-600">Đã hủy</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 border-2 border-blue-500 rounded"></div>
          <span className="text-gray-600">Hôm nay</span>
        </div>
      </div>
    </div>
  );
};

export default ShowtimeCalendar;
