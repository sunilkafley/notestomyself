import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-4 z-40 inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-[#111A2E]/95 px-3.5 py-2 text-xs font-semibold text-amber-200 shadow-xl backdrop-blur-md"
    >
      <WifiOff className="w-3.5 h-3.5 text-[#FDE047] shrink-0" />
      <span>Offline Mode — Saved notes available</span>
    </div>
  );
}
