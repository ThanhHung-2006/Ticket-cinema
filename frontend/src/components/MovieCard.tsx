import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Tag, Play } from 'lucide-react';

export interface Movie {
  id: string;
  title: string;
  englishTitle?: string;
  genres: string;
  duration: number;
  releaseDate: string;
  ageRating: string;
  posterUrl: string;
  status: 'NOW_SHOWING' | 'COMING_SOON' | 'ENDED';
}

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const isNowShowing = movie.status === 'NOW_SHOWING';

  return (
    <div className="group relative bg-[#181C2E] border border-[#2A2F45] rounded-2xl overflow-hidden hover:border-[#E11D48]/80 transition-all duration-300 hover:shadow-xl hover:shadow-[#E11D48]/15 flex flex-col">
      {/* Poster Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#0F1220]">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1220] via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Link
            to={`/movies/${movie.id}`}
            className="w-12 h-12 rounded-full bg-[#E11D48] text-white flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300 hover:bg-[#BE123C]"
          >
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </Link>
        </div>

        {/* Age Rating Badge */}
        <div className="absolute top-3 left-3 px-2 py-1 rounded-md text-[11px] font-black uppercase tracking-wider bg-black/70 backdrop-blur border border-white/20 text-[#F5B301]">
          {movie.ageRating}
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur ${
              isNowShowing
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}
          >
            {isNowShowing ? 'Đang chiếu' : 'Sắp chiếu'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-white text-base line-clamp-1 group-hover:text-[#E11D48] transition-colors" title={movie.title}>
            {movie.title}
          </h3>
          {movie.englishTitle && (
            <p className="text-xs text-[#9CA3AF] line-clamp-1 italic -mt-0.5">
              {movie.englishTitle}
            </p>
          )}

          <div className="mt-2.5 flex items-center gap-3 text-xs text-[#9CA3AF]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#F5B301]" />
              {movie.duration} phút
            </span>
            <span className="flex items-center gap-1 line-clamp-1">
              <Tag className="w-3.5 h-3.5 text-[#E11D48]" />
              {movie.genres.split(',')[0]}
            </span>
          </div>
        </div>

        <Link
          to={`/movies/${movie.id}`}
          className="mt-4 w-full py-2.5 px-3 rounded-xl bg-[#1F2438] hover:bg-[#E11D48] text-white text-xs font-bold text-center border border-[#2A2F45] hover:border-[#E11D48] transition-all duration-200"
        >
          {isNowShowing ? '🎟️ Đặt Vé Ngay' : 'Chi Tiết Phim'}
        </Link>
      </div>
    </div>
  );
};
