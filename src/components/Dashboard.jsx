import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../services/authContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getPath } from "../algorithms/linkstate";
import { parseGraphText } from "../utils";
import GraphCanvas from "./GraphCanvas";
import { SimulationEngine } from "../canvas/Engine";

import { Network } from "lucide-react";

import DashboardHeader from "./dashboard/DashboardHeader";
import SimulationInputs from "./dashboard/SimulationInputs";
import AdjacencyEditor from "./dashboard/AdjacencyEditor";
import PlaybackControls from "./dashboard/PlaybackControls";
import TraceInspector from "./dashboard/TraceInspector";

// Default coordinates for nodes in the reference graph
const DEFAULT_NODE_POSITIONS = {
  "9": { x: 60, y: 190 },
  "0": { x: 160, y: 170 },
  "6": { x: 100, y: 280 },
  "4": { x: 250, y: 70 },
  "1": { x: 270, y: 170 },
  "3": { x: 250, y: 285 },
  "2": { x: 380, y: 170 },
  "11": { x: 460, y: 100 },
  "5": { x: 460, y: 280 }
};

const DEFAULT_GRAPH_TEXT = `# Vertices (Nodes)
9
0
6
4
1
3
2
11
5

# Edges (Source Dest Weight)
9 0 1
6 0 1
6 1 1
0 1 1
1 4 1
1 3 1
4 2 1
3 2 1
0 2 1
1 2 5
2 11 1
2 5 1
`;

