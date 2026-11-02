import home from '@/data/pages/home.json';
import services from '@/data/pages/services.json';
import about from '@/data/pages/about.json';
import contact from '@/data/pages/contact.json';
import book from '@/data/pages/book.json';
import type { PageData, PageKey } from '@/lib/types';

/**
 * Page payloads extracted from the original static build.
 * Rendered by <SitePage /> — markup is untouched, only tech changed.
 */
export const pageData: Record<PageKey, PageData> = {
  home: home as unknown as PageData,
  services: services as unknown as PageData,
  about: about as unknown as PageData,
  contact: contact as unknown as PageData,
  book: book as unknown as PageData,
};
