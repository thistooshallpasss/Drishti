import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { DrishtiProvider } from '@/context/DrishtiContext';

export const metadata: Metadata = {
  title: 'Drishti (दृष्टि) - Focus Command Center & Knowledge Hub',
  description:
    'A personalized, high-aesthetic distraction-free command center featuring direct deep links, daily voice journal, and focus learning hubs.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
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
