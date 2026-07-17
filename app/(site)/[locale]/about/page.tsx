import { setRequestLocale } from "next-intl/server";
import { AboutTabs } from "@/components/about/AboutTabs";
import { leadership } from "@/lib/content/leadership";
import { committee } from "@/lib/content/committee";
import { history } from "@/lib/content/history";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AboutTabs leadership={leadership} committee={committee} history={history} />;
}
