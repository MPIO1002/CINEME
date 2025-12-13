import React, { useState, useEffect, useRef } from 'react';
import { theaterApi } from '@/services/theaterApi';
import type { Theater } from '@/services/theaterApi';

// TheaterCard Component
interface TheaterCardProps {
    theater: Theater;
    isSelected: boolean;
    onClick: () => void;
}

const TheaterCard: React.FC<TheaterCardProps> = ({ theater, isSelected, onClick }) => {
    return (
        <div
            className={`cursor-pointer p-4 rounded-lg transition-all duration-300 ${isSelected
                    ? 'bg-orange-500/10 ring-2 ring-orange-500'
                    : 'bg-[#1a1a1a] hover:bg-[#222]'
                }`}
            onClick={onClick}
        >
            <h3 className={`font-semibold text-lg mb-1 ${isSelected ? 'text-orange-500' : 'text-white'
                }`}>
                {theater.nameVn}
            </h3>
            <p className="text-sm text-gray-400">{theater.nameEn}</p>

            {isSelected && (
                <div className="mt-3 pt-3 border-t border-orange-500/20">
                    <p className="text-xs text-orange-400">● Đang xem trên bản đồ</p>
                </div>
            )}
        </div>
    );
};

// VietMap Component với Leaflet thật
interface VietMapProps {
    theaters: Theater[];
    selectedTheater: Theater | null;
    onTheaterSelect: (theater: Theater) => void;
}

declare global {
    interface Window {
        L: any;
    }
}

