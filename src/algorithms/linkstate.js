function snapshotLSDB(lsdb) {
  const copy = {};
  for (const node in lsdb) {
    copy[node] = { ...lsdb[node] };
  }
  return copy;
}

function snapshotDist(dist) {
  return { ...dist };
}

function snapshotPrev(prev) {
  return { ...prev };
}

function snapshotTables(tables) {
  const copy = {};
  for (const node in tables) {
    copy[node] = {};
    for (const dest in tables[node]) {
      copy[node][dest] = { ...tables[node][dest] };
    }
  }
  return copy;
}

function reconstructPath(prev, src, dest) {
  if (prev[dest] === null && dest !== src) return [];
  const path = [];
  let current = dest;
  while (current !== null && current !== undefined) {
    path.unshift(current);
    if (current === src) return path;
    current = prev[current];
  }
  return [];
}

function buildTable(nodes, src, dist, prev) {
  const table = {};
  for (const dest of nodes) {
    if (dest === src) {
      table[dest] = { cost: 0, nextHop: null };
      continue;
    }
    const cost = dist[dest];
    if (cost === Infinity) {
      table[dest] = { cost: Infinity, nextHop: null };
      continue;
    }
    
    const path = reconstructPath(prev, src, dest);
    const nextHop = path.length >= 2 ? path[1] : null;
    table[dest] = { cost, nextHop };
  }
  return table;
}

function runDijkstra(source, nodes, lsdb, tables, steps) {
  const dist = {};
  const prev = {};
  const settled = new Set();

  for (const n of nodes) {
    dist[n] = Infinity;
    prev[n] = null;
  }
  dist[source] = 0;

  steps.push({
    type:    "dijkstra_start",
    node:    source,
    dist:    snapshotDist(dist),
    prev:    snapshotPrev(prev),
    settled: [...settled],
    phase:   "dijkstra",
  });

  while (settled.size < nodes.length) {
    
    let u = null;
    for (const n of nodes) {
      if (!settled.has(n)) {
        if (u === null || dist[n] < dist[u]) u = n;
      }
    }

    if (dist[u] === Infinity) break;

    settled.add(u);

    steps.push({
      type:    "dijkstra_visit",
      node:    source,
      visiting: u,
      dist:    snapshotDist(dist),
      prev:    snapshotPrev(prev),
      settled: [...settled],
      phase:   "dijkstra",
    });

    const neighbours = lsdb[u] ?? {};
    for (const v of nodes) {
      if (settled.has(v)) continue;
      const linkCost = neighbours[v];
      if (linkCost === undefined) continue; 

      const candidate = dist[u] + linkCost;
      if (candidate < dist[v]) {
        const oldCost = dist[v];
        dist[v] = candidate;
        prev[v] = u;

        steps.push({
          type:      "dijkstra_relax",
          node:      source,
          visiting:  u,
          neighbour: v,
          oldCost,
          newCost:   candidate,
          dist:      snapshotDist(dist),
          prev:      snapshotPrev(prev),
          settled:   [...settled],
          phase:     "dijkstra",
        });
      }
    }
  }

  const table = buildTable(nodes, source, dist, prev);
  tables[source] = table;

  steps.push({
    type:    "dijkstra_done",
    node:    source,
    table:   { ...table },
    dist:    snapshotDist(dist),
    prev:    snapshotPrev(prev),
    settled: [...settled],
    phase:   "dijkstra",
  });
}

export function linkState(graph) {
  const nodes = Object.keys(graph);

  if (nodes.length === 0) {
    throw new Error("linkState: graph is empty");
  }

  for (const u of nodes) {
    for (const { to: v, weight: w } of graph[u]) {
      if (!(v in graph)) {
        throw new Error(
          `linkState: node "${v}" referenced from "${u}" is not defined in graph`
        );
      }
      if (w < 0) {
        throw new Error(
          `linkState: negative edge weight (${u} → ${v}, weight ${w}). ` +
          `Dijkstra requires non-negative weights. Use bellmanFord instead.`
        );
      }
    }
  }

  const steps = [];

  const lsdb = {};
  for (const u of nodes) {
    lsdb[u] = {};
  }
  const seen = new Set();

  const queue = [];

  for (const u of nodes) {
    const links = {};
    for (const { to: v, weight: w } of graph[u]) {
      links[v] = w;
    }
    const lsa = { origin: u, links };

    lsdb[u] = { ...links };
    seen.add(u);

    steps.push({
      type:  "lsa_created",
      node:  u,
      lsa:   { ...lsa, links: { ...lsa.links } },
      lsdb:  snapshotLSDB(lsdb),
      phase: "flood",
    });

    for (const { to: neighbour } of graph[u]) {
      queue.push({ lsa, forwarder: u, receiver: neighbour });
    }
  }

  while (queue.length > 0) {
    const { lsa, forwarder, receiver } = queue.shift();
    const origin = lsa.origin;
    const duplicate = lsdb[receiver][origin] !== undefined ||
                      (origin === receiver);

    steps.push({
      type:      "lsa_received",
      sender:    forwarder,
      receiver,
      lsa:       { ...lsa, links: { ...lsa.links } },
      duplicate,
      lsdb:      snapshotLSDB(lsdb),
      phase:     "flood",
    });

    if (duplicate) continue;

    lsdb[receiver][origin] = undefined; 
    
    for (const [dest, cost] of Object.entries(lsa.links)) {
      if (lsdb[origin] === undefined) lsdb[origin] = {};
      lsdb[origin][dest] = cost;
    }

    lsdb[receiver] = lsdb[receiver] ?? {};

    steps.push({
      type:      "lsa_forwarded",
      forwarder: receiver,
      lsa:       { ...lsa, links: { ...lsa.links } },
      lsdb:      snapshotLSDB(lsdb),
      phase:     "flood",
    });

    for (const { to: next } of graph[receiver]) {
      if (next === forwarder) continue;
      queue.push({ lsa, forwarder: receiver, receiver: next });
    }
  }

  const floodSteps = steps.length;

  steps.push({
    type:  "flood_done",
    lsdb:  snapshotLSDB(lsdb),
    phase: "flood",
  });

  const tables = {};

  for (const node of nodes) {
    runDijkstra(node, nodes, lsdb, tables, steps);
  }

  const dijkstraSteps = steps.length - floodSteps - 1; 

  steps.push({
    type:   "done",
    lsdb:   snapshotLSDB(lsdb),
    tables: snapshotTables(tables),
  });

  return {
    lsdb:   snapshotLSDB(lsdb),
    tables: snapshotTables(tables),
    steps,
    meta: {
      totalSteps:      steps.length,
      lsaCount:        nodes.length,
      floodSteps,
      dijkstraSteps,
      hasNegativeCycle: false,
    },
  };
}

export function getPath(tables, src, dest) {
  if (!(src in tables)) {
    throw new Error(`getPath: source node "${src}" not found in tables`);
  }
  if (!(dest in tables)) {
    throw new Error(`getPath: destination node "${dest}" not found in tables`);
  }

  const cost = tables[src][dest].cost;
  const reachable = cost !== Infinity;
  const path = [];

  if (reachable) {
    let current = src;
    const visited = new Set([src]);
    path.push(src);
    while (current !== dest) {
      const nextHop = tables[current][dest].nextHop;
      if (nextHop === null || visited.has(nextHop)) { path.length = 0; break; }
      visited.add(nextHop);
      path.push(nextHop);
      current = nextHop;
    }
  }
  
  return { path, cost, reachable };
}