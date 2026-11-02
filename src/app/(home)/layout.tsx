import type { Metadata, Viewport } from 'next';
import RootShell from '@/components/RootShell';
import SitePage from '@/components/SitePage';
import { pageData } from '@/lib/pageData';

export const metadata: Metadata = {
  title: 'Morph AI — Virtual Try-On API for Fashion E-commerce',
  description:
    'Morph AI is a usage-based virtual try-on API for fashion e-commerce. One API, realistic previews, pay per generated image.',
  robots: 'index, follow, max-image-preview:large',
  openGraph: {
    title: 'Morph AI — Virtual Try-On API for Fashion E-commerce',
    description:
      'Morph AI is a usage-based virtual try-on API for fashion e-commerce. One API, realistic previews, pay per generated image.',
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

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootShell bodyClass={pageData.home.bodyClass}>{children}</RootShell>
  );
}
