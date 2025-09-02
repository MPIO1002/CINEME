import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { API_BASE_URL } from '../../../../components/api-config';

interface Showtime {
    id: string;
    movieId: string;
    movieNameVn: string;
    movieNameEn: string;
    img: string;
    date: string;
    startTime: string;
    endTime: string;
    roomId: string;
    theaterId: string;
    roomName: string;
}

interface Movie {
    movieId: string;
    movieNameVn: string;
    movieNameEn: string;
    img: string;
    limitAgeVn: string;
    limitAgeEn: string;
    genreVn: string;
    genreEn: string;
    showtimes: Showtime[];
}

interface Theater {
    id: string;
    nameEn: string;
    nameVn: string;
}

interface ShowtimesResponse {
    statusCode: number;
    message: string;
    data: Movie[];
}

interface TheatersResponse {
    statusCode: number;
    message: string;
    data: Theater[];
}

const ShowtimesPage = () => {
    const navigate = useNavigate();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [theaters, setTheaters] = useState<Theater[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('2025-08-27');
    const [selectedTheater, setSelectedTheater] = useState('');
    const [selectedTheaterName, setSelectedTheaterName] = useState('');

    // Generate date options (current date + 6 days)
    const generateDateOptions = () => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            dates.push({
                value: dateStr,
                day: date.getDate().toString().padStart(2, '0'),
                name: date.toLocaleDateString('en', { weekday: 'short' }).toUpperCase(),
                month: date.toLocaleDateString('en', { month: 'short' })
            });
        }
        return dates;
    };

    const dateOptions = generateDateOptions();

    const fetchTheaters = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/theaters`);
            const result: TheatersResponse = await response.json();

            if (result.statusCode === 200) {
                setTheaters(result.data);
                // Set first theater as default
                if (result.data.length > 0) {
                    setSelectedTheater(result.data[0].id);
                    setSelectedTheaterName(result.data[0].nameVn);
                }
            } else {
                console.error('Failed to fetch theaters:', result.message);
            }
        } catch (error) {
            console.error('Error fetching theaters:', error);
        }
    };

    const fetchShowtimes = async () => {
        if (!selectedTheater) return;

        setLoading(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/schedules/search?theaterId=${selectedTheater}&date=${selectedDate}`
            );
            const result: ShowtimesResponse = await response.json();

            if (result.statusCode === 0) {
                setMovies(result.data);
            } else {
                console.error('Failed to fetch showtimes:', result.message);
                setMovies([]);
            }
        } catch (error) {
            console.error('Error fetching showtimes:', error);
            setMovies([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTheaters();
    }, []);

    useEffect(() => {
        if (selectedTheater) {
            fetchShowtimes();
        }
    }, [selectedDate, selectedTheater]);

    const formatTime = (timeString: string) => {
        return timeString.slice(0, 5); // HH:mm
    };

    const handleShowtimeClick = (_showtime: Showtime, movie: Movie) => {
        // Navigate to booking page with movieId in path
        // The booking page will handle date, theater, and showtime selection
        navigate(`/booking/${movie.movieId}`);
    };

    const getAgeRatingColor = (age: string) => {
        switch (age) {
            case 'P': return 'bg-green-500';
            case 'K': return 'bg-blue-500';
            case 'T13': return 'bg-yellow-500';
            case 'T16': return 'bg-orange-500';
            case 'T18': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
                <div className="text-white text-xl">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-white p-20">
            <div className="flex">
                {/* Left Sidebar - Theater List */}
                <div className="w-80 min-h-screen border-r border-gray-700">
                    {/* Search Box */}
                    <div className="p-4 border-b border-gray-700">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Tìm theo tên rạp ..."
                                className="w-full px-4 py-2 bg-[var(--color-background)] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-[var(--color-accent)] focus:outline-none"
                            />
                            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                        </div>
                    </div>

                    {/* Theater List */}
                    <div className="flex-1 overflow-y-auto">
                        {theaters.map((theater) => (
                            <button
                                key={theater.id}
                                onClick={() => {
                                    setSelectedTheater(theater.id);
                                    setSelectedTheaterName(theater.nameVn);
                                }}
                                className={`w-full p-4 text-left border-b border-gray-700/50 hover:bg-[var(--color-accent)] transition ${selectedTheater === theater.id ? 'bg-[var(--color-secondary)] border-l-4 border-l-[var(--color-accent)]' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex-1">
                                        <div className="font-medium text-white">{theater.nameVn}</div>
                                        <div className="text-sm text-white">{theater.nameEn}</div>
                                    </div>
                                    <div className="text-gray-400">
                                        ❯
                                    </div>
                                </div>
                            </button>
                        ))}

                        {/* View More Button */}
                        <div className="p-4">
                            <button className="w-full py-3 text-center text-[var(--color-accent)] border border-[var(--color-accent)] rounded-lg hover:bg-[var(--color-accent)] hover:text-white transition">
                                Xem thêm
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Content */}
                <div className="flex-1">
                    {/* Header */}
                    {selectedTheaterName && (
                        <div className="p-6 border-b border-gray-700">
                            <h1 className="text-2xl font-bold text-white mb-2">Lịch chiếu phim {selectedTheaterName}</h1>
                            <p className="text-gray-400 text-sm">
                                Tầng 6, Van Hanh Mall, 11 Sư Vạn Hạnh, Phường 12, Quận 10
                            </p>
                        </div>
                    )}

                    {/* Date Selector */}
                    <div className="p-6">
                        <div
                            className="flex gap-2 overflow-x-auto pb-2"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: 'var(--color-accent) transparent'
                            }}
                        >
                            {dateOptions.map((date) => (
                                <button
                                    key={date.value}
                                    onClick={() => setSelectedDate(date.value)}
                                    className={`flex flex-col items-center p-4 rounded-lg transition-colors border-2 text-sm flex-shrink-0 min-w-[80px] ${selectedDate === date.value ? 'border-[var(--color-accent)]' : 'border-transparent'
                                        }`}
                                    style={{
                                        backgroundColor: selectedDate === date.value ? 'var(--color-accent)' : 'var(--color-secondary)',
                                        color: selectedDate === date.value ? 'white' : 'var(--color-text)'
                                    }}
                                >
                                    <span className="text-xs">{date.name}</span>
                                    <span className="text-2xl font-bold">{date.day}</span>
                                    <span className="text-xs">{date.month}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Movies and Showtimes */}
                    <div className="p-6">
                        {!selectedTheater ? (
                            <div className="text-center py-20">
                                <p className="text-gray-400 text-lg">Vui lòng chọn rạp để xem lịch chiếu</p>
                            </div>
                        ) : movies.length === 0 ? (
                            <div className="text-center py-20">
                                <p className="text-gray-400 text-lg">Không có suất chiếu nào trong ngày này</p>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                {movies.map((movie) => (
                                    <div key={movie.movieId} className="flex gap-6 bg-gradient-to-r from-[var(--color-background)] via-black to-[var(--color-background)] p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-black">
                                        {/* Movie Poster */}
                                        <div className="flex-shrink-0">
                                            <img
                                                src={movie.img}
                                                alt={movie.movieNameVn}
                                                className="w-32 h-48 object-cover rounded-lg"
                                            />
                                        </div>

                                        {/* Movie Info and Showtimes */}
                                        <div className="flex-1">
                                            {/* Movie Title and Rating */}
                                            <div className="flex items-start gap-3 mb-3">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white mb-1">{movie.movieNameVn}</h3>
                                                    <p className="text-gray-400 text-sm">{movie.genreVn}</p>
                                                </div>
                                                <span
                                                    className={`px-2 py-1 rounded text-xs font-bold text-white ${getAgeRatingColor(
                                                        movie.limitAgeVn
                                                    )}`}
                                                >
                                                    {movie.limitAgeVn}
                                                </span>
                                            </div>

                                            {/* 2D Subtitle */}
                                            <div className="mb-4">
                                                <h4 className="text-base font-semibold text-white mb-3">2D Phụ đề</h4>
                                                <div className="flex flex-wrap gap-3">
                                                    {movie.showtimes.map((showtime) => (
                                                        <button
                                                            key={showtime.id}
                                                            onClick={() => handleShowtimeClick(showtime, movie)}
                                                            className="px-4 py-2 bg-transparent border-2 border-[var(--color-accent)] text-[var(--color-accent)] rounded-lg hover:bg-[var(--color-accent)] hover:text-white transition font-medium cursor-pointer"
                                                        >
                                                            {formatTime(showtime.startTime)} - {formatTime(showtime.endTime)}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* IMAX Section (if available) */}
                                            {movie.showtimes.length > 2 && (
                                                <div className="mb-4">
                                                    <h4 className="text-base font-semibold text-white mb-3">2D Phụ đề | IMAX</h4>
                                                    <div className="flex flex-wrap gap-3">
                                                        {movie.showtimes.slice(0, 3).map((showtime) => (
                                                            <button
                                                                key={`imax-${showtime.id}`}
                                                                onClick={() => handleShowtimeClick(showtime, movie)}
                                                                className="px-4 py-2 bg-transparent border-2 border-[var(--color-accent)] text-[var(--color-accent)] rounded-lg hover:bg-[var(--color-accent)] hover:text-white transition font-medium cursor-pointer"
                                                            >
                                                                {formatTime(showtime.startTime)} - {formatTime(showtime.endTime)}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShowtimesPage;
