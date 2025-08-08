import { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faGear, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import Login from "../dialogs/Login";

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

const Nav = ({
  lang,
  onLangChange,
}: {
  lang: "vi" | "en";
  onLangChange?: (lang: "vi" | "en") => void;
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [openLogin, setOpenLogin] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
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
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleOpenLogin = () => {
    setOpenLogin(true);
  }

  const handleOnClose = () => {
    setOpenLogin(false);
  }
  return (
    <nav
      className={`w-full flex items-center justify-between fixed top-0 left-0 z-30 px-6 py-3 transition-colors duration-300 ${scrolled ? "bg-[var(--color-background)] bg-opacity-95" : "bg-transparent"
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
        <li className="hover:text-[var(--color-secondary)] cursor-pointer transition">{TEXT[lang].phim}</li>
        <li className="hover:text-[var(--color-secondary)] cursor-pointer transition">{TEXT[lang].rap}</li>
        <li className="hover:text-[var(--color-secondary)] cursor-pointer transition">{TEXT[lang].suatchieu}</li>
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
        <button aria-label="User" className="hover:text-[var(--color-accent)] transition" onClick={handleOpenLogin}>
          <FontAwesomeIcon icon={faUser} className="w-6 h-6" />
        </button>
        <button aria-label="Settings" className="hover:text-[var(--color-accent)] transition">
          <FontAwesomeIcon icon={faGear} className="w-6 h-6" />
        </button>
      </div>
        {/* Login Dialog */}
        {openLogin && (
            <Login onClose={handleOnClose}/>
        )}
    </nav>
  );
};

export default Nav;