import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Info, ChevronRight } from "lucide-react";

export default function TraceInspector({
  algoError,
  activeStep,
  selectedAlgo,
  nodeIds,
  inspectorRouter,
  setInspectorRouter,
  finalReachable,
  finalPath,
  finalCost
}) {
  return (
    <Card className="stark-card border-zinc-850 rounded-xl overflow-hidden bg-black/40 backdrop-blur-sm flex-1 flex flex-col justify-between">
      <div className="flex flex-col flex-1">
        <CardHeader className="border-b border-zinc-850 pb-3">
          <CardTitle className="text-xs font-bold text-zinc-300 tracking-wider uppercase flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-zinc-400" />
            Algorithm Trace Inspector
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-4 space-y-4 flex-1 flex flex-col justify-between">
          
          {/* STEP DETAILS DESCRIPTION */}
          {algoError ? (
            <div className="bg-rose-950/20 border border-rose-900 text-rose-300 rounded-lg p-3.5 text-xs font-semibold leading-relaxed">
              Error running algorithm:<br />
              <span className="font-mono text-[11px] text-rose-400">{algoError}</span>
            </div>
          ) : activeStep ? (
            <div className="space-y-3 flex-1 flex flex-col justify-between">
              
              {/* Step Type description */}
              <div className="bg-zinc-950 border border-zinc-850 rounded-lg p-3 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 text-zinc-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">
                    Active Event type
                  </div>
                  <div className="font-mono font-bold text-zinc-200 mt-0.5 uppercase tracking-wide">
                    {activeStep.type}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    {selectedAlgo === "dijkstra" && activeStep.type === "visit" && `Visiting Node ${activeStep.visiting}. Settling its distance.`}
                    {selectedAlgo === "dijkstra" && activeStep.type === "relax" && `Relaxing edge ${activeStep.relaxedEdge?.[0]} → ${activeStep.relaxedEdge?.[1]}. Path cost improved.`}
                    {selectedAlgo === "dijkstra" && activeStep.type === "done" && `Algorithm completed. Route computed.`}
                    
                    {selectedAlgo === "bidirectionalDijkstra" && activeStep.type === "visit" && `Visiting Node ${activeStep.visiting} in the ${activeStep.direction} direction. Settling its distance.`}
                    {selectedAlgo === "bidirectionalDijkstra" && activeStep.type === "relax" && `Relaxing edge ${activeStep.relaxedEdge?.[0]} → ${activeStep.relaxedEdge?.[1]} in the ${activeStep.direction} direction. Path cost improved.`}
                    {selectedAlgo === "bidirectionalDijkstra" && activeStep.type === "done" && `Algorithm completed. Meeting point established. Shortest path computed.`}
                    
                    {selectedAlgo === "bellmanFord" && activeStep.type === "scan" && `Scanning edge ${activeStep.relaxedEdge?.[0]} → ${activeStep.relaxedEdge?.[1]}.`}
                    {selectedAlgo === "bellmanFord" && activeStep.type === "relax" && `Relaxing edge ${activeStep.relaxedEdge?.[0]} → ${activeStep.relaxedEdge?.[1]}. Distance value updated.`}
                    {selectedAlgo === "bellmanFord" && activeStep.type === "round_end" && `Completed full pass #${activeStep.roundNumber} over all edges. (Relaxations: ${activeStep.anyRelaxed ? "Yes" : "No"})`}
                    {selectedAlgo === "bellmanFord" && activeStep.type === "negative_cycle" && `ALERT: Negative weight cycle detected at edge ${activeStep.relaxedEdge?.[0]} → ${activeStep.relaxedEdge?.[1]}!`}
                    
                    {selectedAlgo === "distanceVector" && activeStep.type === "init" && `Router ${activeStep.router} initializes its distance vector from direct links.`}
                    {selectedAlgo === "distanceVector" && activeStep.type === "advertise" && `Router ${activeStep.router} sends advertisement packet to ${activeStep.neighbour}.`}
                    {selectedAlgo === "distanceVector" && activeStep.type === "receive" && `Router ${activeStep.router} receives distance vector updates from ${activeStep.neighbour}.`}
                    {selectedAlgo === "distanceVector" && activeStep.type === "update" && `Router ${activeStep.router} improves its routes using advertisements.`}
                    {selectedAlgo === "distanceVector" && activeStep.type === "converge" && `No routes changed in this round. Network has fully converged!`}
                    {selectedAlgo === "distanceVector" && activeStep.type === "count_to_infinity" && `ALERT: Count-to-infinity loop detected! Terminated.`}

                    {selectedAlgo === "pathVector" && activeStep.type === "init" && `Router ${activeStep.router} initializes its routing table from direct links.`}
                    {selectedAlgo === "pathVector" && activeStep.type === "advertise" && `Router ${activeStep.router} sends path vector advertisement to ${activeStep.neighbour}.`}
                    {selectedAlgo === "pathVector" && activeStep.type === "receive" && `Router ${activeStep.router} receives path vector advertisement from ${activeStep.neighbour}.`}
                    {selectedAlgo === "pathVector" && activeStep.type === "reject" && `Router ${activeStep.router} discards advertised routes from ${activeStep.neighbour} that would create a loop.`}
                    {selectedAlgo === "pathVector" && activeStep.type === "update" && `Router ${activeStep.router} improves its routes using advertisements from ${activeStep.neighbour}.`}
                    {selectedAlgo === "pathVector" && activeStep.type === "converge" && `No routes changed in this round. Network has converged!`}
                    {selectedAlgo === "pathVector" && activeStep.type === "no_convergence" && `ALERT: Safety cap reached! Path Vector algorithm failed to converge.`}
                    
                    {selectedAlgo === "linkState" && activeStep.type === "lsa_created" && `Router ${activeStep.node} creates and queues its initial LSA.`}
                    {selectedAlgo === "linkState" && activeStep.type === "lsa_received" && `Router ${activeStep.node} receives LSA from neighbour ${activeStep.neighbour}. (Duplicate: ${activeStep.duplicate ? "Yes" : "No"})`}
                    {selectedAlgo === "linkState" && activeStep.type === "lsa_forwarded" && `Router ${activeStep.node} forwards LSA to remaining neighbours.`}
                    {selectedAlgo === "linkState" && activeStep.type === "flood_done" && `LSA propagation completed. LSDBs are now identical on all routers.`}
                    {selectedAlgo === "linkState" && activeStep.type === "dijkstra_start" && `Router ${activeStep.node} starts local Dijkstra computation.`}
                    {selectedAlgo === "linkState" && activeStep.type === "dijkstra_visit" && `Router ${activeStep.node} visits node ${activeStep.neighbour} during Dijkstra.`}
                    {selectedAlgo === "linkState" && activeStep.type === "dijkstra_relax" && `Router ${activeStep.node} relaxes link to ${activeStep.neighbour} with cost ${activeStep.newCost}.`}
                    {selectedAlgo === "linkState" && activeStep.type === "dijkstra_done" && `Router ${activeStep.node} completed Dijkstra. Routing table built.`}
                    {selectedAlgo === "linkState" && activeStep.type === "done" && `Link State algorithm completed. All tables are stable.`}
                  </p>
                </div>
              </div>

              {/* DYNAMIC DATA TABLE STATE INSPECTORS */}
              <div className="flex-1 flex flex-col justify-stretch">
                        {/* Dijkstra & Bellman-Ford Table Inspector */}
                {(selectedAlgo === "dijkstra" || selectedAlgo === "bellmanFord") && (
                  <div className="space-y-1.5 flex-1 flex flex-col">
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                      State Tables:
                    </div>
                    <div className="flex-1 bg-zinc-950 border border-zinc-850 rounded-lg overflow-y-auto max-h-[220px] font-mono text-[11px] scrollbar-thin">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-900 bg-zinc-900/50 text-[9px] text-zinc-400 uppercase tracking-wider font-bold">
                            <th className="py-2 px-3">Node</th>
                            <th className="py-2 px-3 text-right">Cost (dist)</th>
                            <th className="py-2 px-3 text-right">Prev</th>
                          </tr>
                        </thead>
                        <tbody>
                          {nodeIds.map((nodeId) => {
                            const cost = activeStep.dist?.[nodeId];
                            const predecessor = activeStep.prev?.[nodeId];
                            const isVisited = activeStep.visited?.includes(nodeId);
                            const isVisiting = activeStep.visiting === nodeId;
                            
                            let rowClass = "border-b border-zinc-900/40 text-zinc-400";
                            if (isVisiting) {
                              rowClass = "border-b border-zinc-900/40 bg-zinc-800/40 text-white font-bold";
                            } else if (isVisited) {
                              rowClass = "border-b border-zinc-900/40 text-zinc-200";
                            }

                            return (
                              <tr key={`state-${nodeId}`} className={rowClass}>
                                <td className="py-1.5 px-3 flex items-center gap-1.5">
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    isVisiting ? "bg-white animate-pulse" : isVisited ? "bg-zinc-400" : "bg-zinc-700"
                                  }`}></span>
                                  {nodeId}
                                </td>
                                <td className="py-1.5 px-3 text-right">
                                  {cost === Infinity || cost === undefined ? "∞" : cost}
                                </td>
                                <td className="py-1.5 px-3 text-right">
                                  {predecessor === null || predecessor === undefined ? "-" : predecessor}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Bidirectional Dijkstra Table Inspector */}
                {selectedAlgo === "bidirectionalDijkstra" && (
                  <div className="space-y-1.5 flex-1 flex flex-col">
                    <div className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider block">
                      State Tables (Forward & Backward):
                    </div>
                    <div className="flex-1 bg-zinc-950 border border-zinc-850 rounded-lg overflow-y-auto max-h-[220px] font-mono text-[11px] scrollbar-thin">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-900 bg-zinc-900/50 text-[9px] text-zinc-400 uppercase tracking-wider font-bold">
                            <th className="py-2 px-2">Node</th>
                            <th className="py-2 px-2 text-right">Cost F</th>
                            <th className="py-2 px-2 text-right">Prev F</th>
                            <th className="py-2 px-2 text-right">Cost B</th>
                            <th className="py-2 px-2 text-right">Prev B</th>
                          </tr>
                        </thead>
                        <tbody>
                          {nodeIds.map((nodeId) => {
                            const costF = activeStep.distF?.[nodeId];
                            const prevF = activeStep.prevF?.[nodeId];
                            const costB = activeStep.distB?.[nodeId];
                            const prevB = activeStep.prevB?.[nodeId];
                            
                            const isVisitedF = activeStep.visitedF?.includes(nodeId);
                            const isVisitedB = activeStep.visitedB?.includes(nodeId);
                            const isVisiting = activeStep.visiting === nodeId;
                            
                            let rowClass = "border-b border-zinc-900/40 text-zinc-400";
                            if (isVisiting) {
                              rowClass = "border-b border-zinc-900/40 bg-zinc-800/40 text-white font-bold";
                            } else if (isVisitedF || isVisitedB) {
                              rowClass = "border-b border-zinc-900/40 text-zinc-200";
                            }

                            return (
                              <tr key={`state-bidir-${nodeId}`} className={rowClass}>
                                <td className="py-1.5 px-2 flex items-center gap-1.5">
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    isVisiting ? "bg-white animate-pulse" : (isVisitedF && isVisitedB) ? "bg-purple-500" : isVisitedF ? "bg-blue-400" : isVisitedB ? "bg-orange-400" : "bg-zinc-700"
                                  }`}></span>
                                  {nodeId}
                                </td>
                                <td className="py-1.5 px-2 text-right">
                                  {costF === Infinity || costF === undefined ? "∞" : costF}
                                </td>
                                <td className="py-1.5 px-2 text-right">
                                  {prevF === null || prevF === undefined ? "-" : prevF}
                                </td>
                                <td className="py-1.5 px-2 text-right">
                                  {costB === Infinity || costB === undefined ? "∞" : costB}
                                </td>
                                <td className="py-1.5 px-2 text-right">
                                  {prevB === null || prevB === undefined ? "-" : prevB}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Distance Vector & Path Vector Matrix Inspector */}
                {(selectedAlgo === "distanceVector" || selectedAlgo === "pathVector") && (
                  <div className="space-y-3 flex-1 flex flex-col">
                    
                    {/* Selector for Routing Table view */}
                    <div>
                      <label className="text-[9px] text-zinc-550 font-bold uppercase tracking-wider block mb-1">
                        View Routing Table for Router:
                      </label>
                      <select
                        value={inspectorRouter}
                        onChange={(e) => setInspectorRouter(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-850 rounded px-2 py-1 text-xs text-zinc-200"
                      >
                        {nodeIds.map((id) => (
                          <option key={`dv-inspect-${id}`} value={id}>
                            Router {id}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Specific routing table display */}
                    {activeStep.routingTables?.[inspectorRouter] && (
                      <div className="flex-1 bg-zinc-950 border border-zinc-850 rounded-lg overflow-y-auto max-h-[170px] font-mono text-[11px] scrollbar-thin">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-900 bg-zinc-900/50 text-[9px] text-zinc-400 uppercase tracking-wider font-bold">
                              <th className="py-1.5 px-3">Dest</th>
                              <th className="py-1.5 px-3 text-right">Cost</th>
                              <th className="py-1.5 px-3 text-right">
                                {selectedAlgo === "pathVector" ? "Path" : "Next"}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {nodeIds.map((destId) => {
                              const entry = activeStep.routingTables[inspectorRouter][destId];
                              const cost = entry?.cost;
                              const nextHop = entry?.next;
                              const path = entry?.path;
                              return (
                                <tr key={`dv-table-${destId}`} className="border-b border-zinc-900/40 text-zinc-400">
                                  <td className="py-1 px-3">{destId}</td>
                                  <td className="py-1 px-3 text-right">{cost === Infinity ? "∞" : cost}</td>
                                  <td className="py-1 px-3 text-right">
                                    {selectedAlgo === "pathVector" ? (
                                      path && path.length > 0 ? path.join("→") : "-"
                                    ) : (
                                      nextHop === null ? "-" : nextHop
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Advertisement Packet Inspector */}
                    {activeStep.packet && (
                      <div className="bg-zinc-900/50 border border-zinc-850/60 rounded-lg p-2.5">
                        <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                          Packet advertisement payload:
                        </div>
                        <div className="font-mono text-[10px] text-zinc-300 mt-1 flex flex-wrap gap-x-2 gap-y-1">
                          {Object.entries(activeStep.packet).map(([dest, val]) => {
                            const displayVal = selectedAlgo === "pathVector"
                              ? `${val?.cost ?? Infinity} (${val?.path ? val.path.join("→") : ""})`
                              : (val === Infinity ? "∞" : val);
                            return (
                              <span key={`dv-packet-${dest}`} className="px-1.5 py-0.5 bg-black/40 border border-zinc-800 rounded">
                                {dest}: {displayVal}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Updated Routes details */}
                    {activeStep.updatedRoutes && activeStep.updatedRoutes.length > 0 && (
                      <div className="bg-emerald-950/20 border border-emerald-900/45 rounded-lg p-2.5">
                        <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                          Updated routes:
                        </div>
                        <div className="font-mono text-[10px] text-zinc-300 mt-1 space-y-0.5">
                          {activeStep.updatedRoutes.map((route, idx) => {
                            const pathStr = route.newPath ? ` via ${route.newPath.join("→")}` : ` (next: ${route.nextHop})`;
                            const oldCostStr = route.oldCost === Infinity ? "∞" : route.oldCost;
                            const newCostStr = route.newCost === Infinity ? "∞" : route.newCost;
                            return (
                              <div key={`ur-${idx}`}>
                                {route.destination}: cost {oldCostStr} → {newCostStr}{pathStr}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Rejected Paths details */}
                    {activeStep.rejectedPaths && activeStep.rejectedPaths.length > 0 && (
                      <div className="bg-rose-950/20 border border-rose-900/45 rounded-lg p-2.5">
                        <div className="text-[9px] text-rose-455 font-bold uppercase tracking-wider">
                          Rejected paths (loop detected):
                        </div>
                        <div className="font-mono text-[10px] text-zinc-300 mt-1 space-y-0.5">
                          {activeStep.rejectedPaths.map((route, idx) => (
                            <div key={`rp-${idx}`} className="text-rose-300">
                              {route.destination}: path [{route.path.join("→")}] rejected
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* Link State DB & FLOODING LSA Inspector */}
                {selectedAlgo === "linkState" && (
                  <div className="space-y-3 flex-1 flex flex-col">
                    
                    {/* LSA in Transit */}
                    {activeStep.lsa && (
                      <div className="bg-zinc-900/50 border border-zinc-850/65 rounded-lg p-2.5">
                        <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                          {activeStep.type === "lsa_created" ? "LSA generated" : "LSA in transit"}:
                        </div>
                        <div className="font-mono text-[10.5px] text-zinc-300 mt-1">
                          <span className="font-bold text-white">Origin:</span> {activeStep.lsa.origin}<br />
                          <span className="font-bold text-white">Links:</span>{" "}
                          {Object.entries(activeStep.lsa.links).map(([dest, cost]) => (
                            <span key={`lsa-l-${dest}`} className="text-zinc-400">
                              {dest}(cost {cost}){" "}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* LSDB Viewer */}
                    {activeStep.lsdb && (
                      <div className="flex-1 flex flex-col min-h-[140px]">
                        <label className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider block mb-1">
                          Link State Database (LSDB):
                        </label>
                        <div className="flex-1 bg-zinc-950 border border-zinc-850 rounded-lg overflow-y-auto max-h-[160px] font-mono text-[10.5px] scrollbar-thin">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-zinc-900 bg-zinc-900/50 text-[9px] text-zinc-400 uppercase tracking-wider font-bold">
                                <th className="py-1 px-3">Node</th>
                                <th className="py-1 px-3">Adjacencies (cost)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {nodeIds.map((nodeId) => {
                                const adj = activeStep.lsdb[nodeId] || {};
                                const adjsStr = Object.entries(adj)
                                  .map(([dest, cost]) => `${dest}(${cost})`)
                                  .join(", ");
                                return (
                                  <tr key={`lsdb-row-${nodeId}`} className="border-b border-zinc-900/30 text-zinc-400">
                                    <td className="py-1 px-3 font-bold text-white">{nodeId}</td>
                                    <td className="py-1 px-3 text-zinc-350">{adjsStr || "-"}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Dijkstra Sub-Inspector */}
                    {activeStep.phase === "dijkstra" && activeStep.dist && (
                      <div className="bg-zinc-950/40 border border-zinc-850 rounded-lg p-2.5">
                        <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                          Dijkstra local trace for Node {activeStep.node}:
                        </div>
                        <div className="font-mono text-[10px] text-zinc-400 mt-1 leading-relaxed">
                          <span className="text-zinc-500 font-bold">Settled:</span> {activeStep.settled?.join(", ") || "-"}<br />
                          <span className="text-zinc-500 font-bold">Dist:</span>{" "}
                          {Object.entries(activeStep.dist)
                            .filter(([_, cost]) => cost !== Infinity)
                            .map(([dest, cost]) => `${dest}:${cost}`)
                            .join(", ")}
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>

            </div>
          ) : (
            <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-6 text-center text-zinc-500 text-xs italic">
              Configure topology nodes and edges above to start the trace simulation.
            </div>
          )}

          {/* SHORTEST PATH SUMMARY SUMMARY CARD */}
          <div className="pt-4 border-t border-zinc-850/30 space-y-3">
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              Final Best Route Path:
            </h3>

            <div className="space-y-2">
              {/* Path box */}
              <div className="bg-zinc-900/40 rounded-lg px-3.5 py-2.5 text-left">
                <div className="text-[9px] text-zinc-400 font-bold tracking-wider uppercase mb-0.5">
                  Active Route
                </div>
                <div className="text-xs font-mono font-bold text-zinc-200">
                  {finalReachable && finalPath.length > 0 ? (
                    <span className="flex items-center gap-1.5 flex-wrap">
                      Path: {finalPath.join(" → ")}
                    </span>
                  ) : (
                    <span className="text-zinc-500 italic font-semibold">No Path Available</span>
                  )}
                </div>
              </div>

              {/* Cost box */}
              <div className="bg-zinc-900/40 rounded-lg px-3.5 py-2.5 text-left">
                <div className="text-[9px] text-zinc-400 font-bold tracking-wider uppercase mb-0.5">
                  Total Distance
                </div>
                <div className="text-xs font-semibold text-zinc-300">
                  Shortest Path Cost:{" "}
                  <span className="font-mono font-bold text-white">
                    {finalReachable ? (
                      `${finalCost} Hops / Cost`
                    ) : (
                      <span className="text-zinc-500 italic">Infinite</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </CardContent>
      </div>

    </Card>
  );
}
