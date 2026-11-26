import { CardTone } from '../types/note';
import { parseQuoteSegments } from '../utils/quoteParser';

interface QuoteTextProps {
  text: string;
  tone?: CardTone;
  className?: string;
}

export function QuoteText({ text, tone = 'dark', className = '' }: QuoteTextProps) {
  const segments = parseQuoteSegments(text);
  const isLight = tone === 'light';

  if (segments.length === 0) {
    return (
      <span
        className={`font-sans font-bold tracking-[-0.02em] ${
          isLight ? 'text-slate-400' : 'text-[#F9FAFB]/45'
        } ${className}`}
      >
        Your quote will appear here...
      </span>
    );
  }

  return (
    <span
      className={`font-sans font-bold tracking-[-0.02em] [text-wrap:balance] ${
        isLight ? 'text-slate-900' : 'text-[#F9FAFB] quote-shadow'
      } ${className}`}
    >
      {segments.map((segment, index) =>
        segment.highlighted ? (
          <span
            key={index}
            className={
              isLight
                ? 'font-hand font-semibold text-slate-900 bg-[#FEF08A] rounded-md px-1.5 text-[1.18em] leading-[1.05] tracking-normal inline-block align-baseline'
                : 'font-hand font-semibold text-[#FDE047] hand-shadow text-[1.24em] leading-[1.02] tracking-normal inline-block px-0.5 align-baseline'
            }
          >
            {segment.text}
          </span>
        ) : (
          <span key={index}>{segment.text}</span>
        )
      )}
    </span>
  );
}
