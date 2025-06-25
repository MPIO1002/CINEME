import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faHouse, faPhone, faEnvelope } from "@fortawesome/free-solid-svg-icons";

const TEXT = {
  vi: {
    about: "GIỚI THIỆU",
    aboutItems: ["Về Chúng Tôi", "Thỏa Thuận Sử Dụng", "Quy Chế Hoạt Động", "Chính Sách Bảo Mật"],
    cinema: "GÓC ĐIỆN ẢNH",
    cinemaItems: ["Thể Loại Phim", "Bình Luận Phim", "Blog Điện Ảnh", "Phim Hay Tháng", "Phim IMAX"],
    support: "HỖ TRỢ",
    supportItems: ["Góp Ý", "Sale & Services", "Rạp / Giá Vé", "Tuyển Dụng", "FAQ"],
    company: "CÔNG TY TNHH CINEMÊ",
    address: "123 Đường Phim, Quận 1, TP. Hồ Chí Minh, Việt Nam",
    phone: "0123.456.789 (8:00 - 22:00)",
    email: "support@cineme.vn",
    copyright: "All rights reserved.",
  },
  en: {
    about: "ABOUT US",
    aboutItems: ["About Us", "Terms of Use", "Operating Regulations", "Privacy Policy"],
    cinema: "CINEMA CORNER",
    cinemaItems: ["Genres", "Movie Reviews", "Cinema Blog", "Best Movies of the Month", "IMAX Movies"],
    support: "SUPPORT",
    supportItems: ["Feedback", "Sale & Services", "Cinemas / Ticket Prices", "Careers", "FAQ"],
    company: "CINEMÊ CO., LTD",
    address: "123 Movie St, District 1, Ho Chi Minh City, Vietnam",
    phone: "0123.456.789 (8:00am - 10:00pm)",
    email: "support@cineme.vn",
    copyright: "All rights reserved.",
  }
};

const Footer = ({ lang }: { lang: "vi" | "en" }) => (
  <footer
    className="pt-10 pb-6 px-4"
    style={{
      background: "var(--color-background)",
      color: "var(--color-text)",
    }}
  >
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b"
        style={{ borderColor: "rgba(254,253,252,0.13)" }}>
        {/* Cột 1: Giới thiệu */}
        <div>
          <h3 className="font-bold mb-3 text-lg">{TEXT[lang].about}</h3>
          <ul className="space-y-2 text-sm opacity-90">
            {TEXT[lang].aboutItems.map(item => <li key={item}>{item}</li>)}
          </ul>
        </div>
        {/* Cột 2: Góc điện ảnh */}
        <div>
          <h3 className="font-bold mb-3 text-lg">{TEXT[lang].cinema}</h3>
          <ul className="space-y-2 text-sm opacity-90">
            {TEXT[lang].cinemaItems.map(item => <li key={item}>{item}</li>)}
          </ul>
        </div>
        {/* Cột 3: Hỗ trợ */}
        <div>
          <h3 className="font-bold mb-3 text-lg">{TEXT[lang].support}</h3>
          <ul className="space-y-2 text-sm opacity-90">
            {TEXT[lang].supportItems.map(item => <li key={item}>{item}</li>)}
          </ul>
        </div>
        {/* Cột 4: Logo & Social */}
        <div className="flex flex-col items-center gap-3">
          <img src="/logo_cinema_new.PNG" alt="Cinemê Logo" className="w-25 h-25 object-contain mb-2" />
          <span className="font-bold text-xl">Cinemê</span>
          <div className="flex gap-3 mt-2">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FontAwesomeIcon icon={faFacebookF} className="w-6 h-6 hover:text-[var(--color-secondary)] transition" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <FontAwesomeIcon icon={faYoutube} className="w-6 h-6 hover:text-[var(--color-secondary)] transition" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FontAwesomeIcon icon={faInstagram} className="w-6 h-6 hover:text-[var(--color-secondary)] transition" />
            </a>
          </div>
        </div>
      </div>
      {/* Thông tin công ty */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
        <div className="flex items-center gap-3">
          <img src="/logo_cinema_new.PNG" alt="Cinemê Logo" className="w-10 h-10 object-contain" />
          <div>
            <span className="font-bold text-base">{TEXT[lang].company}</span>
            <div className="text-xs opacity-80">
              {TEXT[lang].address}
            </div>
          </div>
        </div>
        <div className="text-xs opacity-80 flex flex-col md:items-end gap-1">
          <span>
            <FontAwesomeIcon icon={faPhone} className="mr-1" />
            {TEXT[lang].phone}
          </span>
          <span>
            <FontAwesomeIcon icon={faEnvelope} className="mr-1" />
            {TEXT[lang].email}
          </span>
        </div>
      </div>
      <div className="text-center text-xs opacity-60 mt-4">
        &copy; {new Date().getFullYear()} Cinemê. {TEXT[lang].copyright}
      </div>
    </div>
  </footer>
);

export default Footer;