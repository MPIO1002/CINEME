import React, { useEffect, useState, useRef } from "react";

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
`;

type Movie = {
  id: string;
  nameEN: string;
  nameVI: string;
  image: string;
  logo: string;
  descriptionEN: string;
  descriptionVI: string;
};

const MOVIES: Movie[] = [
  {
    id: "1",
    nameEN: "The Old Woman With The Knife",
    nameVI: "Bà Già Cầm Dao",
    image: "https://static.nutscdn.com/vimg/1920-0/80800a687102c4b8dcfb7948fd2af086.jpg",
    logo: "https://static.nutscdn.com/vimg/0-260/426b552389673483a9bf5979c24c8cf9.png",
    descriptionEN:
      "Hornclaw, an experienced old assassin, thought she had seen it all in the underworld, but she never expected to become a mentor to a reckless rookie named Bullfight. As their strange relationship deepens, cracks in the world they operate in begin to show. Things get even more dangerous when Hornclaw discovers someone is out to kill her. Surrounded by enemies and betrayal, to survive, she must keep both her blade—and her mind—sharp.",
    descriptionVI:
      "Hornclaw, một sát thủ già từng trải, tưởng chừng đã nhìn thấu mọi mặt của thế giới ngầm, nhưng bà không ngờ rằng mình sẽ trở thành người dẫn dắt cho một tay lính mới liều lĩnh tên Bullfight. Khi mối quan hệ kỳ lạ giữa hai người dần sâu sắc, những rạn nứt trong thế giới ngầm mà họ hoạt động cũng bắt đầu lộ ra. Mọi thứ càng trở nên nguy hiểm khi Hornclaw phát hiện có kẻ đang muốn lấy mạng mình. Giữa vòng vây của kẻ thù và sự phản bội rình rập, để sống sót, bà buộc phải giữ cho lưỡi dao – và cả đầu óc – luôn sắc bén.",
  },
  {
    id: "2",
    nameEN: "ONE: High School Heroes",
    nameVI: "ONE: Anh Hùng Trung Học",
    image: "https://static.nutscdn.com/vimg/1920-0/ca24572562380c30faeaedb6e5fcb854.webp",
    logo: "https://static.nutscdn.com/vimg/0-260/dd963bdc79bfd59109bf53b067db0e3c.png",
    descriptionEN:
      "Based on the webtoon of the same name, it tells the story of a model student who once devoted all his attention to studying but gets entangled in domestic violence and school bullying, forcing him to make a life-changing decision. ONE: High School Heroes follows a group of brave students fighting against school violence, blending thrilling action and deep drama, delivering a message of unity.",
    descriptionVI:
      "Dựa trên webtoon cùng tên, kể về câu chuyện của một học sinh gương mẫu từng dành toàn bộ sự chú ý của mình cho việc học nhưng bị vướng vào bạo lực gia đình và bắt nạt ở trường, buộc anh phải đưa ra quyết định mang tính thay đổi. One: High School Heroes kể về hành trình nhóm học sinh dũng cảm chống bạo lực học đường, kết hợp hành động mãn nhãn và drama sâu sắc, truyền tải thông điệp đoàn kết.",
  },
  {
    id: "3",
    nameEN: "Good Boy",
    nameVI: "Good Boy",
    image: "https://static.nutscdn.com/vimg/1920-0/27591bc926452f55a69c18dbf6b6f930.webp",
    logo: "https://static.nutscdn.com/vimg/0-260/67f61f7bc00c3b66a801580626cdcddc.png",
    descriptionEN:
      "“Good Boy” tells the story of Yoon Dong Joo (played by Park Bo Gum), a former national boxing athlete and international gold medalist, who becomes a police officer through a special recruitment program for medal-winning athletes. His life takes a dramatic turn when Min Joo Young (Oh Jung Se)—a ruthless villain ruling Inseong city from the shadows—emerges as the ultimate enemy. With his sinister presence and disregard for law and order, even his shadow sends chills down people's spines.",
    descriptionVI:
      "“Good Boy” kể về câu chuyện của Yoon Dong Joo (Park Bo Gum thủ vai), một cựu vận động viên quyền anh quốc gia từng giành huy chương vàng quốc tế, trở thành cảnh sát thông qua một chương trình tuyển dụng đặc biệt dành cho các vận động viên giành huy chương. Cuộc sống của cậu rẽ sang một hướng đầy kịch tính khi Min Joo Young (Oh Jung Se) - một nhân vật phản diện tàn nhẫn cai trị thành phố Inseong từ trong bóng tối - xuất hiện như kẻ thù cuối cùng. Với sự hiện diện nham hiểm và sự khinh thường luật pháp, trật tự, ngay cả hình bóng của hắn cũng khiến người ta rùng mình.",
  },
  {
    id: "4",
    nameEN: "Final Destination: Bloodlines",
    nameVI: "Final Destination: Bloodlines",
    image: "https://static.nutscdn.com/vimg/1920-0/3f912f6db5f248397fe4140f01c1c374.jpg",
    logo: "https://static.nutscdn.com/vimg/0-260/1bb2997c7ffda96d2dd5ff44c0f74e35.png",
    descriptionEN:
      "The latest installment of the famous horror franchise, “Final Destination: Bloodlines” continues the story of survivors of a catastrophic accident. This time, the main characters must face a mysterious force hunting them, forcing them to find a way to escape their predetermined fate. With breathtaking action and thrilling situations, the film promises a chilling experience for audiences.",
    descriptionVI:
      "Phần mới nhất của loạt phim kinh dị nổi tiếng, “Final Destination Bloodliness” tiếp tục câu chuyện về những người sống sót sau một tai nạn thảm khốc. Lần này, nhóm nhân vật chính phải đối mặt với một thế lực bí ẩn đang săn đuổi họ, buộc họ phải tìm cách thoát khỏi số phận đã được định sẵn. Với những pha hành động nghẹt thở và những tình huống giật gân, bộ phim hứa hẹn mang đến trải nghiệm rùng rợn cho khán giả.",
  },
  {
    id: "5",
    nameEN: "The Amateur",
    nameVI: "The Amateur",
    image: "https://static.nutscdn.com/vimg/1920-0/3c774ef35d12cbeb4ad28d00416861f4.jpg",
    logo: "https://static.nutscdn.com/vimg/0-260/b0960d1728d29ce3efab9ca56ce21fc0.png",
    descriptionEN:
      "The film tells the story of a group of young people passionate about eSports who decide to form a team to participate in the biggest tournament of the year. However, they face many challenges, from fierce competition to internal conflicts. “The Amateur” is not only about eSports but also a journey of self-discovery and friendship.",
    descriptionVI:
      "Bộ phim kể về một nhóm thanh niên đam mê thể thao điện tử, họ quyết định thành lập một đội tuyển để tham gia giải đấu lớn nhất trong năm. Tuy nhiên, họ phải đối mặt với nhiều thử thách, từ sự cạnh tranh khốc liệt đến những mâu thuẫn nội bộ. “The Amateur” không chỉ là câu chuyện về thể thao điện tử mà còn là hành trình tìm kiếm bản thân và tình bạn.",
  },
];

const HeroCarousel: React.FC<{ lang: "vi" | "en" }> = ({ lang }) => {
  const [active, setActive] = useState(0);
  const [prevActive, setPrevActive] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

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
      setActive((prev) => (prev + 1) % MOVIES.length);
    }, 6000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active]);

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
        setActive((prev) => (prev + 1) % MOVIES.length);
      } else {
        // Swipe right
        setPrevActive(active);
        setActive((prev) => (prev === 0 ? MOVIES.length - 1 : prev - 1));
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
        {MOVIES.map((movie, idx) => (
          <div
            key={movie.id}
            className={`absolute inset-0 duration-700 ease-in-out ${active === idx ? "" : "hidden"}`}
            data-carousel-item={active === idx ? "active" : undefined}
          >
            {/* Active image */}
            <img
              src={MOVIES[active].image}
              alt={lang === "vi" ? MOVIES[active].nameVI : MOVIES[active].nameEN}
              className="absolute block w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
            />
            {/* PrevActive image with fade-out */}
            {prevActive !== null && prevActive !== active && (
              <img
                src={MOVIES[prevActive].image}
                alt={lang === "vi" ? MOVIES[prevActive].nameVI : MOVIES[prevActive].nameEN}
                className="absolute block w-full h-full object-cover -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 fade-out-normal pointer-events-none"
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
        {MOVIES.map((movie, idx) => (
          active === idx && (
            <div
              key={movie.id}
              className="absolute bottom-20 left-5 w-full p-4 flex flex-col items-start md:items-start z-20"
            >
              <img
                src={movie.logo}
                alt={(lang === "vi" ? movie.nameVI : movie.nameEN) + " logo"}
                className="w-32 md:w-[700px] mb-2 drop-shadow-lg tracking-in-contract-bck-bottom-normal"
                style={{ objectFit: "contain" }}
              />
              <h2
                className="text-xl md:text-xl font-medium mb-2 tracking-in-contract-bck-bottom-normal"
                style={{ color: "var(--color-accent)" }}
              >
                {lang === "vi" ? movie.nameVI : movie.nameEN}
              </h2>
              <p className="text-white text-sm md:text-base mb-4 max-w-2xl line-clamp-3 md:line-clamp-4 tracking-in-contract-bck-bottom-normal">
                {lang === "vi" ? movie.descriptionVI : movie.descriptionEN}
              </p>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;