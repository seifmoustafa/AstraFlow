"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { UI_COPY } from "@/content/ui-copy";

export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const [openAtPath, setOpenAtPath] = useState<string | null>(null);
  const menuOpen = openAtPath === pathname;
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const updateProgress = () => {
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const percent = Math.max(0, Math.min(1, window.scrollY / max));
      document.documentElement.style.setProperty(
        "--v11-scroll",
        percent.toFixed(4),
      );
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
    <header className="site-header">
      <div className="site-wrap header-in">
        <Link href="/" className="brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/mark-on-light.svg"
            alt=""
            width={43}
            height={39}
          />
          <strong>{UI_COPY.brand.name}</strong>{' '}
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
        </nav>

        <Link className="small-btn" href={UI_COPY.header.ctaHref}>
          {UI_COPY.header.ctaLabel}
        </Link>
      </div>
    </header>
  );
}
