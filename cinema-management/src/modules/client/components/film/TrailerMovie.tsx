
interface TrailerMovieProps { // Renamed interface for clarity
  trailerUrl: string;
}

const TrailerMovie = ({ trailerUrl }: TrailerMovieProps) => {
  // Function to convert YouTube watch URL to embed URL
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === "www.youtube.com" && urlObj.pathname === "/watch") {
        const videoId = urlObj.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
      }
      // If it's already an embed URL or a different video platform, return as is
      // You might want to add more robust checks for other video platforms
      return url;
    } catch (error) {
      console.error("Invalid trailer URL:", error);
      return ""; // Return empty string or a placeholder if URL is invalid
    }
  };

  const embedUrl = getEmbedUrl(trailerUrl);

  if (!embedUrl) {
    return (
      <div id='trailer' className='md:max-w-8/12 mx-auto p-5 flex flex-col justify-center mt-10'>
        <h2 className='text-3xl font-bold mb-5'>Trailer</h2>
        <p>Trailer không khả dụng.</p>
      </div>
    );
  }

  return (
    <div id='trailer' className='md:max-w-8/12 mx-auto p-5 flex flex-col justify-center mt-10'>
        <h2 className='text-3xl font-bold mb-5'>Trailer</h2>
      <iframe
        src={embedUrl}
        title="Movie Trailer" // More generic title
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" // Added web-share
        allowFullScreen
        className='w-full h-[300px] md:h-[600px] rounded-lg border-0' // Added border-0
      ></iframe>
    </div>
  )
}

export default TrailerMovie
