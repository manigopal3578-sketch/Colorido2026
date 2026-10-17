import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'COLORIDO 2K26 — R.V.R. & J.C. College of Engineering',
  description:
    'Official Festival Platform for COLORIDO 2K26. Two Worlds: Cultural Arts & Sports Championships. 28–29 December 2026. R.V.R. & J.C. College of Engineering, Guntur, AP, India. CREATE. COMPETE. EXPRESS. CONNECT.',
  keywords: [
    'Colorido 2K26',
    'RVRJC',
    'RVR & JC College of Engineering',
    'Cultural Festival',
    'Sports Tournament',
    'Guntur',
    'Andhra Pradesh',
    'College Fest India',
  ],
  authors: [{ name: 'R.V.R. & J.C. College of Engineering' }],
  openGraph: {
    title: 'COLORIDO 2K26 — Two Worlds. One Experience.',
    description:
      'The National-Level Cultural and Sports Fest at R.V.R. & J.C. College of Engineering, Guntur. 28–29 December 2026.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#5227FF',
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
    <html lang="en" className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col bg-white text-[#090814]">
        {children}
      </body>
    </html>
  );
}
