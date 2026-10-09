import type { Metadata, Viewport } from 'next';
import { Atkinson_Hyperlegible_Next } from 'next/font/google';
import './globals.css';

// Self-hosted by Next.js: the font ships with the app, so no request goes to Google.
const atkinson = Atkinson_Hyperlegible_Next({ subsets: ['latin'], variable: '--font-atkinson', adjustFontFallback: false });

export const metadata: Metadata = {
  title: 'Evie',
  description: 'Evie’s shared puppy log',
  appleWebApp: { capable: true, title: 'Evie', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f2f2ef' },
    { media: '(prefers-color-scheme: dark)', color: '#151413' },
  ],
};

// Applies the saved day/night choice before the first paint, so the screen never flashes bright at night.
const themeScript = `try{var t=localStorage.getItem('evie-theme');if(t)document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={atkinson.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
