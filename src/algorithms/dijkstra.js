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

function reconstructPath(prev, source, target) {
  const path = [];
  let current = target;

  while (current !== null && current !== undefined) {
    path.unshift(current);
    if (current === source) break;
    current = prev[current];
  }

  if (path[0] !== source) return [];
  return path;
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

export function dijkstra(graph, source, target) {

  if (!(source in graph)) {
    throw new Error(`dijkstra: source node "${source}" not found in graph.`);
  }
  if (!(target in graph)) {
    throw new Error(`dijkstra: target node "${target}" not found in graph.`);
  }

  const nodes = Object.keys(graph);

  const dist = {};
  const prev = {};

  for (const node of nodes) {
    dist[node] = Infinity;
    prev[node] = null;
  }
  dist[source] = 0;

  const visited = new Set();

  const pq = new MinHeap();
  pq.push({ node: source, priority: 0 });

  const steps = [];
  let nodesExplored = 0;
  let edgesRelaxed  = 0;


  while (!pq.isEmpty()) {

    const { node: u, priority: d } = pq.pop();

    if (visited.has(u)) continue;

    if (d > dist[u]) continue;

    visited.add(u);
    nodesExplored++;

    steps.push({
      type: "visit",
      visiting: u,
      visited: snapVisited(visited),
      dist: snapDist(dist),
      prev: snapPrev(prev),
      relaxedEdge: null
    });

    if (u === target) break;

    for (const { to: v, weight: w } of graph[u]) {

      if (visited.has(v)) continue;

      if (!(v in dist)) {
        throw new Error(
          `dijkstra: node "${v}" appears as a destination from "${u}" but is not a key in the graph.`
        );
      }

      const candidate = dist[u] + w;

      if (candidate < dist[v]) {
        dist[v] = candidate;
        prev[v] = u;
        pq.push({ node: v, priority: candidate });
        edgesRelaxed++;

        steps.push({
          type: "relax",
          visiting: u,
          visited: snapVisited(visited),
          dist: snapDist(dist),
          prev: snapPrev(prev),
          relaxedEdge: [u, v]
        });
      }
    }
  }

  const reachable = dist[target] !== Infinity;
  const path      = reachable ? reconstructPath(prev, source, target) : [];
  const cost      = reachable ? dist[target] : Infinity;
  steps.push({
    type: "done",
    visiting: target,
    visited: snapVisited(visited),
    dist: snapDist(dist),
    prev: snapPrev(prev),
    relaxedEdge: null,
    finalPath: path
  });

  return {
    path,
    cost,
    reachable,
    steps,
    meta: {
      nodesExplored,
      edgesRelaxed,
      totalSteps: steps.length
    }
  };
}