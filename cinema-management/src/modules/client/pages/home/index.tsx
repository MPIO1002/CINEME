import HeroCarousel from "./components/hero";
import Movies from "./components/movies";
import TicketBox from "./components/box";

const Home = ({ lang }: { lang: "vi" | "en" }) => (
  <div className="relative min-h-screen">
    <div
      className="relative z-10"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <HeroCarousel lang={lang}/>
      <TicketBox lang={lang} />
      <Movies lang={lang} />
    </div>
  </div>
);

export default Home;