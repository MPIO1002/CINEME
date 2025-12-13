import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTicket, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { API_BASE_URL } from "../../../../../../components/api-config";

const animationStyles = `
@keyframes tracking-in-contract-bck-bottom {
  0% { letter-spacing: 1em; transform: translateZ(400px) translateY(300px); opacity: 0; }
  40% { opacity: 0.6; }
  100% { transform: translateZ(0) translateY(0); opacity: 1;}
}
.tracking-in-contract-bck-bottom-normal {
  animation: tracking-in-contract-bck-bottom 1s cubic-bezier(0.215, 0.610, 0.355, 1.000) 0s 1 normal both;
}
@keyframes jello-horizontal {
  0% { transform: scale3d(1, 1, 1); }
  30% { transform: scale3d(1.25, 0.75, 1); }
  40% { transform: scale3d(0.75, 1.25, 1); }
  50% { transform: scale3d(1.15, 0.85, 1); }
  65% { transform: scale3d(0.95, 1.05, 1); }
  75% { transform: scale3d(1.05, 0.95, 1); }
  100% { transform: scale3d(1, 1, 1);}
}
.jello-horizontal-normal {
  animation: jello-horizontal 0.9s ease 0s 1 normal both;
}

/* Fade out animation for image */
@keyframes fade-out {
  0% { opacity: 1; }
  100% { opacity: 0;}
}
.fade-out-normal {
  animation: fade-out 1s ease-out 0s 1 normal both;
}

/* Hide scrollbar */
.hot-movies-scroll::-webkit-scrollbar {
  display: none;
}
.hot-movies-scroll {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
`;

type Movie = {
  id: string;
  nameVn: string;
  nameEn?: string;
  image: string;
  ratings: string;
  briefVn?: string;
  briefEn?: string;
};

type HeroMovie = {
  id: string;
  nameEN: string;
  nameVI: string;
  image: string;
  logo: string;
  descriptionEN: string;
  descriptionVI: string;
};

