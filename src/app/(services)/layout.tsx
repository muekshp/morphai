import type { Metadata, Viewport } from 'next';
import RootShell from '@/components/RootShell';
import SitePage from '@/components/SitePage';
import { pageData } from '@/lib/pageData';

export const metadata: Metadata = {
  title: 'Our Tech — Morph AI',
  description:
    'Morph AI technology: virtual try-on API, 64-variation engine, image pipeline, usage metering and e-commerce integrations.',
  robots: 'index, follow, max-image-preview:large',
  openGraph: {
    title: 'Our Tech — Morph AI',
    description:
      'Morph AI technology: virtual try-on API, 64-variation engine, image pipeline, usage metering and e-commerce integrations.',
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

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <RootShell bodyClass={pageData.services.bodyClass}>{children}</RootShell>;
}
