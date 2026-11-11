'use client';

import React, { useState } from 'react';
import { LAYER_BLUEPRINTS, LayerBlueprint } from './architecture-data';
import { Shield, ArrowRight, Layers, Lock, Cpu, Database, Activity, CheckCircle, ChevronRight } from 'lucide-react';

export const FlowTraceBlueprints: React.FC = () => {
  const [selectedLayerId, setSelectedLayerId] = useState<string>('contracts');
  const [traceStep, setTraceStep] = useState<number>(0);

  const selectedLayer = LAYER_BLUEPRINTS.find(l => l.id === selectedLayerId) || LAYER_BLUEPRINTS[0];

  const traceSteps = [
    {
      title: '1. Inbound Request',
      detail: 'Minimal API endpoint invokes `IMediator.SendAsync(command, ct)`.',
      activeLayer: 'dispatch',
      color: '#72D5DE'
    },
    {
      title: '2. Behavior Pipeline',
      detail: 'Pre-processors validate input, acquire rate limits, and record OpenTelemetry trace.',
      activeLayer: 'observability',
      color: '#89CBA4'
    },
    {
      title: '3. Handler Execution',
      detail: 'Domain handler processes command, mutations orchestrated cleanly.',
      activeLayer: 'dispatch',
      color: '#F0C57C'
    },
    {
      title: '4. Executable Mapping',
      detail: 'AstraFlow.Mapper projects entities to DTOs via compiled expressions with zero reflection.',
      activeLayer: 'mapping',
      color: '#D9A477'
    },
    {
      title: '5. Security Gate & Telemetry',
      detail: 'AstraFlow.Security redacts PII & sensitive IDs before activity completion.',
      activeLayer: 'observability',
      color: '#F39A98'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Interactive Trace Stepper */}
      <div className="rounded-xl border border-[var(--af-border)] bg-[var(--af-bg-surface)] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[var(--af-accent)]" />
              <h3 className="text-base font-semibold text-[var(--af-text-primary)]">
                End-to-End Execution Trace Simulator
              </h3>
            </div>
            <p className="text-xs text-[var(--af-text-secondary)] mt-1">
              Step through a real AstraFlow request dispatch lifecycle to see how boundaries and security gates interact.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setTraceStep(prev => (prev > 0 ? prev - 1 : traceSteps.length - 1))}
              className="px-3 py-1.5 text-xs rounded-md border border-[var(--af-border)] hover:bg-[var(--af-surface-2)] text-[var(--af-text-secondary)] font-medium transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setTraceStep(prev => (prev < traceSteps.length - 1 ? prev + 1 : 0))}
              className="px-3 py-1.5 text-xs rounded-md bg-[var(--af-accent)] text-[var(--af-accent-on)] font-semibold hover:brightness-110 transition-all flex items-center gap-1.5"
            >
              <span>Next Step</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Step Indicator Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-6">
          {traceSteps.map((s, idx) => {
            const isActive = idx === traceStep;
            return (
              <button
                key={idx}
                onClick={() => setTraceStep(idx)}
                className={`p-3 rounded-lg text-left transition-all border ${
                  isActive
                    ? 'border-[var(--af-accent)] bg-[var(--af-accent)]/10 shadow-sm'
                    : 'border-[var(--af-border)]/50 bg-[var(--af-bg-canvas)]/50 hover:bg-[var(--af-surface-2)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-semibold ${isActive ? 'text-[var(--af-accent)]' : 'text-[var(--af-text-subtle)]'}`}>
                    0{idx + 1}
                  </span>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[var(--af-accent)]" />}
                </div>
                <div className={`text-xs font-medium mt-1 truncate ${isActive ? 'text-[var(--af-text-primary)] font-semibold' : 'text-[var(--af-text-secondary)]'}`}>
                  {s.title.split('. ')[1]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Current Step Callout Card */}
        <div className="rounded-lg border border-[var(--af-border)] bg-[var(--af-bg-canvas)] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: traceSteps[traceStep].color }} />
              <span className="text-xs font-mono font-bold text-[var(--af-text-primary)] uppercase tracking-wider">
                {traceSteps[traceStep].title}
              </span>
            </div>
            <p className="text-xs text-[var(--af-text-secondary)] pl-4">
              {traceSteps[traceStep].detail}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 border-t md:border-t-0 md:border-l border-[var(--af-border)] pt-2 md:pt-0 md:pl-4">
            <span className="text-[11px] text-[var(--af-text-subtle)]">Active Subsystem:</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[var(--af-surface-2)] text-[var(--af-accent)] border border-[var(--af-border)]">
              {traceSteps[traceStep].activeLayer}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Layer Blueprints */}
      <div className="rounded-xl border border-[var(--af-border)] bg-[var(--af-bg-surface)] p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[var(--af-accent)]" />
            <h3 className="text-base font-semibold text-[var(--af-text-primary)]">
              Architectural Layer Isolation Blueprints
            </h3>
          </div>
          <p className="text-xs text-[var(--af-text-secondary)] mt-1">
            AstraFlow enforces strict layer boundaries: core contracts never depend on implementations, and optional integrations remain completely decoupled.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Layer Nav */}
          <div className="lg:col-span-5 space-y-2">
            {LAYER_BLUEPRINTS.map((layer) => {
              const isSelected = layer.id === selectedLayerId;
              return (
                <button
                  key={layer.id}
                  onClick={() => setSelectedLayerId(layer.id)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-[var(--af-accent)] bg-[var(--af-accent)]/10 shadow-sm'
                      : 'border-[var(--af-border)]/60 bg-[var(--af-bg-canvas)]/40 hover:bg-[var(--af-surface-2)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-1 rounded-full shrink-0"
                      style={{ backgroundColor: layer.color }}
                    />
                    <div>
                      <div className={`text-xs font-semibold ${isSelected ? 'text-[var(--af-text-primary)]' : 'text-[var(--af-text-secondary)]'}`}>
                        {layer.name}
                      </div>
                      <div className="text-[11px] text-[var(--af-text-subtle)] truncate max-w-[200px]">
                        {layer.packages.join(', ')}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform ${isSelected ? 'text-[var(--af-accent)] translate-x-1' : 'text-[var(--af-text-subtle)]'}`} />
                </button>
              );
            })}
          </div>

          {/* Right Blueprint Inspector */}
          <div className="lg:col-span-7 rounded-xl border border-[var(--af-border)] bg-[var(--af-bg-canvas)] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--af-border)] mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: selectedLayer.color }}
                  />
                  <h4 className="text-sm font-semibold text-[var(--af-text-primary)]">
                    {selectedLayer.name}
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-[var(--af-accent)] bg-[var(--af-accent)]/10 px-2 py-0.5 rounded border border-[var(--af-accent)]/20">
                  {selectedLayer.packages.length} Package{selectedLayer.packages.length > 1 ? 's' : ''}
                </span>
              </div>

              <p className="text-xs text-[var(--af-text-secondary)] mb-4 leading-relaxed">
                {selectedLayer.description}
              </p>

              {/* Package Badges */}
              <div className="mb-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--af-text-subtle)] block mb-2">
                  Contained Packages
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedLayer.packages.map((pkg, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-[var(--af-surface-2)] text-xs font-mono font-medium text-[var(--af-text-primary)] border border-[var(--af-border)]"
                    >
                      {pkg}
                    </span>
                  ))}
                </div>
              </div>

              {/* Architectural Rules */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--af-text-subtle)] block mb-2">
                  Architectural Governance Rules
                </span>
                <ul className="space-y-2">
                  {selectedLayer.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[var(--af-text-secondary)]">
                      <CheckCircle className="h-3.5 w-3.5 text-[var(--af-success)] shrink-0 mt-0.5" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--af-border)] flex items-center justify-between text-[11px] text-[var(--af-text-subtle)]">
              <span>Boundary Enforcement: Roslyn AF-Rules + Archify Gate</span>
              <span className="font-mono text-[var(--af-success)]">VERIFIED COMPLIANT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
