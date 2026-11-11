'use client';

import React, { useState } from 'react';
import { ARCHIFY_ARTIFACTS, ArchifyArtifact } from './architecture-data';
import { ExternalLink, CheckCircle2, ShieldCheck, FileCode2, Maximize2, RefreshCw } from 'lucide-react';
import { usePortal } from '@/context/PortalContext';

export const ArchifyViewer: React.FC = () => {
  const { locale } = usePortal();
  const [selectedId, setSelectedId] = useState<string>(ARCHIFY_ARTIFACTS[0].id);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [iframeKey, setIframeKey] = useState<number>(0);

  const currentArtifact = ARCHIFY_ARTIFACTS.find(a => a.id === selectedId) || ARCHIFY_ARTIFACTS[0];

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="w-full rounded-xl border border-[var(--af-border)] bg-[var(--af-bg-surface)] overflow-hidden shadow-2xl">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[var(--af-border)] px-4 py-3 bg-[var(--af-bg-canvas)]/60 backdrop-blur-sm gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--af-accent)]" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--af-accent)]">
              Archify SSOT Engine
            </span>
          </div>
          <span className="text-xs text-[var(--af-text-subtle)]">|</span>
          <span className="text-xs font-mono text-[var(--af-text-secondary)]">
            Receipt SHA: <code className="text-[var(--af-accent)]">{currentArtifact.sha256}</code>
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            title="Reload artifact"
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] hover:bg-[var(--af-surface-2)] transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reload</span>
          </button>

          <a
            href={`/archify/${currentArtifact.filename}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] hover:bg-[var(--af-surface-2)] transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Open Standalone</span>
          </a>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1.5 rounded-md bg-[var(--af-accent)] text-[var(--af-accent-on)] font-semibold px-3 py-1 text-xs hover:brightness-110 transition-all"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Artifact Selector Tabs */}
      <div className="flex border-b border-[var(--af-border)] bg-[var(--af-bg-surface)] px-4 py-2 gap-2 overflow-x-auto scrollbar-none">
        {ARCHIFY_ARTIFACTS.map((artifact) => {
          const isSelected = artifact.id === selectedId;
          return (
            <button
              key={artifact.id}
              onClick={() => setSelectedId(artifact.id)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                isSelected
                  ? 'bg-[var(--af-accent)]/10 text-[var(--af-accent)] border border-[var(--af-accent)]/30 font-semibold shadow-sm'
                  : 'text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] hover:bg-[var(--af-surface-2)] border border-transparent'
              }`}
            >
              <FileCode2 className="h-3.5 w-3.5" />
              <span>{artifact.title}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                isSelected ? 'bg-[var(--af-accent)] text-[var(--af-accent-on)]' : 'bg-[var(--af-surface-3)] text-[var(--af-text-subtle)]'
              }`}>
                {artifact.type}
              </span>
            </button>
          );
        })}
      </div>

      {/* Artifact Summary and Verification Meta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border-b border-[var(--af-border)] bg-[var(--af-bg-surface)]/80 text-xs">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-[var(--af-text-primary)]">{currentArtifact.title}</span>
            <span className="rounded bg-[var(--af-accent)]/15 px-2 py-0.5 text-[10px] font-mono text-[var(--af-accent)] font-medium">
              {currentArtifact.badge}
            </span>
          </div>
          <p className="text-[var(--af-text-secondary)] leading-relaxed">
            {currentArtifact.description}
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {currentArtifact.highlights.map((h, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 rounded bg-[var(--af-surface-2)] px-2 py-0.5 text-[11px] text-[var(--af-text-secondary)] border border-[var(--af-border)]/50">
                <CheckCircle2 className="h-3 w-3 text-[var(--af-success)] shrink-0" />
                {h}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--af-border)] bg-[var(--af-bg-canvas)] p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[var(--af-success)] font-medium mb-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>Verified Archify Quality Gate</span>
            </div>
            <p className="text-[11px] text-[var(--af-text-secondary)] font-mono">
              {currentArtifact.verifiedGate}
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-[var(--af-border)] text-[10px] text-[var(--af-text-subtle)] font-mono flex items-center justify-between">
            <span>Stand-alone HTML size:</span>
            <span className="text-[var(--af-text-secondary)] font-semibold">Self-Contained (~840KB)</span>
          </div>
        </div>
      </div>

      {/* Embedded Iframe Container */}
      <div className={`relative bg-neutral-950 transition-all ${isFullscreen ? 'fixed inset-4 z-50 rounded-2xl shadow-2xl border-2 border-[var(--af-accent)] flex flex-col' : 'h-[640px]'}`}>
        {isFullscreen && (
          <div className="flex items-center justify-between bg-[var(--af-bg-surface)] px-4 py-2 border-b border-[var(--af-border)]">
            <span className="text-xs font-semibold text-[var(--af-text-primary)]">
              Fullscreen Preview: {currentArtifact.title}
            </span>
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-2.5 py-1 text-xs rounded bg-[var(--af-accent)] text-[var(--af-accent-on)] font-semibold"
            >
              Exit Fullscreen
            </button>
          </div>
        )}
        <iframe
          key={iframeKey}
          src={`/archify/${currentArtifact.filename}`}
          title={currentArtifact.title}
          className="w-full h-full border-0 bg-transparent flex-1"
          loading="lazy"
        />
      </div>
    </div>
  );
};
