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