export default function Dashboard() {
  const { currentUser, logout, isFirebase } = useAuth();

  // Topology States
  const [graphText, setGraphText] = useState(DEFAULT_GRAPH_TEXT);
  const [directed, setDirected] = useState(false);
  const [parsedData, setParsedData] = useState({ graph: {}, nodeIds: [], edges: [] });
  const [nodePositions, setNodePositions] = useState(DEFAULT_NODE_POSITIONS);

  // Algorithm States
  const [selectedAlgo, setSelectedAlgo] = useState("dijkstra"); // dijkstra, bellmanFord, distanceVector, linkState
  const [sourceNode, setSourceNode] = useState("1");
  const [destNode, setDestNode] = useState("2");
  const [maxRounds, setMaxRounds] = useState(50);
  const [poisonReverse, setPoisonReverse] = useState(false);
  const [algoResult, setAlgoResult] = useState(null);
  const [algoError, setAlgoError] = useState(null);

  // Animation States
  const [animationIndex, setAnimationIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(1000); // ms per step

  // Layout recalculation trigger
  const [layoutTrigger, setLayoutTrigger] = useState(0);

  // Secondary inspector states
  const [inspectorRouter, setInspectorRouter] = useState("");

  const nodePositionsRef = useRef(DEFAULT_NODE_POSITIONS);

  // Sync ref with state
  useEffect(() => {
    nodePositionsRef.current = nodePositions;
  }, [nodePositions]);

  // Parse graph and run simulation (coordinates + algorithms) from the central canvas engine coordinator
  useEffect(() => {
    try {
      const result = parseGraphText(graphText, directed);
      setParsedData(result);

      const engine = new SimulationEngine(520, 380);
      const simResult = engine.runSimulation(
        result.graph,
        selectedAlgo,
        sourceNode,
        destNode,
        {
          seedPositions: nodePositionsRef.current,
          poisonReverse,
          maxRounds,
          iterations: 120
        }
      );

      setNodePositions(simResult.coordinates);
      setAlgoResult(simResult.algoResult);
      setAlgoError(simResult.error);

      // Initialize inspector router default
      if (result.nodeIds.length > 0 && !result.nodeIds.includes(inspectorRouter)) {
        setInspectorRouter(result.nodeIds[0]);
      }
    } catch (err) {
      console.error("Simulation run error", err);
      setAlgoError(err.message);
    }
    setAnimationIndex(0);
    setIsPlaying(false);
  }, [graphText, directed, selectedAlgo, sourceNode, destNode, poisonReverse, maxRounds, layoutTrigger]);

  // Adjust source/destination fallback selections
  useEffect(() => {
    const nodes = parsedData.nodeIds;
    if (nodes.length > 0) {
      if (!sourceNode || !nodes.includes(sourceNode)) {
        setSourceNode(nodes.includes("1") ? "1" : nodes[0]);
      }
      if (!destNode || !nodes.includes(destNode)) {
        setDestNode(nodes.includes("2") ? "2" : (nodes[1] || nodes[0]));
      }
    }
  }, [parsedData.nodeIds, sourceNode, destNode]);

  // Node drag handler
  const handleNodeDrag = (nodeId, newX, newY) => {
    setNodePositions((prev) => ({
      ...prev,
      [nodeId]: { x: newX, y: newY }
    }));
  };

  // Node click handler
  const handleNodeClick = (nodeId) => {
    if (window.event?.shiftKey || nodeId === sourceNode) {
      if (nodeId !== sourceNode) setDestNode(nodeId);
    } else {
      setSourceNode(nodeId);
    }
    setAnimationIndex(0);
    setIsPlaying(false);
  };

  // Manual rearrange layout handler
  const handleRearrange = () => {
    nodePositionsRef.current = {};
    setNodePositions({});
    setLayoutTrigger((prev) => prev + 1);
  };

  // Get active step and properties
  const steps = algoResult?.steps || [];
  const stepsCount = steps.length;
  
  // Safe bounds check for animationIndex
  const safeIndex = Math.max(0, Math.min(animationIndex, stepsCount - 1));
  const activeStep = steps[safeIndex] || null;

  // Autoplay VCR step transitions
  useEffect(() => {
    if (!isPlaying || stepsCount === 0) return;
    const interval = setInterval(() => {
      setAnimationIndex((prev) => {
        if (prev >= stepsCount - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, playSpeed);
    return () => clearInterval(interval);
  }, [isPlaying, stepsCount, playSpeed]);

  // Determine active visual indicators on the canvas based on step data
  let activeCanvasNode = null;
  let activeCanvasEdge = null;
  let activeVisualPath = [];

  if (activeStep) {
    if (selectedAlgo === "dijkstra" || selectedAlgo === "bellmanFord") {
      activeCanvasNode = activeStep.visiting;
      activeCanvasEdge = activeStep.relaxedEdge;
      
      // If we are at the final step, show the completed path
      if (activeStep.type === "done" && activeStep.finalPath) {
        activeVisualPath = activeStep.finalPath;
      }
    } else if (selectedAlgo === "distanceVector") {
      activeCanvasNode = activeStep.router;
      if (activeStep.router && activeStep.neighbour) {
        activeCanvasEdge = [activeStep.router, activeStep.neighbour];
      }
    } else if (selectedAlgo === "linkState") {
      activeCanvasNode = activeStep.node || activeStep.neighbour;
      if (activeStep.phase === "flood" && activeStep.node && activeStep.neighbour) {
        activeCanvasEdge = [activeStep.node, activeStep.neighbour];
      } else if (activeStep.phase === "dijkstra" && activeStep.node && activeStep.neighbour) {
        activeCanvasEdge = [activeStep.node, activeStep.neighbour];
      }
    }
  }

  // Decode final path & cost for summary vectors (Distance Vector & Link State require path reconstruction)
  let finalPath = [];
  let finalCost = Infinity;
  let finalReachable = false;

  if (algoResult) {
    if (selectedAlgo === "dijkstra" || selectedAlgo === "bellmanFord") {
      finalPath = algoResult.path;
      finalCost = algoResult.cost;
      finalReachable = algoResult.reachable;
    } else if (selectedAlgo === "distanceVector") {
      const routingTables = algoResult.routingTables;
      if (routingTables && routingTables[sourceNode] && routingTables[sourceNode][destNode]) {
        finalCost = routingTables[sourceNode][destNode].cost;
        finalReachable = finalCost !== Infinity;
        if (finalReachable) {
          // Reconstruct path
          const path = [sourceNode];
          let current = sourceNode;
          const visited = new Set([sourceNode]);
          while (current !== destNode) {
            const next = routingTables[current]?.[destNode]?.next;
            if (!next || visited.has(next)) {
              finalReachable = false;
              break;
            }
            visited.add(next);
            path.push(next);
            current = next;
          }
          if (finalReachable) finalPath = path;
        }
      }
    } else if (selectedAlgo === "linkState") {
      const routingTables = algoResult.routingTables;
      if (routingTables) {
        try {
          const pathInfo = getPath(routingTables, sourceNode, destNode);
          finalPath = pathInfo.path;
          finalCost = pathInfo.cost;
          finalReachable = pathInfo.reachable;
        } catch (e) {
          // Path calculation failed
        }
      }
    }
  }

  // Map coordinate nodes
  const visualNodes = parsedData.nodeIds.map((id) => ({
    id,
    label: id,
    x: nodePositions[id]?.x ?? 250,
    y: nodePositions[id]?.y ?? 180
  }));

  // Presets
  const applyPresetCount = (count) => {
    const nodeNames = Array.from({ length: count }, (_, i) => String(i));
    const connections = [];

    // Create a connected tree
    for (let i = 1; i < count; i++) {
      const parent = Math.floor(Math.random() * i);
      const weight = Math.floor(Math.random() * 5) + 1;
      connections.push(`${parent} ${i} ${weight}`);
    }

    // Add random loop edges
    const loopCount = Math.floor(count * 0.4);
    for (let i = 0; i < loopCount; i++) {
      const u = Math.floor(Math.random() * count);
      const v = Math.floor(Math.random() * count);
      if (u !== v) {
        const sortedEdge = u < v ? `${u} ${v}` : `${v} ${u}`;
        const weight = Math.floor(Math.random() * 5) + 1;
        const exists = connections.some(c => c.startsWith(sortedEdge));
        if (!exists) {
          connections.push(`${sortedEdge} ${weight}`);
        }
      }
    }

    const text = `# Preset: ${count} Nodes\n# Nodes\n${nodeNames.join("\n")}\n\n# Edges (u v w)\n${connections.join("\n")}`;
    
    // Clear previous node positions so layout engine recalculates it fresh!
    nodePositionsRef.current = {};
    setNodePositions({});
    setGraphText(text);
    setSourceNode("0");
    setDestNode(String(count - 1));
    setLayoutTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#07080a] text-zinc-200 font-sans">
      
      {/* Header Panel */}
      <DashboardHeader
        currentUser={currentUser}
        logout={logout}
        isFirebase={isFirebase}
      />

      {/* Main Panel Layout */}
      <main className="flex-1 p-6 relative bg-[#07080a] grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="absolute inset-0 opacity-[0.01] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        {/* LEFT COLUMN: Controls & Code Editor */}
        <div className="lg:col-span-3 flex flex-col gap-6 z-10">
          
          {/* CONTROL BOX CARD */}
          <SimulationInputs
            selectedAlgo={selectedAlgo}
            setSelectedAlgo={setSelectedAlgo}
            nodeIds={parsedData.nodeIds}
            sourceNode={sourceNode}
            setSourceNode={setSourceNode}
            destNode={destNode}
            setDestNode={setDestNode}
            directed={directed}
            setDirected={setDirected}
            poisonReverse={poisonReverse}
            setPoisonReverse={setPoisonReverse}
            setAnimationIndex={setAnimationIndex}
            setIsPlaying={setIsPlaying}
            applyPresetCount={applyPresetCount}
          />

          {/* ADJACENCY EDITOR CARD */}
          <AdjacencyEditor
            graphText={graphText}
            setGraphText={setGraphText}
            onRearrange={handleRearrange}
          />
        </div>

        {/* CENTER COLUMN: Canvas & Player */}
        <div className="lg:col-span-6 flex flex-col gap-6 z-10 items-stretch">
          
          <Card className="stark-card border-zinc-850 rounded-xl overflow-hidden bg-black/40 backdrop-blur-sm flex-1 flex flex-col justify-between">
            <CardHeader className="border-b border-zinc-850 pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold text-zinc-300 tracking-wider uppercase flex items-center gap-2">
                <Network className="w-4 h-4 text-zinc-400" />
                Canvas: Network Topology
              </CardTitle>
              <div className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider hidden sm:block">
                Shift+Click = Set Destination Node
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col justify-between items-stretch">
              
              {/* Canvas Rendering */}
              <div className="flex-1">
                <GraphCanvas
                  nodes={visualNodes}
                  edges={parsedData.edges}
                  onNodeDrag={handleNodeDrag}
                  sourceNode={sourceNode}
                  destNode={destNode}
                  path={activeVisualPath.length > 0 ? activeVisualPath : finalPath}
                  activeNode={activeCanvasNode}
                  activeEdge={activeCanvasEdge}
                  directed={directed}
                  onNodeClick={handleNodeClick}
                />
              </div>

              {/* VCR Animation Controls */}
              <PlaybackControls
                stepsCount={stepsCount}
                animationIndex={animationIndex}
                setAnimationIndex={setAnimationIndex}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                playSpeed={playSpeed}
                setPlaySpeed={setPlaySpeed}
              />

            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Analysis & Detailed Inspector */}
        <div className="lg:col-span-3 flex flex-col gap-6 z-10 items-stretch">
          <TraceInspector
            algoError={algoError}
            activeStep={activeStep}
            selectedAlgo={selectedAlgo}
            nodeIds={parsedData.nodeIds}
            inspectorRouter={inspectorRouter}
            setInspectorRouter={setInspectorRouter}
            finalReachable={finalReachable}
            finalPath={finalPath}
            finalCost={finalCost}
          />
        </div>

      </main>

      {/* Footer Bar */}
      <footer className="glass-panel border-t border-zinc-850 py-3.5 px-6 text-center text-[9px] text-zinc-650 font-bold tracking-wider uppercase mt-auto bg-black/60 backdrop-blur-md">
        IEEE COMPUTER SOCIETY • INTERACTIVE ROUTING SIMULATOR
      </footer>
    </div>
  );
}
