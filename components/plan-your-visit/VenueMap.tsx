// Google's keyless "classic" embed format (`output=embed` on a plain
// maps.google.com query URL) -- distinct from the paid Maps Embed API,
// needs no API key, and works for a simple address query like this one.
export function VenueMap({ address, title }: { address: string; title: string }) {
  return (
    <iframe
      title={title}
      src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
      className="h-72 w-full rounded-2xl border border-[var(--color-border)]"
      style={{ border: 0 }}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
