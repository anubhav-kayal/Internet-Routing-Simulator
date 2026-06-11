class MinHeap {
  constructor() {
    this._heap = [];
  }

  get size() {
    return this._heap.length;
  }

  isEmpty() {
    return this._heap.length === 0;
  }

  push(item) {
    this._heap.push(item);
    this._bubbleUp(this._heap.length - 1);
  }

  pop() {
    const top = this._heap[0];
    const last = this._heap.pop();
    if (this._heap.length > 0) {
      this._heap[0] = last;
      this._siftDown(0);
    }
    return top;
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this._heap[parent].priority <= this._heap[i].priority) break;
      [this._heap[parent], this._heap[i]] = [this._heap[i], this._heap[parent]];
      i = parent;
    }
  }

  _siftDown(i) {
    const n = this._heap.length;
    while (true) {
      let smallest = i;
      const left  = 2 * i + 1;
      const right = 2 * i + 2;
      if (left  < n && this._heap[left].priority  < this._heap[smallest].priority) smallest = left;
      if (right < n && this._heap[right].priority < this._heap[smallest].priority) smallest = right;
      if (smallest === i) break;
      [this._heap[smallest], this._heap[i]] = [this._heap[i], this._heap[smallest]];
      i = smallest;
    }
  }
}

function buildReverseGraph(graph) {
  const reversed = {};
  for (const node of Object.keys(graph)) {
    if (!(node in reversed)) reversed[node] = [];
    for (const { to, weight } of graph[node]) {
      if (!(to in reversed)) reversed[to] = [];
      reversed[to].push({ to: node, weight });
    }
  }
  return reversed;
}

function reconstructPath(prevF, prevB, source, target, meetNode) {
  const forward = [];
  let cur = meetNode;
  while (cur !== null && cur !== undefined) {
    forward.unshift(cur);
    if (cur === source) break;
    cur = prevF[cur];
  }
  if (forward[0] !== source) return [];

  const backward = [];
  cur = meetNode;
  while (cur !== null && cur !== undefined) {
    if (cur !== meetNode) backward.push(cur);
    if (cur === target) break;
    cur = prevB[cur];
  }
  if (backward[backward.length - 1] !== target) return [];

  return [...forward, ...backward];
}

function snapDist(dist) {
  return { ...dist };
}

function snapPrev(prev) {
  return { ...prev };
}

function snapVisited(visitedSet) {
  return Array.from(visitedSet);
}

export function bidirectionalDijkstra(graph, source, target) {
  if (!(source in graph)) {
    throw new Error(`bidirectionalDijkstra: source node "${source}" not found in graph.`);
  }
  if (!(target in graph)) {
    throw new Error(`bidirectionalDijkstra: target node "${target}" not found in graph.`);
  }

  if (source === target) {
    const visitedSnap = [source];
    const distSnap    = {};
    const prevSnap    = {};
    for (const n of Object.keys(graph)) {
      distSnap[n] = n === source ? 0 : Infinity;
      prevSnap[n] = null;
    }
    const steps = [{
      type:        "done",
      direction:   "forward",
      visiting:    source,
      visitedF:    visitedSnap,
      visitedB:    visitedSnap,
      distF:       distSnap,
      distB:       { ...distSnap },
      prevF:       prevSnap,
      prevB:       { ...prevSnap },
      relaxedEdge: null,
      mu:          0,
      finalPath:   [source]
    }];
    return {
      path: [source], cost: 0, reachable: true, steps,
      meta: { nodesExplored: 1, edgesRelaxed: 0, totalSteps: 1, meetNode: source }
    };
  }
  const nodes        = Object.keys(graph);
  const reverseGraph = buildReverseGraph(graph);

  const distF = {};
  const prevF = {};
  const visitedF = new Set();
  const pqF = new MinHeap();

  const distB = {};
  const prevB = {};
  const visitedB = new Set();
  const pqB = new MinHeap();

  for (const node of nodes) {
    distF[node] = Infinity;
    distB[node] = Infinity;
    prevF[node] = null;
    prevB[node] = null;
  }

  distF[source] = 0;
  distB[target] = 0;

  pqF.push({ node: source, priority: 0 });
  pqB.push({ node: target, priority: 0 });
  let mu       = Infinity;
  let meetNode = null;

  const steps = [];
  let nodesExplored = 0;
  let edgesRelaxed  = 0;

  function emitStep(type, direction, visiting, relaxedEdge) {
    steps.push({
      type,
      direction,
      visiting,
      visitedF:    snapVisited(visitedF),
      visitedB:    snapVisited(visitedB),
      distF:       snapDist(distF),
      distB:       snapDist(distB),
      prevF:       snapPrev(prevF),
      prevB:       snapPrev(prevB),
      relaxedEdge,
      mu
    });
  }

  function expand(direction) {
    const isForward = direction === "forward";
    const pq        = isForward ? pqF : pqB;
    const dist      = isForward ? distF : distB;
    const distOther = isForward ? distB : distF;
    const visited   = isForward ? visitedF : visitedB;
    const prev      = isForward ? prevF : prevB;
    const adjList   = isForward ? graph : reverseGraph;

    if (pq.isEmpty()) return false;

    const { node: u, priority: d } = pq.pop();

    if (visited.has(u)) return false;
    if (d > dist[u])    return false;

    visited.add(u);
    nodesExplored++;

    emitStep("visit", direction, u, null);
    const otherVisited = isForward ? visitedB : visitedF;
    if (otherVisited.has(u)) return true; 

    for (const { to: v, weight: w } of adjList[u]) {

      if (visited.has(v)) continue;

      if (!(v in dist)) {
        throw new Error(
          `bidirectionalDijkstra: node "${v}" appears as destination from "${u}" but is not a key in the graph.`
        );
      }

      const candidate = dist[u] + w;

      if (candidate < dist[v]) {
        dist[v] = candidate;
        prev[v] = u;
        pq.push({ node: v, priority: candidate });
        edgesRelaxed++;

        emitStep("relax", direction, u, isForward ? [u, v] : [v, u]);
      }
      const combined = dist[v] + distOther[v];
      if (combined < mu) {
        mu       = combined;
        meetNode = v;
      }
    }
    const combinedU = dist[u] + distOther[u];
    if (combinedU < mu) {
      mu       = combinedU;
      meetNode = u;
    }

    return false;
  }
  let done = false;

  while (!done && (!pqF.isEmpty() || !pqB.isEmpty())) {
    if (!pqF.isEmpty()) {
      done = expand("forward");
      if (done) break;
    }
    if (!pqB.isEmpty()) {
      done = expand("backward");
      if (done) break;
    }
  }
  const reachable = mu !== Infinity;
  const path      = reachable
    ? reconstructPath(prevF, prevB, source, target, meetNode)
    : [];
  const cost      = reachable ? mu : Infinity;

  emitStep("done", "forward", target, null);
  steps.at(-1).finalPath = path;
  steps.at(-1).mu        = mu;

  return {
    path,
    cost,
    reachable,
    steps,
    meta: {
      nodesExplored,
      edgesRelaxed,
      totalSteps: steps.length,
      meetNode
    }
  };
}