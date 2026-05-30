'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div
          style={{
            position: 'fixed',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#050308',
            color: '#fdf6e9',
            padding: '2rem',
            textAlign: 'center',
            fontFamily: 'serif',
          }}
        >
          <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Something went wrong</h2>
          <button
            onClick={reset}
            style={{
              padding: '0.875rem 2.5rem',
              background: '#d89530',
              color: '#050308',
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
      </body>
    </html>
  );
}
