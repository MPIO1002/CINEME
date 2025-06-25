import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useState } from 'react';
import DatePicked from '../../components/film/DatePicked';
import TimePicked from '../../components/film/TimePicked';
import SeatLayout from '../seat/SeatLayout'; // 1. Import SeatLayout

interface BookingMovieProps {
  movieId?: string;
  movieName?: string;
}

const BookingMovie = ({ movieName = "Phim Đang Chọn" }: BookingMovieProps) => {
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState<{
        day: number;
        date: string;
        month: number;
    }>({
        day: today.getDate(),
        date: today.toLocaleDateString('vi', { weekday: 'short' }),
        month: today.getMonth() + 1,
    });

    // 2. Thêm state để quản lý dialog và phòng được chọn
    const [isSeatLayoutOpen, setIsSeatLayoutOpen] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

    const handleSelectDate = (date: { day: number; date: string; month: number }) => {
        setSelectedDate(date);
    };

    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    // 3. Cập nhật hàm này để mở dialog
    const handleSelectTime = (time: string) => {
        // Tìm suất chiếu tương ứng với thời gian được chọn
        const showtime = scheduleTimes.find(st => st.time === time);
        // Chỉ mở dialog nếu suất chiếu còn vé và có roomId
        if (showtime && showtime.kind === 'Còn vé' && showtime.roomId) {
            setSelectedTime(time);
            setSelectedRoomId(showtime.roomId);
            setIsSeatLayoutOpen(true); // Mở dialog
        }
    };

    const handleCloseSeatDialog = () => {
        setIsSeatLayoutOpen(false);
        setSelectedRoomId(null);
        // Tùy chọn: bỏ chọn suất chiếu khi đóng dialog
        setSelectedTime(null);
    };

    const [location, setLocation] = useState('HCM');

    const handleChange = (event: SelectChangeEvent) => {
        setLocation(event.target.value as string);
    };

    const stype = {
        m: 1,
        minWidth: 220,
        width: '100%',
        '@media (min-width: 768px)': {
            width: 'auto',
        },
        '& .MuiInputBase-root': { color: '#ffa43c', backgroundColor: 'var(--color-background)' },
        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#ffa43c' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ffa43c' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ffa43c' },
        '& .MuiInputLabel-root': { color: '#ffa43c' },
        '& .MuiSvgIcon-root': { color: '#ffa43c' },
    };

    // Cập nhật dữ liệu suất chiếu để bao gồm roomId
    const scheduleTimes = [
        { time: '08:00', kind: 'Hết vé', roomId: null },
        { time: '09:00', kind: 'Hết vé', roomId: null },
        { time: '10:00', kind: 'Hết vé', roomId: null },
        { time: '12:00', kind: 'Hết vé', roomId: null },
        { time: '14:00', kind: 'Hết vé', roomId: null },
        { time: '16:00', kind: 'Hết vé', roomId: null },
        { time: '18:00', kind: 'Còn vé', roomId: 'b12d4066-d85a-47d0-b2b3-002211001666' },
        { time: '20:00', kind: 'Còn vé', roomId: 'b12d4066-d85a-47d0-b2b3-002211001666' },
        { time: '22:00', kind: 'Còn vé', roomId: 'b12d4066-d85a-47d0-b2b3-002211001666' },
    ];

  return (
    // Sử dụng Fragment để bao bọc component và dialog
    <>
        <div id='booking' className='md:max-w-8/12 mx-auto p-4 md:p-6 flex flex-col mt-10 rounded-lg shadow-lg bg-[var(--color-card-background,var(--color-background-secondary))]'>
            <div className='w-full'>
                <h1 className='text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-4 text-center md:text-left'>Lịch chiếu {movieName}</h1>
                
                <div className="mb-6">
                    <FormControl sx={stype}>
                        <InputLabel id="location-select-label" sx={{ color: '#ffa43c' }}>Địa điểm</InputLabel>
                        <Select labelId="location-select-label" id="location-select" value={location} label="Địa điểm" onChange={handleChange}>
                            <MenuItem value={"HCM"}>Hồ Chí Minh</MenuItem>
                            <MenuItem value={"HN"}>Hà Nội</MenuItem>
                            <MenuItem value={"VT"}>Vũng Tàu</MenuItem>
                        </Select>
                    </FormControl>
                </div>

                <h2 className='text-xl sm:text-2xl font-semibold text-[var(--color-text-secondary)] mb-3 mt-6'>Chọn ngày</h2>
                <div className='w-full px-2 sm:px-0'>
                    <Carousel opts={{ align: "start", loop: false }} className="w-full cursor-grab">
                        <CarouselContent className="-ml-2">
                            {Array.from({ length: 14 }).map((_, idx) => {
                                const dateIterator = new Date();
                                dateIterator.setDate(today.getDate() + idx);
                                const day = dateIterator.getDate();
                                const month = dateIterator.getMonth() + 1;
                                const weekDay = dateIterator.toLocaleDateString('vi', { weekday: 'short' });
                                return (
                                    <CarouselItem key={idx} className="pl-2 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/7">
                                        <div className="p-1 flex justify-center items-center">
                                            <DatePicked day={day} date={weekDay} month={month} isPicked={selectedDate?.day === day && selectedDate?.date === weekDay && selectedDate?.month === month} onSelect={handleSelectDate} />
                                        </div>
                                    </CarouselItem>
                                );
                            })}
                        </CarouselContent>
                        <CarouselPrevious className="hidden sm:flex" />
                        <CarouselNext className="hidden sm:flex" />
                    </Carousel>
                </div>
                
                <h2 className='text-xl sm:text-2xl font-semibold text-[var(--color-text-secondary)] my-4 mt-6'>Chọn giờ</h2>
                <div className='flex flex-col md:flex-row gap-4 md:gap-6'>
                    <div className='grid grid-cols-3 sm:grid-cols-4 gap-2 md:gap-3 flex-grow'>
                        {scheduleTimes.map(({ time, kind }) => (
                            <TimePicked key={time} time={time} kind={kind} isPicked={selectedTime === time} onSelect={handleSelectTime} />
                        ))}
                    </div>
                    <div className='flex flex-col gap-3 mt-5 md:mt-0 p-4 border border-gray-600 rounded-lg md:w-auto md:min-w-[180px]'>
                        <div className='flex items-center gap-2'><div className='w-5 h-5 rounded border-2 border-gray-600 bg-[var(--color-background)]'></div><p className="text-sm text-[var(--color-text-secondary)]">Hết vé</p></div>
                        <div className='flex items-center gap-2'><div className='w-5 h-5 rounded bg-[var(--color-text)]'></div><p className="text-sm text-[var(--color-text-secondary)]">Còn vé</p></div>
                        <div className='flex items-center gap-2'><div className='w-5 h-5 rounded bg-[#ffa43c]'></div><p className="text-sm text-[var(--color-text-secondary)]">Đã chọn</p></div>
                    </div>
                </div>
            </div>
        </div>

        {/* 4. Render dialog một cách có điều kiện */}
        {selectedRoomId && (
            <SeatLayout
                isOpen={isSeatLayoutOpen}
                onClose={handleCloseSeatDialog}
                roomId={selectedRoomId}
                onSeatsSelected={(seats) => {
                    console.log('Ghế đã chọn:', seats);
                    // Bạn có thể xử lý danh sách ghế đã chọn ở đây
                }}
            />
        )}
    </>
  )
}

export default BookingMovie
