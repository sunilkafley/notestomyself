import { ChevronLeft, ChevronRight, Eye, EyeOff, Pencil, Trash2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { NoteItem } from '../types/note';
import { StoryCard } from './StoryCard';

interface FullscreenReaderProps {
  notes: NoteItem[];
  activeIndex: number;
  onChangeIndex: (index: number) => void;
  onClose: () => void;
  onEdit: (note: NoteItem) => void;
  onDelete: (id: string) => void;
}

export function FullscreenReader({
  notes,
  activeIndex,
  onChangeIndex,
  onClose,
  onEdit,
  onDelete,
}: FullscreenReaderProps) {
  const [cleanMode, setCleanMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const currentNote = notes[activeIndex];
  const hasPrev = activeIndex > 0;
  const hasNext = activeIndex < notes.length - 1;

  useEffect(() => {
    setConfirmDelete(false);
  }, [activeIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (cleanMode) {
          setCleanMode(false);
        } else {
          onClose();
        }
      } else if (event.key === 'ArrowLeft' && hasPrev) {
        onChangeIndex(activeIndex - 1);
      } else if (event.key === 'ArrowRight' && hasNext) {
        onChangeIndex(activeIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, cleanMode, hasNext, hasPrev, onChangeIndex, onClose]);

  const handleTouchStart = (event: React.TouchEvent) => {
    if (event.touches.length !== 1) return;
    touchStartX.current = event.touches[0].clientX;
    touchStartY.current = event.touches[0].clientY;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const endX = event.changedTouches[0].clientX;
    const endY = event.changedTouches[0].clientY;
    const deltaX = endX - touchStartX.current;
    const deltaY = endY - touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    // Require predominantly horizontal swipe > 48px
    if (Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.25) {
      if (deltaX < 0 && hasNext) {
        onChangeIndex(activeIndex + 1);
      } else if (deltaX > 0 && hasPrev) {
        onChangeIndex(activeIndex - 1);
      }
    }
  };

  if (!currentNote) return null;

  return (
    <div
      className="fixed inset-0 z-50 min-h-[100dvh] bg-[#060B16]/96 backdrop-blur-md flex flex-col justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Fullscreen story reader"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Toolbar */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-5xl w-full mx-auto min-h-[44px]">
        {!cleanMode ? (
          <>
            <span className="text-xs sm:text-sm font-medium text-slate-400 tabular-nums whitespace-nowrap shrink-0">
              {activeIndex + 1} / {notes.length}
            </span>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setCleanMode(true)}
                className="inline-flex items-center justify-center gap-1.5 px-3 min-h-[44px] text-xs font-semibold text-zinc-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                title="Hide controls for clean screenshots"
              >
                <EyeOff className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="hidden xs:inline sm:inline">Clean View</span>
              </button>

              <button
                type="button"
                onClick={() => onEdit(currentNote)}
                className="inline-flex items-center justify-center gap-1.5 px-3 min-h-[44px] text-xs font-semibold text-zinc-200 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                aria-label="Edit note"
              >
                <Pencil className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>

              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 min-h-[44px] text-xs font-semibold text-zinc-300 hover:text-rose-300 bg-white/5 hover:bg-rose-500/10 border border-white/10 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  aria-label="Delete note"
                >
                  <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              ) : (
                <div className="flex items-center gap-1 bg-rose-500/15 border border-rose-500/30 rounded-lg px-1.5 min-h-[44px]">
                  <button
                    type="button"
                    onClick={() => onDelete(currentNote.id)}
                    className="px-2.5 min-h-[36px] text-xs font-bold text-rose-200 hover:text-white cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 min-h-[36px] text-xs font-medium text-zinc-300 hover:text-white cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer shrink-0"
                aria-label="Close reader"
              >
                <X className="w-5 h-5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="ml-auto">
            <button
              type="button"
              onClick={() => setCleanMode(false)}
              className="inline-flex items-center gap-1.5 px-3 min-h-[44px] text-xs font-medium text-zinc-400 hover:text-white rounded-lg opacity-45 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              Show Controls
            </button>
          </div>
        )}
      </div>

      {/* Centered 4:5 Story Card with Desktop Arrows & Mobile Swipe */}
      <div className="relative flex items-center justify-center gap-6 my-auto py-3 max-w-5xl w-full mx-auto">
        {!cleanMode && (
          <button
            type="button"
            disabled={!hasPrev}
            onClick={() => onChangeIndex(activeIndex - 1)}
            className="hidden sm:flex items-center justify-center w-11 h-11 rounded-full bg-white/5 border border-white/10 text-zinc-200 hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer shrink-0"
            aria-label="Previous note"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        <div className="w-full max-w-[420px] mx-auto">
          <StoryCard note={currentNote} variant="reader" />
        </div>

        {!cleanMode && (
          <button
            type="button"
            disabled={!hasNext}
            onClick={() => onChangeIndex(activeIndex + 1)}
            className="hidden sm:flex items-center justify-center w-11 h-11 rounded-full bg-white/5 border border-white/10 text-zinc-200 hover:bg-white/10 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer shrink-0"
            aria-label="Next note"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Bottom Mobile Navigation & Hint */}
      <div className="flex flex-col items-center justify-center gap-2 max-w-5xl w-full mx-auto min-h-[44px]">
        {!cleanMode && (
          <>
            <div className="flex sm:hidden items-center justify-between w-full max-w-[420px] gap-3">
              <button
                type="button"
                disabled={!hasPrev}
                onClick={() => onChangeIndex(activeIndex - 1)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 min-h-[44px] text-xs font-semibold rounded-xl bg-white/5 border border-white/10 text-zinc-200 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                type="button"
                disabled={!hasNext}
                onClick={() => onChangeIndex(activeIndex + 1)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 min-h-[44px] text-xs font-semibold rounded-xl bg-white/5 border border-white/10 text-zinc-200 disabled:opacity-30 cursor-pointer"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <p className="sm:hidden text-[11px] text-zinc-500">
              Swipe card left or right to flip notes
            </p>
            <p className="hidden sm:block text-xs text-zinc-500">
              Use arrow keys to flip through notes · Esc to exit
            </p>
          </>
        )}
      </div>
    </div>
  );
}
