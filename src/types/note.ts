export type NoteCategory =
  | 'Life Lesson'
  | 'Conversation'
  | 'Mindset'
  | 'Book/Podcast';

export type MoodId =
  | 'cobalt'
  | 'midnight'
  | 'ocean'
  | 'pine'
  | 'charcoal'
  | 'espresso'
  | 'plum'
  | 'amber'
  | 'ash'
  | 'paper'
  | 'sky'
  | 'mint'
  | 'linen';

export type CardTone = 'dark' | 'light';

export interface MoodPreset {
  id: MoodId;
  label: string;
  tone: CardTone;
  gradientClass: string;
  swatchStyle: string;
}

export interface PhotoPreset {
  id: string;
  label: string;
  src: string;
}

export interface NoteItem {
  id: string;
  quote: string;
  reflection: string;
  source: string;
  date: string; // YYYY-MM-DD
  category: NoteCategory;
  mood: MoodId;
  customImage?: string; // Compressed Data URL or curated backdrop path
  createdAt: number;
}
