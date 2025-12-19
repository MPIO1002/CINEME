import React, { useEffect, useState } from 'react';
import type { Theater } from '@/services/theaterApi';

interface VietMapProps {
  theaters: Theater[];
  selectedTheater: Theater | null;
  onTheaterSelect: (theater: Theater) => void;
}

const VietMap: React.FC<VietMapProps> = ({ theaters, selectedTheater, onTheaterSelect }) => {
  const [mapHtml, setMapHtml] = useState<string>('');

  useEffect(() => {
    generateMapHtml();
  }, [theaters, selectedTheater]);

  const generateMapHtml = () => {
    const html = `
      <div class="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col">
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 text-center shadow-md">
          <h3 class="font-bold text-lg">Bản Đồ Vị Trí Rạp Chiếu</h3>
          <p class="text-sm opacity-90">Khu vực Hà Nội</p>
        </div>
        <div class="flex-1 relative overflow-hidden bg-gradient-to-br from-green-100 via-blue-50 to-gray-100">
          ${theaters.map((theater, index) => {
            const positions = [
              { left: 45, top: 30 }, // CGV Vincom Center
              { left: 25, top: 45 }, // Lotte Cinema Keangnam  
              { left: 55, top: 35 }, // Galaxy Cinema Nguyễn Du
              { left: 65, top: 55 }, // BHD Star Vincom Times City
              { left: 50, top: 25 }, // Cineplex Hai Bà Trưng
            ];
            const pos = positions[index] || { left: 50 + (index % 3 - 1) * 15, top: 40 + Math.floor(index / 3) * 15 };
            
            return `
              <div 
                class="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                  selectedTheater?.id === theater.id 
                    ? 'z-20 scale-125' 
                    : 'z-10 hover:scale-110'
                }"
                style="left: ${pos.left}%; top: ${pos.top}%;"
                onclick="window.handleTheaterClick && window.handleTheaterClick('${theater.id}')"
              >
                <div class="relative">
                  <div class="w-10 h-10 ${
                    selectedTheater?.id === theater.id 
                      ? 'bg-orange-500 ring-4 ring-orange-300' 
                      : theater.status === 'ACTIVE' 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : theater.status === 'MAINTENANCE'
                          ? 'bg-yellow-500 hover:bg-yellow-600'
                          : 'bg-red-500 hover:bg-red-600'
                  } rounded-full border-3 border-white shadow-lg flex items-center justify-center transform transition-all duration-200">
                    <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                    </svg>
                  </div>
                  
                  ${selectedTheater?.id === theater.id ? `
                    <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 animate-bounce">
                      <div class="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                        <div class="font-semibold">${theater.nameVn}</div>
                        <div class="text-gray-300 mt-1">${theater.address?.substring(0, 30)}...</div>
                        <div class="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  ` : ''}
                  
                  <!-- Theater label -->
                  <div class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2">
                    <div class="bg-white/90 backdrop-blur-sm text-gray-800 text-xs rounded px-2 py-1 shadow-md font-medium">
                      ${theater.nameVn.split(' ')[0]}
                    </div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
          
          <!-- Decorative elements -->
          <div class="absolute inset-0 pointer-events-none">
            <!-- Roads simulation -->
            <div class="absolute top-1/3 left-0 w-full h-1 bg-gray-400 opacity-30"></div>
            <div class="absolute top-2/3 left-0 w-full h-1 bg-gray-400 opacity-30"></div>
            <div class="absolute left-1/3 top-0 h-full w-1 bg-gray-400 opacity-30"></div>
            <div class="absolute left-2/3 top-0 h-full w-1 bg-gray-400 opacity-30"></div>
          </div>
        </div>
        
        <!-- Legend -->
        <div class="bg-white border-t p-4">
          <div class="flex items-center justify-center space-x-6 text-sm">
            <div class="flex items-center">
              <div class="w-4 h-4 bg-green-500 rounded-full mr-2 border border-white shadow"></div>
              <span class="text-gray-700">Hoạt động</span>
            </div>
            <div class="flex items-center">
              <div class="w-4 h-4 bg-yellow-500 rounded-full mr-2 border border-white shadow"></div>
              <span class="text-gray-700">Bảo trì</span>
            </div>
            <div class="flex items-center">
              <div class="w-4 h-4 bg-red-500 rounded-full mr-2 border border-white shadow"></div>
              <span class="text-gray-700">Đóng cửa</span>
            </div>
            <div class="flex items-center">
              <div class="w-4 h-4 bg-orange-500 rounded-full mr-2 border border-white shadow ring-2 ring-orange-300"></div>
              <span class="text-gray-700 font-medium">Đã chọn</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    setMapHtml(html);
  };

  useEffect(() => {
    // Add click handler for theater selection
    (window as any).handleTheaterClick = (theaterId: string) => {
      const theater = theaters.find(t => t.id === theaterId);
      if (theater) {
        onTheaterSelect(theater);
      }
    };

    return () => {
      // Cleanup
      delete (window as any).handleTheaterClick;
    };
  }, [theaters, onTheaterSelect]);

  return (
    <div 
      className="w-full h-96 rounded-lg overflow-hidden border border-gray-200 shadow-lg"
      style={{ minHeight: '400px' }}
      dangerouslySetInnerHTML={{ __html: mapHtml }}
    />
  );
};

export default VietMap;