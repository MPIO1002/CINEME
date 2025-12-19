import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import MoviePopup from "../home/components/movie-popup";
import { API_BASE_URL } from "../../../../components/api-config";

type Movie = {
    id: string;
    nameVn: string;
    nameEn?: string;
    image: string;
    ratings: number;
};

type PageableData = {
    pageNumber: number;
    pageSize: number;
    totalPage: number;
    totalRecords: number;
};

type ApiResponse = {
    listContent: Movie[];
    pageableData: PageableData;
};

type MovieCategory = "available" | "coming-soon";

const MoviesPage: React.FC<{ lang: "vi" | "en" }> = ({ lang }) => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageableData, setPageableData] = useState<PageableData | null>(null);
    const [category, setCategory] = useState<MovieCategory>("available");
    // pendingHover: immediate lightweight preview; hovered: promoted full popup after delay
    const [pendingHover, setPendingHover] = useState<string | null>(null);
    const [hovered, setHovered] = useState<string | null>(null);
    const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
    const [popupPos, setPopupPos] = useState<{
        height: any; top: number; left: number; width: number
    } | null>(null);
    const movieRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const [isPopupHovered, setIsPopupHovered] = useState(false);
    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // clear timer on unmount
    useEffect(() => {
        return () => {
            if (hoverTimerRef.current) {
                clearTimeout(hoverTimerRef.current);
                hoverTimerRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const apiUrl = category === "available" 
            ? `${API_BASE_URL}/movies/available?page=${currentPage}&size=12`
            : `${API_BASE_URL}/movies/coming-soon?page=${currentPage}&size=12`;

        fetch(apiUrl)
            .then((res) => res.json())
            .then((data: ApiResponse) => {
                setMovies(data.listContent);
                setPageableData(data.pageableData);
            })
            .catch((error) => console.error('Error fetching movies:', error));
    }, [currentPage, category]);

    // Reset to page 1 when category changes
    useEffect(() => {
        setCurrentPage(1);
    }, [category]);

    // Xử lý lấy id video từ url youtube
    const getYoutubeId = (url: string) => {
        const match = url.match(
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        );
        return match ? match[1] : "";
    };

    // Khi hover vào movie: show a lightweight preview immediately (pendingHover)
    // and start a timer to promote to full popup after 2s
    const handleMouseEnter = (id: string) => {
        // cancel existing timer
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
        const ref = movieRefs.current[id];
        if (ref) {
            const rect = ref.getBoundingClientRect();
            setPopupPos({
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
                height: rect.height,
            });
        }
        setPendingHover(id);
        // promote to full after 2s
        hoverTimerRef.current = setTimeout(() => {
            setHovered(id);
            setPendingHover(null);
            hoverTimerRef.current = null;
        }, 2000);
    };

    // Khi rời movie: cancel timer and hide preview/popup if popup not hovered
    const handleMouseLeave = () => {
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
        if (!isPopupHovered) {
            setPendingHover(null);
            setHovered(null);
            setPopupPos(null);
        }
    };

    return (
        <div className="w-full min-h-screen flex justify-center items-start p-10" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="rounded-2xl p-8">
                {/* Movie Category Tabs */}
                <div className="mb-8">
                    <div className="flex items-center gap-8" style={{ borderBottom: '1px solid var(--color-primary)' }}>
                        <span className="text-2xl font-bold pb-3" style={{ color: 'var(--color-text)' }}>PHIM</span>
                        <button
                            onClick={() => setCategory("available")}
                            className="text-xl font-semibold pb-3 transition-colors hover:opacity-80 cursor-pointer"
                            style={{ 
                                color: category === "available" ? 'var(--color-secondary)' : 'var(--color-primary)', 
                                borderBottom: category === "available" ? '2px solid var(--color-secondary)' : 'none'
                            }}
                        >
                            Đang chiếu
                        </button>
                        <button 
                            onClick={() => setCategory("coming-soon")}
                            className="text-xl font-medium transition-colors pb-3 hover:opacity-80 cursor-pointer"
                            style={{ 
                                color: category === "coming-soon" ? 'var(--color-secondary)' : 'var(--color-primary)',
                                borderBottom: category === "coming-soon" ? '2px solid var(--color-secondary)' : 'none'
                            }}
                        >
                            Sắp chiếu
                        </button>
                    </div>
                </div>

                {movies.length === 0 ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <p className="text-2xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                                Không có phim nào
                            </p>
                            <p className="text-lg" style={{ color: 'var(--color-primary)' }}>
                                Hiện tại chưa có phim trong danh mục này
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-start">
                        {movies.map((movie) => (
                            <div
                                key={movie.id}
                                className="flex flex-col items-center w-64 relative"
                                ref={el => { movieRefs.current[movie.id] = el; }}
                                onMouseEnter={() => handleMouseEnter(movie.id)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <div className="relative w-full h-[380px] rounded-lg overflow-hidden shadow-lg bg-black">
                                    <img
                                        src={movie.image}
                                        alt={lang === "vi" ? movie.nameVn : movie.nameEn || movie.nameVn}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                    <div className="absolute bottom-3 right-0 flex items-center backdrop-trapezoid gap-1 px-2 py-1">
                                        <span className="text-white text-lg font-medium">{movie.ratings}</span>
                                        <svg className="w-4 h-4 text-yellow-200" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.176 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-3 text-base font-semibold text-center text-white">
                                    {lang === "vi" ? movie.nameVn : movie.nameEn || movie.nameVn}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pageableData && pageableData.totalPage > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 cursor-pointer"
                            style={{
                                backgroundColor: 'var(--color-background)',
                                color: 'var(--color-text)',
                                border: '1px solid var(--color-primary)'
                            }}
                        >
                            Trước
                        </button>

                        {Array.from({ length: pageableData.totalPage }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className="px-4 py-2 rounded-lg transition-all hover:opacity-80 cursor-pointer"
                                style={{
                                    backgroundColor: currentPage === page ? 'var(--color-secondary)' : 'var(--color-background)',
                                    color: 'var(--color-text)',
                                    fontWeight: currentPage === page ? 'bold' : 'normal',
                                    border: currentPage === page ? '1px solid var(--color-secondary)' : '1px solid var(--color-primary)'
                                }}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(pageableData.totalPage, prev + 1))}
                            disabled={currentPage === pageableData.totalPage}
                            className="px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 cursor-pointer"
                            style={{
                                backgroundColor: 'var(--color-background)',
                                color: 'var(--color-text)',
                                border: '1px solid var(--color-primary)'
                            }}
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>
            {/* Popup movie nằm ngoài grid, định vị tuyệt đối */}
            {(pendingHover || hovered) && popupPos && (
                <div
                    className="absolute z-50"
                    style={{
                        top: popupPos.top + (popupPos.height ? (popupPos.height / 2) : (popupPos.width / 2)) - 30,
                        left: popupPos.left + (popupPos.width / 2) - 210,
                        width: 420,
                        pointerEvents: 'none',
                    }}
                >
                    <div
                        style={{ pointerEvents: 'auto' }}
                        onMouseEnter={() => setIsPopupHovered(true)}
                        onMouseLeave={() => {
                            setIsPopupHovered(false);
                            setPendingHover(null);
                            setHovered(null);
                            setPopupPos(null);
                        }}
                    >
                        <div style={{
                            opacity: hovered ? 0 : 1,
                            transform: hovered ? 'translateY(0px) scale(1)' : 'translateY(6px) scale(0.985)',
                            transition: 'opacity 200ms ease, transform 200ms ease'
                        }}>
                            <MoviePopup
                                movieId={hovered || pendingHover!}
                                lang={lang}
                                onShowTrailer={(url) => setTrailerUrl(url)}
                            />
                        </div>
                    </div>
                </div>
            )}
            {/* Popup Youtube trailer */}
            {trailerUrl &&
                ReactDOM.createPortal(
                    <div
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70"
                        onClick={() => setTrailerUrl(null)}
                    >
                        <div
                            className="bg-black rounded-xl overflow-hidden shadow-2xl relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <iframe
                                width="1120"
                                height="630"
                                src={`https://www.youtube.com/embed/${getYoutubeId(trailerUrl)}?autoplay=1`}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                            ></iframe>
                            <button
                                className="absolute top-2 right-2 text-white text-2xl bg-black/60 rounded-full w-10 h-10 flex items-center justify-center hover:bg-black"
                                onClick={() => setTrailerUrl(null)}
                            >
                                &times;
                            </button>
                        </div>
                    </div>,
                    document.body
                )
            }
        </div>
    );
};

export default MoviesPage;
