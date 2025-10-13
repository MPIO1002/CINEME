import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Calendar, Clock, Globe, Users, MessageSquare, ThumbsUp, TrendingUp } from 'lucide-react';
import { API_BASE_URL } from '../../../../components/api-config';
import ProgressBar from '../../components/progress-bar'; 
// Using emoji fallback for face icons to avoid adding new FontAwesome dependency

interface Actor {
  id: string;
  name: string;
  img: string;
}

interface MovieDetail {
  id: string;
  nameVn: string;
  nameEn: string;
  director: string;
  countryVn: string;
  countryEn: string;
  format: string;
  releaseDate: string;
  endDate: string;
  briefVn: string;
  briefEn: string;
  image: string;
  himage: string;
  trailer: string;
  status: string;
  ratings: string;
  time: number;
  limitageNameVn: string;
  limitageNameEn: string;
  languageNameVn: string;
  languageNameEn: string;
  sortorder: number;
  listActor: Actor[];
}

interface ApiResponse {
  statusCode: number;
  message: string;
  data: MovieDetail;
}

interface Review {
  username: string;
  comment: string;
  rating: number;
  date: string;
}

const FilmDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recommended, setRecommended] = useState<MovieDetail[]>([]);
  const recommendedRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchMovieDetail = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/movies/${id}/detail`);
        const data: ApiResponse = await response.json();

        if (data.statusCode === 200) {
          setMovie(data.data);
        }
      } catch (error) {
        console.error('Error fetching movie detail:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieDetail();
    }
  }, [id]);

  // Fetch reviews for the movie
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      try {
        const res = await fetch(`${API_BASE_URL}/movies/${id}/reviews`);
        const json = await res.json();
        if (json && json.statusCode === 200 && Array.isArray(json.data)) {
          setReviews(json.data);
        } else {
          console.warn('Unexpected reviews response', json);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };

    fetchReviews();
  }, [id]);

  // Fetch recommended movies
  useEffect(() => {
    const fetchRecommended = async () => {
      if (!id) return;
      try {
        const res = await fetch(`${API_BASE_URL}/movies/recommend?movieId=${encodeURIComponent(id)}&topN=10`);
        const json = await res.json();
        if (json && json.statusCode === 200 && Array.isArray(json.data)) {
          setRecommended(json.data);
        } else {
          console.warn('Unexpected recommend response', json);
        }
      } catch (err) {
        console.error('Error fetching recommended movies:', err);
      }
    };

    fetchRecommended();
  }, [id]);

  // Enable click+drag to scroll horizontally (desktop mouse). Touch devices keep native swipe.
  useEffect(() => {
    const el = recommendedRef.current;
    if (!el) return;

    const isDown = { value: false } as { value: boolean };
    const startX = { value: 0 } as { value: number };
    const scrollLeft = { value: 0 } as { value: number };

    const onPointerDown = (e: PointerEvent) => {
      // Only engage drag behavior for mouse to avoid interfering with touch swipe
      if (e.pointerType !== 'mouse') return;
      isDown.value = true;
      startX.value = e.clientX;
      scrollLeft.value = el.scrollLeft;
      el.classList.add('dragging');
      try { (e.target as Element).setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDown.value) return;
      e.preventDefault();
      const x = e.clientX;
      const walk = x - startX.value; // positive when moving right
      el.scrollLeft = scrollLeft.value - walk;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      isDown.value = false;
      el.classList.remove('dragging');
      try { (e.target as Element).releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointerleave', onPointerUp);

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointerleave', onPointerUp);
    };
  }, [recommendedRef.current]);

  // Scroll to top when the movie id changes (e.g., navigating to another film)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: 'var(--color-secondary)' }}></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-background)' }}>
        <p className="text-xl" style={{ color: 'var(--color-text)' }}>Không tìm thấy thông tin phim</p>
      </div>
    );
  }

  const videoId = getYouTubeVideoId(movie.trailer);

  // Use backend-provided rating percent (movie.ratings is already a percent)
  const ratingPercent = Math.round(Number(movie.ratings) || 0);
  const totalReviews = reviews.length;

  const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return (parts[0].slice(0,1) + parts[parts.length-1].slice(0,1)).toUpperCase();
  };

  return (
    <>
      {/* Custom CSS for scrolling animations and recommended scroller */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          
          @keyframes scroll-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          
          .animate-scroll-left {
            animation: scroll-left 15s linear infinite;
          }
          
          .animate-scroll-right {
            animation: scroll-right 15s linear infinite;
          }

          /* Recommended scroller - show a thin themed scrollbar similar to booking page */
          .recommended-scroll {
            scrollbar-width: thin;
            scrollbar-color: var(--color-accent) transparent;
            cursor: grab;
          }
          .recommended-scroll.dragging { cursor: grabbing; }
          .recommended-scroll::-webkit-scrollbar { height: 10px; }
          .recommended-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.06); border-radius: 6px; }
          .recommended-scroll::-webkit-scrollbar-thumb { background: linear-gradient(45deg, var(--color-accent), var(--color-secondary)); border-radius: 6px; }
          .recommended-scroll::-webkit-scrollbar-thumb:hover { background: linear-gradient(45deg, var(--color-secondary), var(--color-accent)); }

          .recommended-card {
            transition: transform 0.25s ease, box-shadow 0.25s ease;
          }
          .recommended-card:hover { transform: translateY(-6px); box-shadow: 0 12px 30px rgba(0,0,0,0.35); }
        `
      }} />

      <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}>
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to right, var(--color-background), rgba(36, 34, 30, 0.7), transparent)' }}></div>
          <div className="absolute inset-0 z-15" style={{ background: 'linear-gradient(to top, var(--color-background), transparent)' }}></div>
          <div
            className="h-screen bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${movie.image})` }}
          >
            <div className="relative z-20 container mx-auto p-10 h-full flex items-center">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center w-full">
                {/* Movie Info */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 rounded font-bold" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-background)' }}>
                      {movie.format}
                    </span>
                    <span className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-text)' }}>
                      {movie.limitageNameVn}
                    </span>
                  </div>

                  <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                    {movie.nameVn}
                  </h1>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(movie.releaseDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(movie.time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span>{movie.languageNameVn}</span>
                    </div>
                  </div>

                  <p className="text-lg leading-relaxed max-w-2xl">
                    {movie.briefVn}
                  </p>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowTrailer(true)}
                      className="px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                      style={{ backgroundColor: 'var(--color-secondary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-accent)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-secondary)'}
                    >
                      <Play className="w-5 h-5" />
                      Xem Trailer
                    </button>
                    <button
                      onClick={() => navigate(`/booking/${id}`)}
                      className="px-6 py-3 rounded-lg transition-colors border"
                      style={{
                        borderColor: 'white',
                        color: 'white'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.color = 'var(--color-background)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'white';
                      }}
                    >
                      Đặt Vé
                    </button>
                  </div>

                  <div className="pt-4">
                    <p className="text-sm text-white">
                      <span className="font-semibold">Đạo diễn:</span> {movie.director}
                    </p>
                    <p className="text-sm text-white">
                      <span className="font-semibold">Quốc gia:</span> {movie.countryVn}
                    </p>

                    {/* Cast Section */}
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                        <Users className="w-4 h-4" style={{ color: 'var(--color-secondary)' }} />
                        Diễn viên
                      </h4>
                      <div className="flex gap-1 overflow-x-auto pb-2">
                        {movie.listActor.slice(0, 8).map((actor, index) => (
                          <div key={`${actor.id}-${index}`} className="text-center group cursor-pointer flex-shrink-0">
                            <div className="relative overflow-hidden rounded-full mb-2 w-16 h-16 mx-auto">
                              <img
                                src={actor.img}
                                alt={actor.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                              <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"
                                style={{ background: 'linear-gradient(to top, rgba(36, 34, 30, 0.7), transparent)' }}
                              ></div>
                            </div>
                            <p className="font-medium text-xs w-16 truncate" style={{ color: 'var(--color-text)' }}>{actor.name}</p>
                          </div>
                        ))}
                      </div>
                      {movie.listActor.length > 8 && (
                        <div className="text-left mt-2">
                          <span className="text-xs" style={{ color: 'var(--color-primary)' }}>
                            +{movie.listActor.length - 8} diễn viên khác
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Movie Poster */}
                <div className="flex justify-center lg:justify-end">
                  <div className="relative">
                    <img
                      src={movie.image}
                      alt={movie.nameVn}
                      className="w-80 h-auto rounded-lg shadow-2xl"
                    />
                    <div
                      className="absolute inset-0 rounded-lg"
                      style={{ background: 'linear-gradient(to top, rgba(36, 34, 30, 0.5), transparent)' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrolling Ribbons Section - Full Width */}
        <div className="relative py-20 overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
          <div className="space-y-6">
            {/* First Ribbon - Orange to Yellow */}
            <div
              className="py-6 transform -rotate-3 overflow-hidden"
              style={{
                background: 'linear-gradient(45deg, #ff6b35, #ffd700)',
                boxShadow: '0 8px 25px rgba(255, 107, 53, 0.4)',
                width: '100vw',
                marginLeft: 'calc(-50vw + 50%)',
                zIndex: 9999
              }}
            >
              <div className="flex animate-scroll-left whitespace-nowrap">
                {Array.from({ length: 30 }).map((_, i) => (
                  <span key={i} className="mx-8 text-white font-bold text-2xl tracking-wider">
                    • CINEMA •
                  </span>
                ))}
              </div>
            </div>

            {/* Second Ribbon - Red to Orange */}
            <div
              className="py-6 transform rotate-1 overflow-hidden"
              style={{
                background: 'linear-gradient(45deg, #dc2626, #ff6b35)',
                boxShadow: '0 8px 25px rgba(220, 38, 38, 0.4)',
                width: '100vw',
                marginLeft: 'calc(-50vw + 50%)',
                zIndex: 9999
              }}
            >
              <div className="flex animate-scroll-right whitespace-nowrap">
                {Array.from({ length: 30 }).map((_, i) => (
                  <span key={i} className="mx-8 text-white font-bold text-2xl tracking-wider">
                    ★ MOVIES ★
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <ProgressBar currentStep="film-detail" />

        {/* Rating and Reviews Section */}
        <div className="py-16 px-8" style={{ backgroundColor: 'var(--custom-300)' }}>
          <div className="container mx-auto px-4">

            {/* Section Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6" style={{ color: 'var(--color-accent)' }} />
                <h2 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>
                  ĐÁNH GIÁ VÀ BÌNH LUẬN
                </h2>
              </div>
              <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Cùng xem khán giả nghĩ gì về bộ phim này
              </p>
            </div>

            <div className="space-y-6">
              {/* Rating Card - moved above reviews */}
              <div className="p-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-6 mb-2">
                    <div className="relative">
                      <div className="text-5xl font-bold">
                        {ratingPercent}%
                      </div>
                      <div className="text-sm text-gray-300">Trung bình</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <div className="h-3 w-48 rounded-full overflow-hidden bg-[var(--custom-300)]">
                      <div className="h-full bg-[var(--color-accent)]" style={{ width: `${ratingPercent}%` }} />
                    </div>
                    <div className="text-sm font-medium">{ratingPercent}%</div>
                  </div>
                  <p className="text-sm font-medium mt-3">
                    Đánh giá từ {totalReviews} khán giả
                  </p>
                </div>
              </div>

              {/* Reviews List - single column */}
              <div className="space-y-5 shadow-lg rounded-2xl p-4"
                style={{
                  backgroundColor: 'var(--color-background)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                {/* Review Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
                    <h3 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
                      Bình luận nổi bật
                    </h3>
                  </div>
                  <button className="text-sm px-4 py-2 rounded-lg transition-colors border"
                    style={{
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'rgba(255, 255, 255, 0.8)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                    }}>
                    Xem tất cả
                  </button>
                </div>

                {/* Render reviews fetched from backend */}
                {reviews.length === 0 ? (
                  <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Chưa có bình luận nào.</p>
                ) : (
                  reviews.map((r, idx) => {
                    return (
                      <div key={`${r.username}-${idx}`} className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group" style={{ backgroundColor: 'var(--color-background)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#6b7280' }}>
                                <span className="text-white text-xl font-bold">{getInitials(r.username)}</span>
                              </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>{r.username}</p>
                              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}>
                                {r.rating}/10
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{new Date(r.date).toLocaleDateString('vi-VN')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--color-text)' }}>{r.comment}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Recommended Movies */}
              <div className="mt-8">
                <h4 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text)' }}>PHIM ĐỀ CỬ</h4>
                {recommended.length === 0 ? (
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Không có đề cử nào.</p>
                ) : (
                  <div ref={recommendedRef} className="flex gap-4 overflow-x-auto pb-2 recommended-scroll">
                    {recommended.map((rec) => (
                      <div key={rec.id} className="w-56 flex-shrink-0 cursor-pointer recommended-card" onClick={() => navigate(`/film/${rec.id}`)}>
                        <div className="relative mb-2 rounded-lg overflow-hidden" style={{ height: '400px', backgroundColor: 'rgba(0,0,0,0.08)' }}>
                          <img src={rec.image} alt={rec.nameVn} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-sm text-center font-semibold truncate" style={{ color: 'var(--color-text)' }}>{rec.nameVn || rec.nameEn}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trailer Modal */}
        {showTrailer && videoId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(36, 34, 30, 0.8)' }}>
            <div className="relative w-full max-w-4xl">
              <button
                onClick={() => setShowTrailer(false)}
                className="absolute -top-10 right-0 text-2xl transition-colors"
                style={{ color: 'var(--color-text)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text)'}
              >
                ✕
              </button>
              <div className="relative pt-[56.25%]">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                  className="absolute inset-0 w-full h-full rounded-lg"
                  allowFullScreen
                  title="Movie Trailer"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FilmDetail;