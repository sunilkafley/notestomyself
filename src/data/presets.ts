import { MoodPreset, NoteCategory, NoteItem, PhotoPreset } from '../types/note';

export const NOTE_CATEGORIES: NoteCategory[] = [
  'Life Lesson',
  'Conversation',
  'Mindset',
  'Book/Podcast',
];

export const MOOD_PRESETS: MoodPreset[] = [
  {
    id: 'charcoal',
    label: 'Charcoal Film',
    gradientClass: 'bg-gradient-to-br from-[#232326] via-[#171719] to-[#0D0D0F]',
    swatchStyle: 'linear-gradient(135deg, #2A2A2E 0%, #121214 100%)',
  },
  {
    id: 'midnight',
    label: 'Midnight Slate',
    gradientClass: 'bg-gradient-to-br from-[#1B2230] via-[#131720] to-[#0B0D12]',
    swatchStyle: 'linear-gradient(135deg, #222B3D 0%, #0D1017 100%)',
  },
  {
    id: 'espresso',
    label: 'Warm Espresso',
    gradientClass: 'bg-gradient-to-br from-[#271F1B] via-[#1A1513] to-[#0E0C0B]',
    swatchStyle: 'linear-gradient(135deg, #322621 0%, #120E0C 100%)',
  },
  {
    id: 'pine',
    label: 'Deep Pine',
    gradientClass: 'bg-gradient-to-br from-[#192420] via-[#121916] to-[#0B0F0E]',
    swatchStyle: 'linear-gradient(135deg, #202F2A 0%, #0D1210 100%)',
  },
  {
    id: 'plum',
    label: 'Noir Plum',
    gradientClass: 'bg-gradient-to-br from-[#281C26] via-[#1B141A] to-[#0E0B0E]',
    swatchStyle: 'linear-gradient(135deg, #362433 0%, #130E13 100%)',
  },
  {
    id: 'ocean',
    label: 'Ocean Dusk',
    gradientClass: 'bg-gradient-to-br from-[#17252C] via-[#111A20] to-[#0A0E12]',
    swatchStyle: 'linear-gradient(135deg, #1E333D 0%, #0B1117 100%)',
  },
  {
    id: 'amber',
    label: 'Burnt Amber',
    gradientClass: 'bg-gradient-to-br from-[#2B2016] via-[#1D1610] to-[#0F0C09]',
    swatchStyle: 'linear-gradient(135deg, #3A2A1B 0%, #140F0A 100%)',
  },
  {
    id: 'ash',
    label: 'Smoked Ash',
    gradientClass: 'bg-gradient-to-br from-[#2D2D32] via-[#1D1D21] to-[#111114]',
    swatchStyle: 'linear-gradient(135deg, #3B3B42 0%, #151518 100%)',
  },
];

export const PHOTO_PRESETS: PhotoPreset[] = [
  {
    id: 'rainy-window',
    label: 'Rainy Window',
    src: '/src/assets/images/backdrop_rainy_window_1795520890816.jpg',
  },
  {
    id: 'night-street',
    label: 'Night Street',
    src: '/src/assets/images/backdrop_night_street_1795520891454.jpg',
  },
  {
    id: 'morning-coffee',
    label: 'Morning Light',
    src: '/src/assets/images/backdrop_morning_coffee_1795520891925.jpg',
  },
  {
    id: 'misty-ridge',
    label: 'Misty Ridge',
    src: '/src/assets/images/backdrop_misty_ridge_1795520891544.jpg',
  },
];

export function getMoodPreset(moodId: string): MoodPreset {
  return MOOD_PRESETS.find((preset) => preset.id === moodId) ?? MOOD_PRESETS[0];
}

export const SAMPLE_NOTES: NoteItem[] = [
  {
    id: 'sample-1',
    quote:
      'People rarely remember every word you said, but they always remember *how safe they felt* sitting across from you.',
    reflection: 'Listen slower tonight. Put the phone face down.',
    source: 'Late night talk with Dad',
    date: '2026-11-18',
    category: 'Conversation',
    mood: 'espresso',
    createdAt: 1763424000000,
  },
  {
    id: 'sample-2',
    quote:
      'You do not need a whole new life. Most days, you just need *one honest hour* before the world wakes up.',
    reflection: 'When I read this again at 6am, it hit me.',
    source: 'Overheard at Cornerstone Coffee',
    date: '2026-11-12',
    category: 'Life Lesson',
    mood: 'charcoal',
    customImage: '/src/assets/images/backdrop_morning_coffee_1795520891925.jpg',
    createdAt: 1762905600000,
  },
  {
    id: 'sample-3',
    quote:
      'Confidence is not walking into a room thinking you are the smartest. It is walking in knowing *you will be okay* even if you are not.',
    reflection: 'Read twice before any hard conversation.',
    source: 'Notes from a quiet Sunday walk',
    date: '2026-11-04',
    category: 'Mindset',
    mood: 'midnight',
    createdAt: 1762214400000,
  },
];
