import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faGear, faChevronDown, faSignOutAlt, faUserCircle } from "@fortawesome/free-solid-svg-icons";
import { API_BASE_URL } from "../../../../components/api-config";
import AuthModal from "../auth-modal";
import { useToast } from "../../../../hooks/useToast";
import { handleLogoutAPI } from "../../../../utils/auth";
import userApiService from "../../../../services/userApi";

const LANGUAGES = [
  { code: "vi", label: "VIE", flag: "/VN.webp" },
  { code: "en", label: "ENG", flag: "/ENG.webp" },
];

const TEXT = {
  vi: {
    slogan: "Xem là mê.",
    phim: "Phim",
    rap: "Rạp",
    suatchieu: "Suất chiếu",
  },
  en: {
    slogan: "Watch and love.",
    phim: "Movies",
    rap: "Cinemas",
    suatchieu: "Showtimes",
  }
};

interface Movie {
  id: string;
  nameVn: string;
  nameEn: string;
  image: string;
}

interface Theater {
  id: string;
  nameEn: string;
  nameVn: string;
}

interface UserData {
  id: string;
  email: string;
  fullName: string;
  accessToken: string;
  refreshToken: string;
}

const Nav = ({
  lang,
  onLangChange,
}: {
  lang: "vi" | "en";
  onLangChange?: (lang: "vi" | "en") => void;
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  
  // Popup states
  const [showMoviePopup, setShowMoviePopup] = useState(false);
  const [showTheaterPopup, setShowTheaterPopup] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState(false);
  const [isLoadingTheaters, setIsLoadingTheaters] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  // Refs and timers for movie/theater popup hide delays
  const moviePopupRef = useRef<HTMLDivElement | null>(null);
  const theaterPopupRef = useRef<HTMLDivElement | null>(null);
  const movieHideTimer = useRef<number | null>(null);
  const theaterHideTimer = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Check for saved user data on mount and listen for storage changes
  useEffect(() => {
    const checkUserData = () => {
      const savedUserData = localStorage.getItem('userData');
      const accessToken = localStorage.getItem('accessToken');
      
      if (savedUserData) {
        try {
          const userData = JSON.parse(savedUserData);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing saved user data:', error);
          localStorage.removeItem('userData');
        }
      } else if (accessToken) {
        // If we have accessToken but no userData, user just logged in via OAuth
        // Fetch user profile data
        fetchUserProfile(accessToken);
      } else {
        setUser(null);
      }
    };

    const fetchUserProfile = async (token: string) => {
      try {
        const result = await userApiService.getUserProfile();
        const userData: UserData = {
          id: result.id,
          email: result.email,
          fullName: result.fullName,
          accessToken: token,
          refreshToken: token,
        };
        setUser(userData);
        localStorage.setItem('userData', JSON.stringify(userData));
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    // Check initially
    checkUserData();

    // Listen for storage changes (including OAuth callbacks)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userData' || e.key === 'accessToken') {
        checkUserData();
      }
    };

    // Listen for window focus (in case user logged in from another tab)
    const handleFocus = () => {
      checkUserData();
    };

    // Custom event for manual user data updates
    const handleUserDataUpdate = () => {
      checkUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('userDataUpdated', handleUserDataUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('userDataUpdated', handleUserDataUpdate);
    };
  }, []);

  useEffect(() => {
    onLangChange?.(lang);
  }, [lang, onLangChange]);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    if (open || showUserDropdown) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, showUserDropdown]);

  // Handle login success
  const handleLoginSuccess = (userData: UserData) => {
    setUser(userData);
    // Dispatch event to notify other components
    window.dispatchEvent(new Event('userDataUpdated'));
  };

  // Handle logout
  const handleLogout = async () => {
    setUser(null);
    setShowUserDropdown(false);
    await handleLogoutAPI('client', showToast, navigate);
  };

  // Fetch movies function
  const fetchMovies = async () => {
    if (movies.length > 0) return; // Don't fetch if already loaded
    
    setIsLoadingMovies(true);
    try {
      const response = await fetch(`${API_BASE_URL}/movies`);
      const data = await response.json();
      
      if (data.statusCode === 200) {
        setMovies(data.data);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setIsLoadingMovies(false);
    }
  };

  // Fetch theaters function
  const fetchTheaters = async () => {
    if (theaters.length > 0) return; // Don't fetch if already loaded
    
    setIsLoadingTheaters(true);
    try {
      const response = await fetch(`${API_BASE_URL}/theaters`);
      const data = await response.json();
      
      if (data.statusCode === 200) {
        setTheaters(data.data);
      }
    } catch (error) {
      console.error('Error fetching theaters:', error);
    } finally {
      setIsLoadingTheaters(false);
    }
  };

  // Handle movie click
  const handleMovieClick = () => {
    setShowMoviePopup(false);
    navigate('/');
  };

  return (
    <nav
      className={`w-full flex items-center justify-between fixed top-0 left-0 z-90 px-6 py-3 transition-colors duration-300 ${scrolled ? "bg-[var(--color-background)] bg-opacity-95" : "bg-transparent"
        }`}
      style={{
        color: "var(--color-text)",
      }}
    >
      {/* Logo, tên rạp và slogan */}
      <a href="/" className="flex items-center gap-3">
        <img src="/logo_cinema_new.PNG" alt="Cinemê Logo" className="w-10 h-10 object-contain" />
        <div>
          <span className="font-bold text-xl leading-tight block">Cinemê</span>
          <span className="text-xs opacity-80 block">{TEXT[lang].slogan}</span>
        </div>
      </a>
      {/* Menu giữa */}
      <ul className="flex gap-8 font-medium text-base">
        <li 
          className="hover:text-[var(--color-secondary)] cursor-pointer transition relative"
          onMouseEnter={() => {
            // Cancel any hide timer and show popup
            if (movieHideTimer.current) { window.clearTimeout(movieHideTimer.current); movieHideTimer.current = null; }
            setShowMoviePopup(true);
            fetchMovies();
          }}
          onMouseLeave={() => {
            // Start a short hide timer to allow pointer to move into popup
            movieHideTimer.current = window.setTimeout(() => setShowMoviePopup(false), 160);
          }}
        >
          {TEXT[lang].phim}
          
          {/* Movies Popup */}
          {showMoviePopup && (
            <div ref={el => { moviePopupRef.current = el; }} className="absolute top-full left-0 mt-2 w-96 bg-[var(--color-background)] border border-gray-700 rounded-lg shadow-xl z-50"
              onMouseEnter={() => {
                // Cancel hide while hovering popup
                if (movieHideTimer.current) { window.clearTimeout(movieHideTimer.current); movieHideTimer.current = null; }
              }}
              onMouseLeave={() => {
                // Hide shortly after leaving popup
                movieHideTimer.current = window.setTimeout(() => setShowMoviePopup(false), 160);
              }}
            >
              <div className="p-4">
                <h3 className="text-lg font-bold mb-3 text-[var(--color-accent)]">Danh sách phim</h3>
                {isLoadingMovies ? (
                  <div className="text-center py-4">Đang tải...</div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {movies.slice(0, 8).map((movie) => (
                      <div 
                        key={movie.id} 
                        onClick={handleMovieClick}
                        className="flex gap-2 p-2 hover:bg-[var(--color-secondary)] rounded-lg transition cursor-pointer"
                      >
                        <img 
                          src={movie.image} 
                          alt={movie.nameVn}
                          className="w-8 h-12 object-cover rounded flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white text-xs truncate">{movie.nameVn}</h4>
                          <p className="text-gray-400 text-xs truncate">{movie.nameEn}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </li>
        
        <li 
          className="hover:text-[var(--color-secondary)] cursor-pointer transition relative"
          onMouseEnter={() => {
            if (theaterHideTimer.current) { window.clearTimeout(theaterHideTimer.current); theaterHideTimer.current = null; }
            setShowTheaterPopup(true);
            fetchTheaters();
          }}
          onMouseLeave={() => {
            theaterHideTimer.current = window.setTimeout(() => setShowTheaterPopup(false), 160);
          }}
        >
          {TEXT[lang].rap}
          
          {/* Theaters Popup */}
          {showTheaterPopup && (
            <div ref={el => { theaterPopupRef.current = el; }} className="absolute top-full left-0 mt-2 w-80 bg-[var(--color-background)] border border-gray-700 rounded-lg shadow-xl z-50"
              onMouseEnter={() => {
                if (theaterHideTimer.current) { window.clearTimeout(theaterHideTimer.current); theaterHideTimer.current = null; }
              }}
              onMouseLeave={() => {
                theaterHideTimer.current = window.setTimeout(() => setShowTheaterPopup(false), 160);
              }}
            >
              <div className="p-4">
                <h3 className="text-lg font-bold mb-3 text-[var(--color-accent)]">Danh sách rạp</h3>
                {isLoadingTheaters ? (
                  <div className="text-center py-4">Đang tải...</div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {theaters.slice(0, 8).map((theater) => (
                      <div key={theater.id} className="p-2 hover:bg-[var(--color-secondary)] rounded-lg transition cursor-pointer">
                        <h4 className="font-medium text-white text-xs truncate">{theater.nameVn}</h4>
                        <p className="text-gray-400 text-xs truncate">{theater.nameEn}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </li>
        
        <li className="hover:text-[var(--color-secondary)] cursor-pointer transition">
          <a href="/showtimes">{TEXT[lang].suatchieu}</a>
        </li>
      </ul>
      {/* Icon user, setting, và chọn ngôn ngữ */}
      <div className="flex items-center gap-5">
        {/* Custom dropdown language */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center text-white px-3 py-1 rounded min-w-[70px] font-semibold focus:outline-none"
            onClick={() => setOpen(v => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
          >
            <img
              src={LANGUAGES.find(l => l.code === lang)?.flag}
              alt={lang}
              className="w-5 h-5 object-cover rounded mr-2"
            />
            <span>{LANGUAGES.find(l => l.code === lang)?.label}</span>
            <FontAwesomeIcon icon={faChevronDown} className="ml-2 w-3 h-3" />
          </button>
          {open && (
            <ul
              className="absolute left-0 mt-2 w-full bg-[#333] rounded shadow-lg z-50"
              role="listbox"
            >
              {LANGUAGES.map(l => (
                <li
                  key={l.code}
                  className={`flex items-center px-3 py-2 cursor-pointer hover:bg-[var(--color-accent)] transition ${lang === l.code ? "bg-[var(--color-accent)]" : ""
                    }`}
                  onClick={() => {
                    onLangChange?.(l.code as "vi" | "en");
                    setOpen(false);
                  }}
                  role="option"
                  aria-selected={lang === l.code}
                >
                  <img src={l.flag} alt={l.label} className="w-7 h-5 object-cover rounded mr-2" />
                  <span>{l.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* User section */}
        {user ? (
          // User is logged in - show user dropdown (without user icon)
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setShowUserDropdown(v => !v)}
              className="flex items-center gap-2 hover:text-[var(--color-accent)] transition cursor-pointer"
            >
              <span className="text-base font-medium">{user.fullName}</span>
              <FontAwesomeIcon icon={faChevronDown} className="w-3 h-3" />
            </button>
            
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-[var(--color-background)] border border-gray-400/20 rounded-lg shadow-xl z-50">
                <div className="p-2">
                  <div className="px-3 py-2 text-sm text-gray-300 border-b border-gray-600">
                    <div className="font-medium text-white">{user.fullName}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[var(--color-accent)]/10 rounded-md transition flex items-center gap-2 mt-1"
                  >
                    <FontAwesomeIcon icon={faUserCircle} className="w-4 h-4" />
                    Hồ sơ cá nhân
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-md transition flex items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // User is not logged in - show login button
          <button 
            aria-label="User" 
            className="hover:text-[var(--color-accent)] transition cursor-pointer"
            onClick={() => setShowAuthModal(true)}
          >
            <FontAwesomeIcon icon={faUser} className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </nav>
  );
};

export default Nav;