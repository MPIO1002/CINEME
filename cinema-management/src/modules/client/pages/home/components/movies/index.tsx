import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import MoviePopup from "../movie-popup";

type Movie = {
    id: string;
    nameVn: string;
    nameEn?: string;
    image: string;
    ratings: string;
};

const MovieList: React.FC<{ lang: "vi" | "en" }> = ({ lang }) => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [hovered, setHovered] = useState<string | null>(null);
    const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
    const [popupPos, setPopupPos] = useState<{
        height: any; top: number; left: number; width: number
    } | null>(null);
    const movieRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const [isPopupHovered, setIsPopupHovered] = useState(false);

    useEffect(() => {
        fetch("http://localhost:8080/api/v1/movies")
            .then((res) => res.json())
            .then((data) => {
                if (data.statusCode === 200 && Array.isArray(data.data)) {
                    setMovies(data.data);
                }
            });
    }, []);

    // Xử lý lấy id video từ url youtube
    const getYoutubeId = (url: string) => {
        const match = url.match(
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        );
        return match ? match[1] : "";
    };

    // Khi hover vào movie, lấy vị trí để đặt popup
    const handleMouseEnter = (id: string) => {
        setHovered(id);
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
    };

    const handleMouseLeave = () => {
        setTimeout(() => {
            if (!isPopupHovered) {
                setHovered(null);
                setPopupPos(null);
            }
        }, 50);
    };

    return (
        <div className="w-full min-h-screen flex justify-center items-start p-10">
            <div className="backdrop-blur-md bg-black/50 rounded-2xl p-8">
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
            </div>
            {/* Popup movie nằm ngoài grid, định vị tuyệt đối */}
            {hovered && popupPos && (
                <div
                    className="absolute z-50"
                    style={{
                        top: popupPos.top + (popupPos.height ? (popupPos.height / 2) : (popupPos.width / 2)) - 30,
                        left: popupPos.left + (popupPos.width / 2) - 210,
                        width: 420,
                        pointerEvents: "none",
                    }}
                    onMouseEnter={() => setIsPopupHovered(true)}
                    onMouseLeave={() => {
                        setIsPopupHovered(false);
                        handleMouseLeave();
                    }}
                >
                    <div style={{ pointerEvents: "auto" }}>
                        <MoviePopup
                            movieId={hovered}
                            lang={lang}
                            onShowTrailer={(url) => setTrailerUrl(url)}
                        />
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

export default MovieList;