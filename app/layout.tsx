import type { Metadata } from 'next';
import { Anton, Space_Mono } from 'next/font/google';
import './globals.css';

const bigShoulders = Anton({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-big-shoulders',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
});

export const metadata: Metadata = {
  title: 'VAMPIRE SEX',
  description: 'Minimal tech house DJ duo. Official merch, music, and booking.',
  metadataBase: new URL('https://vampiresex.com'),
  openGraph: {
    title: 'VAMPIRE SEX',
    description: 'Minimal tech house DJ duo. Official merch, music, and booking.',
    siteName: 'VAMPIRE SEX',
    images: [{ url: '/images/press/vs-ny-shoot-2.webp', width: 1800, height: 1200 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VAMPIRE SEX',
    description: 'Minimal tech house DJ duo. Official merch, music, and booking.',
    images: ['/images/press/vs-ny-shoot-2.webp'],
  },
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bigShoulders.variable} ${spaceMono.variable}`}>
      <body suppressHydrationWarning className="bg-[#E8DCC8] text-[#1A1612] font-mono antialiased selection:bg-[#8B0000] selection:text-[#F2EDE4]">
        {/* Static border frame */}
        <div className="fixed inset-[10px] border-[1.5px] border-[#8B0000]/30 pointer-events-none z-[60]"></div>
        {/* Traveling glow layer — conic gradient rotates over the frame */}
        <div className="border-glow fixed inset-[9px] pointer-events-none z-[60]"></div>
        {children}
      </body>
    </html>
  );
}
