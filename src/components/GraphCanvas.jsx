import React, { useState, useEffect, useRef } from "react";

export default function GraphCanvas({
  nodes = [],
  edges = [],
  onNodeDrag = () => {},
  sourceNode = "",
  destNode = "",
  path = [],
  activeNode = null,
  activeEdge = null,
  directed = false,
  onNodeClick = () => {}
}) {
  const svgRef = useRef(null);
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Panning State
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Handle node dragging start
  const handleMouseDown = (e, nodeId) => {
    e.stopPropagation();
    e.preventDefault();
    const node = nodes.find(n => n.id === nodeId);
    if (!node || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    const mouseX = clientX - rect.left - panOffset.x;
    const mouseY = clientY - rect.top - panOffset.y;

    setDraggedNodeId(nodeId);
    setDragOffset({
      x: mouseX - node.x,
      y: mouseY - node.y
    });
  };

  // Handle canvas panning start
  const handleCanvasMouseDown = (e) => {
    // Only pan with left click
    if (e.button !== 0) return;
    setIsPanning(true);
    setPanStart({
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y
    });
  };

  // Double click to reset pan view
  const handleDoubleClick = (e) => {
    if (e.target === svgRef.current) {
      setPanOffset({ x: 0, y: 0 });
    }
  };

  // Ref to store the latest interactive states to avoid re-binding event listeners on every mouse move
  const interactionStateRef = useRef();
  interactionStateRef.current = {
    nodes,
    draggedNodeId,
    dragOffset,
    isPanning,
    panOffset,
    panStart
  };

  const handleMouseMove = (e) => {
    const state = interactionStateRef.current;
    if (state.draggedNodeId !== null && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      const mouseX = clientX - rect.left - state.panOffset.x;
      const mouseY = clientY - rect.top - state.panOffset.y;

      const newX = mouseX - state.dragOffset.x;
      const newY = mouseY - state.dragOffset.y;

      onNodeDrag(state.draggedNodeId, newX, newY);
    } else if (state.isPanning) {
      setPanOffset({
        x: e.clientX - state.panStart.x,
        y: e.clientY - state.panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
    setIsPanning(false);
  };

  useEffect(() => {
    const shouldBind = draggedNodeId !== null || isPanning;
    if (shouldBind) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggedNodeId !== null, isPanning]);

  // Helper to check if an edge is part of the final shortest path
  const isEdgeInPath = (u, v) => {
    if (path.length < 2) return false;
    for (let i = 0; i < path.length - 1; i++) {
      if (directed) {
        if (path[i] === u && path[i + 1] === v) return true;
      } else {
        if ((path[i] === u && path[i + 1] === v) || (path[i] === v && path[i + 1] === u)) return true;
      }
    }
    return false;
  };

  // Helper to check if an edge is currently active (being scanned or relaxed)
  const isEdgeActive = (u, v) => {
    if (!activeEdge) return false;
    const [activeU, activeV] = activeEdge;
    if (directed) {
      return activeU === u && activeV === v;
    } else {
      return (activeU === u && activeV === v) || (activeU === v && activeV === u);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[380px] bg-[#0c0d12] rounded-xl border border-zinc-850 overflow-hidden select-none">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none"></div>

      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ minHeight: "380px" }}
        onMouseDown={handleCanvasMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        <defs>
          {/* Arrow markers for directed edges */}
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#3f3f46" />
          </marker>
          
          <marker
            id="arrow-active"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffffff" />
          </marker>

          <marker
            id="arrow-path"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffffff" />
          </marker>

          {/* Neon Glow Filters */}
          <filter id="glow-white" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Main Transformed Canvas Container */}
        <g transform={`translate(${panOffset.x}, ${panOffset.y})`}>
          {/* Draw Edges */}
          <g>
            {edges.map((edge, i) => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const isPath = isEdgeInPath(edge.from, edge.to);
              const isActive = isEdgeActive(edge.from, edge.to);

              // Determine edge color, width, marker
              let strokeColor = "#27272a";
              let strokeWidth = 1.5;
              let strokeOpacity = 0.4;
              let markerEnd = directed ? "url(#arrow)" : undefined;
              let strokeDasharray = undefined;

              if (isPath) {
                strokeColor = "#ffffff"; // White path
                strokeWidth = 2.5;
                strokeOpacity = 1;
                markerEnd = directed ? "url(#arrow-path)" : undefined;
              } else if (isActive) {
                strokeColor = "#ffffff"; // White active scanning edge
                strokeWidth = 3;
                strokeOpacity = 1;
                markerEnd = directed ? "url(#arrow-active)" : undefined;
                strokeDasharray = "4,4"; // Dashed to differentiate from path
              }

              // Midpoint coordinates for weights
              const midX = (fromNode.x + toNode.x) / 2;
              const midY = (fromNode.y + toNode.y) / 2;

              return (
                <g key={`edge-group-${edge.from}-${edge.to}-${i}`}>
                  {/* Edge line */}
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeOpacity={strokeOpacity}
                    markerEnd={markerEnd}
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                  />

                  {/* Edge Weight Midpoint Label */}
                  {edge.weight !== undefined && (
                    <g transform={`translate(${midX}, ${midY})`} className="pointer-events-none">
                      {/* Background rectangle to block out the line */}
                      <rect
                        x="-10"
                        y="-7"
                        width="20"
                        height="14"
                        rx="3"
                        fill="#0c0d12"
                        stroke={isActive || isPath ? "#ffffff" : "#27272a"}
                        strokeWidth="1"
                        className="transition-colors duration-200"
                      />
                      {/* Weight Text */}
                      <text
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        dy=".3em"
                        fill={isActive || isPath ? "#ffffff" : "#a1a1aa"}
                        fontSize="9"
                        fontWeight="bold"
                        className="font-mono"
                      >
                        {edge.weight}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* Draw Nodes */}
          <g>
            {nodes.map((node) => {
              const isSource = sourceNode === node.id;
              const isDest = destNode === node.id;
              const isPathNode = path.includes(node.id);
              const isVisiting = activeNode === node.id;

              // Determine border color and fill (stark monochrome style)
              let strokeColor = "#52525b"; // Normal node border (zinc-600)
              let fillColor = "#09090b";   // Normal node fill (zinc-950)
              let strokeWidth = 1.5;

              if (isSource) {
                strokeColor = "#ffffff";   // Thick white border for source
                fillColor = "#27272a";      // zinc-800
                strokeWidth = 3;
              } else if (isDest) {
                strokeColor = "#ffffff";   // Solid white node for target
                fillColor = "#ffffff";
                strokeWidth = 1.5;
              } else if (isVisiting) {
                strokeColor = "#ffffff";   // Active node border
                fillColor = "#52525b";      // zinc-600
                strokeWidth = 2;
              } else if (isPathNode) {
                strokeColor = "#ffffff";   // White border for path nodes
                fillColor = "#18181b";      // zinc-900
                strokeWidth = 2.5;
              }

              return (
                <g
                  key={`node-${node.id}`}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer select-none group"
                  onClick={() => onNodeClick(node.id)}
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                >
                  {/* Outer pulsating indicator for visiting node */}
                  {isVisiting && (
                    <circle
                      r="19"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="animate-pulse"
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    r="14"
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    className="transition-all duration-200 group-hover:stroke-white group-hover:fill-zinc-900"
                  />

                  {/* Node Label Text */}
                  <text
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    dy=".3em"
                    fill={isDest ? "#000000" : "#ffffff"}
                    fontSize="10"
                    fontWeight="bold"
                    className="pointer-events-none font-mono"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Floating Canvas Badges */}
      <div className="absolute top-3 left-3 px-3 py-1 bg-zinc-950/80 border border-zinc-850 rounded-md text-[9px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-sm pointer-events-none">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
        Topology View ({directed ? "Directed" : "Undirected"})
      </div>
      
      <div className="absolute bottom-3 left-3 px-3 py-1 bg-zinc-950/80 border border-zinc-850 rounded-md text-[9px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-sm pointer-events-none">
        Drag nodes to structure • Drag background to pan • Double-click to reset view
      </div>
    </div>
  );
}
