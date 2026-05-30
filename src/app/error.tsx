'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('Vesak Street error:', error);
  }, [error]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fdf6e9 0%, #f5ead0 100%)',
        padding: '2rem',
        textAlign: 'center',
        fontFamily: 'var(--font-sinhala, serif), serif',
      }}
    >
      <div style={{ fontSize: '2rem', color: '#3a2a1a', marginBottom: '0.75rem' }}>
        වෙසක් වීදිය
      </div>
      <div style={{ fontSize: '1rem', color: '#7a5a3a', marginBottom: '2rem', maxWidth: '32rem', lineHeight: 1.5 }}>
        Something went wrong while loading the experience.<br />
        This may happen if your browser doesn't fully support 3D graphics, or if the connection dropped.
      </div>
      <button
        onClick={reset}
        style={{
          padding: '0.875rem 2.5rem',
          background: 'linear-gradient(180deg, #d89530 0%, #b87216 100%)',
          color: '#fdf6e9',
          border: 'none',
          borderRadius: '999px',
          fontSize: '1rem',
          fontWeight: 500,
          cursor: 'pointer',
          minHeight: '52px',
          minWidth: '160px',
        }}
      >
        Try Again
      </button>
    </div>
  );
}
