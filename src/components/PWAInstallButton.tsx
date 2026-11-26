import { Download, PlusSquare, Share, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export function PWAInstallButton() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    if (!showIOSGuide) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowIOSGuide(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showIOSGuide]);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 min-h-[44px] md:min-h-[36px] text-xs font-semibold rounded-lg border border-sky-200/15 bg-[#111A2E] text-slate-200 hover:border-sky-200/35 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE047]"
      >
        <Download className="w-3.5 h-3.5 text-[#FDE047]" />
        Install App
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 min-h-[44px] md:min-h-[36px] text-xs font-semibold rounded-lg border border-sky-200/15 bg-[#111A2E] text-slate-200 hover:border-sky-200/35 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDE047]"
        >
          <Share className="w-3.5 h-3.5 text-[#FDE047]" />
          Add to Home
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-[#040812]/80 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowIOSGuide(false);
            }}
          >
            <div className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl bg-[#111A2E] border-t sm:border border-sky-200/15 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl">
              <div className="flex items-center justify-between gap-3">
                <h3 id="ios-install-title" className="text-lg font-bold tracking-tight text-[#F9FAFB]">
                  Add to iPhone Home Screen
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
                  aria-label="Close install instructions"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="mt-2 text-sm text-slate-400">
                Install <span className="text-slate-200 font-medium">Notes to Myself</span> as a full-screen offline app in Safari:
              </p>

              <ol className="mt-4 space-y-3 text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#0B1120] border border-sky-200/15 text-xs font-bold text-[#FDE047] tabular-nums">
                    1
                  </span>
                  <span>
                    Tap the{' '}
                    <span className="inline-flex items-center gap-1 font-semibold text-white">
                      Share <Share className="w-3.5 h-3.5 text-[#FDE047]" />
                    </span>{' '}
                    button in Safari&apos;s toolbar.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#0B1120] border border-sky-200/15 text-xs font-bold text-[#FDE047] tabular-nums">
                    2
                  </span>
                  <span>
                    Scroll down and tap{' '}
                    <span className="inline-flex items-center gap-1 font-semibold text-white">
                      Add to Home Screen <PlusSquare className="w-3.5 h-3.5 text-[#FDE047]" />
                    </span>
                    .
                  </span>
                </li>
              </ol>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full min-h-[44px] rounded-xl bg-[#FDE047] hover:bg-[#FEF08A] text-sm font-bold text-[#0B1120] transition-colors cursor-pointer"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
