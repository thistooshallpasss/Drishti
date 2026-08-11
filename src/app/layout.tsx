import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { DrishtiProvider } from '@/context/DrishtiContext';

export const metadata: Metadata = {
  title: 'Drishti (दृष्टि) - Distraction-Free Command Center & Flashcards',
  description:
    'A personalized, high-aesthetic command center featuring direct-intent deep links, interactive SDE & AI/ML revision flashcards, curated tech radar, and developer scratchpad.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="obsidian">
      <body>
        <DrishtiProvider>{children}</DrishtiProvider>
      </body>
    </html>
  );
}
