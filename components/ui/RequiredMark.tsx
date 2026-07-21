/**
 * Visible required-field indicator for form labels. Every required input
 * on the site previously relied solely on the native `required` HTML
 * attribute, which gives no visual or screen-reader signal until a user
 * actually submits and hits browser validation.
 *
 * The asterisk is a CSS `::after` pseudo-element, not real DOM text --
 * `aria-hidden` alone still leaves a text node that `textContent`-based
 * label matching (e.g. testing-library's `getByLabelText`, and some
 * screen-reader label-name computations) picks up regardless, turning
 * "Full name" into "Full name *". An empty, pseudo-element-only span has
 * no text content for any of that to see, while still painting visibly.
 */
export function RequiredMark() {
  return (
    <span aria-hidden="true" className="ml-0.5 text-[var(--color-red-text)] after:content-['*']" />
  );
}
