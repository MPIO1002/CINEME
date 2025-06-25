interface TimePickedProps  {
    time: string;
    kind: string;
    isPicked: boolean;
    onSelect: (time: string) => void;
};

const TimePicked = ({ time, kind, isPicked, onSelect }: TimePickedProps) => {
    const handleClick = () => {
        if (!isPicked) {
            onSelect(time);
        }
    };
    const phanLoai: { [key: string]: string } = {
        "Hết vé": "bg-[var(--color-background)] text-white",
        "Còn vé": "bg-[#fefdfc] text-[var(--color-background)]",
    };
    const isSoldOut = kind === "Hết vé";
    const className = `
        ${phanLoai[kind]}
        border-2 border-gray-600
        rounded-lg px-4 py-2
        ${ isPicked ? "border-[#ffa43c] bg-[#ffa43c] " : (isSoldOut ? "cursor-default" : "hover:border-[#ffa43c] hover:bg-amber-100 cursor-pointer")}
        transition-all duration-300 max-h-min
    `;

    return (
        <button className={className.trim()} disabled={isSoldOut} onClick={handleClick}>
            {time}
        </button>
    );
};

export default TimePicked;