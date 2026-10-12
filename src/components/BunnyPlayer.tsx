import React from 'react';
import { FilmSubmission } from '../types/festival';
import { useFestival } from '../context/FestivalContext';
import { Film, ExternalLink } from 'lucide-react';

interface BunnyPlayerProps {
  film: FilmSubmission;
}

export const BunnyPlayer: React.FC<BunnyPlayerProps> = ({ film }) => {
  const { language } = useFestival();
  const isAr = language === 'ar';

  const { bunnyStream } = film;

  // Official Bunny Stream Iframe Embed Player URL
  const bunnyEmbedUrl = bunnyStream.directIframeUrl || 
    `https://iframe.mediadelivery.net/embed/${bunnyStream.libraryId}/${bunnyStream.videoId}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`;

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-black border border-stone-200 shadow-md">
      {/* Stream Info Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-stone-200 text-xs">
        <div className="flex items-center gap-2 text-stone-800 font-medium">
          <Film className="w-4 h-4 text-[#9E7A2A]" />
          <span className="font-semibold text-stone-900">
            {isAr ? film.titleAr : film.title}
          </span>
          <span className="text-stone-300">·</span>
          <span className="text-stone-500 font-mono">{film.runtimeFormatted}</span>
          <span className="text-stone-300">·</span>
          <span className="text-stone-500 font-mono">{film.aspectRatio}</span>
        </div>

        <a
          href={bunnyEmbedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-stone-500 hover:text-[#9E7A2A] transition-colors font-mono text-[11px]"
        >
          <span>Bunny Stream</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Official Bunny Stream Video Player */}
      <div className="relative w-full aspect-video bg-black">
        <iframe
          src={bunnyEmbedUrl}
          loading="lazy"
          title={`${film.title} - Bunny Stream`}
          className="w-full h-full border-0 absolute inset-0"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen={true}
        />
      </div>
    </div>
  );
};
