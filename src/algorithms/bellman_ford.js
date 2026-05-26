function reconstructPath(prev, src, target) {
  const path = [];
  let current = target;
  while (current !== null && current !== undefined) {
    path.unshift(current);
    if (current === src) return path;
    current = prev[current];
  }
  return [];
}

function snapshot(object) {
  return { ...object };
}

export function bellmanFord(graph, src, target) {
  if (!(src in graph)) {
    throw new Error(`bellmanFord: source node "${src}" not found in graph`);
  }
  if (!(target in graph)) {
    throw new Error(`bellmanFord: target node "${target}" not found in graph`);
  }

  const nodes = Object.keys(graph);
  const dist = {};
  const prev = {};

  for (const node of nodes) {
    dist[node] = Infinity;
    prev[node] = null;
  }
  dist[src] = 0;

  const steps = [];
  let edgesRelaxed = 0;
  const visited = [];

  for (let i = 0; i < nodes.length - 1; i++) {
    let anyRelaxed = false;

    for (const u of nodes) {
      for (const { to: v, weight: w } of graph[u]) {
        if (!(v in graph)) {
          throw new Error(
            `bellmanFord: node "${v}" referenced from "${u}" is not defined in graph`
          );
        }

        steps.push({
          type: "scan",
          visiting: u,
          visited: [...visited],
          dist: snapshot(dist),
          prev: snapshot(prev),
          relaxedEdge: [u, v]
        });

        if (dist[u] === Infinity) continue;

        const candidate = dist[u] + w;
        if (candidate < dist[v]) {
          dist[v] = candidate;
          prev[v] = u;
          anyRelaxed = true;
          edgesRelaxed++;

          steps.push({
            type: "relax",
            visiting: u,
            visited: [...visited],
            dist: snapshot(dist),
            prev: snapshot(prev),
            relaxedEdge: [u, v]
          });
        }
      }

      if (!visited.includes(u)) visited.push(u);
    }
    steps.push({
      type: "round_end",
      roundNumber: i + 1,
      anyRelaxed,
      visiting: null,
      visited: [...visited],
      dist: snapshot(dist),
      prev: snapshot(prev),
      relaxedEdge: null
    });

    if (!anyRelaxed) break;
  }

  let hasNegativeCycle = false;

  for (const u of nodes) {
    for (const { to: v, weight: w } of graph[u]) {
      if (dist[u] === Infinity) continue;
      if (dist[u] + w < dist[v]) {
        hasNegativeCycle = true;
        steps.push({
          type: "negative_cycle",
          visiting: u,
          visited: [...visited],
          dist: snapshot(dist),
          prev: snapshot(prev),
          relaxedEdge: [u, v]
        });
        break;
      }
    }
    if (hasNegativeCycle) break;
  }

  const reachable = !hasNegativeCycle && dist[target] !== Infinity;
  const path = reachable ? reconstructPath(prev, src, target) : [];
  const cost = reachable ? dist[target] : Infinity;

  steps.push({
    type: "done",
    visiting: target,
    visited: [...visited],
    dist: snapshot(dist),
    prev: snapshot(prev),
    relaxedEdge: null,
    finalPath: path
  });

  return {
    path,
    cost,
    reachable,
    steps,
    meta: {
      nodesExplored: visited.length,
      edgesRelaxed,
      totalSteps: steps.length,
      hasNegativeCycle
    }
  };
}