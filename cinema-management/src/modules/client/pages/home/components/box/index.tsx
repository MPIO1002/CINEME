import React from "react";

const TEXT = {
  vi: {
    step1: "Chọn Phim",
    step2: "Chọn Rạp",
    step3: "Chọn Ngày",
    step4: "Chọn Suất",
    buy: "Mua vé nhanh",
  },
  en: {
    step1: "Select Movie",
    step2: "Select Cinema",
    step3: "Select Date",
    step4: "Select Showtime",
    buy: "Quick Buy",
  }
};

const TicketBox: React.FC<{ lang: "vi" | "en" }> = ({ lang }) => (
    <div className="relative -mt-8 z-50 w-full mx-auto px-20">
        <div
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 w-full top-8 h-32 z-[-1]"
            style={{
                background: "linear-gradient(to bottom, rgba(1, 1, 1, 1) 0%, rgba(0,0,0,0) 100%)"
            }}
        />
        <div className="flex items-center justify-between bg-white rounded-xl shadow-lg">
            {/* Step 1 */}
            <div className="flex items-center px-6 py-3 min-w-[200px]">
                <div className="w-8 h-8 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-white font-bold mr-3">1</div>
                <span className="font-medium text-gray-800">{TEXT[lang].step1}</span>
                <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </div>
            {/* Step 2 */}
            <div className="flex items-center px-6 py-3 min-w-[200px] opacity-60">
                <div className="w-8 h-8 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-white font-bold mr-3">2</div>
                <span className="font-medium text-gray-800">{TEXT[lang].step2}</span>
                <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </div>
            {/* Step 3 */}
            <div className="flex items-center px-6 py-3 min-w-[200px] opacity-60">
                <div className="w-8 h-8 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-white font-bold mr-3">3</div>
                <span className="font-medium text-gray-800">{TEXT[lang].step3}</span>
                <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </div>
            {/* Step 4 */}
            <div className="flex items-center px-6 py-3 min-w-[200px] opacity-60">
                <div className="w-8 h-8 rounded-full bg-[var(--color-secondary)] flex items-center justify-center text-white font-bold mr-3">4</div>
                <span className="font-medium text-gray-800">{TEXT[lang].step4}</span>
            </div>
            <button className="bg-[var(--color-accent)] hover:bg-[var(--color-secondary)] text-white font-semibold px-8 py-3 transition-all text-lg rounded-r-xl h-full cursor-pointer">
                {TEXT[lang].buy}
            </button>
        </div>
    </div>
);

export default TicketBox;