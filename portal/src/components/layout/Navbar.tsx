"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePortal } from "@/context/PortalContext";
import { AstraFlowLogo } from "@/components/brand/AstraFlowLogo";
import {
  Sun,
  Moon,
  Languages,
  Search,
  Github,
  Package,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";

export function Navbar() {
  const { theme, toggleTheme, locale, toggleLocale, t, setIsSearchOpen } = usePortal();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t.nav.overview },
    { href: "/docs", label: t.nav.docs },
    { href: "/architecture", label: t.nav.architecture },
    { href: "/explore", label: t.nav.knowledge },
    { href: "/changelog", label: t.nav.changelog },
    { href: "/community", label: t.nav.community },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--af-border)] bg-[var(--af-bg-canvas)]/85 backdrop-blur-md transition-af">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2 group focus:outline-none">
          <AstraFlowLogo size={28} showSubtitle={true} />
        </Link>

        {/* Desktop 6-Pillar Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-[var(--af-radius-control)] text-sm font-medium transition-af ${
                  isActive
                    ? "bg-[var(--af-bg-surface)] text-[var(--af-accent)] shadow-xs border border-[var(--af-border)]"
                    : "text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] hover:bg-[var(--af-bg-surface)]/50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side controls: Search, Theme, Locale, External Links */}
        <div className="flex items-center gap-2">
          {/* Quick Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-[var(--af-text-subtle)] bg-[var(--af-bg-surface)] border border-[var(--af-border)] rounded-[var(--af-radius-control)] hover:border-[var(--af-accent)] hover:text-[var(--af-text-primary)] transition-af"
            aria-label="Search"
          >
            <Search className="w-3.5 h-3.5 text-[var(--af-accent)]" />
            <span className="hidden sm:inline font-mono">Search</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-[var(--af-bg-canvas)] border border-[var(--af-border)] rounded text-[var(--af-text-subtle)]">
              ⌘K
            </kbd>
          </button>

          {/* Language Switcher */}
          <button
            onClick={toggleLocale}
            className="p-2 rounded-[var(--af-radius-control)] text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] hover:bg-[var(--af-bg-surface)] border border-transparent hover:border-[var(--af-border)] transition-af"
            title={t.nav.langToggle}
            aria-label="Toggle language"
          >
            <span className="text-xs font-mono font-semibold px-0.5">
              {locale === "en" ? "عربي" : "EN"}
            </span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-[var(--af-radius-control)] text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] hover:bg-[var(--af-bg-surface)] border border-transparent hover:border-[var(--af-border)] transition-af"
            title={t.nav.themeToggle}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-[var(--af-warning)]" />
            ) : (
              <Moon className="w-4 h-4 text-[var(--af-accent)]" />
            )}
          </button>

          {/* GitHub Link */}
          <a
            href="https://github.com/seifmoustafa/AstraFlow"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex p-2 rounded-[var(--af-radius-control)] text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] hover:bg-[var(--af-bg-surface)] border border-transparent hover:border-[var(--af-border)] transition-af"
            aria-label="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>

          {/* NuGet Link */}
          <a
            href="https://www.nuget.org/packages?q=AstraFlow"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex p-2 rounded-[var(--af-radius-control)] text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] hover:bg-[var(--af-bg-surface)] border border-transparent hover:border-[var(--af-border)] transition-af"
            aria-label="NuGet Packages"
          >
            <Package className="w-4 h-4" />
          </a>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-[var(--af-radius-control)] text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] hover:bg-[var(--af-bg-surface)] border border-[var(--af-border)]"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[var(--af-border)] bg-[var(--af-bg-surface)] px-4 py-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-[var(--af-radius-control)] text-sm font-medium text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] hover:bg-[var(--af-bg-canvas)]"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-[var(--af-border)] flex items-center gap-4">
            <a
              href="https://github.com/seifmoustafa/AstraFlow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-[var(--af-text-secondary)]"
            >
              <Github className="w-4 h-4" /> GitHub
            </a>
            <a
              href="https://www.nuget.org/packages?q=AstraFlow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-[var(--af-text-secondary)]"
            >
              <Package className="w-4 h-4" /> NuGet
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
