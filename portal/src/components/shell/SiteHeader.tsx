"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GlobalScrollChoreographer } from "@/components/motion/ScrollReveal";
import { UI_COPY } from "@/content/ui-copy";
import { GITHUB_URL } from "@/lib/site-config";

function GitHubMarkSvg({ size = 20 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 1.27a11 11 0 0 0-3.48 21.46c.55.1.73-.24.73-.53v-1.85c-3.03.66-3.67-1.45-3.67-1.45-.5-1.26-1.21-1.6-1.21-1.6-.99-.68.07-.67.07-.67 1.09.08 1.67 1.12 1.67 1.12.97 1.66 2.54 1.18 3.16.9.1-.7.38-1.18.69-1.45-2.42-.27-4.96-1.21-4.96-5.4 0-1.19.42-2.16 1.12-2.92-.11-.28-.49-1.39.11-2.89 0 0 .92-.29 3 1.12a10.4 10.4 0 0 1 5.46 0c2.08-1.41 3-1.12 3-1.12.6 1.5.22 2.61.11 2.89.7.76 1.12 1.73 1.12 2.92 0 4.2-2.54 5.12-4.97 5.39.39.34.74 1 .74 2.02v2.99c0 .29.18.64.74.53A11 11 0 0 0 12 1.27Z" />
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [openAtPath, setOpenAtPath] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuOpen = openAtPath === pathname;
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updateProgress = () => {
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const scrollY = window.scrollY;
      const percent = Math.max(0, Math.min(1, scrollY / max));
      document.documentElement.style.setProperty(
        "--v11-scroll",
        percent.toFixed(4),
      );
      setIsScrolled(scrollY > 12);
    };

    let pending = false;
    const onScroll = () => {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(() => {
        updateProgress();
        pending = false;
      });
    };

    const rafId = window.requestAnimationFrame(updateProgress);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateProgress);
    };
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenAtPath(null);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <>
      <GlobalScrollChoreographer />
      <header className={isScrolled ? "site-header scrolled" : "site-header"}>
        <div className="site-wrap header-in">
          <Link href="/" className="brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/mark-on-light.svg"
              alt=""
              width={43}
              height={39}
            />
            <strong>{UI_COPY.brand.name}</strong>{" "}
            <small className="mono">{UI_COPY.brand.tagline}</small>
          </Link>

          <button
            ref={menuButtonRef}
            type="button"
            className="mobile-menu"
            aria-controls="main-menu"
            aria-expanded={menuOpen}
            aria-label={
              menuOpen
                ? UI_COPY.header.mobileMenuAriaLabelOpen
                : UI_COPY.header.mobileMenuAriaLabelClosed
            }
            onClick={() =>
              setOpenAtPath((prev) => (prev === pathname ? null : pathname))
            }
          >
            {UI_COPY.header.mobileMenuLabel}
          </button>

          <nav
            id="main-menu"
            aria-label={UI_COPY.header.navAriaLabel}
            className={menuOpen ? "nav open" : "nav"}
          >
            {UI_COPY.header.navItems.map((item) => {
              const isCurrent =
                item.href === "/"
                  ? pathname === "/"
                  : pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isCurrent ? "page" : undefined}
                  onClick={() => setOpenAtPath(null)}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="nav-mobile-extras">
              <a
                className="nav-mobile-gh"
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={UI_COPY.header.githubAriaLabel}
                onClick={() => setOpenAtPath(null)}
              >
                <GitHubMarkSvg size={18} />
                <span>{UI_COPY.header.githubDrawerLabel}</span>
              </a>
              <Link
                className="small-btn nav-mobile-cta"
                href={UI_COPY.header.ctaHref}
                onClick={() => setOpenAtPath(null)}
              >
                {UI_COPY.header.ctaLabel}
              </Link>
            </div>
          </nav>

          <div className="header-actions">
            <a
              className="header-gh-link"
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={UI_COPY.header.githubAriaLabel}
              title={UI_COPY.header.githubTitle}
            >
              <GitHubMarkSvg size={19} />
            </a>
            <Link className="small-btn" href={UI_COPY.header.ctaHref}>
              {UI_COPY.header.ctaLabel}
            </Link>
          </div>
        </div>
        <div className="site-header-progress" aria-hidden="true" />
      </header>
    </>
  );
}
