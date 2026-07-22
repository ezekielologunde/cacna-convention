// Deliberately a plain (non-async) component -- an async Server Component
// nested inside a list (rather than as a page's top-level section, like
// RegisterCta) breaks the client reconciler ("<QrCode> is an async Client
// Component"), confirmed by actually hitting that error in
// tests/app/account.test.tsx. The caller (an async Server Component itself)
// awaits lib/qr.ts's renderQrCodeSvg() up front and passes the plain string
// down instead.
export function QrCode({ svg, label }: { svg: string; label: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className="inline-block shrink-0 overflow-hidden rounded-xl border border-[var(--color-border)] bg-white p-1.5"
      // qrcode's own SVG output, not user input -- see lib/qr.ts.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
