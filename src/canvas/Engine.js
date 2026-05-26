export class SimulationEngine {
    constructor(canvasWidth = 800, canvasHeight = 600) {
        //################# Important ###############
        // We still need dimensions so we know how big of an area to calculate
        
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.nodes = {}; 
        this.edges = [];
    }

    /**
     * Phase 1: Parse Adjacency List
     * Gives every router a random starting (x, y) coordinate
     */
    initializeGraph(adjacencyList) {
        this.nodes = {};
        this.edges = [];
        const routerIds = Object.keys(adjacencyList);

        // 1. Give every router a random starting coordinate
        routerIds.forEach(id => {
            this.nodes[id] = {
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                vx: 0, // Velocity X
                vy: 0  // Velocity Y
            };
        });

        // 2. Extract unique edges for the spring physics
        const seenEdges = new Set();
        routerIds.forEach(u => {
            adjacencyList[u].forEach(edge => {
                const v = edge.to;
                // Create a unique ID (A-B) so we don't calculate the same spring twice
                const edgeId = [u, v].sort().join('-'); 
                if (!seenEdges.has(edgeId)) {
                    seenEdges.add(edgeId);
                    this.edges.push({ source: u, target: v, weight: edge.weight });
                }
            });
        });
    }

    /**
     * Phase 2: The Physics Loop
     * Runs a simulation to push/pull nodes until they are perfectly spaced
     */
    calculateLayout(iterations = 300) {
        const repulsion = 5000; 
        const gravity = 0.05;   
        for (let i = 0; i < iterations; i++) {
            const nodeIds = Object.keys(this.nodes);

            // 1. Repulsion Force (Electrons pushing away)
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

            // 2. Attraction Force (Springs pulling together)
            this.edges.forEach(edge => {
                const nodeA = this.nodes[edge.source];
                const nodeB = this.nodes[edge.target];
                
                // Scale the edge weight to a physical pixel length
                const idealLength = edge.weight * 20; 

                let dx = nodeA.x - nodeB.x;
                let dy = nodeA.y - nodeB.y;
                let distance = Math.sqrt(dx * dx + dy * dy) || 1;

                // Hooke's Law for springs
                const force = (distance - idealLength) * 0.05; 
                const fx = (dx / distance) * force;
                const fy = (dy / distance) * force;

                nodeA.vx -= fx;
                nodeA.vy -= fy;
                nodeB.vx += fx;
                nodeB.vy += fy;
            });

            // 3. Apply Gravity, Move Nodes, and Apply Friction
            const centerX = this.width / 2;
            const centerY = this.height / 2;

            nodeIds.forEach(id => {
                const node = this.nodes[id];
                
                // Pull gently to the center of the screen
                node.vx += (centerX - node.x) * gravity;
                node.vy += (centerY - node.y) * gravity;

                //move the node
                node.x += node.vx;
                node.y += node.vy;
                
                // Apply friction so they eventually stop moving 
                node.vx *= 0.85; 
                node.vy *= 0.85;
                node.x = Math.max(30, Math.min(this.width - 30, node.x));
                node.y = Math.max(30, Math.min(this.height - 30, node.y));
            });
        }

        // Return a clean coordinate map 
        const finalCoordinates = {};
        Object.keys(this.nodes).forEach(id => {
            finalCoordinates[id] = {
                x: Math.round(this.nodes[id].x),
                y: Math.round(this.nodes[id].y)
            };
        });

        return finalCoordinates; 
    }
}