export function distanceVector(graph, options = {}) {
    const {
        maxRounds = 50,
        poisonReverse = false
    } = options;

    const routers = Object.keys(graph);

    const snapshotDistVectors = (distVectors) => {
        const snap = {};

        for (const router of routers) {
            snap[router] = { ...distVectors[router] };
        }

        return snap;
    };

    const snapshotRoutingTables = (routingTables) => {
        const snap = {};

        for (const router of routers) {
            snap[router] = {};

            for (const dest of Object.keys(routingTables[router])) {
                snap[router][dest] = { ...routingTables[router][dest] };
            }
        }

        return snap;
    }

    const buildRoutingTables = (distVectors, nextHops) => {
        const tables = {};

        for (const router of routers) {
            tables[router] = {};

            for (const dest of routers) {
                tables[router][dest] ={
                    cost: distVectors[router]?.[dest] ?? Infinity,
                    next: nextHops[router]?.[dest] ?? null
                };
            }
        }

        return tables;
    }

    const steps = [];
    const distVectors = {};
    const nextHops = {};

    let totalMessages = 0;
    let totalUpdates = 0;
    let converged = false

    for (const router of routers) {
        distVectors[router] = {};
        nextHops[router] = {};

        for (const dest of routers) {
            distVectors[router][dest] = Infinity;
            nextHops[router][dest] = null;
        }

        distVectors[router][router] = 0;

        for (const edge of graph[router] || []) {
            distVectors[router][edge.to] = edge.weight;
            nextHops[router][edge.to] = edge.to;
        }

        const routingTables = buildRoutingTables(distVectors, nextHops);

        steps.push({
            type: "init",
            round: 0,
            router,
            neighbour: null,
            packet: null,
            distVectors: snapshotDistVectors(distVectors),
            routingTables: snapshotRoutingTables(routingTables),
            updatedRoutes: []
        });
    }
    
    let lastRound = maxRounds;

    for (let round = 1; round <= maxRounds; round++) {
        let changed = false;

        for (const router of routers) {
            for (const neighbourEdge of graph[router] || []) {
                const neighbour = neighbourEdge.to;

                let packet = {};

                for (const dest of routers) {
                    let advertisedCost = distVectors[router][dest];

                    if (
                        poisonReverse &&
                        nextHops[router][dest] === neighbour &&
                        dest !== neighbour
                    ) {
                        advertisedCost = Infinity;
                    }

                    packet[dest] = advertisedCost;
                }

                totalMessages++;

                steps.push({
                    type: "advertise",
                    round,
                    router,
                    neighbour,
                    packet: structuredClone(packet),
                    distVectors: snapshotDistVectors(distVectors),
                    routingTables: snapshotRoutingTables(buildRoutingTables(distVectors, nextHops)),
                    updatedRoutes: []
                });

                steps.push({
                    type: "receive",
                    round,
                    router: neighbour,
                    neighbour: router,
                    packet: structuredClone(packet),
                    distVectors: snapshotDistVectors(distVectors),
                    routingTables: snapshotRoutingTables(buildRoutingTables(distVectors, nextHops)),
                    updatedRoutes: []
                });

                const updatedRoutes = [];

                for (const dest of routers) {
                    if (dest === neighbour)
                        continue;

                    const linkCost = neighbourEdge.weight;

                    if (linkCost === Infinity)
                        continue;

                    const neighbourCost = packet[dest];

                    const candidateCost = neighbourCost === Infinity ? Infinity : linkCost + neighbourCost;

                    const currentCost = distVectors[neighbour][dest];

                    if (candidateCost < currentCost || (nextHops[neighbour][dest] === router && candidateCost != currentCost)) {
                        distVectors[neighbour][dest] = candidateCost;
                        nextHops[neighbour][dest] = router;

                        updatedRoutes.push({
                            destination: dest,
                            oldCost: currentCost,
                            newCost: candidateCost, 
                            nextHop: router
                        });

                        totalUpdates++;
                        changed = true;
                    }
                }

                if (updatedRoutes.length > 0) {
                    steps.push({
                        type: "update",
                        round,
                        router: neighbour,
                        neighbour: router,
                        packet: structuredClone(packet),
                        distVectors: snapshotDistVectors(distVectors),
                        routingTables: snapshotRoutingTables(buildRoutingTables(distVectors, nextHops)),
                        updatedRoutes
                    });
                }
            }
        }

        if (!changed) {
            converged = true;

            steps.push({
                type: "converge",
                round,
                router: null,
                neighbour: null,
                packet: null,
                distVectors: snapshotDistVectors(distVectors),
                routingTables: snapshotRoutingTables(buildRoutingTables(distVectors, nextHops)),
                updatedRoutes: []
            });

            lastRound = round;

            break;
        }
    }

    if (!converged) {
        steps.push({
            type: "count_to_infinity",
            lastRound,
            router: null,
            neighbour: null,
            packet: null,
            distVectors: snapshotDistVectors(distVectors),
            routingTables: snapshotRoutingTables(buildRoutingTables(distVectors, nextHops)),
            updatedRoutes: []
        });
    }

    const routingTables = buildRoutingTables(distVectors, nextHops);

    return {
        routingTables,
        converged,
        steps,
        meta: {
            rounds: converged ? steps[steps.length - 1].round : maxRounds,
            totalMessages,
            totalUpdates,
            converged
        }
    };
}
