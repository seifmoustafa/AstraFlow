'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface ComposerPackageOption {
  id: string;
  label: string;
  shortTag: string;
  stratumCode: string;
  sublabel: string;
  plateFill: string;
  plateStroke: string;
  plateText: string;
  innerStroke: string;
}

export const COMPOSER_OPTIONS: readonly ComposerPackageOption[] = [
  {
    id: 'AstraFlow.Mediator',
    label: 'Mediator',
    shortTag: 'MEDIATOR',
    stratumCode: '01 / DISPATCH',
    sublabel: 'requests + pipelines',
    plateFill: '#0c352d',
    plateStroke: '#0a3d33',
    plateText: '#f9f2e6',
    innerStroke: '#81aa95',
  },
  {
    id: 'AstraFlow.Mapper',
    label: 'Mapper',
    shortTag: 'MAPPER',
    stratumCode: '02 / MAPPING',
    sublabel: 'explicit mapping',
    plateFill: '#fff9ed',
    plateStroke: '#365d51',
    plateText: '#082c26',
    innerStroke: '#648778',
  },
  {
    id: 'AstraFlow.Diagnostics',
    label: 'Diagnostics',
    shortTag: 'DIAGNOSTICS',
    stratumCode: '03 / OBSERVE',
    sublabel: 'inspect registrations',
    plateFill: '#f5e6d7',
    plateStroke: '#c14a2b',
    plateText: '#082c26',
    innerStroke: '#e47b54',
  },
  {
    id: 'AstraFlow.Testing',
    label: 'Testing',
    shortTag: 'TESTING',
    stratumCode: '04 / VERIFY',
    sublabel: 'focused test support',
    plateFill: '#ece5d9',
    plateStroke: '#2f5b4e',
    plateText: '#082c26',
    innerStroke: '#62766b',
  },
  {
    id: 'AstraFlow.Generators',
    label: 'Generators',
    shortTag: 'GENERATORS',
    stratumCode: '05 / COMPILER',
    sublabel: 'opt-in generated code',
    plateFill: '#ffd2bd',
    plateStroke: '#b73921',
    plateText: '#082c26',
    innerStroke: '#db5837',
  },
];

const CANONICAL_ORDER = COMPOSER_OPTIONS.map((opt) => opt.id);

export function sortPackagesCanonically(pkgIds: readonly string[]): string[] {
  return [...pkgIds].sort(
    (a, b) => CANONICAL_ORDER.indexOf(a) - CANONICAL_ORDER.indexOf(b)
  );
}

export interface PackageStackContextValue {
  selectedPkgs: string[];
  focusedPkgId: string;
  hasInteracted: boolean;
  togglePackage: (pkgId: string) => void;
  focusPackage: (pkgId: string) => void;
  selectAndEnsurePackage: (pkgId: string) => void;
}

const PackageStackContext = createContext<PackageStackContextValue | null>(null);

export function PackageStackProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedPkgs, setSelectedPkgs] = useState<string[]>([
    'AstraFlow.Mediator',
  ]);
  const [focusedPkgId, setFocusedPkgId] = useState<string>(
    'AstraFlow.Mediator'
  );
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  const togglePackage = useCallback((pkgId: string) => {
    setHasInteracted(true);
    setSelectedPkgs((prev) => {
      const exists = prev.includes(pkgId);
      const next = exists
        ? prev.filter((item) => item !== pkgId)
        : sortPackagesCanonically([...prev, pkgId]);

      if (!exists) {
        setFocusedPkgId(pkgId);
      } else {
        setFocusedPkgId((currentFocus) => {
          if (currentFocus !== pkgId) return currentFocus;
          return next[next.length - 1] ?? pkgId;
        });
      }
      return next;
    });
  }, []);

  const focusPackage = useCallback((pkgId: string) => {
    setFocusedPkgId(pkgId);
  }, []);

  const selectAndEnsurePackage = useCallback((pkgId: string) => {
    setHasInteracted(true);
    setFocusedPkgId(pkgId);
    setSelectedPkgs((prev) => {
      if (prev.includes(pkgId)) return prev;
      return sortPackagesCanonically([...prev, pkgId]);
    });
  }, []);

  return (
    <PackageStackContext.Provider
      value={{
        selectedPkgs,
        focusedPkgId,
        hasInteracted,
        togglePackage,
        focusPackage,
        selectAndEnsurePackage,
      }}
    >
      {children}
    </PackageStackContext.Provider>
  );
}

export function usePackageStack(): PackageStackContextValue {
  const ctx = useContext(PackageStackContext);
  if (!ctx) {
    throw new Error(
      'usePackageStack must be used within a PackageStackProvider'
    );
  }
  return ctx;
}
