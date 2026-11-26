import { useEffect, useState } from 'react';
import { getMoodPreset } from '../data/presets';
import { NoteItem } from '../types/note';
import { formatDisplayDate } from '../utils/storage';
import { QuoteText } from './QuoteText';

interface StoryCardProps {
  note: NoteItem;
  variant?: 'feed' | 'reader' | 'preview';
  onClick?: () => void;
}

export function StoryCard({ note, variant = 'feed', onClick }: StoryCardProps) {
  const moodPreset = getMoodPreset(note.mood);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [note.customImage]);

  const isFeed = variant === 'feed';
  const isReader = variant === 'reader';

  // Scale quote typography sensibly based on character count so 4:5 cards never clip
  const length = note.quote.length;
  const quoteSizeClass = isReader
    ? length > 180
      ? 'text-[1.45rem] sm:text-[1.65rem] leading-[1.22]'
      : length > 110
        ? 'text-[1.7rem] sm:text-[1.95rem] leading-[1.18]'
        : 'text-[1.95rem] sm:text-[2.25rem] leading-[1.15]'
    : length > 180
      ? 'text-[1.15rem] sm:text-[1.25rem] leading-[1.24]'
      : length > 110
        ? 'text-[1.35rem] sm:text-[1.48rem] leading-[1.2]'
        : 'text-[1.55rem] sm:text-[1.72rem] leading-[1.16]';

  const reflectionSizeClass = isReader
    ? 'text-[1.5rem] sm:text-[1.7rem] leading-[1.15]'
    : 'text-[1.25rem] sm:text-[1.35rem] leading-[1.15]';

  const showImage = Boolean(note.customImage && !imageFailed);

  const content = (
    <div
      className={`relative w-full aspect-[4/5] rounded-xl overflow-hidden border border-white/10 flex flex-col justify-between text-left select-none ${
        moodPreset.gradientClass
      } ${isReader ? 'p-8 sm:p-10 shadow-2xl' : 'p-6 sm:p-7'} ${
        isFeed
          ? 'transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-1 group-hover:border-white/20'
          : ''
      }`}
    >
      {/* Background photo with WCAG-safe dark contrast scrim and automatic fallback to gradient */}
      {showImage && (
        <>
          <img
            src={note.customImage}
            alt=""
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/62 to-black/52"
            aria-hidden="true"
          />
        </>
      )}

      {/* Subtle film-grain texture overlay */}
      <div className="absolute inset-0 film-grain pointer-events-none" aria-hidden="true" />

      {/* Subtle vignette for intimate editorial depth */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_35%,rgba(0,0,0,0.42)_100%)] pointer-events-none"
        aria-hidden="true"
      />

      {/* Top metadata: clean unboxed text with typographic separator */}
      <div className="relative z-10 flex items-center justify-between gap-3 text-[12px] font-medium tracking-[0.01em] text-slate-400">
        <div className="flex items-center gap-2 min-w-0 truncate">
          <span className="text-slate-300">{note.category}</span>
          {note.date && (
            <>
              <span aria-hidden="true" className="text-slate-600">
                ·
              </span>
              <span className="tabular-nums text-slate-400">{formatDisplayDate(note.date)}</span>
            </>
          )}
        </div>
      </div>

      {/* Center Editorial Anchor: Quote + Handwritten Reflection */}
      <div className="relative z-10 my-auto py-4 flex flex-col gap-4">
        <blockquote className="m-0">
          <QuoteText text={note.quote} className={quoteSizeClass} />
        </blockquote>

        {note.reflection.trim() && (
          <p
            className={`font-hand font-semibold text-[#FDE047] hand-shadow ${reflectionSizeClass}`}
          >
            {note.reflection}
          </p>
        )}
      </div>

      {/* Bottom Source / Context Attribution */}
      <div className="relative z-10 flex items-end justify-between gap-4 pt-3 border-t border-white/10">
        <p className="text-[13px] font-medium text-slate-300/90 truncate">
          {note.source.trim() ? `— ${note.source}` : '— Personal Note'}
        </p>
        {isFeed && (
          <span className="text-[12px] font-medium text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap shrink-0">
            Open
          </span>
        )}
      </div>
    </div>
  );

  if (isFeed && onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group w-full block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE047] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1120] cursor-pointer"
        aria-label={`Open note from ${note.source || 'Personal Note'}`}
      >
        {content}
      </button>
    );
  }

  return content;
}
