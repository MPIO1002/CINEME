import React from 'react'

// Định nghĩa interface cho một diễn viên
interface Actor {
  id: string;
  name: string;
  // Nếu bạn có URL ảnh cho diễn viên, hãy thêm vào đây
  // imageUrl?: string; 
}

// Định nghĩa interface cho props của component ActorMovie
interface ActorMovieProps {
  actors: Actor[];
}

const ActorMovie = ({ actors }: ActorMovieProps) => {
  return (
    <div  className='md:max-w-8/12 mx-auto p-5 gap-5 flex flex-col mt-10'>
        <h2 className='text-3xl font-bold mb-5'>Diễn viên</h2>
        <div className='flex flex-row gap-5 overflow-x-auto pb-4'> {/* Thêm overflow-x-auto để cuộn ngang nếu có nhiều diễn viên */}
            {actors.map((actor) => (
                <div key={actor.id} className='flex flex-col items-center flex-shrink-0 w-[150px]'> {/* Thêm flex-shrink-0 và width cố định */}
                    <img 
                        className='w-[120px] h-[120px] md:w-[150px] md:h-[150px] object-cover rounded-full border-2 border-[var(--color-background)] hover:border-[#ffa43c] duration-300' 
                        // Sử dụng actor.imageUrl nếu có, nếu không thì dùng ảnh placeholder
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(actor.name)}&background=random&size=150`} // Ảnh placeholder dựa trên tên
                        alt={actor.name} 
                    />
                    <p className='mt-2 text-center text-sm md:text-base'>{actor.name}</p>
                </div>
            ))}
            {/* Nếu không có diễn viên nào, bạn có thể hiển thị một thông báo */}
            {actors.length === 0 && <p>Không có thông tin diễn viên.</p>}
        </div>
    </div>
  )
}

export default ActorMovie
