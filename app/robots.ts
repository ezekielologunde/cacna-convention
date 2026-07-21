import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// AI assistants and answer-engines we explicitly welcome — being listed by
// name improves "AI reach" (citations in ChatGPT, Claude, Perplexity, Google
// AI, etc.) and future-proofs us if the wildcard group is ever tightened.
// Same list used on the sibling cacnorthamerica.com site.
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "Bytespider",
  "CCBot",
  "cohere-ai",
  "DuckAssistBot",
  "Meta-ExternalAgent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin", "/admin/",
          "/account", "/account/",
          "/register/confirmation",
          "/api/",
        ],
      },
      { userAgent: AI_BOTS, allow: "/" },
      { userAgent: ["AdsBot-Google", "AdsBot-Google-Mobile"], allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
