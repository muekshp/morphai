import type { Metadata, Viewport } from 'next';
import RootShell from '@/components/RootShell';
import SitePage from '@/components/SitePage';
import { pageData } from '@/lib/pageData';

export const metadata: Metadata = {
  title: 'Book a Free Demo — Morph AI',
  description:
    'Book a free Morph AI demo — a 30-minute call to explore try-on opportunities for your store. No pitch, no pressure.',
  robots: 'index, follow, max-image-preview:large',
  openGraph: {
    title: 'Book a Free Demo — Morph AI',
    description:
      'Book a free Morph AI demo — a 30-minute call to explore try-on opportunities for your store. No pitch, no pressure.',
    siteName: 'Morph AI',
    type: 'website',
  },
  icons: {
    icon: ['/images/fav-icon-150x150.png', '/images/fav-icon-300x298.png'],
    apple: ['/images/fav-icon-300x298.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#6904F2',
};

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <RootShell bodyClass={pageData.book.bodyClass}>{children}</RootShell>;
}
