import axios from 'axios';
import { useEffect, useState } from 'react';
import ActorMovie from '../../components/film/ActorMovie';
import BookingMovie from '../../components/film/BookingMovie';
import InfoFilm from '../../components/film/InfoFilm';
import TrailerMovie from '../../components/film/TrailerMovie';
import { useParams } from 'react-router-dom';

interface Actor {
  id: string;
  name: string;
}

interface MovieDetail {
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
  ratings: string;
  time: number;
  limitageNameVn: string;
  limitageNameEn: string;
  languageNameVn: string;
  languageNameEn: string;
  sortorder: number;
  listActor: Actor[];
}

function Index() {
    const [movieDetail, setMovieDetail] = useState<MovieDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { movieId } = useParams();
    useEffect(() => {
        // Ensure movieId is available before fetching
        if (!movieId) {
            setIsLoading(false);
            setError("Movie ID is missing.");
            return;
        }

        const fetchMovieDetail = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get(`http://localhost:8080/api/v1/movies/${movieId}/detail`);
                // Check statusCode from the response data
                if (response.data && response.data.statusCode === 200) {
                    setMovieDetail(response.data.data);
                } else {
                    const errorMessage = response.data?.message || "Failed to fetch movie details";
                    console.error("Failed to fetch movie details:", errorMessage);
                    setError(errorMessage);
                }
            } catch (err) {
                console.error("Error fetching movie details:", err);
                setError(err instanceof Error ? err.message : "An unknown error occurred");
            } finally {
                setIsLoading(false);
            }
        };
        fetchMovieDetail();
    }, [movieId]); // Add movieId as a dependency
    
  if (isLoading) {
    return (
      <div className='bg-[var(--color-background)] w-full h-screen flex justify-center items-center text-[var(--color-text)]'>
        <h1 className='text-3xl font-bold'>Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-[var(--color-background)] w-full h-screen flex justify-center items-center text-red-500'>
        <h1 className='text-3xl font-bold'>Error: {error}</h1>
      </div>
    );
  }

  if (!movieDetail) {
    return (
      <div className='bg-[var(--color-background)] w-full h-screen flex justify-center items-center text-[var(--color-text)]'>
        <h1 className='text-3xl font-bold'>No movie details found.</h1>
      </div>
    );
  }
  
  return (
    <div className='bg-[var(--color-background)] w-full h-auto text-[var(--color-text)] pt-10' style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}>
        {/* Nội dung phim */}
        <InfoFilm movieDetail={movieDetail}/>

        {/* Diễn viên */}
        <ActorMovie actors={movieDetail.listActor} />

        {/* Lịch chiếu */}
        <BookingMovie movieId={movieDetail.id} movieName={movieDetail.nameVn} />
        
        {/* Trailer phim */}
        <TrailerMovie trailerUrl={movieDetail.trailer} />

    </div>
  )
}

export default Index