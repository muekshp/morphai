import type { Metadata, Viewport } from 'next';
import RootShell from '@/components/RootShell';
import SitePage from '@/components/SitePage';
import { pageData } from '@/lib/pageData';

export const metadata: Metadata = {
  title: 'About — Morph AI',
  description:
    'Morph AI builds virtual try-on infrastructure for fashion e-commerce stores. Meet the team, our mission, and values.',
  robots: 'index, follow, max-image-preview:large',
  openGraph: {
    title: 'About — Morph AI',
    description:
      'Morph AI builds virtual try-on infrastructure for fashion e-commerce stores. Meet the team, our mission, and values.',
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

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <RootShell bodyClass={pageData.about.bodyClass}>{children}</RootShell>;
}
