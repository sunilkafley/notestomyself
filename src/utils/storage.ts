import { NOTE_CATEGORIES, SAMPLE_NOTES } from '../data/presets';
import { MoodId, NoteCategory, NoteItem } from '../types/note';

const STORAGE_KEY = 'notes_to_myself_v1';
const VALID_MOODS: MoodId[] = [
  'charcoal',
  'midnight',
  'espresso',
  'pine',
  'plum',
  'ocean',
  'amber',
  'ash',
];

export function loadNotes(): NoteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_NOTES));
      return SAMPLE_NOTES;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return SAMPLE_NOTES;
    }

    return parsed.filter(isValidNote);
  } catch {
    return SAMPLE_NOTES;
  }
}

export function saveNotes(notes: NoteItem[]): { ok: boolean; error?: string } {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: 'Storage limit reached. Try removing large uploaded images or exporting a backup.',
    };
  }
}

function isValidNote(item: unknown): item is NoteItem {
  if (!item || typeof item !== 'object') return false;
  const candidate = item as Record<string, unknown>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.quote === 'string' &&
    typeof candidate.source === 'string' &&
    typeof candidate.date === 'string' &&
    typeof candidate.category === 'string'
  );
}

export function parseImportedNotes(jsonText: string): NoteItem[] {
  const parsed = JSON.parse(jsonText);
  const rawList = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === 'object' && Array.isArray((parsed as { notes?: unknown[] }).notes)
      ? (parsed as { notes: unknown[] }).notes
      : null;

  if (!rawList) {
    throw new Error('Invalid backup format. Expected a JSON array of notes.');
  }

  const normalized: NoteItem[] = [];

  for (const item of rawList) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const quote = typeof record.quote === 'string' ? record.quote.trim() : '';
    if (!quote) continue;

    const category = NOTE_CATEGORIES.includes(record.category as NoteCategory)
      ? (record.category as NoteCategory)
      : 'Life Lesson';

    const mood = VALID_MOODS.includes(record.mood as MoodId)
      ? (record.mood as MoodId)
      : 'charcoal';

    normalized.push({
      id: typeof record.id === 'string' && record.id ? record.id : crypto.randomUUID(),
      quote,
      reflection: typeof record.reflection === 'string' ? record.reflection : '',
      source: typeof record.source === 'string' && record.source.trim() ? record.source : 'Personal Note',
      date:
        typeof record.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(record.date)
          ? record.date
          : new Date().toISOString().slice(0, 10),
      category,
      mood,
      customImage: typeof record.customImage === 'string' ? record.customImage : undefined,
      createdAt: typeof record.createdAt === 'number' ? record.createdAt : Date.now(),
    });
  }

  if (normalized.length === 0) {
    throw new Error('No valid notes were found in the imported file.');
  }

  return normalized;
}

export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  const dateObj = new Date(year, month - 1, day);
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
