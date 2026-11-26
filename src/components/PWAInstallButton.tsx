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
        className="inline-flex items-center gap-1.5 px-3 min-h-[44px] md:min-h-[36px] text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900 shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
      >
        <Download className="w-3.5 h-3.5 text-[#2563EB]" />
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
          className="inline-flex items-center gap-1.5 px-3 min-h-[44px] md:min-h-[36px] text-xs font-semibold rounded-lg border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:text-slate-900 shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
        >
          <Share className="w-3.5 h-3.5 text-[#2563EB]" />
          Add to Home
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-slate-900/45 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowIOSGuide(false);
            }}
          >
            <div className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl bg-white border-t sm:border border-slate-200 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl">
              <div className="flex items-center justify-between gap-3">
                <h3 id="ios-install-title" className="text-lg font-bold tracking-tight text-slate-900">
                  Add to iPhone Home Screen
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                  aria-label="Close install instructions"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="mt-2 text-sm text-slate-600">
                Install <span className="text-slate-900 font-semibold">Notes to Myself</span> as a full-screen offline app in Safari:
              </p>

              <ol className="mt-4 space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-50 border border-blue-200 text-xs font-bold text-[#2563EB] tabular-nums">
                    1
                  </span>
                  <span>
                    Tap the{' '}
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                      Share <Share className="w-3.5 h-3.5 text-[#2563EB]" />
                    </span>{' '}
                    button in Safari&apos;s toolbar.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-50 border border-blue-200 text-xs font-bold text-[#2563EB] tabular-nums">
                    2
                  </span>
                  <span>
                    Scroll down and tap{' '}
                    <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                      Add to Home Screen <PlusSquare className="w-3.5 h-3.5 text-[#2563EB]" />
                    </span>
                    .
                  </span>
                </li>
              </ol>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full min-h-[44px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-sm font-bold text-white transition-colors cursor-pointer"
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
