import { ImagePlus, Sparkles, Trash2, Upload, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import {
  DARK_MOOD_PRESETS,
  LIGHT_MOOD_PRESETS,
  NOTE_CATEGORIES,
  PHOTO_PRESETS,
} from '../data/presets';
import { MoodId, NoteCategory, NoteItem } from '../types/note';
import { compressImageToDataUrl } from '../utils/imageCompress';
import { StoryCard } from './StoryCard';

interface CaptureModalProps {
  isOpen: boolean;
  initialNote?: NoteItem | null;
  onClose: () => void;
  onSave: (note: NoteItem) => void;
}

function getTodayIso(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

export function CaptureModal({ isOpen, initialNote, onClose, onSave }: CaptureModalProps) {
  const [quote, setQuote] = useState('');
  const [reflection, setReflection] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState(getTodayIso());
  const [category, setCategory] = useState<NoteCategory>('Life Lesson');
  const [mood, setMood] = useState<MoodId>('cobalt');
  const [customImage, setCustomImage] = useState<string | undefined>(undefined);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'write' | 'preview'>('write');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (initialNote) {
      setQuote(initialNote.quote);
      setReflection(initialNote.reflection);
      setSource(initialNote.source);
      setDate(initialNote.date);
      setCategory(initialNote.category);
      setMood(initialNote.mood);
      setCustomImage(initialNote.customImage);
    } else {
      setQuote('');
      setReflection('');
      setSource('');
      setDate(getTodayIso());
      setCategory('Life Lesson');
      setMood('cobalt');
      setCustomImage(undefined);
    }
    setImageError(null);
    setFormError(null);
    setIsDraggingFile(false);
    setMobileTab('write');

    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 60);

    return () => clearTimeout(timer);
  }, [isOpen, initialNote]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleWrapSelection = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end) {
      const selected = quote.slice(start, end);
      const isAlreadyWrapped = selected.startsWith('*') && selected.endsWith('*') && selected.length > 2;
      const replacement = isAlreadyWrapped ? selected.slice(1, -1) : `*${selected}*`;
      const updated = quote.slice(0, start) + replacement + quote.slice(end);
      setQuote(updated);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start, start + replacement.length);
      });
    } else {
      const insertText = '*key phrase*';
      const updated = quote.slice(0, start) + insertText + quote.slice(end);
      setQuote(updated);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 1, start + insertText.length - 1);
      });
    }
  };

  const processPhotoFile = async (file: File) => {
    setImageError(null);
    setIsCompressing(true);
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setCustomImage(dataUrl);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Could not process image.');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processPhotoFile(file);
  };

  const handleDropFile = async (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDraggingFile(false);
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    await processPhotoFile(file);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedQuote = quote.trim();
    if (!trimmedQuote) {
      setFormError('Write a quote or lesson before saving.');
      setMobileTab('write');
      requestAnimationFrame(() => textareaRef.current?.focus());
      return;
    }

    const note: NoteItem = {
      id: initialNote?.id ?? crypto.randomUUID(),
      quote: trimmedQuote,
      reflection: reflection.trim(),
      source: source.trim() || 'Personal Note',
      date: date || getTodayIso(),
      category,
      mood,
      customImage,
      createdAt: initialNote?.createdAt ?? Date.now(),
    };

    onSave(note);
  };

  const isCustomUploadedPhoto =
    Boolean(customImage) && !PHOTO_PRESETS.some((preset) => preset.src === customImage);

  const previewNote: NoteItem = {
    id: 'preview',
    quote,
    reflection,
    source: source || 'Overheard at coffee shop',
    date,
    category,
    mood,
    customImage,
    createdAt: Date.now(),
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-slate-900/45 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="capture-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full sm:max-w-4xl max-h-[92dvh] sm:max-h-[90dvh] bg-white border-t sm:border border-slate-200 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Mobile sheet drag handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center shrink-0" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 sm:px-6 py-3 sm:py-4 border-b border-slate-200 shrink-0">
          <h2 id="capture-modal-title" className="text-lg font-bold tracking-tight text-slate-900">
            {initialNote ? 'Edit Note' : 'Capture a Note'}
          </h2>

          <div className="flex items-center gap-2">
            {/* Mobile Write / Preview switch */}
            <div className="flex lg:hidden items-center p-1 bg-slate-100 border border-slate-200 rounded-lg">
              <button
                type="button"
                onClick={() => setMobileTab('write')}
                className={`px-3 min-h-[36px] text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  mobileTab === 'write' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setMobileTab('preview')}
                className={`px-3 min-h-[36px] text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  mobileTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Preview
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form + Live Preview */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-6">
            {/* Write Pane */}
            <div className={`flex-col gap-5 ${mobileTab === 'write' ? 'flex' : 'hidden lg:flex'}`}>
              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <label htmlFor="note-quote" className="text-sm font-semibold text-slate-800">
                    Quote or Lesson
                  </label>
                  <button
                    type="button"
                    onClick={handleWrapSelection}
                    className="inline-flex items-center gap-1.5 px-3 min-h-[36px] sm:min-h-[32px] text-xs font-semibold rounded-lg bg-[#FEF08A] text-slate-900 hover:bg-[#FDE047] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                    Highlight *word*
                  </button>
                </div>
                <textarea
                  ref={textareaRef}
                  id="note-quote"
                  rows={4}
                  value={quote}
                  onChange={(e) => {
                    setQuote(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder='e.g. When I got this text, it *hit me.*'
                  className="w-full rounded-xl bg-[#F8FAFC] border border-slate-200 px-4 py-3 text-base sm:text-[15px] leading-relaxed text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] resize-none"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  Wrap any key phrase in <span className="bg-[#FEF08A] text-slate-900 px-1 rounded font-semibold">*asterisks*</span> to render it in yellow handwritten marker.
                </p>
                {formError && (
                  <p className="mt-1.5 text-xs font-medium text-rose-600" role="alert">
                    {formError}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="note-reflection" className="block text-sm font-semibold text-slate-800 mb-2">
                  Personal Reflection <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  id="note-reflection"
                  type="text"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Short handwritten reminder beneath the quote..."
                  className="w-full min-h-[44px] rounded-xl bg-[#F8FAFC] border border-slate-200 px-4 py-2.5 text-base sm:text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_164px] gap-4">
                <div>
                  <label htmlFor="note-source" className="block text-sm font-semibold text-slate-800 mb-2">
                    Context or Source
                  </label>
                  <input
                    id="note-source"
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="Overheard at coffee shop, Dad..."
                    className="w-full min-h-[44px] rounded-xl bg-[#F8FAFC] border border-slate-200 px-4 py-2.5 text-base sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
                <div>
                  <label htmlFor="note-date" className="block text-sm font-semibold text-slate-800 mb-2">
                    Date
                  </label>
                  <input
                    id="note-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full min-h-[44px] rounded-xl bg-[#F8FAFC] border border-slate-200 px-3 py-2.5 text-base sm:text-sm text-slate-900 tabular-nums focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <span className="block text-sm font-semibold text-slate-800 mb-2">Category</span>
                <div className="flex flex-wrap gap-2">
                  {NOTE_CATEGORIES.map((item) => {
                    const active = category === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCategory(item)}
                        className={`px-3.5 min-h-[44px] sm:min-h-[38px] text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-[#F8FAFC] text-slate-700 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card Backdrop: Rich/Cobalt Gradients + Light Paper/Pastel + Photos */}
              <div className="flex flex-col gap-4">
                <div>
                  <span className="block text-sm font-semibold text-slate-800 mb-2">
                    Cobalt &amp; Rich Gradients
                  </span>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {DARK_MOOD_PRESETS.map((preset) => {
                      const isSelected = mood === preset.id && !customImage;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setMood(preset.id);
                            setCustomImage(undefined);
                          }}
                          title={preset.label}
                          aria-label={preset.label}
                          className={`w-11 h-11 rounded-lg border transition-transform cursor-pointer ${
                            isSelected
                              ? 'border-[#2563EB] ring-2 ring-[#2563EB]/35 scale-105'
                              : 'border-slate-300 hover:border-slate-500'
                          }`}
                          style={{ background: preset.swatchStyle }}
                        />
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="block text-sm font-semibold text-slate-800 mb-2">
                    Light Paper &amp; Pastel
                  </span>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {LIGHT_MOOD_PRESETS.map((preset) => {
                      const isSelected = mood === preset.id && !customImage;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setMood(preset.id);
                            setCustomImage(undefined);
                          }}
                          title={preset.label}
                          aria-label={preset.label}
                          className={`w-11 h-11 rounded-lg border transition-transform cursor-pointer ${
                            isSelected
                              ? 'border-[#2563EB] ring-2 ring-[#2563EB]/35 scale-105'
                              : 'border-slate-300 hover:border-slate-500'
                          }`}
                          style={{ background: preset.swatchStyle }}
                        />
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-semibold text-slate-800">
                      Photo Backdrops
                    </span>
                    {customImage && (
                      <button
                        type="button"
                        onClick={() => setCustomImage(undefined)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove Photo
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-5 gap-2.5">
                    {PHOTO_PRESETS.map((photo) => {
                      const isSelected = customImage === photo.src;
                      return (
                        <button
                          key={photo.id}
                          type="button"
                          onClick={() => {
                            setCustomImage(photo.src);
                            setImageError(null);
                          }}
                          title={photo.label}
                          aria-label={`Use ${photo.label} backdrop`}
                          className={`relative aspect-[4/5] rounded-lg overflow-hidden border transition-transform cursor-pointer ${
                            isSelected
                              ? 'border-[#2563EB] ring-2 ring-[#2563EB]/35 scale-[1.03]'
                              : 'border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          <img
                            src={photo.src}
                            alt={photo.label}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                          <span className="absolute inset-x-1 bottom-1 text-[10px] font-medium text-white truncate text-center">
                            {photo.label}
                          </span>
                        </button>
                      );
                    })}

                    {/* Add / Drop Your Own Photo Tile */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="card-image-upload"
                    />
                    <label
                      htmlFor="card-image-upload"
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingFile(true);
                      }}
                      onDragLeave={() => setIsDraggingFile(false)}
                      onDrop={handleDropFile}
                      className={`relative aspect-[4/5] rounded-lg border border-dashed flex flex-col items-center justify-center gap-1.5 p-1.5 text-center transition-colors cursor-pointer overflow-hidden ${
                        isDraggingFile
                          ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]'
                          : isCustomUploadedPhoto
                            ? 'border-[#2563EB] ring-2 ring-[#2563EB]/35'
                            : 'border-slate-300 bg-[#F8FAFC] hover:border-slate-400 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {isCustomUploadedPhoto && customImage ? (
                        <>
                          <img
                            src={customImage}
                            alt="Uploaded photo backdrop"
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/55" />
                          <Upload className="relative z-10 w-4 h-4 text-[#FDE047]" />
                          <span className="relative z-10 text-[10px] font-semibold text-white leading-tight">
                            {isCompressing ? 'Saving...' : 'Replace'}
                          </span>
                        </>
                      ) : (
                        <>
                          <ImagePlus className="w-4 h-4 text-[#2563EB]" />
                          <span className="text-[10px] font-semibold leading-tight">
                            {isCompressing ? 'Adding...' : 'Add Photo'}
                          </span>
                        </>
                      )}
                    </label>
                  </div>

                  {imageError && (
                    <p className="mt-2 text-xs text-rose-600" role="alert">
                      {imageError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Live 4:5 Card Preview */}
            <div
              className={`flex-col items-center justify-center bg-[#F1F5F9] rounded-xl p-5 border border-slate-200 ${
                mobileTab === 'preview' ? 'flex' : 'hidden lg:flex'
              }`}
            >
              <div className="w-full max-w-[300px]">
                <p className="text-xs font-semibold text-slate-500 mb-3 text-center">Live Story Preview</p>
                <StoryCard note={previewNote} variant="preview" />
              </div>
            </div>
          </div>

          {/* Pinned Thumb-Friendly Sheet Footer */}
          <div className="flex items-center justify-end gap-3 px-5 sm:px-6 pt-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))] border-t border-slate-200 bg-white shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 min-h-[44px] text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCompressing}
              className="flex-1 sm:flex-initial px-6 min-h-[44px] text-sm font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {initialNote ? 'Save Changes' : 'Save Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
