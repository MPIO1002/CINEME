type DatePickedProps = {
	day: number;
	date: string;
	month: number;
	isPicked: boolean;
	onSelect: (
		date: {
			day: number;
			date: string;
			month: number;
		}
	) => void;
};

const DatePicked = ({
	day,
	date,
	month,
	isPicked,
	onSelect
}: DatePickedProps) => {
	const handleClick = () => {
		onSelect(
			{
				day,
				date,
				month
			}
		);
	};

	return (
		<button
			className={`flex rounded-xl items-center bg-[var(--color-background)] border ${isPicked
				? " text-[#ffa43c] border-[#ffa43c] cursor-default"
				: "border-var(--color-text) text-var(--color-text) hover:border-[#ffa43c] hover:text-[#ffa43c] cursor-pointer"}  transition-all duration-300`}
			onClick={
				handleClick
			}
			disabled={
				isPicked
			}
		>
			<div className=" py-1 flex flex-col justify-between items-center w-12">
				<p
				>
					{
						month
					}
				</p>
				<p
				>
					{
						date
					}
				</p>
			</div>
			<div
				className={`text-5xl  py-1 px-1 w-[70px] ${isPicked
					? "bg-[#ffa43c] text-[var(--color-background)] rounded-e-lg"
					: ""}`}
			>
				{
					day
				}
			</div>
		</button>
	);
};

export default DatePicked;
