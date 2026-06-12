import React from "react";
import { Sliders } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SimulationInputs({
  selectedAlgo,
  setSelectedAlgo,
  nodeIds,
  sourceNode,
  setSourceNode,
  destNode,
  setDestNode,
  directed,
  setDirected,
  poisonReverse,
  setPoisonReverse,
  setAnimationIndex,
  setIsPlaying,
  applyPresetCount
}) {
  return (
    <Card className="stark-card border-zinc-850 rounded-xl overflow-hidden bg-black/40 backdrop-blur-sm">
      <CardHeader className="border-b border-zinc-850 pb-3">
        <CardTitle className="text-xs font-bold text-zinc-300 tracking-wider uppercase flex items-center gap-2">
          <Sliders className="w-4 h-4 text-zinc-400" />
          Simulation Inputs
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        
        {/* Algorithm select dropdown */}
        <div>
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1.5">
            Routing Algorithm:
          </label>
          <select
            value={selectedAlgo}
            onChange={(e) => {
              setSelectedAlgo(e.target.value);
              setAnimationIndex(0);
              setIsPlaying(false);
            }}
            className="w-full bg-zinc-900 border border-zinc-850 rounded px-2.5 py-1.5 text-xs text-zinc-200 outline-none focus:border-cyan-600 cursor-pointer font-semibold uppercase"
          >
            <option value="dijkstra">Dijkstra's Shortest Path</option>
            <option value="bellmanFord">Bellman-Ford Path</option>
            <option value="distanceVector">Distance Vector Routing</option>
            <option value="linkState">Link State Routing</option>
          </select>
        </div>

        {/* Presets */}
        <div>
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">
            Node Count:
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {[3, 6, 9, 12, 15].map((cnt) => {
              const isActive = nodeIds.length === cnt;
              return (
                <button
                  key={`cnt-${cnt}`}
                  onClick={() => applyPresetCount(cnt)}
                  className={`py-1 text-xs font-mono font-bold rounded border transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.15)]"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  {cnt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Source/Dest dropdowns */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
              Source:
            </label>
            <select
              value={sourceNode}
              onChange={(e) => {
                setSourceNode(e.target.value);
                setAnimationIndex(0);
                setIsPlaying(false);
              }}
              className="w-full bg-zinc-900 border border-zinc-850 rounded px-2 py-1 text-xs text-zinc-200 outline-none font-mono"
            >
              {nodeIds.map((id) => (
                <option key={`src-${id}`} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
              Target:
            </label>
            <select
              value={destNode}
              onChange={(e) => {
                setDestNode(e.target.value);
                setAnimationIndex(0);
                setIsPlaying(false);
              }}
              className="w-full bg-zinc-900 border border-zinc-850 rounded px-2 py-1 text-xs text-zinc-200 outline-none font-mono"
            >
              {nodeIds.map((id) => (
                <option key={`dst-${id}`} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="pt-2 border-t border-zinc-850/50 flex flex-wrap gap-x-4 gap-y-2">
          <label className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-wider cursor-pointer">
            <input
              type="checkbox"
              checked={directed}
              onChange={(e) => setDirected(e.target.checked)}
              className="rounded bg-zinc-900 border-zinc-800 text-cyan-600 focus:ring-0 focus:ring-offset-0"
            />
            Directed Graph
          </label>

          {selectedAlgo === "distanceVector" && (
            <label className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-wider cursor-pointer">
              <input
                type="checkbox"
                checked={poisonReverse}
                onChange={(e) => {
                  setPoisonReverse(e.target.checked);
                  setAnimationIndex(0);
                  setIsPlaying(false);
                }}
                className="rounded bg-zinc-900 border-zinc-800 text-cyan-600 focus:ring-0"
              />
              Poison Reverse
            </label>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
