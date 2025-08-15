import HeroCarousel from "./components/hero";
import Movies from "./components/movies";
import ProgressBar from "../../components/progress-bar";

const Home = ({ lang }: { lang: "vi" | "en" }) => (
  <div className="relative min-h-screen">
    <div className="relative z-10 bg-[var(--color-background)]">
      <HeroCarousel lang={lang} />
      {/* Scrolling Ribbons Section - Full Width */}
      <div className="relative py-20 overflow-hidden" style={{ backgroundColor: 'var(--color-background)' }}>
        <div className="space-y-6">
          {/* First Ribbon - Orange */}
          <div 
            className="py-6 transform -rotate-3 overflow-hidden"
            style={{ 
              background: 'linear-gradient(45deg, #F97316, #FB923C)',
              boxShadow: '0 8px 25px rgba(249, 115, 22, 0.4)',
              width: '100vw',
              marginLeft: 'calc(-50vw + 50%)',
              zIndex: 9999
            }}
          >
            <div className="flex animate-scroll-left whitespace-nowrap">
              {Array.from({ length: 30 }).map((_, i) => (
                <span key={i} className="mx-8 text-white font-bold text-2xl tracking-wider">
                  CHÀO MỪNG BẠN ĐẾN VỚI CINEME
                </span>
              ))}
            </div>
          </div>
          
          {/* Second Ribbon - Red */}
          <div 
            className="py-6 transform rotate-1 overflow-hidden"
            style={{ 
              background: 'linear-gradient(45deg, #DC2626, #EF4444)',
              boxShadow: '0 8px 25px rgba(220, 38, 38, 0.4)',
              width: '100vw',
              marginLeft: 'calc(-50vw + 50%)',
              zIndex: 9999
            }}
          >
            <div className="flex animate-scroll-right whitespace-nowrap">
              {Array.from({ length: 30 }).map((_, i) => (
                <span key={i} className="mx-8 text-white font-bold text-2xl tracking-wider">
                  XEM LÀ MÊ
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ProgressBar currentStep="home" />
      <Movies lang={lang} />
    </div>
  </div>
);

export default Home;