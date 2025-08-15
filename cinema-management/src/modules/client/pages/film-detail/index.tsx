import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Star, Calendar, Clock, Globe, Users, MessageSquare, ThumbsUp, CheckCircle, TrendingUp } from 'lucide-react';
import { API_BASE_URL } from '../../../../components/api-config';
import ProgressBar from '../../components/progress-bar'; 

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

const FilmDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);

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

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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

  return (
    <>
      {/* Custom CSS for scrolling animations */}
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
            <div className="relative z-20 container mx-auto px-4 h-full flex items-center">
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
        <div className="py-16" style={{ backgroundColor: 'var(--custom-300)' }}>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Rating Score and Chart */}
              <div className="lg:col-span-1">
                <div className="p-8 rounded-2xl shadow-xl" style={{
                  backgroundColor: 'var(--color-background)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-6 mb-4">
                      <div className="relative">
                        <div className="text-7xl font-bold">
                          {movie.ratings}.0
                        </div>
                      </div>
                      <div className="flex flex-col items-start">
                        <div className="flex mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-7 h-7 ${i < parseInt(movie.ratings)
                                  ? 'fill-current animate-bounce'
                                  : ''
                                }`}
                              style={{
                                color: i < parseInt(movie.ratings) ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.3)',
                                animationDelay: `${i * 0.1}s`
                              }}
                            />
                          ))}
                        </div>
                        <p className="text-sm font-medium">
                          Đánh giá từ 1,247 khán giả
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rating Bar Chart */}
                  <div className="space-y-3">
                    {[
                      { stars: 5, percentage: 78, count: 973 },
                      { stars: 4, percentage: 15, count: 187 },
                      { stars: 3, percentage: 5, count: 62 },
                      { stars: 2, percentage: 1, count: 15 },
                      { stars: 1, percentage: 1, count: 10 }
                    ].map((rating) => (
                      <div key={rating.stars} className="flex items-center gap-3 text-sm group hover:scale-105 transition-transform duration-200">
                        <span style={{ color: 'var(--color-text)' }} className="w-8 font-medium">{rating.stars}★</span>
                        <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--custom-300)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{
                              backgroundColor: rating.stars >= 4 ? 'var(--color-accent)' : rating.stars >= 3 ? 'var(--color-secondary)' : 'rgba(255, 255, 255, 0.4)',
                              width: `${rating.percentage}%`,
                              transform: 'translateX(0%)'
                            }}
                          ></div>
                        </div>
                        <span style={{ color: 'rgba(255, 255, 255, 0.8)' }} className="w-12 text-right font-medium">
                          {rating.percentage}%
                        </span>
                        <span style={{ color: 'rgba(255, 255, 255, 0.5)' }} className="w-12 text-right text-xs">
                          ({rating.count})
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Summary Stats */}
                  <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>93%</div>
                        <div className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Khuyên xem</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold" style={{ color: 'var(--color-secondary)' }}>8.5</div>
                        <div className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>IMDb Score</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Examples */}
              <div className="lg:col-span-2">
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

                  {/* Individual Reviews */}
                  <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                          style={{ backgroundColor: '#e11d48' }}>
                          <span className="text-sm font-bold" style={{ color: 'white' }}>TH</span>
                        </div>
                        <CheckCircle className="absolute -bottom-1 -right-1 w-4 h-4 text-blue-500 bg-white rounded-full" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-lg" style={{ color: 'var(--color-text)' }}>Thanh Huyền</p>
                          <span className="text-xs px-2 py-1 rounded-full"
                            style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}>
                            Verified
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current" style={{ color: 'var(--color-accent)' }} />
                            ))}
                          </div>
                          <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>• 2 ngày trước</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--color-text)' }}>
                      Phim hay, kịch tính và hấp dẫn. Diễn xuất của các diễn viên rất tự nhiên và
                      cuốn hút người xem từ đầu đến cuối. Đặc biệt là phần âm nhạc và cinematography thực sự ấn tượng!
                    </p>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-2 text-sm transition-colors group-hover:text-accent"
                        style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>
                        <ThumbsUp className="w-4 h-4" />
                        <span>142</span>
                      </button>
                      <button className="text-sm transition-colors"
                        style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>
                        Trả lời
                      </button>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: '#10b981' }}>
                        <span className="text-sm font-bold" style={{ color: 'white' }}>MN</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-lg mb-1" style={{ color: 'var(--color-text)' }}>Minh Ngọc</p>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current" style={{ color: 'var(--color-accent)' }} />
                            ))}
                          </div>
                          <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>• 3 ngày trước</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--color-text)' }}>
                      Một bộ phim trinh thám xuất sắc với cốt truyện hấp dẫn và những tình tiết
                      bất ngờ. Rất đáng xem!
                    </p>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-2 text-sm transition-colors"
                        style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>
                        <ThumbsUp className="w-4 h-4" />
                        <span>89</span>
                      </button>
                      <button className="text-sm transition-colors"
                        style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>
                        Trả lời
                      </button>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                    style={{
                      backgroundColor: 'var(--color-background)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      opacity: 0.9
                    }}>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: '#3b82f6' }}>
                        <span className="text-sm font-bold" style={{ color: 'white' }}>DL</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-lg mb-1" style={{ color: 'var(--color-text)' }}>Duy Lâm</p>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-current" style={{ color: 'var(--color-accent)' }} />
                            ))}
                          </div>
                          <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>• 1 tuần trước</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--color-text)' }}>
                      Cinematography tuyệt vời, âm thanh sống động. Victor Vũ thực sự đã tạo ra một
                      kiệt tác điện ảnh Việt Nam đáng tự hào!
                    </p>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-2 text-sm transition-colors"
                        style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>
                        <ThumbsUp className="w-4 h-4" />
                        <span>203</span>
                      </button>
                      <button className="text-sm transition-colors"
                        style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}>
                        Trả lời
                      </button>
                    </div>
                  </div>
                </div>
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