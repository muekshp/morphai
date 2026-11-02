import { HeadResources } from '@/components/RootShell';
import { MORPH_BOOTSTRAP } from '@/lib/bootstrap';
import type { PageData } from '@/lib/types';

/**
 * Renders one original page inside the React tree.
 *
 * - <HeadResources /> — original stylesheets + inline styles (React 19
 *   hoists them into <head>, cascade order preserved).
 * - Bootstrap inline script — runs during parse; on DOMContentLoaded it
 *   materializes the page's inert script placeholders in order and then
 *   re-dispatches DOMContentLoaded (see lib/bootstrap.ts for the why).
 * - Content — the full original body markup through dangerouslySetInnerHTML
 *   on a wrapper div using `display: contents` (styles/morph.css), so the
 *   wrapper is layout-invisible. React adopts this subtree during
 *   hydration and never re-parses it, which keeps Morph's runtime DOM
 *   mutations (carousels, menus, accordions) intact.
 *
 * Internal navigation uses plain <a> tags (full page loads), mirroring the
 * static site, so every page boots its scripts fresh.
 */
export default function SitePage({ data }: { data: PageData }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: MORPH_BOOTSTRAP }} />
      <HeadResources items={data.head} />
      <div
        className="morph-root"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
    </>
  );
}
