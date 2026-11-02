import type { ReactNode } from 'react';
import type { HeadElement } from '@/lib/types';
import '@/styles/morph.css';

/**
 * Root document shell (one per page via route-group root layouts, so each
 * page keeps its original <body> class — Morph page CSS relies on it).
 *
 * Head resources (stylesheets + inline styles, in original cascade order)
 * are rendered inside <body>; React 19 hoists them into <head> preserving
 * order within the shared precedence, which keeps the CSS cascade identical
 * to the static site.
 */

export default function RootShell({
  bodyClass,
  children,
}: {
  bodyClass: string;
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={bodyClass} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

export function HeadResources({ items }: { items: HeadElement[] }) {
  return (
    <>
      {items.map((el, i) => {
        if (el.k === 'style') {
          return (
            <style
              key={el.id || `s-${i}`}
              href={`morph-style-${el.id || i}`}
              precedence="morph"
              dangerouslySetInnerHTML={{ __html: el.css }}
            />
          );
        }
        if (el.k === 'css') {
          return (
            <link key={el.href} rel="stylesheet" href={el.href} precedence="morph" />
          );
        }
        return (
          <link key={el.href} rel="preload" href={el.href} as={el.as || 'image'} />
        );
      })}
    </>
  );
}