const VietMap: React.FC<VietMapProps> = ({ theaters, selectedTheater, onTheaterSelect }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<any>(null);
    const markersRef = useRef<any[]>([]);

    // Load Leaflet từ CDN
    useEffect(() => {
        const loadLeaflet = async () => {
            if (window.L) {
                initializeMap();
                return;
            }

            // Load Leaflet CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);

            // Load Leaflet JS
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = () => {
                initializeMap();
            };
            document.head.appendChild(script);
        };

        loadLeaflet();

        return () => {
            if (leafletMap.current) {
                leafletMap.current.remove();
                leafletMap.current = null;
            }
        };
    }, []);

    // Update markers khi theaters hoặc selectedTheater thay đổi
    useEffect(() => {
        if (leafletMap.current && theaters.length > 0) {
            updateMarkers();
        }
    }, [theaters, selectedTheater]);

    const initializeMap = () => {
        if (!mapRef.current || leafletMap.current || !window.L) return;

        try {
            // Tạo map với OpenStreetMap tiles
            leafletMap.current = window.L.map(mapRef.current).setView([21.0285, 105.8542], 12);

            // Thêm OpenStreetMap tiles
            window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(leafletMap.current);

            // Thêm markers nếu có theaters
            if (theaters.length > 0) {
                updateMarkers();
            }
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    };

    const updateMarkers = () => {
        if (!leafletMap.current || !window.L) return;

        // Xóa markers cũ
        markersRef.current.forEach(marker => {
            leafletMap.current.removeLayer(marker);
        });
        markersRef.current = [];

        // Tạo custom icon cho từng trạng thái
        const createCustomIcon = (theater: Theater) => {
            const isSelected = selectedTheater?.id === theater.id;
            let color = '#10B981'; // green for ACTIVE

            if (theater.status === 'MAINTENANCE') {
                color = '#F59E0B'; // yellow
            } else if (theater.status === 'CLOSED') {
                color = '#EF4444'; // red
            }

            if (isSelected) {
                color = '#F97316'; // orange for selected
            }

            const iconHtml = `
        <div style="
          width: ${isSelected ? '40px' : '32px'}; 
          height: ${isSelected ? '40px' : '32px'}; 
          background: ${color}; 
          border: 3px solid white; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
          transition: all 0.3s ease;
        ">
          <svg style="width: ${isSelected ? '20px' : '16px'}; height: ${isSelected ? '20px' : '16px'}; color: white;" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
          </svg>
        </div>
      `;

            return window.L.divIcon({
                html: iconHtml,
                className: 'custom-theater-marker',
                iconSize: [isSelected ? 40 : 32, isSelected ? 40 : 32],
                iconAnchor: [isSelected ? 20 : 16, isSelected ? 40 : 32],
                popupAnchor: [0, isSelected ? -40 : -32]
            });
        };

        // Thêm markers mới
        theaters.forEach(theater => {
            if (theater.latitude && theater.longitude) {
                const marker = window.L.marker([theater.latitude, theater.longitude], {
                    icon: createCustomIcon(theater)
                }).addTo(leafletMap.current);

                // Popup content - chỉ hiện tên
                const popupContent = `
          <div style="padding: 8px; text-align: center;">
            <h3 style="margin: 0; font-weight: bold; color: #1f2937; font-size: 15px;">${theater.nameVn}</h3>
          </div>
        `;

                marker.bindPopup(popupContent);

                // Click event
                marker.on('click', () => {
                    onTheaterSelect(theater);
                });

                markersRef.current.push(marker);
            }
        });

        // Fit map bounds to show all theaters
        if (markersRef.current.length > 0) {
            try {
                const group = new window.L.featureGroup(markersRef.current);
                const bounds = group.getBounds();
                if (bounds.isValid()) {
                    leafletMap.current.fitBounds(bounds.pad(0.1));
                }
            } catch (error) {
                console.error('Error fitting bounds:', error);
            }
        }
    };

    // Zoom to selected theater
    useEffect(() => {
        if (leafletMap.current && selectedTheater && selectedTheater.latitude && selectedTheater.longitude) {
            leafletMap.current.setView([selectedTheater.latitude, selectedTheater.longitude], 15, {
                animate: true,
                duration: 1
            });

            // Show popup for selected theater
            const selectedMarker = markersRef.current.find(marker => {
                const pos = marker.getLatLng();
                return pos.lat === selectedTheater.latitude && pos.lng === selectedTheater.longitude;
            });

            if (selectedMarker) {
                selectedMarker.openPopup();
            }
        }
    }, [selectedTheater]);

    return (
        <div className="w-full rounded-lg overflow-hidden shadow-lg" style={{ height: '600px', position: 'relative', zIndex: 1 }}>
            <div
                ref={mapRef}
                className="w-full h-full"
                style={{ zIndex: 1 }}
            />
        </div>
    );
};

// Fake coordinates cho các rạp (dựa trên tên)
const getFakeCoordinates = (index: number) => {
    const baseLocations = [
        { lat: 16.4637, lng: 107.5909 }, // Huế
        { lat: 10.7769, lng: 106.7009 }, // TP.HCM
        { lat: 10.7626, lng: 106.6824 }, // TP.HCM
        { lat: 10.9804, lng: 106.6760 }, // Bình Dương
        { lat: 10.0120, lng: 105.0819 }  // Kiên Giang
    ];
    return baseLocations[index % baseLocations.length];
};

const TheaterPage: React.FC = () => {
    const [theaters, setTheaters] = useState<Theater[]>([]);
    const [selectedTheater, setSelectedTheater] = useState<Theater | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadTheaters();
    }, []);

    const loadTheaters = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await theaterApi.getAllTheaters();
            const theatersData = response.data || [];

            // Thêm fake coordinates cho mỗi rạp
            const theatersWithCoords = theatersData.map((theater: Theater, index: number) => {
                const coords = getFakeCoordinates(index);
                return {
                    ...theater,
                    latitude: coords.lat,
                    longitude: coords.lng
                };
            });

            setTheaters(theatersWithCoords);
        } catch (err) {
            console.error('Error loading theaters:', err);
            setError('Không thể tải danh sách rạp chiếu');
        } finally {
            setLoading(false);
        }
    };

    const handleTheaterSelect = (theater: Theater) => {
        setSelectedTheater(theater);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-background)] pt-20">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-center items-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-background)] pt-20">
            <div className="container mx-auto px-4 py-8">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8">
                        <p className="text-red-400 text-center">{error}</p>
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Theater List */}
                    <div className="lg:col-span-1 flex flex-col">
                        <h2 className="text-xl font-semibold text-white mb-4">Danh Sách Rạp</h2>
                        <div className="space-y-3 flex-1 overflow-y-auto overflow-x-visible pr-2 scrollbar-hide" style={{ maxHeight: '600px', paddingTop: '2px', paddingBottom: '2px', marginLeft: '-2px', paddingLeft: '2px' }}>
                            {theaters.map((theater) => (
                                <TheaterCard
                                    key={theater.id}
                                    theater={theater}
                                    isSelected={selectedTheater?.id === theater.id}
                                    onClick={() => handleTheaterSelect(theater)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Map */}
                    <div className="lg:col-span-2 flex flex-col">
                        <h2 className="text-xl font-semibold text-white mb-4">Bản Đồ Vị Trí</h2>
                        <div className="flex-1">
                            <VietMap
                                theaters={theaters}
                                selectedTheater={selectedTheater}
                                onTheaterSelect={handleTheaterSelect}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TheaterPage;