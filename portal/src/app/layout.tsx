import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "@/styles/tokens.css";
import "@/styles/vision.css";
import "@/styles/final.css";
import "@/styles/polish.css";
import "@/styles/craft-v12.css";
import "@/styles/layout.css";
import "@/styles/components.css";
import "@/styles/motion.css";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SkipLink } from "@/components/site/SkipLink";
import { ReducedMotionProvider } from "@/components/motion/ReducedMotionProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://astraflow.dev"),
  title: "AstraFlow — Control the flow.",
  description:
    "A focused family of .NET packages for explicit request dispatch, object mapping, diagnostics and testing. Compose only what your application needs.",
  icons: {
    icon: "/brand/mark.svg",
    shortcut: "/brand/mark.svg",
  },
  openGraph: {
    title: "AstraFlow — Control the flow.",
    description:
      "A focused family of .NET packages for explicit request dispatch, object mapping, diagnostics and testing. Compose only what your application needs.",
    url: "https://astraflow.dev",
    siteName: "AstraFlow",
    images: [
      {
        url: "/brand/mark-on-light.svg",
        width: 800,
        height: 600,
        alt: "AstraFlow — The .NET Flow Engine",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AstraFlow — Control the flow.",
    description:
      "A focused family of .NET packages for explicit request dispatch, object mapping, diagnostics and testing.",
    images: ["/brand/mark-on-light.svg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      data-theme="warm-forest"
      className={`${inter.variable} ${plexMono.variable}`}
    >
      <body>
        <SkipLink />
        <ReducedMotionProvider>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </ReducedMotionProvider>
      </body>
    </html>
  );
}
