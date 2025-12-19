import React from 'react';
import type { Theater } from '@/services/theaterApi';

interface TheaterCardProps {
  theater: Theater;
  isSelected: boolean;
  onClick: () => void;
}

const TheaterCard: React.FC<TheaterCardProps> = ({ theater, isSelected, onClick }) => {
  return (
    <div
      className={`cursor-pointer p-4 rounded-lg transition-all duration-300 border ${
        isSelected 
          ? 'bg-orange-500/20 border-orange-500/50 shadow-lg transform scale-105'
          : 'bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 hover:border-gray-600'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className={`font-semibold text-lg mb-2 ${
            isSelected ? 'text-orange-400' : 'text-white'
          }`}>
            {theater.nameVn}
          </h3>
          
          <div className="space-y-1 text-sm text-gray-300">
            <p className="flex items-start">
              <span className="inline-block w-4 h-4 mt-0.5 mr-2">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
              </span>
              <span className="line-clamp-2">{theater.address}</span>
            </p>
            
            <p className="flex items-center">
              <span className="inline-block w-4 h-4 mr-2">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                </svg>
              </span>
              {theater.phone}
            </p>
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-400">
                {theater.totalRooms} phòng
              </span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                theater.status === 'ACTIVE' 
                  ? 'bg-green-500/20 text-green-400'
                  : theater.status === 'MAINTENANCE'
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {theater.status === 'ACTIVE' ? 'Hoạt động' : 
                 theater.status === 'MAINTENANCE' ? 'Bảo trì' : 'Đóng cửa'}
              </span>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className={`w-3 h-3 rounded-full ml-3 mt-1 ${
          theater.status === 'ACTIVE' 
            ? 'bg-green-400'
            : theater.status === 'MAINTENANCE'
            ? 'bg-yellow-400'
            : 'bg-red-400'
        }`}></div>
      </div>

      {isSelected && (
        <div className="mt-4 pt-3 border-t border-orange-500/30">
          <div className="flex items-center text-orange-400 text-sm">
            <span className="w-4 h-4 mr-2">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
            </span>
            Đã chọn - Xem vị trí trên bản đồ
          </div>
        </div>
      )}
    </div>
  );
};

export default TheaterCard;