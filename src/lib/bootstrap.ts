/**
 * Morph AI script bootstrap.
 *
 * The page's original scripts ship as inert placeholders
 * (<script data-morph-inert ...>) inside the injected markup — scripts
 * inserted via innerHTML never execute, so neither the parser nor React
 * hydration can run them (React 19 re-creates tree-rendered <script>
 * elements, which re-executes them and corrupts jQuery/runtime state;
 * this design makes that impossible).
 *
 * This bootstrap reproduces the static site's load semantics:
 *
 *  1. Freeze document.readyState as 'loading' so that libraries which
 *     load later still queue their setup on DOMContentLoaded instead of
 *     firing immediately out of order.
 *  2. On the REAL DOMContentLoaded (DOM fully parsed), materialize every
 *     placeholder into a fresh <script> element at the same DOM position,
 *     sequentially — src scripts awaited one by one, inline scripts run
 *     synchronously — preserving the original execution order exactly.
 *  3. Restore the native readyState, then dispatch a DOMContentLoaded
 *     event: jQuery's ready pipeline, the page-builder runtime init, VamTam's handlers
 *     and every other DCL listener now fire in their original order, just
 *     like the original static build.
 *
 * The double-run guard makes React's hydration re-creation of this very
 * script a harmless no-op.
 */
export const MORPH_BOOTSTRAP = `(function () {
  if (window.__morphBooted) return;
  window.__morphBooted = true;
  try {
    Object.defineProperty(document, 'readyState', {
      configurable: true,
      get: function () { return 'loading'; },
    });
  } catch (e) {}
  function run() {
    if (window.__morphRan) return;
    window.__morphRan = true;
    var placeholders = Array.prototype.slice.call(
      document.querySelectorAll('script[data-morph-inert]')
    );
    var i = 0;
    (function next() {
      if (i >= placeholders.length) return finish();
      var ph = placeholders[i++];
      var s = document.createElement('script');
      for (var j = 0; j < ph.attributes.length; j++) {
        var a = ph.attributes[j];
        if (a.name !== 'data-morph-inert') s.setAttribute(a.name, a.value);
      }
      var hasSrc = s.hasAttribute('src');
      if (!hasSrc) s.text = ph.textContent;
      ph.parentNode.insertBefore(s, ph);
      ph.parentNode.removeChild(ph);
      if (hasSrc) {
        s.onload = next;
        s.onerror = function () { next(); };
      } else {
        next();
      }
    })();
  }
  function finish() {
    try { delete document.readyState; } catch (e) {}
    document.dispatchEvent(new Event('DOMContentLoaded'));
  }
  document.addEventListener('DOMContentLoaded', run);
  window.addEventListener('load', function () { run(); });
})();`;
