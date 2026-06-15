import { dijkstra } from "../algorithms/dijkstra.js";
import { bellmanFord } from "../algorithms/bellman_ford.js";
import { distanceVector } from "../algorithms/distance_vector_routing.js";
import { linkState } from "../algorithms/linkstate.js";
import { bidirectionalDijkstra } from "../algorithms/bidirectional-dijkstra.js";
import { pathVector } from "../algorithms/pathvector.js";

export class SimulationEngine {
    constructor(canvasWidth = 800, canvasHeight = 600) {
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.nodes = {};
        this.edges = [];
    }

    initializeGraph(adjacencyList) {
        this.nodes = {};
        this.edges = [];
        const routerIds = Object.keys(adjacencyList);

        routerIds.forEach(id => {
            this.nodes[id] = {
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: 0,
                vy: 0
            };
        });

        const seenEdges = new Set();
        routerIds.forEach(u => {
            adjacencyList[u].forEach(edge => {
                const v = edge.to;
                const edgeId = [u, v].sort().join('-');
                if (!seenEdges.has(edgeId)) {
                    seenEdges.add(edgeId);
                    this.edges.push({ source: u, target: v, weight: edge.weight });
                }
            });
        });
    }

    calculateLayout(iterations = 300) {
        const repulsionForce = 120000;
        const gravity = 0.01;

        for (let i = 0; i < iterations; i++) {
            const nodeIds = Object.keys(this.nodes);

            for (let a = 0; a < nodeIds.length; a++) {
                for (let b = a + 1; b < nodeIds.length; b++) {
                    const nodeA = this.nodes[nodeIds[a]];
                    const nodeB = this.nodes[nodeIds[b]];

                    let dx = nodeA.x - nodeB.x;
                    let dy = nodeA.y - nodeB.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 5) {
                        dx = (Math.random() - 0.5) * 6 || 3;
                        dy = (Math.random() - 0.5) * 6 || 3;
                        distance = Math.sqrt(dx * dx + dy * dy);
                    }

                    const force = Math.min(100, repulsionForce / (distance * distance));
                    const fx = (dx / distance) * force;
                    const fy = (dy / distance) * force;

                    nodeA.vx += fx;
                    nodeA.vy += fy;
                    nodeB.vx -= fx;
                    nodeB.vy -= fy;
                }
            }

            this.edges.forEach(edge => {
                const nodeA = this.nodes[edge.source];
                const nodeB = this.nodes[edge.target];
                if (!nodeA || !nodeB) return;

                const idealLength = edge.weight * 35 + 85;

                let dx = nodeA.x - nodeB.x;
                let dy = nodeA.y - nodeB.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 5) {
                    dx = (Math.random() - 0.5) * 6 || 3;
                    dy = (Math.random() - 0.5) * 6 || 3;
                    distance = Math.sqrt(dx * dx + dy * dy);
                }

                const force = (distance - idealLength) * 0.06;
                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;

                nodeA.vx -= fx;
                nodeA.vy -= fy;
                nodeB.vx += fx;
                nodeB.vy += fy;
            });

            const centerX = this.width / 2;
            const centerY = this.height / 2;

            nodeIds.forEach(id => {
                const node = this.nodes[id];

                node.vx += (centerX - node.x) * gravity;
                node.vy += (centerY - node.y) * gravity;

                const maxSpeed = 10;
                const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
                if (speed > maxSpeed) {
                    node.vx = (node.vx / speed) * maxSpeed;
                    node.vy = (node.vy / speed) * maxSpeed;
                }

                node.x += node.vx;
                node.y += node.vy;

                node.vx *= 0.85;
                node.vy *= 0.85;
                
                node.x = Math.max(30, Math.min(this.width - 30, node.x));
                node.y = Math.max(30, Math.min(this.height - 30, node.y));
            });
        }

        const finalCoordinates = {};
        Object.keys(this.nodes).forEach(id => {
            finalCoordinates[id] = {
                x: Math.round(this.nodes[id].x),
                y: Math.round(this.nodes[id].y)
            };
        });

        return finalCoordinates;
    }

    runSimulation(graph, algorithm, source, target, options = {}) {
        this.initializeGraph(graph);
        
        if (options.seedPositions) {
            Object.keys(this.nodes).forEach(id => {
                if (options.seedPositions[id]) {
                    this.nodes[id].x = options.seedPositions[id].x;
                    this.nodes[id].y = options.seedPositions[id].y;
                }
            });
        }

        const coordinates = this.calculateLayout(options.iterations || 120);

        let algoResult = null;
        let error = null;

        try {
            const nodes = Object.keys(graph);
            if (nodes.length > 0) {
                if (algorithm === "dijkstra") {
                    // Dijkstra
                    if (nodes.includes(source) && nodes.includes(target)) {
                        algoResult = dijkstra(graph, source, target);
                    }
                } else if (algorithm === "bidirectionalDijkstra") {
                    // Bidirectional Dijkstra
                    if (nodes.includes(source) && nodes.includes(target)) {
                        algoResult = bidirectionalDijkstra(graph, source, target);
                    }
                } else if (algorithm === "bellmanFord") {
                    // Bellman-Ford
                    if (nodes.includes(source) && nodes.includes(target)) {
                        algoResult = bellmanFord(graph, source, target);
                    }
                } else if (algorithm === "distanceVector") {
                    // Distance Vector
                    algoResult = distanceVector(graph, {
                        maxRounds: options.maxRounds || 50,
                        poisonReverse: options.poisonReverse || false
                    });
                } else if (algorithm === "pathVector") {
                    // Path Vector
                    algoResult = pathVector(graph, {
                        maxRounds: options.maxRounds || 50
                    });
                } else if (algorithm === "linkState") {
                    // Link State
                    algoResult = linkState(graph);
                }
            }
        } catch (err) {
            error = err.message;
        }

        return {
            coordinates,
            algoResult,
            error
        };
    }
}