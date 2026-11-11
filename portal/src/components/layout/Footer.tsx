"use client";

import React from "react";
import Link from "next/link";
import { AstraFlowLogo } from "@/components/brand/AstraFlowLogo";
import { usePortal } from "@/context/PortalContext";
import { Github, Package, ArrowUpRight } from "lucide-react";

export function Footer() {
  const { t } = usePortal();

  return (
    <footer className="w-full border-t border-[var(--af-border)] bg-[var(--af-bg-canvas)] py-12 px-4 sm:px-6 transition-af">
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand column */}
        <div className="md:col-span-2 space-y-4">
          <AstraFlowLogo size={32} showSubtitle={true} />
          <p className="text-sm text-[var(--af-text-secondary)] max-w-md leading-relaxed">
            {t.footer.tagline}
          </p>
          <div className="flex items-center gap-4 text-xs text-[var(--af-text-subtle)] font-mono">
            <span>{t.footer.licensedUnder}</span>
            <span>•</span>
            <span>MIT License</span>
            <span>•</span>
            <span className="text-[var(--af-copper)]">The Trace v0.2</span>
          </div>
        </div>

        {/* Ecosystem Links */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--af-text-subtle)] mb-3">
            Ecosystem
          </h4>
          <ul className="space-y-2 text-sm text-[var(--af-text-secondary)]">
            <li>
              <Link href="/docs/mediator" className="hover:text-[var(--af-accent)] transition-af">
                Mediator
              </Link>
            </li>
            <li>
              <Link href="/docs/mapper" className="hover:text-[var(--af-accent)] transition-af">
                Mapper & Projections
              </Link>
            </li>
            <li>
              <Link href="/docs/observability" className="hover:text-[var(--af-accent)] transition-af">
                Diagnostics & OpenTelemetry
              </Link>
            </li>
            <li>
              <Link href="/docs/testing" className="hover:text-[var(--af-accent)] transition-af">
                Testing Harness
              </Link>
            </li>
          </ul>
        </div>

        {/* Resources & Open Source */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-[var(--af-text-subtle)] mb-3">
            Resources
          </h4>
          <ul className="space-y-2 text-sm text-[var(--af-text-secondary)]">
            <li>
              <Link href="/architecture" className="hover:text-[var(--af-accent)] transition-af">
                Architecture Blueprint
              </Link>
            </li>
            <li>
              <Link href="/explore" className="hover:text-[var(--af-accent)] transition-af">
                Interactive Visual Hub
              </Link>
            </li>
            <li>
              <Link href="/changelog" className="hover:text-[var(--af-accent)] transition-af">
                Release Notes & Tags
              </Link>
            </li>
            <li>
              <a
                href="https://github.com/seifmoustafa/AstraFlow"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-[var(--af-accent)] transition-af"
              >
                GitHub Repository <ArrowUpRight className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto mt-8 pt-8 border-t border-[var(--af-border-subtle)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--af-text-subtle)]">
        <p>{t.footer.allRightsReserved}</p>
        <p className="mt-2 sm:mt-0 font-mono">{t.footer.builtForDotNet}</p>
      </div>
    </footer>
  );
}
