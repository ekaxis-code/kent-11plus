import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kent 11+ Admissions Intelligence Platform (2015–2026)',
  description: 'Authoritative Kent Test admissions intelligence dashboard, predictive cut-off engine, and SCAF application strategist for September 2027 entry.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white text-notion-text antialiased selection:bg-notion-blue-bg selection:text-notion-blue-text">
        {children}
      </body>
    </html>
  );
}
