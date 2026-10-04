import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KIET Smart City Lab | Innovation, Research & Project Showcase',
  description: 'The premier student research & project incubation platform for smart urban infrastructure, IoT, AI, and green energy at KIET Group of Institutions.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.ico' },
      { url: '/smartcity-logo.png', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/smartcity-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAFCFF] text-slate-900 font-sans antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}