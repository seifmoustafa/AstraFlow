import React from 'react';
import type { Metadata } from 'next';
import { PackageStackProvider } from '@/components/packages/PackageStackContext';
import { PackagesHeroAssembly } from '@/components/packages/PackagesHeroAssembly';
import { PackageComposer } from '@/components/packages/PackageComposer';
import { PackageInventory } from '@/components/packages/PackageInventory';

export const metadata: Metadata = {
  title: 'Packages — AstraFlow',
  description:
    'Discover AstraFlow .NET packages and assemble an install plan for the capabilities you need.',
};

export default function PackagesPage() {
  return (
    <PackageStackProvider>
      <section className="hero">
        <div className="site-wrap page-intro grid">
          <div>
            <p className="eyebrow">A DIFFERENT WAY TO COMPOSE</p>
            <h1>
              Take the parts.
              <span className="ital">Keep the control.</span>
            </h1>
            <p className="lead">
              A family of focused .NET packages. Choose a capability, see what
              it adds, and generate an install plan without adopting a platform.
            </p>
            <div className="links">
              <a className="button button-primary" href="#composer">
                Build your stack
                <span aria-hidden="true" className="arrow">
                  ↗
                </span>
              </a>
              <a className="button button-outline" href="#directory">
                Browse packages
                <span aria-hidden="true" className="arrow">
                  ↗
                </span>
              </a>
            </div>
          </div>
          <PackagesHeroAssembly />
        </div>
      </section>
      <PackageComposer />
      <PackageInventory />
    </PackageStackProvider>
  );
}
