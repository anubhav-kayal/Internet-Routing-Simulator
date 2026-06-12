import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function parseGraphText(text, directed = false) {
  const lines = text.split("\n");
  const nodeIdsSet = new Set();
  const edges = [];
  const graph = {};

  lines.forEach(line => {
    // Strip comments
    const commentIdx = line.indexOf("#");
    let content = commentIdx !== -1 ? line.substring(0, commentIdx) : line;
    const dsIdx = content.indexOf("//");
    content = dsIdx !== -1 ? content.substring(0, dsIdx) : content;

    const trimmed = content.trim();
    if (!trimmed) return;

    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) {
      const node = parts[0];
      nodeIdsSet.add(node);
      if (!graph[node]) {
        graph[node] = [];
      }
    } else if (parts.length >= 2) {
      const from = parts[0];
      const to = parts[1];
      const weight = parts[2] ? parseFloat(parts[2]) : 1;

      nodeIdsSet.add(from);
      nodeIdsSet.add(to);

      if (!graph[from]) graph[from] = [];
      if (!graph[to]) graph[to] = [];

      // Add edge from -> to
      graph[from].push({ to, weight });
      edges.push({ from, to, weight });

      // If undirected, add edge to -> from for algorithms
      if (!directed) {
        graph[to].push({ to: from, weight });
      }
    }
  });

  const nodeIds = Array.from(nodeIdsSet);
  // Ensure every node has an entry in graph adjacency list
  nodeIds.forEach(node => {
    if (!graph[node]) {
      graph[node] = [];
    }
  });

  return { graph, nodeIds, edges };
}
