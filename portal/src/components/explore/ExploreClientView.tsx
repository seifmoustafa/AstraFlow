'use client';

import React, { useState } from 'react';
import { KnowledgeGraph } from '@/components/explore/KnowledgeGraph';
import { GuidedTours } from '@/components/explore/GuidedTours';
import { GraphNode } from '@/components/explore/knowledge-graph-data';
import { Compass, Network, Sparkles, BookOpen } from 'lucide-react';

export const ExploreClientView: React.FC = () => {
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  return (
    <div className="space-y-12">
      {/* Section 1: AI-Guided Architecture Tours */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--af-border)] pb-3">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-[var(--af-accent)]" />
            <h2 className="text-xl font-bold text-[var(--af-text-primary)]">
              Interactive Guided Architecture Tours
            </h2>
          </div>
          <span className="text-xs font-mono text-[var(--af-text-subtle)]">
            Curated Deep Dives
          </span>
        </div>

        <GuidedTours
          onHighlightNodes={(nodeIds) => setHighlightedNodeIds(nodeIds)}
        />
      </section>

      {/* Section 2: Full Knowledge Graph & Path Finder */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--af-border)] pb-3">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-[var(--af-accent)]" />
            <h2 className="text-xl font-bold text-[var(--af-text-primary)]">
              Interactive 16-Package AST & Dependency Graph
            </h2>
          </div>
          <span className="text-xs font-mono text-[var(--af-text-subtle)]">
            Modeled after Understand Anything
          </span>
        </div>

        <KnowledgeGraph
          highlightedNodeIds={highlightedNodeIds}
          onSelectNode={(node) => setSelectedNode(node)}
        />
      </section>
    </div>
  );
};
