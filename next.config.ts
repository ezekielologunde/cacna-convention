import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withSerwistInit from "@serwist/next";

const withNextIntl = createNextIntlPlugin();

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
});

const nextConfig: NextConfig = {
  images: {
    // Vercel's Image Optimization quota is exhausted on this plan, which turns every
    // next/image request into a 402. Serve raw files instead of failing to render.
    unoptimized: true,
  },
};

export default withSerwist(withNextIntl(nextConfig));
