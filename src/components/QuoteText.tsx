import { parseQuoteSegments } from '../utils/quoteParser';

interface QuoteTextProps {
  text: string;
  className?: string;
}

export function QuoteText({ text, className = '' }: QuoteTextProps) {
  const segments = parseQuoteSegments(text);

  if (segments.length === 0) {
    return (
      <span className={`font-sans font-bold tracking-[-0.02em] text-[#F9FAFB]/40 ${className}`}>
        Your quote will appear here...
      </span>
    );
  }

  return (
    <span
      className={`font-sans font-bold tracking-[-0.02em] text-[#F9FAFB] quote-shadow [text-wrap:balance] ${className}`}
    >
      {segments.map((segment, index) =>
        segment.highlighted ? (
          <span
            key={index}
            className="font-hand font-semibold text-[#FDE047] hand-shadow text-[1.24em] leading-[1.02] tracking-normal inline-block px-0.5 align-baseline"
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
