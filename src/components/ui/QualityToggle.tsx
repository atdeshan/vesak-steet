'use client';

import { useAppStore, type QualityLevel } from '@/lib/store';
import { useStrings } from '@/lib/i18n';

const OPTIONS: QualityLevel[] = ['low', 'medium', 'high'];

export function QualityToggle() {
  const quality = useAppStore((s) => s.quality);
  const setQuality = useAppStore((s) => s.setQuality);
  const language = useAppStore((s) => s.language);
  const t = useStrings(language);

  const labels: Record<QualityLevel, string> = {
    low: t.quality_low,
    medium: t.quality_medium,
    high: t.quality_high,
  };

  return (
    <div className="pointer-events-auto flex gap-1 p-1 rounded-full control-pill">
      {OPTIONS.map((q) => (
        <button
          key={q}
          onClick={() => setQuality(q)}
          className={`btn-flame px-2 md:px-3 py-1 text-[9px] md:text-[10px] ${quality === q ? 'active' : ''}`}
          aria-label={`Quality ${labels[q]}`}
        >
          {labels[q]}
        </button>
      ))}
    </div>
  );
}
