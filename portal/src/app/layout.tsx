import type { Metadata } from "next";
import { Instrument_Sans, IBM_Plex_Mono, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { PortalProvider } from "@/context/PortalContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SearchModal } from "@/components/layout/SearchModal";

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

const plexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-plex-arabic",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://astraflow.dev"),
  title: "AstraFlow — Engineered Clarity for .NET",
  description:
    "AstraFlow makes application flow explicit, predictable, and inspectable. High-performance mediator, projections, structured diagnostics, and testing harnesses for .NET.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/logo-mark-color.svg",
  },
  openGraph: {
    title: "AstraFlow — Engineered Clarity for .NET",
    description:
      "AstraFlow makes application flow explicit, predictable, and inspectable. Modular mediator, projections, structured diagnostics, and testing harnesses for .NET.",
    url: "https://astraflow.dev",
    siteName: "AstraFlow",
    images: [
      {
        url: "/images/brand/astraflow-social-preview.jpg",
        width: 1200,
        height: 630,
        alt: "AstraFlow — Engineered Clarity for .NET",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AstraFlow — Engineered Clarity for .NET",
    description:
      "AstraFlow makes application flow explicit, predictable, and inspectable. Modular mediator, projections, structured diagnostics, and testing harnesses for .NET.",
    images: ["/images/brand/astraflow-social-preview.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" dir="ltr" suppressHydrationWarning>
      <body
        className={`${instrumentSans.variable} ${plexMono.variable} ${plexSansArabic.variable} antialiased selection:bg-[var(--af-accent)] selection:text-[var(--af-accent-on)]`}
      >
        <PortalProvider>
          <div className="min-h-screen flex flex-col justify-between">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <SearchModal />
          </div>
        </PortalProvider>
      </body>
    </html>
  );
}
