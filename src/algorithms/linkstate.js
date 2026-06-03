function snapshotLSDB(lsdb) {
  const copy = {};
  for (const node in lsdb) copy[node] = { ...lsdb[node] };
  return copy;
}

function snapshotRoutingTables(routingTables) {
  const copy = {};
  for (const node in routingTables) {
    copy[node] = {};
    for (const dest in routingTables[node]) {
      copy[node][dest] = { ...routingTables[node][dest] };
    }
  }
  return copy;
}

function snapshotDist(dist)   { return { ...dist }; }
function snapshotPrev(prev)   { return { ...prev }; }
function snapshotSettled(set) { return [...set];     }

function buildNodeTable(nodes, src, dist, prev) {
  const table = {};
  for (const dest of nodes) {
    if (dest === src) {
      table[dest] = { cost: 0, next: null };
      continue;
    }
    const cost = dist[dest];
    if (cost === Infinity) {
      table[dest] = { cost: Infinity, next: null };
      continue;
    }
    let cursor = dest;
    while (prev[cursor] !== src && prev[cursor] !== null) {
      cursor = prev[cursor];
    }
    table[dest] = { cost, next: prev[cursor] === src ? cursor : null };
  }
  return table;
}

function makeStep(overrides, lsdb, routingTables) {
  return {
    type:          null,
    phase:         null,
    node:          null,
    neighbour:     null,
    lsa:           null,
    duplicate:     null,
    dist:          null,
    prev:          null,
    settled:       null,
    lsdb:          snapshotLSDB(lsdb),
    routingTables: snapshotRoutingTables(routingTables),
    ...overrides,
  };
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
  const routingTables = {};

  const lsdb = {};
  for (const u of nodes) lsdb[u] = {};
  const seen = {};
  for (const u of nodes) seen[u] = new Set();

  const queue = []; 

  for (const u of nodes) {
    const links = {};
    for (const { to: v, weight: w } of graph[u]) links[v] = w;

    const lsa = { origin: u, links };

    lsdb[u] = { ...links };
    seen[u].add(u);

    steps.push(makeStep({
      type:      "lsa_created",
      phase:     "flood",
      node:      u,
      lsa:       { origin: u, links: { ...links } },
      duplicate: false,
    }, lsdb, routingTables));

    for (const { to: neighbour } of graph[u]) {
      queue.push({ lsa, forwarder: u, receiver: neighbour });
    }
  }

  while (queue.length > 0) {
    const { lsa, forwarder, receiver } = queue.shift();
    const { origin } = lsa;
    const duplicate = seen[receiver].has(origin);

    steps.push(makeStep({
      type:      "lsa_received",
      phase:     "flood",
      node:      receiver,
      neighbour: forwarder,
      lsa:       { origin, links: { ...lsa.links } },
      duplicate,
    }, lsdb, routingTables));

    if (duplicate) continue;

    seen[receiver].add(origin);
    if (!lsdb[origin]) lsdb[origin] = {};
    for (const [dest, cost] of Object.entries(lsa.links)) {
      lsdb[origin][dest] = cost;
    }

    steps.push(makeStep({
      type:      "lsa_forwarded",
      phase:     "flood",
      node:      receiver,
      neighbour: forwarder,
      lsa:       { origin, links: { ...lsa.links } },
      duplicate: false,
    }, lsdb, routingTables));

    for (const { to: next } of graph[receiver]) {
      if (next === forwarder) continue;
      queue.push({ lsa, forwarder: receiver, receiver: next });
    }
  }

  const floodSteps = steps.length;

  steps.push(makeStep({
    type:  "flood_done",
    phase: "flood",
  }, lsdb, routingTables));

  for (const source of nodes) {
    const dist    = {};
    const prev    = {};
    const settled = new Set();

    for (const n of nodes) {
      dist[n] = Infinity;
      prev[n] = null;
    }
    dist[source] = 0;

    steps.push(makeStep({
      type:    "dijkstra_start",
      phase:   "dijkstra",
      node:    source,
      dist:    snapshotDist(dist),
      prev:    snapshotPrev(prev),
      settled: snapshotSettled(settled),
    }, lsdb, routingTables));

    while (settled.size < nodes.length) {
      let u = null;
      for (const n of nodes) {
        if (!settled.has(n) && (u === null || dist[n] < dist[u])) u = n;
      }
      if (dist[u] === Infinity) break; 

      settled.add(u);

      steps.push(makeStep({
        type:     "dijkstra_visit",
        phase:    "dijkstra",
        node:     source,
        neighbour: u,
        dist:     snapshotDist(dist),
        prev:     snapshotPrev(prev),
        settled:  snapshotSettled(settled),
      }, lsdb, routingTables));

      for (const v of nodes) {
        if (settled.has(v)) continue;
        const linkCost = lsdb[u]?.[v];
        if (linkCost === undefined) continue;

        const candidate = dist[u] + linkCost;
        if (candidate < dist[v]) {
          const oldCost = dist[v];
          dist[v] = candidate;
          prev[v] = u;

          steps.push(makeStep({
            type:      "dijkstra_relax",
            phase:     "dijkstra",
            node:      source,
            neighbour: v,
            dist:      snapshotDist(dist),
            prev:      snapshotPrev(prev),
            settled:   snapshotSettled(settled),
            oldCost,
            newCost:   candidate,
          }, lsdb, routingTables));
        }
      }
    }

    routingTables[source] = buildNodeTable(nodes, source, dist, prev);

    steps.push(makeStep({
      type:    "dijkstra_done",
      phase:   "dijkstra",
      node:    source,
      dist:    snapshotDist(dist),
      prev:    snapshotPrev(prev),
      settled: snapshotSettled(settled),
    }, lsdb, routingTables));
  }

  const dijkstraSteps = steps.length - floodSteps - 1; 

  steps.push(makeStep({
    type:  "done",
    phase: "done",
  }, lsdb, routingTables));

  return {
    lsdb:          snapshotLSDB(lsdb),
    routingTables: snapshotRoutingTables(routingTables),
    steps,
    meta: {
      totalSteps:    steps.length,
      lsaCount:      nodes.length,
      floodSteps,
      dijkstraSteps,
    },
  };
}

export function getPath(routingTables, src, dest) {
  if (!(src in routingTables)) {
    throw new Error(`getPath: source node "${src}" not found in tables`);
  }
  if (!(dest in routingTables[src])) {
    throw new Error(`getPath: destination node "${dest}" not found in tables`);
  }

  const cost      = routingTables[src][dest].cost;
  const reachable = cost !== Infinity;

  if (!reachable) return { path: [], cost, reachable };
  if (src === dest) return { path: [src], cost: 0, reachable: true };

  const path    = [src];
  const visited = new Set([src]);
  let   current = src;

  while (current !== dest) {
    const next = routingTables[current][dest].next;
    if (next === null || visited.has(next)) return { path: [], cost, reachable: false };
    visited.add(next);
    path.push(next);
    current = next;
  }

  return { path, cost, reachable };
}