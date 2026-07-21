import { permanentRedirect } from "next/navigation";

// The registration flow now lives at the site's homepage (/), per the site
// owner's call that Register is the site's single most important
// destination -- it belongs at the front door, not one click in. This route
// only exists so old links/bookmarks to /register still land somewhere
// real. /register/confirmation is a separate route, untouched by this.
export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  permanentRedirect(`/${locale}`);
}