const HeroCarousel: React.FC<{ lang: "vi" | "en" }> = ({ lang }) => {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [prevActive, setPrevActive] = useState<number | null>(null);
  const [hotMovies, setHotMovies] = useState<Movie[]>([]);
  const [carouselMovies, setCarouselMovies] = useState<Movie[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Fetch trending movies from API (top 7 with all details in one call)
  useEffect(() => {
    fetch(`${API_BASE_URL}/movies/trending`)
      .then((res) => res.json())
      .then((data) => {
        if (data.statusCode === 200 && Array.isArray(data.data)) {
          const movieList = data.data.slice(0, 7).map((movie: any) => ({
            id: movie.id,
            nameVn: movie.nameVn,
            nameEn: movie.nameEn,
            image: movie.image,
            ratings: movie.ratings.toString(),
            briefVn: movie.briefVn,
            briefEn: movie.briefEn,
          }));
          
          setHotMovies(movieList);
          setCarouselMovies(movieList);
        }
      })
      .catch((error) => {
        console.error('Error fetching trending movies:', error);
      });
  }, []);

  // Handle click on hot movie to show in carousel
  const handleHotMovieClick = (movieIndex: number) => {
    setPrevActive(active);
    setActive(movieIndex);
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = animationStyles;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setPrevActive(active);
      setActive((prev) => (prev + 1) % carouselMovies.length);
    }, 6000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, carouselMovies.length]);

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if ("touches" in e) {
      touchStartX.current = e.touches[0].clientX;
    } else {
      touchStartX.current = (e as React.MouseEvent).clientX;
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if ("touches" in e) {
      touchEndX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = () => {
    if (
      touchStartX.current !== null &&
      touchEndX.current !== null &&
      Math.abs(touchStartX.current - touchEndX.current) > 50
    ) {
      if (touchStartX.current > touchEndX.current) {
        // Swipe left
        setPrevActive(active);
        setActive((prev) => (prev + 1) % carouselMovies.length);
      } else {
        // Swipe right
        setPrevActive(active);
        setActive((prev) => (prev === 0 ? carouselMovies.length - 1 : prev - 1));
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Mouse swipe support
  const handleMouseMove = (e: MouseEvent) => {
    touchEndX.current = e.clientX;
  };
  const handleMouseUp = () => {
    handleTouchEnd();
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div id="indicators-carousel" className="relative w-full" data-carousel="static">
      <div
        className="relative h-56 overflow-hidden md:h-[calc(100vh-100px)] object-cover"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        style={{ touchAction: "pan-y" }}
      >
        {carouselMovies.map((movie, idx) => (
          <div
            key={movie.id}
            className={`absolute inset-0 duration-700 ease-in-out ${active === idx ? "" : "hidden"}`}
            data-carousel-item={active === idx ? "active" : undefined}
          >
            {/* Active image */}
            <img
              src={carouselMovies[active]?.image}
              alt={lang === "vi" ? carouselMovies[active]?.nameVn : carouselMovies[active]?.nameEn || carouselMovies[active]?.nameVn}
              className="absolute block w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
              style={{ filter: 'brightness(0.6)' }}
            />
            {/* PrevActive image with fade-out */}
            {prevActive !== null && prevActive !== active && carouselMovies[prevActive] && (
              <img
                src={carouselMovies[prevActive].image}
                alt={lang === "vi" ? carouselMovies[prevActive].nameVn : carouselMovies[prevActive].nameEn || carouselMovies[prevActive].nameVn}
                className="absolute block w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 fade-out-normal pointer-events-none"
                style={{ filter: 'brightness(0.6)' }}
                onAnimationEnd={() => setPrevActive(null)}
              />
            )}
          </div>
        ))}
        {/* Overlay gradient */}
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0) 60%, rgba(0,0,0,0.7) 100%), linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 30%), linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 30%), linear-gradient(to left, rgba(0,0,0,0.7) 0%, transparent 30%), linear-gradient(to right, rgba(0,0,0,0.7) 0%, transparent 30%)",
            mixBlendMode: "multiply",
          }}
        />

        {/* Bottom overlay with background color gradient */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-15"
          style={{
            height: "200px",
            background: "linear-gradient(to top, var(--color-background) 0%, transparent 100%)",
          }}
        />
        {carouselMovies.map((movie, idx) => (
          active === idx && (
            <div
              key={movie.id}
              className="absolute bottom-70 left-5 w-full p-4 flex flex-col items-start md:items-start z-20"
            >
              <h2
                className="text-4xl md:text-6xl font-bold mb-2 tracking-in-contract-bck-bottom-normal"
                style={{ color: "var(--color-text)" }}
              >
                {lang === "vi" ? movie.nameVn : movie.nameEn || movie.nameVn}
              </h2>

              {/* Movie Description */}
              {(movie.briefVn || movie.briefEn) && (
                <p className="text-white text-sm md:text-base mb-4 max-w-2xl line-clamp-3 md:line-clamp-4 tracking-in-contract-bck-bottom-normal">
                  {lang === "vi" ? movie.briefVn : movie.briefEn || movie.briefVn}
                </p>
              )}

              {/* Buttons */}
              <div className="flex gap-4 mb-4">
                <button
                  onClick={() => navigate(`/booking/${movie.id}`)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-lg font-semibold flex items-center gap-2 hover:from-orange-600 hover:to-red-600 transition-colors"
                >
                  <FontAwesomeIcon icon={faTicket} className="w-5 h-5" />
                  <span>Mua vé</span>
                </button>
                <button
                  onClick={() => navigate(`/film/${movie.id}`)}
                  className="border-2 border-white text-white py-3 px-6 rounded-lg font-semibold flex items-center gap-2 hover:bg-white hover:text-black transition-colors"
                >
                  <FontAwesomeIcon icon={faInfoCircle} className="w-5 h-5" />
                  <span>Xem chi tiết</span>
                </button>
              </div>
            </div>
          )
        ))}
      </div>

      {/* Hot Movies Section - Bottom Horizontal */}
      <div className="absolute bottom-0 right-0 z-30 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-bold flex items-center gap-2">
            <span>🔥</span>
            <span>HOT</span>
          </div>
          <h2 className="text-white text-2xl font-bold">PHIM HOT TRONG THÁNG</h2>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 hot-movies-scroll">
          {hotMovies.map((movie, index) => (
            <div
              key={movie.id}
              className="flex-shrink-0 relative group cursor-pointer"
              onClick={() => handleHotMovieClick(index)}
            >
              {/* Movie Number */}
              <div className="absolute top-2 left-2 z-30">
                <span
                  className="text-6xl font-black opacity-80"
                  style={{
                    color: 'var(--color-accent)',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  {index + 1}
                </span>
              </div>

              {/* Movie Poster */}
              <div className="relative w-32 h-48 rounded-lg overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
                <img
                  src={movie.image}
                  alt={lang === "vi" ? movie.nameVn : movie.nameEn || movie.nameVn}
                  className="w-full h-full object-cover"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center">
                  <div className="text-white text-center p-2">

                  </div>
                </div>
              </div>

              {/* Movie Title */}
              <div className="mt-2 w-32">
                <p className="text-white text-xs font-medium text-center line-clamp-2">
                  {lang === "vi" ? movie.nameVn : movie.nameEn || movie.nameVn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;