import type { Metadata } from 'next';
import { Noto_Sans_JP, Playfair_Display, Open_Sans } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { BadgeProvider } from '@/contexts/BadgeContext';
import './globals.css';

// Japanese font for Japanese text
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans-jp',
});

// Elegant serif font for headings and logo
const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair-display',
});

// Clean sans-serif for body text in English
const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans',
});

export const metadata: Metadata = {
  title: 'Mikke - スポット発見アプリ',
  description: 'インタラクティブマップでスポットを発見・共有できるWebアプリケーション',
  keywords: ['地図', 'スポット', '共有', 'マップ', 'Mikke'],
  authors: [{ name: 'Mikke Team' }],
  openGraph: {
    title: 'Mikke - スポット発見アプリ',
    description: 'インタラクティブマップでスポットを発見・共有',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mikke - スポット発見アプリ',
    description: 'インタラクティブマップでスポットを発見・共有',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#823D2C',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${playfairDisplay.variable} ${openSans.variable}`}>
      <body className="font-sans antialiased bg-background text-neutral-800">
        <AuthProvider>
          <BadgeProvider>
            {children}
          </BadgeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}