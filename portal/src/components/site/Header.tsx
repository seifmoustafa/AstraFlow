"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/packages", label: "Packages" },
    { href: "/docs", label: "Docs" },
    { href: "/guides", label: "Guides" },
    { href: "/changelog", label: "Changelog" },
    { href: "/community", label: "Community" },
  ];

  return (
    <header className="site-header">
      <div className="site-wrap header-in">
        <Link href="/" className="brand" aria-label="AstraFlow home">
          <img src="/brand/mark-on-light.svg" alt="" width={43} height={39} />
          <strong>AstraFlow</strong>
          <small className="mono">ENGINEERED CLARITY</small>
        </Link>

        <button
          ref={menuBtnRef}
          type="button"
          className="mobile-menu"
          aria-controls="main-menu"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          {mobileMenuOpen ? "Close ✕" : "Menu ☰"}
        </button>

        <nav
          id="main-menu"
          aria-label="Primary"
          className={`nav ${mobileMenuOpen ? "open" : ""}`}
        >
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={isActive ? "active" : ""}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/docs" className="small-btn">
          Get started ↗
        </Link>
      </div>
    </header>
  );
}
