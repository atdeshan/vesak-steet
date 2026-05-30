// TODO: Optimize /public/logo/budda rashmi logo.png — currently 1.8MB.
// Use https://tinypng.com to compress in place. Target: 150-300KB.
import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter, Noto_Sans_Sinhala } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import '@/styles/globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-display',
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const sinhala = Noto_Sans_Sinhala({
  subsets: ['sinhala'],
  weight: ['400', '500', '600'],
  variable: '--font-sinhala',
});

export const metadata: Metadata = {
  title: 'Vesak Street · Lanterns of Colombo',
  description: 'A virtual walk through the Vesak lantern displays of Colombo, Sri Lanka. Experience the lights, stories, and atmosphere of one of the most beautiful Buddhist festivals in the world.',
  metadataBase: new URL('https://vesakstreet.com'),
  openGraph: {
    title: 'Vesak Street · Lanterns of Colombo',
    description: 'A virtual walk through the Vesak lantern displays of Colombo, Sri Lanka.',
    images: ['/opengraph-image'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vesak Street · Lanterns of Colombo',
    description: 'A virtual walk through the Vesak lantern displays of Colombo, Sri Lanka.',
    images: ['/opengraph-image'],
  },
};

export const viewport: Viewport = {
  themeColor: '#050308',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${sinhala.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
