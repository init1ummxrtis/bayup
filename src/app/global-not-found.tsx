import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Page not found | WAlosses",
  description: "The page you're looking for doesn't exist.",
};

/**
 * Catches URLs that don't even resolve to a valid `[locale]` segment (the
 * root layout is dynamic, so a plain root not-found.tsx can't compose a
 * shell here — see the Next.js docs on global-not-found.js). This bypasses
 * the app's normal rendering entirely, so it's kept static and locale-free
 * on purpose — we can't know which locale the visitor wanted.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body
        className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center text-text"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        <span className="text-xl font-extrabold tracking-tight">
          <span className="text-primary">WA</span>losses
        </span>
        <h1 className="mt-6 text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-text-muted">The page you&apos;re looking for doesn&apos;t exist.</p>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- this page intentionally bypasses the app shell/router (see file docblock), so next/link's router context isn't available here */}
        <a
          href="/"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Back to home
        </a>
      </body>
    </html>
  );
}
