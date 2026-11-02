/**
 * Morph AI — page data types.
 *
 * The original VamTam page-builder markup is preserved byte-for-byte and
 * rendered from generated JSON (scripts/extract_nextjs.py), so the site
 * keeps its exact look while running on Next.js + TypeScript.
 */

/** Ordered <head> resource: inline <style> block, stylesheet or preload link. */
export type HeadElement =
  | { k: 'style'; id?: string; css: string }
  | { k: 'css'; href: string }
  | { k: 'preload'; href: string; as?: string };

/** Full page payload extracted from the original static HTML. */
export interface PageData {
  /** Original <body> class list (Morph page CSS targets it). */
  bodyClass: string;
  /** Ordered head resources (styles + preloads) in original cascade order. */
  head: HeadElement[];
  /**
   * Full body markup with scripts replaced by inert placeholders
   * (<script data-morph-inert ...>); the bootstrap in lib/bootstrap.ts
   * materializes them in order after DOMContentLoaded.
   */
  content: string;
}

export type PageKey = 'home' | 'services' | 'about' | 'contact' | 'book';
