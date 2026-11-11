'use client';

import React, { useState } from 'react';
import { ARCHITECTURE_TOURS, ArchitectureTour } from './knowledge-graph-data';
import { Compass, ArrowRight, ArrowLeft, CheckCircle2, Code2, BookOpen, Layers } from 'lucide-react';

interface GuidedToursProps {
  onHighlightNodes?: (nodeIds: string[]) => void;
}

export const GuidedTours: React.FC<GuidedToursProps> = ({ onHighlightNodes }) => {
  const [selectedTourId, setSelectedTourId] = useState<string>(ARCHITECTURE_TOURS[0].id);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const currentTour = ARCHITECTURE_TOURS.find(t => t.id === selectedTourId) || ARCHITECTURE_TOURS[0];
  const currentStep = currentTour.steps[currentStepIndex] || currentTour.steps[0];

  const handleSelectTour = (tour: ArchitectureTour) => {
    setSelectedTourId(tour.id);
    setCurrentStepIndex(0);
    if (onHighlightNodes) {
      onHighlightNodes(tour.steps[0].targetNodeIds);
    }
  };

  const handleNextStep = () => {
    if (currentStepIndex < currentTour.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      if (onHighlightNodes) {
        onHighlightNodes(currentTour.steps[nextIdx].targetNodeIds);
      }
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      if (onHighlightNodes) {
        onHighlightNodes(currentTour.steps[prevIdx].targetNodeIds);
      }
    }
  };

  return (
    <div className="rounded-xl border border-[var(--af-border)] bg-[var(--af-bg-surface)] overflow-hidden shadow-2xl">
      {/* Tour Selection Header */}
      <div className="border-b border-[var(--af-border)] p-5 bg-[var(--af-bg-canvas)]/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-[var(--af-accent)]" />
              <h3 className="text-base sm:text-lg font-bold text-[var(--af-text-primary)]">
                AI-Guided Architecture Tours
              </h3>
            </div>
            <p className="text-xs text-[var(--af-text-secondary)] mt-1">
              Interactive step-by-step walkthroughs highlighting real architectural patterns, package interactions, and source code.
            </p>
          </div>
          <span className="text-xs font-mono text-[var(--af-text-subtle)] shrink-0 self-start sm:self-auto">
            4 Interactive Tours Available
          </span>
        </div>

        {/* Tour Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ARCHITECTURE_TOURS.map((tour) => {
            const isSelected = tour.id === selectedTourId;
            return (
              <button
                key={tour.id}
                onClick={() => handleSelectTour(tour)}
                className={`p-3.5 rounded-lg text-left transition-all border flex flex-col justify-between ${
                  isSelected
                    ? 'border-[var(--af-accent)] bg-[var(--af-accent)]/10 shadow-sm'
                    : 'border-[var(--af-border)]/60 bg-[var(--af-bg-surface)] hover:bg-[var(--af-surface-2)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[var(--af-surface-2)] text-[var(--af-accent)] border border-[var(--af-border)]">
                      {tour.badge}
                    </span>
                    {isSelected && <span className="h-2 w-2 rounded-full bg-[var(--af-accent)]" />}
                  </div>
                  <h4 className={`text-xs font-bold leading-snug ${isSelected ? 'text-[var(--af-text-primary)]' : 'text-[var(--af-text-secondary)]'}`}>
                    {tour.title}
                  </h4>
                </div>
                <div className="mt-2 text-[11px] text-[var(--af-text-subtle)] truncate">
                  {tour.steps.length} Guided Steps
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tour Step Body */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Explanation Column */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          <div>
            {/* Step Navigation Pill */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--af-border)] mb-4">
              <span className="text-xs font-mono text-[var(--af-accent)] font-semibold uppercase tracking-wider">
                Step {currentStep.step} of {currentTour.steps.length}: {currentStep.subtitle}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                  className="p-1 rounded border border-[var(--af-border)] text-[var(--af-text-secondary)] hover:bg-[var(--af-surface-2)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={currentStepIndex === currentTour.steps.length - 1}
                  className="p-1 rounded bg-[var(--af-accent)] text-[var(--af-accent-on)] font-semibold hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold text-[var(--af-text-primary)]">
              {currentStep.title}
            </h3>

            <p className="text-sm text-[var(--af-text-secondary)] mt-2 leading-relaxed">
              {currentStep.description}
            </p>

            {/* Target Graph Node Tags */}
            <div className="mt-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--af-text-subtle)] block mb-1.5">
                Target Architectural Components
              </span>
              <div className="flex flex-wrap gap-2">
                {currentStep.targetNodeIds.map((nodeId, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-[var(--af-surface-2)] text-xs font-mono font-medium text-[var(--af-accent)] border border-[var(--af-border)]"
                  >
                    {nodeId}
                  </span>
                ))}
              </div>
            </div>

            {/* Architectural Highlights */}
            <div className="mt-5 space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--af-text-subtle)] block">
                Engineering Guarantees
              </span>
              {currentStep.highlights.map((h, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-[var(--af-text-secondary)]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--af-success)] shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--af-border)] flex items-center justify-between text-xs text-[var(--af-text-subtle)]">
            <span>Focus: Real C# Code & Invariants</span>
            <span className="font-mono text-[var(--af-accent)]">Step {currentStep.step} / {currentTour.steps.length}</span>
          </div>
        </div>

        {/* Right Code Excerpt Column */}
        <div className="lg:col-span-6 rounded-xl border border-[var(--af-border)] bg-[var(--af-bg-canvas)] overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--af-border)] bg-[var(--af-bg-surface)]">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-[var(--af-accent)]" />
              <span className="text-xs font-mono font-medium text-[var(--af-text-primary)]">
                Real C# Source Excerpt
              </span>
            </div>
            <span className="text-[11px] font-mono text-[var(--af-text-subtle)]">
              AstraFlow / src /
            </span>
          </div>

          <div className="p-4 overflow-x-auto flex-1 font-mono text-xs leading-relaxed text-[var(--af-text-primary)] bg-neutral-950">
            <pre>
              <code>{currentStep.csharpExcerpt}</code>
            </pre>
          </div>

          <div className="px-4 py-2 border-t border-[var(--af-border)] bg-[var(--af-bg-surface)]/60 text-[11px] text-[var(--af-text-subtle)] flex items-center justify-between">
            <span>Verified in AstraFlow Solution Suite</span>
            <span className="text-[var(--af-success)] font-medium">✓ Compiles Cleanly</span>
          </div>
        </div>
      </div>
    </div>
  );
};
