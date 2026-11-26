import { ArrowUpDown, Plus, Search, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CaptureModal } from './components/CaptureModal';
import { FullscreenReader } from './components/FullscreenReader';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallButton } from './components/PWAInstallButton';
import { StoryCard } from './components/StoryCard';
import { NOTE_CATEGORIES, SAMPLE_NOTES } from './data/presets';
import { NoteCategory, NoteItem } from './types/note';
import { loadNotes, parseImportedNotes, saveNotes } from './utils/storage';

type CategoryFilter = 'All' | NoteCategory;
type SortOrder = 'newest' | 'oldest';

interface ToastMessage {
  text: string;
  tone: 'neutral' | 'error';
}

export default function App() {
  const [notes, setNotes] = useState<NoteItem[]>(() => loadNotes());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteItem | null>(null);
  const [readerIndex, setReaderIndex] = useState<number | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (text: string, tone: 'neutral' | 'error' = 'neutral') => {
    setToast({ text, tone });
  };

  const persistNotes = (nextNotes: NoteItem[]) => {
    setNotes(nextNotes);
    const result = saveNotes(nextNotes);
    if (!result.ok && result.error) {
      showToast(result.error, 'error');
    }
  };

  const filteredNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return [...notes]
      .sort((a, b) => {
        if (b.date !== a.date) {
          return sortOrder === 'newest'
            ? b.date.localeCompare(a.date)
            : a.date.localeCompare(b.date);
        }
        return sortOrder === 'newest' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt;
      })
      .filter((note) => {
        const matchesCategory = activeCategory === 'All' || note.category === activeCategory;
        if (!matchesCategory) return false;
        if (!query) return true;

        return (
          note.quote.toLowerCase().includes(query) ||
          note.reflection.toLowerCase().includes(query) ||
          note.source.toLowerCase().includes(query) ||
          note.category.toLowerCase().includes(query)
        );
      });
  }, [notes, searchQuery, activeCategory, sortOrder]);

  const handleOpenNewCapture = () => {
    setEditingNote(null);
    setIsCaptureOpen(true);
  };

  const handleSaveNote = (savedNote: NoteItem) => {
    const exists = notes.some((item) => item.id === savedNote.id);
    const nextNotes = exists
      ? notes.map((item) => (item.id === savedNote.id ? savedNote : item))
      : [savedNote, ...notes];

    persistNotes(nextNotes);
    setIsCaptureOpen(false);
    setEditingNote(null);
    showToast(exists ? 'Note updated.' : 'Note saved to your journal.');
  };

  const handleDeleteNote = (id: string) => {
    const nextNotes = notes.filter((item) => item.id !== id);
    persistNotes(nextNotes);

    if (readerIndex !== null) {
      if (nextNotes.length === 0 || filteredNotes.length <= 1) {
        setReaderIndex(null);
      } else if (readerIndex >= filteredNotes.length - 1) {
        setReaderIndex(Math.max(0, filteredNotes.length - 2));
      }
    }

    showToast('Note removed.');
  };

  const handleExportJson = () => {
    const payload = JSON.stringify(notes, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `notes-to-myself-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    showToast(`Exported ${notes.length} ${notes.length === 1 ? 'note' : 'notes'} as JSON.`);
  };

  const handleImportJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = parseImportedNotes(text);

      const existingById = new Map(notes.map((n) => [n.id, n]));
      for (const item of imported) {
        existingById.set(item.id, item);
      }

      const merged = Array.from(existingById.values());
      persistNotes(merged);
      showToast(`Imported ${imported.length} ${imported.length === 1 ? 'note' : 'notes'}.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not import JSON file.', 'error');
    } finally {
      if (importInputRef.current) {
        importInputRef.current.value = '';
      }
    }
  };

  const handleRestoreSamples = () => {
    persistNotes(SAMPLE_NOTES);
    setActiveCategory('All');
    setSearchQuery('');
    showToast('Sample notes restored.');
  };

  const filterOptions: CategoryFilter[] = ['All', ...NOTE_CATEGORIES];

  return (
    <div className="min-h-[100dvh] bg-[#0B1120] text-[#F9FAFB] relative">
      {/* Atmospheric midnight-blue ambient glow & subtle film grain */}
      <div
        className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.16),transparent_62%)] pointer-events-none"
        aria-hidden="true"
      />
      <div className="fixed inset-0 film-grain pointer-events-none opacity-60" aria-hidden="true" />

      {/* Top Navigation Bar */}
      <header className="relative md:sticky md:top-0 z-30 bg-[#0B1120]/88 backdrop-blur-md border-b border-sky-200/10">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-4 md:gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            className="text-lg font-extrabold tracking-[-0.02em] text-[#F9FAFB] whitespace-nowrap shrink-0 min-h-[44px] flex items-center"
          >
            Notes to Myself
          </a>

          {/* Zone 2: Clean single-line text links (desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <button
              type="button"
              onClick={() => {
                if (filteredNotes.length > 0) setReaderIndex(0);
              }}
              disabled={filteredNotes.length === 0}
              className="hover:text-[#F9FAFB] hover:underline underline-offset-4 disabled:opacity-40 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Story Mode
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              className="hover:text-[#F9FAFB] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="hover:text-[#F9FAFB] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Import JSON
            </button>
          </nav>

          {/* Zone 3: 1 primary CTA (desktop) / Story Mode shortcut (mobile) */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleOpenNewCapture}
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-[#0B1120] bg-[#FDE047] hover:bg-[#FEF08A] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE047] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1120]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Capture Note
            </button>

            <button
              type="button"
              onClick={() => {
                if (filteredNotes.length > 0) setReaderIndex(0);
              }}
              disabled={filteredNotes.length === 0}
              className="md:hidden inline-flex items-center px-3 min-h-[44px] text-xs font-semibold text-slate-200 hover:text-white disabled:opacity-40 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Story Mode
            </button>
          </div>
        </div>
      </header>

      <input
        ref={importInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImportJson}
        className="hidden"
        aria-label="Import notes JSON backup"
      />

      <main
        id="top"
        className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 sm:pt-12 pb-28 md:pb-20"
      >
        {/* Quiet Editorial Lead */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 sm:pb-8 border-b border-sky-200/10">
          <div className="max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.025em] text-[#F9FAFB] [text-wrap:balance]">
              Words worth{' '}
              <span className="font-hand font-semibold text-[#FDE047] text-[1.22em] leading-none">
                keeping.
              </span>
            </h1>
            <p className="mt-2 text-sm sm:text-[15px] leading-relaxed text-slate-400">
              Overheard conversations, late-night advice, and quiet reminders saved locally in your browser. Tap any card for fullscreen reading or screenshots.
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 md:justify-end">
            {/* Mobile JSON backup triggers with 44px touch targets */}
            <div className="flex md:hidden items-center gap-1 text-xs font-medium text-slate-400 -ml-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="px-2 min-h-[44px] flex items-center hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
              >
                Export JSON
              </button>
              <span aria-hidden="true" className="text-slate-700">
                ·
              </span>
              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                className="px-2 min-h-[44px] flex items-center hover:text-white whitespace-nowrap shrink-0 cursor-pointer"
              >
                Import JSON
              </button>
            </div>

            <PWAInstallButton />
          </div>
        </section>

        {/* Search & Category Filter Toolbar */}
        <section className="py-5 sm:py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-1 p-1 bg-[#111A2E] border border-sky-200/10 rounded-xl overflow-x-auto no-scrollbar">
            {filterOptions.map((category) => {
              const active = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`px-3.5 min-h-[40px] sm:min-h-[36px] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#1D2B4A] text-[#F9FAFB]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quotes or sources..."
                aria-label="Search quotes or sources"
                className="w-full min-h-[44px] rounded-xl bg-[#111A2E] border border-sky-200/10 pl-10 pr-10 py-2 text-base sm:text-sm text-[#F9FAFB] placeholder:text-slate-500 focus:outline-none focus:border-[#FDE047]/60 focus:ring-1 focus:ring-[#FDE047]/60"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[38px] min-h-[38px] flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))}
              aria-label={`Sort order: ${sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}. Click to switch.`}
              className="inline-flex items-center gap-1.5 px-3.5 min-h-[44px] rounded-xl bg-[#111A2E] border border-sky-200/10 hover:border-sky-200/25 text-xs font-semibold text-slate-200 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE047]"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
            </button>

            <span className="text-xs font-medium text-slate-400 tabular-nums whitespace-nowrap shrink-0">
              {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
            </span>
          </div>
        </section>

        {/* Editorial 4:5 Story Card Grid */}
        {filteredNotes.length > 0 ? (
          <section
            aria-label="Saved story cards"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 pt-1"
          >
            {filteredNotes.map((note, index) => (
              <StoryCard
                key={note.id}
                note={note}
                variant="feed"
                onClick={() => setReaderIndex(index)}
              />
            ))}
          </section>
        ) : (
          <section className="my-10 rounded-2xl border border-sky-200/10 bg-[#111A2E] px-6 py-14 text-center max-w-xl mx-auto">
            <h2 className="text-xl font-bold tracking-tight text-[#F9FAFB]">
              {notes.length === 0 ? 'Your journal is empty' : 'No matching notes'}
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              {notes.length === 0
                ? 'Capture a meaningful line from today, or restore the three starter notes.'
                : 'Try clearing your search keyword or switching back to all categories.'}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {notes.length === 0 ? (
                <>
                  <button
                    type="button"
                    onClick={handleOpenNewCapture}
                    className="px-5 min-h-[44px] text-sm font-bold text-[#0B1120] bg-[#FDE047] hover:bg-[#FEF08A] rounded-lg transition-colors cursor-pointer"
                  >
                    Capture First Note
                  </button>
                  <button
                    type="button"
                    onClick={handleRestoreSamples}
                    className="px-4 min-h-[44px] text-sm font-medium text-slate-300 hover:text-white border border-sky-200/15 rounded-lg transition-colors cursor-pointer"
                  >
                    Restore Samples
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('All');
                  }}
                  className="px-5 min-h-[44px] text-sm font-semibold text-[#0B1120] bg-[#FDE047] hover:bg-[#FEF08A] rounded-lg transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Mobile Thumb-Zone Floating Capture CTA */}
      <div className="md:hidden fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-4 z-30">
        <button
          type="button"
          onClick={handleOpenNewCapture}
          className="inline-flex items-center gap-2 px-5 min-h-[48px] text-sm font-bold text-[#0B1120] bg-[#FDE047] hover:bg-[#FEF08A] active:scale-[0.97] rounded-xl shadow-[0_8px_28px_rgba(0,0,0,0.65)] transition-transform whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE047] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1120]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Capture Note
        </button>
      </div>

      {/* Capture / Edit Sheet & Modal */}
      <CaptureModal
        isOpen={isCaptureOpen}
        initialNote={editingNote}
        onClose={() => {
          setIsCaptureOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
      />

      {/* Fullscreen Story Reader */}
      {readerIndex !== null && filteredNotes[readerIndex] && (
        <FullscreenReader
          notes={filteredNotes}
          activeIndex={readerIndex}
          onChangeIndex={setReaderIndex}
          onClose={() => setReaderIndex(null)}
          onEdit={(note) => {
            setReaderIndex(null);
            setEditingNote(note);
            setIsCaptureOpen(true);
          }}
          onDelete={handleDeleteNote}
        />
      )}

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Non-blocking Toast Feedback */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-[max(1rem,env(safe-area-inset-top))] inset-x-4 sm:inset-x-auto sm:top-auto sm:bottom-5 sm:right-5 z-50 px-4 py-3 sm:py-2.5 rounded-xl border text-xs font-semibold shadow-xl text-center sm:text-left ${
            toast.tone === 'error'
              ? 'bg-rose-950/95 border-rose-500/40 text-rose-200'
              : 'bg-[#111A2E]/95 border-sky-200/15 text-[#F9FAFB]'
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}
