import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KIET Smart City Lab | Innovation, Research & Project Showcase',
  description: 'The premier student research & project incubation platform for smart urban infrastructure, IoT, AI, and green energy at KIET Group of Institutions.',
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