'use client';

import React, { useState, useMemo } from 'react';
import { GRAPH_NODES, GRAPH_EDGES, GraphNode, GraphEdge } from './knowledge-graph-data';
import { Search, Route, Info, Layers, ExternalLink, Check, Copy } from 'lucide-react';

interface KnowledgeGraphProps {
  highlightedNodeIds?: string[];
  onSelectNode?: (node: GraphNode | null) => void;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({
  highlightedNodeIds = [],
  onSelectNode
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('AstraFlow.Mediator');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLayerFilter, setSelectedLayerFilter] = useState<string>('all');
  const [sourcePathNode, setSourcePathNode] = useState<string>('AstraFlow.AspNetCore');
  const [targetPathNode, setTargetPathNode] = useState<string>('AstraFlow.Contracts');
  const [showPathFinder, setShowPathFinder] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Filter nodes based on search & layer
  const filteredNodes = useMemo(() => {
    return GRAPH_NODES.filter(node => {
      const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.publicApis.some(api => api.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesLayer = selectedLayerFilter === 'all' || node.layer === selectedLayerFilter;
      return matchesSearch && matchesLayer;
    });
  }, [searchQuery, selectedLayerFilter]);

  // Path finder: simple BFS to find dependency path
  const activePathEdges = useMemo(() => {
    if (!showPathFinder || !sourcePathNode || !targetPathNode) return new Set<string>();

    const queue: { current: string; path: string[] }[] = [{ current: sourcePathNode, path: [sourcePathNode] }];
    const visited = new Set<string>([sourcePathNode]);

    while (queue.length > 0) {
      const { current, path } = queue.shift()!;
      if (current === targetPathNode) {
        // Return set of edge keys "from->to"
        const edgeKeys = new Set<string>();
        for (let i = 0; i < path.length - 1; i++) {
          edgeKeys.add(`${path[i]}->${path[i+1]}`);
          edgeKeys.add(`${path[i+1]}->${path[i]}`);
        }
        return edgeKeys;
      }

      // Find adjacent nodes in edges
      const neighbors: string[] = [];
      GRAPH_EDGES.forEach(edge => {
        if (edge.from === current && !visited.has(edge.to)) neighbors.push(edge.to);
        if (edge.to === current && !visited.has(edge.from)) neighbors.push(edge.from);
      });

      for (const n of neighbors) {
        visited.add(n);
        queue.push({ current: n, path: [...path, n] });
      }
    }

    return new Set<string>();
  }, [showPathFinder, sourcePathNode, targetPathNode]);

  const selectedNode = GRAPH_NODES.find(n => n.id === selectedNodeId) || null;

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNodeId(node.id);
    if (onSelectNode) onSelectNode(node);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getLayerColor = (layer: string) => {
    switch (layer) {
      case 'contracts': return '#72D5DE';
      case 'dispatch': return '#89CBA4';
      case 'mapping': return '#F0C57C';
      case 'roslyn': return '#D9A477';
      case 'observability': return '#F39A98';
      case 'testing': return '#A5B4C4';
      default: return '#72D5DE';
    }
  };

  return (
    <div className="rounded-xl border border-[var(--af-border)] bg-[var(--af-bg-surface)] overflow-hidden shadow-2xl flex flex-col">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[var(--af-border)] px-4 py-3 bg-[var(--af-bg-canvas)]/80 backdrop-blur-sm gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[200px] sm:min-w-[260px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--af-text-subtle)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search packages, interfaces, or APIs..."
              className="w-full rounded-md border border-[var(--af-border)] bg-[var(--af-bg-surface)] py-1.5 pl-8 pr-3 text-xs text-[var(--af-text-primary)] placeholder-[var(--af-text-subtle)] focus:border-[var(--af-accent)] focus:outline-none transition-colors"
            />
          </div>

          {/* Layer Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {['all', 'contracts', 'dispatch', 'mapping', 'roslyn', 'observability', 'testing'].map((layer) => (
              <button
                key={layer}
                onClick={() => setSelectedLayerFilter(layer)}
                className={`px-2.5 py-1 text-[11px] rounded-md capitalize transition-colors font-medium ${
                  selectedLayerFilter === layer
                    ? 'bg-[var(--af-accent)] text-[var(--af-accent-on)] font-semibold shadow-xs'
                    : 'text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] hover:bg-[var(--af-surface-2)]'
                }`}
              >
                {layer}
              </button>
            ))}
          </div>
        </div>

        {/* Path Finder Toggle */}
        <button
          onClick={() => setShowPathFinder(!showPathFinder)}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
            showPathFinder
              ? 'bg-[var(--af-accent)] text-[var(--af-accent-on)]'
              : 'border border-[var(--af-border)] text-[var(--af-text-secondary)] hover:text-[var(--af-text-primary)] hover:bg-[var(--af-surface-2)]'
          }`}
        >
          <Route className="h-3.5 w-3.5" />
          <span>Path Finder {showPathFinder ? 'Active' : ''}</span>
        </button>
      </div>

      {/* Path Finder Configuration Sub-bar */}
      {showPathFinder && (
        <div className="flex flex-wrap items-center gap-3 px-4 py-2 bg-[var(--af-bg-canvas)] border-b border-[var(--af-border)] text-xs">
          <span className="text-[var(--af-text-subtle)] font-medium">Trace Path From:</span>
          <select
            value={sourcePathNode}
            onChange={(e) => setSourcePathNode(e.target.value)}
            className="rounded border border-[var(--af-border)] bg-[var(--af-bg-surface)] px-2 py-1 text-xs text-[var(--af-text-primary)] font-mono"
          >
            {GRAPH_NODES.map(n => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>
          <span className="text-[var(--af-text-subtle)] font-medium">To:</span>
          <select
            value={targetPathNode}
            onChange={(e) => setTargetPathNode(e.target.value)}
            className="rounded border border-[var(--af-border)] bg-[var(--af-bg-surface)] px-2 py-1 text-xs text-[var(--af-text-primary)] font-mono"
          >
            {GRAPH_NODES.map(n => (
              <option key={n.id} value={n.id}>{n.name}</option>
            ))}
          </select>
          <span className="text-[11px] text-[var(--af-accent)] font-mono ml-auto">
            {activePathEdges.size > 0 ? '✓ Path Resolved' : 'No direct path found'}
          </span>
        </div>
      )}

      {/* Main Canvas & Details Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* SVG Interactive Graph Canvas */}
        <div className="lg:col-span-8 relative bg-neutral-950 overflow-auto p-4 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-[var(--af-border)]">
          <svg
            viewBox="0 0 850 780"
            className="w-full h-full max-w-[850px] min-h-[540px] select-none"
          >
            <defs>
              <marker
                id="arrow-default"
                viewBox="0 0 10 10"
                refX="20"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#405267" />
              </marker>
              <marker
                id="arrow-active"
                viewBox="0 0 10 10"
                refX="20"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 10 5 L 0 9 z" fill="#72D5DE" />
              </marker>
            </defs>

            {/* Background Grid Pattern */}
            <pattern id="graph-grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#172231" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#graph-grid)" />

            {/* Edges */}
            {GRAPH_EDGES.map((edge, idx) => {
              const fromNode = GRAPH_NODES.find(n => n.id === edge.from);
              const toNode = GRAPH_NODES.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const isPathActive = activePathEdges.has(`${edge.from}->${edge.to}`) || activePathEdges.has(`${edge.to}->${edge.from}`);
              const isTourActive = highlightedNodeIds.includes(edge.from) && highlightedNodeIds.includes(edge.to);
              const isActive = isPathActive || isTourActive;

              return (
                <line
                  key={idx}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={isActive ? '#72D5DE' : '#2A3B4C'}
                  strokeWidth={isActive ? 2.5 : 1.2}
                  strokeDasharray={edge.type === 'validates' ? '4 3' : undefined}
                  markerEnd={isActive ? 'url(#arrow-active)' : 'url(#arrow-default)'}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Nodes */}
            {filteredNodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              const isTourHighlighted = highlightedNodeIds.includes(node.id);
              const isPathHighlighted = activePathEdges.size > 0 && (
                sourcePathNode === node.id || targetPathNode === node.id ||
                Array.from(activePathEdges).some(k => k.includes(node.id))
              );

              const color = getLayerColor(node.layer);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => handleNodeClick(node)}
                  className="cursor-pointer group"
                >
                  {/* Highlight halo */}
                  {(isSelected || isTourHighlighted || isPathHighlighted) && (
                    <circle
                      r="36"
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      opacity="0.4"
                    />
                  )}

                  {/* Main Node Bubble */}
                  <rect
                    x="-65"
                    y="-20"
                    width="130"
                    height="40"
                    rx="8"
                    fill={isSelected ? '#172231' : '#0C1420'}
                    stroke={isSelected || isTourHighlighted ? color : '#3A4D62'}
                    strokeWidth={isSelected ? 2 : 1}
                    className="transition-all group-hover:stroke-[var(--af-accent)] group-hover:fill-[var(--af-surface-2)]"
                  />

                  {/* Status Indicator Dot */}
                  <circle
                    cx="-50"
                    cy="0"
                    r="4"
                    fill={color}
                  />

                  {/* Node Label */}
                  <text
                    x="-40"
                    y="4"
                    fill={isSelected ? '#F2F1EC' : '#A5B4C4'}
                    fontSize="11"
                    fontFamily="var(--font-mono, monospace)"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    className="group-hover:fill-white"
                  >
                    {node.name.length > 14 ? node.name.slice(0, 13) + '…' : node.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right Details Panel */}
        <div className="lg:col-span-4 p-5 flex flex-col justify-between bg-[var(--af-bg-surface)]">
          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${getLayerColor(selectedNode.layer)}20`,
                      color: getLayerColor(selectedNode.layer)
                    }}
                  >
                    {selectedNode.layerName}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    selectedNode.status === 'published' ? 'bg-[var(--af-success)]/10 text-[var(--af-success)] border border-[var(--af-success)]/30' :
                    selectedNode.status === 'preview' ? 'bg-[var(--af-warning)]/10 text-[var(--af-warning)] border border-[var(--af-warning)]/30' :
                    'bg-[var(--af-surface-2)] text-[var(--af-text-subtle)]'
                  }`}>
                    {selectedNode.status.toUpperCase()}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[var(--af-text-primary)] mt-2 font-mono break-all">
                  {selectedNode.name}
                </h3>
                <p className="text-xs text-[var(--af-text-secondary)] mt-1 leading-relaxed">
                  {selectedNode.summary}
                </p>
              </div>

              {/* Source File Location */}
              <div className="rounded-lg border border-[var(--af-border)] bg-[var(--af-bg-canvas)] p-3">
                <div className="flex items-center justify-between text-[11px] text-[var(--af-text-subtle)] mb-1">
                  <span>Source File Reference</span>
                  <button
                    onClick={() => handleCopy(selectedNode.filePath)}
                    className="text-[var(--af-accent)] hover:underline flex items-center gap-1"
                  >
                    {copiedText === selectedNode.filePath ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedText === selectedNode.filePath ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <code className="text-xs font-mono text-[var(--af-text-primary)] break-all block">
                  {selectedNode.filePath}
                </code>
              </div>

              {/* Public API Surfaces */}
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--af-text-subtle)] block mb-1.5">
                  Core Public APIs & Symbols
                </span>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {selectedNode.publicApis.map((api, idx) => (
                    <div
                      key={idx}
                      className="px-2.5 py-1 rounded bg-[var(--af-bg-canvas)] border border-[var(--af-border)] text-xs font-mono text-[var(--af-text-secondary)] truncate"
                      title={api}
                    >
                      {api}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dependencies */}
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--af-text-subtle)] block mb-1.5">
                  Package Dependencies
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.dependencies.length > 0 ? (
                    selectedNode.dependencies.map((dep, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--af-surface-2)] text-[var(--af-text-secondary)] border border-[var(--af-border)]"
                      >
                        {dep}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[var(--af-text-subtle)] italic">
                      Zero internal or external dependencies (Strict isolation)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-[var(--af-text-subtle)]">
              <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Select any node on the graph to inspect public APIs and dependencies.</p>
            </div>
          )}

          {/* Quick Footer Action */}
          <div className="mt-6 pt-3 border-t border-[var(--af-border)] flex items-center justify-between text-xs text-[var(--af-text-subtle)]">
            <span>Graph Nodes: {GRAPH_NODES.length}</span>
            <span className="font-mono text-[var(--af-accent)]">Live AST Model</span>
          </div>
        </div>
      </div>
    </div>
  );
};
