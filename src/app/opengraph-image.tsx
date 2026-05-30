import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Vesak Street — A Vesak gift to the nation';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #fdf6e9 0%, #f5ead0 50%, #050308 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#3a2a1a',
          padding: 80,
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 24, opacity: 0.7 }}>
          වෙසක් වීදිය
        </div>
        <div style={{ fontSize: 96, fontWeight: 600, letterSpacing: '-0.02em' }}>
          Vesak Street
        </div>
        <div style={{ fontSize: 24, marginTop: 32, opacity: 0.6, textAlign: 'center' }}>
          A walk through Colombo on Vesak night
        </div>
        <div style={{ fontSize: 18, marginTop: 80, opacity: 0.5 }}>
          ප්‍රධාන දායකත්වය • Commercial Bank of Ceylon
        </div>
      </div>
    ),
    { ...size }
  );
}
