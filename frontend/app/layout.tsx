import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resume Engineering Assistant',
  description: 'Analyze a resume against a job description.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
