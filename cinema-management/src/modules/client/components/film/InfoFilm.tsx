import AlarmIcon from '@mui/icons-material/Alarm';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import Rating from '@mui/material/Rating';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import DetailFilm from './DetailFilm';

const StyledRating = styled(Rating)({
    '& .MuiRating-iconFilled': {
        color: '#ffa43c',
    },
    '& .MuiRating-iconEmpty': {
        color: '#fff',
    },
});

interface MovieDetailProps {
  movieDetail: {
    id: string;
    nameVn: string;
    nameEn: string;
    director: string;
    countryVn: string;
    countryEn: string;
    format: string;
    releaseDate: string;
    endDate: string;
    briefVn: string;
    briefEn: string;
    image: string;
    himage: string;
    trailer: string;
    status: string;
    ratings: string; // Nên là number nếu đây là điểm đánh giá
    time: number;
    limitageNameVn: string;
    limitageNameEn: string;
    languageNameVn: string;
    languageNameEn: string;
    sortorder: number;
  };
}

const InfoFilm = ({ movieDetail }: MovieDetailProps) => {
  // Tạo một mảng các chi tiết phim để lặp qua
  const filmDetails = [
    { nameDetail: "Đạo diễn", content: movieDetail.director },
    { nameDetail: "Quốc gia", content: movieDetail.countryVn },
    { nameDetail: "Thể loại", content: movieDetail.format }, // Giả sử format là thể loại
    { nameDetail: "Ngôn ngữ", content: movieDetail.languageNameVn },
    { nameDetail: "Giới hạn tuổi", content: movieDetail.limitageNameVn },
    // Thêm các chi tiết khác bạn muốn hiển thị ở đây
    // Ví dụ: { nameDetail: "Diễn viên", content: movieDetail.listActor.map(actor => actor.name).join(', ') },
    // (Lưu ý: listActor không có trong interface MovieDetailProps hiện tại của InfoFilm, bạn cần thêm nếu muốn dùng)
  ];

  // Chuyển đổi ratings sang number nếu nó là string dạng số
  const ratingValue = parseFloat(movieDetail.ratings) / 2; // Giả sử ratings là thang điểm 10, và Rating component là thang 5

  return (
    <div className='flex flex-col justify-start items-center md:items-start md:flex-row mx-auto mt-10 gap-5 md:max-w-8/12 px-5'>
        <img className='w-[300px] md:w-[350px] object-cover rounded-2xl' src={movieDetail.image} alt={movieDetail.nameVn} />
        <div className='px-2 md:pl-5 flex-1'>
            <h2 className='text-3xl md:text-4xl font-semibold mb-4'>{movieDetail.nameVn}</h2>
            <p className='text-sm text-gray-400 mb-3'>{movieDetail.nameEn}</p>
            <div className='flex flex-wrap gap-x-5 gap-y-2 mb-3'>
                <p className='text-gray-300 text-sm flex items-center gap-1'><CalendarMonthIcon className='text-[#ffa43c]'/> {new Date(movieDetail.releaseDate).toLocaleDateString('vi-VN')}</p>
                <p className='text-gray-300 text-sm flex items-center gap-1'><AlarmIcon className='text-[#ffa43c]'/> {movieDetail.time} phút</p>
            </div>
            <div className='mb-4 flex items-center gap-x-5 gap-y-2 flex-wrap'>
                <Stack spacing={1}>
                    <StyledRating name="half-rating-read" value={ratingValue} precision={0.1} readOnly />
                </Stack>
                <span className='text-gray-300 text-sm'>Đánh giá: {ratingValue}</span>
                <span className='border-1 px-3 py-1 text-xs rounded bg-gray-700 text-white'>{movieDetail.limitageNameVn}</span>
            </div>
            
            {/* Lặp qua mảng filmDetails để hiển thị DetailFilm */}
            {filmDetails.map((detail) => (
                <DetailFilm key={detail.nameDetail} nameDetail={detail.nameDetail} content={detail.content} />
            ))}

            <div className='mt-4'>
                <h3 className='font-semibold mb-1 text-lg'>Nội dung phim:</h3>
                <p className='text-gray-300 text-sm leading-relaxed'>{movieDetail.briefVn}</p>
            </div>

            <div className='flex gap-3 md:gap-5 mt-6'>
                <a href='#trailer' className='bg-gray-700 border-2 border-gray-700 hover:border-white duration-150 py-2 px-4 md:py-3 md:px-8 text-sm md:text-base rounded-lg flex items-center justify-center gap-1 font-bold cursor-pointer'><PlayCircleOutlineIcon/>Xem trailer</a>
                <a href='#booking' className='bg-[#ffa43c] border-2 border-[#ffa43c] hover:bg-transparent hover:text-[#ffa43c] duration-150 py-2 px-4 md:py-3 md:px-8 text-sm md:text-base rounded-lg flex items-center justify-center gap-1 text-gray-900 font-bold cursor-pointer'><ConfirmationNumberIcon/>Đặt vé</a>
            </div>
        </div>
    </div>
  )
}

export default InfoFilm
