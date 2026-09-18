import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  experimental: {
    // The root layout is a dynamic `[locale]` segment, so a plain root
    // not-found.tsx can't compose a consistent 404 shell — this is exactly
    // the documented use case for global-not-found.tsx (see src/app/global-not-found.tsx).
    globalNotFound: true,
  },
};

export default withNextIntl(nextConfig);
