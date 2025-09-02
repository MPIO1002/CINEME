import { faTicket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../../../../components/api-config";

// Cache để lưu trữ data đã fetch
const movieDetailCache = new Map<string, MovieDetail>();

if (typeof window !== "undefined" && !document.getElementById("scale-up-center-keyframes")) {
    const style = document.createElement("style");
    style.id = "scale-up-center-keyframes";
    style.innerHTML = `
    @keyframes scale-up-center {0% { transform: scale(0.5); } 100% { transform: scale(1);} }
    .scale-up-center-normal { 
        animation: scale-up-center 0.4s cubic-bezier(0.390, 0.575, 0.565, 1.000) 0s 1 normal both; 
    }
    `;
    document.head.appendChild(style);
}

type MoviePopupProps = {
    movieId: string;
    lang: "vi" | "en";
    onShowTrailer: (trailerUrl: string) => void;
};

type MovieDetail = {
    nameVn: string;
    nameEn?: string;
    image: string;
    ratings: string;
    trailer?: string;
    briefVn?: string;
    briefEn?: string;
};

const MoviePopup: React.FC<MoviePopupProps> = ({ movieId, lang, onShowTrailer }) => {
    const navigate = useNavigate();
    const [detail, setDetail] = useState<MovieDetail | null>(null);

    useEffect(() => {
        // Kiểm tra cache trước
        if (movieDetailCache.has(movieId)) {
            setDetail(movieDetailCache.get(movieId)!);
            return;
        }

        // Chỉ fetch nếu chưa có trong cache
        fetch(`${API_BASE_URL}/movies/${movieId}/detail`)
            .then(res => res.json())
            .then(data => {
                if (data.statusCode === 200 && data.data) {
                    const movieDetail = data.data;
                    setDetail(movieDetail);
                    // Lưu vào cache
                    movieDetailCache.set(movieId, movieDetail);
                }
            })
            .catch(error => {
                console.error('Error fetching movie detail:', error);
            });
    }, [movieId]);

    if (!detail) return (
        <div className="absolute inset-0 z-40 flex items-center justify-center">
            <div className="w-[420px] h-[420px] rounded-2xl shadow-2xl bg-[var(--color-background)] text-white p-8 scale-up-center-normal flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin"></div>
                    <div className="mt-2 text-base">{lang === "en" ? "Loading..." : "Đang tải..."}</div>
                </div>
            </div>
        </div>
    );

    // Lấy tên và mô tả theo ngôn ngữ, fallback nếu thiếu
    const name = lang === "en" && detail.nameEn ? detail.nameEn : detail.nameVn;
    const brief =
        lang === "en"
            ? (detail.briefEn && detail.briefEn.trim() !== "" ? detail.briefEn : detail.briefVn)
            : detail.briefVn;

    return (
        <div className="absolute inset-0 z-40 flex items-center justify-center">
            <div className="w-[450px] h-[450px] rounded-2xl shadow-2xl bg-[var(--color-background)] text-white scale-up-center-normal overflow-hidden flex flex-col">
                <div className="w-full h-[45%] bg-black relative">
                    <img
                        src={detail.image}
                        alt={name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[var(--color-background)]/100 to-transparent" />
                </div>
                <div className="flex-1 px-6 py-4 flex flex-col justify-between">
                    <div>
                        <div className="font-bold text-lg mb-1">{name}</div>
                        {lang === "vi" && detail.nameEn && (
                            <div className="text-sm mb-3 text-[var(--color-accent)]">{detail.nameEn}</div>
                        )}
                        {lang === "en" && detail.nameVn && detail.nameEn && (
                            <div className="text-sm mb-3 text-[var(--color-accent)]">{detail.nameVn}</div>
                        )}
                    </div>
                    {brief && (
                        <div className="text-sm text-gray-200 mb-3">
                            {brief.split(" ").length > 35
                                ? brief.split(" ").slice(0, 35).join(" ") + "..."
                                : brief}
                        </div>
                    )}
                    <div className="flex gap-2 mt-auto text-sm">
                        <a href={`booking/${movieId}/`}
                            className="flex-1 bg-gradient-to-r from-[var(--color-accent)] to-white hover:from-[var(--color-secondary)] hover:to-yellow-100 text-[var(--color-background)] font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faTicket} className="w-5 h-5 text-[var(--color-background)]" />
                            <span className="font-bold">{lang === "en" ? "Buy Ticket" : "Mua vé"}</span>
                        </a>
                        <button
                            onClick={() => {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                navigate(`/film/${movieId}`);
                            }}
                            className="flex-1 border border-gray-400 hover:bg-black rounded-lg py-2 font-semibold flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" />
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2 2" />
                            </svg>
                            {lang === "en" ? "Details" : "Xem chi tiết"}
                        </button>
                        {detail.trailer && (
                            <button
                                className="flex-1 border border-gray-400 hover:bg-black rounded-lg py-2 font-semibold flex items-center justify-center gap-2 cursor-pointer"
                                onClick={() => onShowTrailer(detail.trailer!)}
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M6.5 5.5v9l8-4.5-8-4.5z" />
                                </svg>
                                {lang === "en" ? "Trailer" : "Trailer"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MoviePopup;