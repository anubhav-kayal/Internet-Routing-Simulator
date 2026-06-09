import { dijkstra } from "../algorithms/dijkstra.js";
import { bellmanFord } from "../algorithms/bellman_ford.js";
import { distanceVector } from "../algorithms/distance_vector_routing.js";
import { linkState } from "../algorithms/linkstate.js";

export class SimulationEngine {
    constructor(canvasWidth = 800, canvasHeight = 600) {
        // Set boundary dimensions
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.nodes = {};
        this.edges = [];
    }

    // Parse adjacency list
    initializeGraph(adjacencyList) {
        this.nodes = {};
        this.edges = [];
        const routerIds = Object.keys(adjacencyList);

        // Assign random initial coordinates
        routerIds.forEach(id => {
            this.nodes[id] = {
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: 0,
                vy: 0
            };
        });

        // Extract unique graph edges
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

    // Run physics simulation loop
    calculateLayout(iterations = 300) {
        const repulsion = 5000;
        const gravity = 0.05;

        for (let i = 0; i < iterations; i++) {
            const nodeIds = Object.keys(this.nodes);

            // Apply node repulsion force
            for (let a = 0; a < nodeIds.length; a++) {
                for (let b = a + 1; b < nodeIds.length; b++) {
                    const nodeA = this.nodes[nodeIds[a]];
                    const nodeB = this.nodes[nodeIds[b]];

                    let dx = nodeA.x - nodeB.x;
                    let dy = nodeA.y - nodeB.y;
                    let distance = Math.sqrt(dx * dx + dy * dy) || 1;

                    const force = repulsion / distance;
                    const fx = (dx / distance) * force;
                    const fy = (dy / distance) * force;

                    nodeA.vx += fx;
                    nodeA.vy += fy;
                    nodeB.vx -= fx;
                    nodeB.vy -= fy;
                }
            }

            // Apply edge spring attraction
            this.edges.forEach(edge => {
                const nodeA = this.nodes[edge.source];
                const nodeB = this.nodes[edge.target];

                const idealLength = edge.weight * 20;

                let dx = nodeA.x - nodeB.x;
                let dy = nodeA.y - nodeB.y;
                let distance = Math.sqrt(dx * dx + dy * dy) || 1;

                const force = (distance - idealLength) * 0.05;
                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;

                nodeA.vx -= fx;
                nodeA.vy -= fy;
                nodeB.vx += fx;
                nodeB.vy += fy;
            });

            const centerX = this.width / 2;
            const centerY = this.height / 2;

            // Apply gravity, movement, and friction
            nodeIds.forEach(id => {
                const node = this.nodes[id];

                node.vx += (centerX - node.x) * gravity;
                node.vy += (centerY - node.y) * gravity;

                node.x += node.vx;
                node.y += node.vy;

                node.vx *= 0.85;
                node.vy *= 0.85;
                
                node.x = Math.max(30, Math.min(this.width - 30, node.x));
                node.y = Math.max(30, Math.min(this.height - 30, node.y));
            });
        }

        // Return final coordinate map
        const finalCoordinates = {};
        Object.keys(this.nodes).forEach(id => {
            finalCoordinates[id] = {
                x: Math.round(this.nodes[id].x),
                y: Math.round(this.nodes[id].y)
            };
        });

        return finalCoordinates;
    }

    // Execute unified simulation
    runSimulation(graph, algorithm, source, target, options = {}) {
        this.initializeGraph(graph);
        
        // Use provided seed positions
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

        // Run selected routing algorithm
        try {
            const nodes = Object.keys(graph);
            if (nodes.length > 0) {
                if (algorithm === "dijkstra") {
                    if (nodes.includes(source) && nodes.includes(target)) {
                        algoResult = dijkstra(graph, source, target);
                    }
                } else if (algorithm === "bellmanFord") {
                    if (nodes.includes(source) && nodes.includes(target)) {
                        algoResult = bellmanFord(graph, source, target);
                    }
                } else if (algorithm === "distanceVector") {
                    algoResult = distanceVector(graph, {
                        maxRounds: options.maxRounds || 50,
                        poisonReverse: options.poisonReverse || false
                    });
                } else if (algorithm === "linkState") {
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