const DetailFilm =
	({
		nameDetail,
		content
	}: {
		nameDetail: string;
		content: string;
	}) => {
		return (
			<p className="text-gray-300 mb-2">
				<span className="font-bold text-white">
					{
						nameDetail
					}
					:{" "}
				</span>
				{
					content
				}
			</p>
		);
	};

export default DetailFilm;
