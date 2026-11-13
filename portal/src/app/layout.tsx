import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import { SiteFooter } from "@/components/shell/SiteFooter";
import { SiteHeader } from "@/components/shell/SiteHeader";
import { UI_COPY } from "@/content/ui-copy";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-config";
import "@/styles/globals.css";

export const viewport: Viewport = {
  themeColor: "#f7f3eb",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AstraFlow — Engineered Clarity for .NET",
    template: "%s — AstraFlow",
  },
  description: SITE_DESCRIPTION,
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg?v=3", type: "image/svg+xml" },
      { url: "/favicon-96x96.png?v=3", sizes: "96x96", type: "image/png" },
      { url: "/favicon.ico?v=3", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png?v=3", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/favicon.ico?v=3"],
  },
  appleWebApp: {
    title: "AstraFlow",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    title: "AstraFlow — Engineered Clarity for .NET",
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "AstraFlow — Engineered Clarity for .NET",
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" data-theme="warm-forest">
      <body>
        <SmoothScrollProvider>
          <a className="v11-skip" href="#main">
            {UI_COPY.brand.skipToMain}
          </a>
          <SiteHeader />
          {children}
          <SiteFooter />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
