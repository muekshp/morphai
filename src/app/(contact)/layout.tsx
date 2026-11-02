import type { Metadata, Viewport } from 'next';
import RootShell from '@/components/RootShell';
import SitePage from '@/components/SitePage';
import { pageData } from '@/lib/pageData';

export const metadata: Metadata = {
  title: 'Contact — Morph AI',
  description:
    'Talk to the Morph AI team about adding virtual try-on to your store. Phones, email and a short contact form.',
  robots: 'index, follow, max-image-preview:large',
  openGraph: {
    title: 'Contact — Morph AI',
    description:
      'Talk to the Morph AI team about adding virtual try-on to your store. Phones, email and a short contact form.',
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

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <RootShell bodyClass={pageData.contact.bodyClass}>{children}</RootShell>;
}
