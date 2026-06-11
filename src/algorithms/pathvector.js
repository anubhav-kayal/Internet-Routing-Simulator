export function pathVector(graph, options = {}) {
    const { maxRounds = 50 } = options;

    const routers = Object.keys(graph);
    const snapshotRoutingTables = (routingTables) => {
        const snap = {};
        for (const router of routers) {
            snap[router] = {};
            for (const dest of Object.keys(routingTables[router])) {
                const entry = routingTables[router][dest];
                snap[router][dest] = {
                    cost: entry.cost,
                    next: entry.next,
                    path: [...entry.path]
                };
            }
        }
        return snap;
    };
    const snapshotPacket = (packet) => {
        if (packet === null) return null;
        const snap = {};
        for (const dest of Object.keys(packet)) {
            snap[dest] = {
                cost: packet[dest].cost,
                path: [...packet[dest].path]
            };
        }
        return snap;
    };
    const steps = [];
    const routingTables = {};

    let totalMessages = 0;
    let totalUpdates  = 0;
    let converged     = false;

    for (const router of routers) {
        routingTables[router] = {};
        for (const dest of routers) {
            routingTables[router][dest] = { cost: Infinity, next: null, path: [] };
        }
        routingTables[router][router] = { cost: 0, next: null, path: [router] };
        for (const edge of graph[router] || []) {
            routingTables[router][edge.to] = {
                cost: edge.weight,
                next: edge.to,
                path: [router, edge.to]
            };
        }
    }

    for (const router of routers) {
        steps.push({
            type:          "init",
            round:         0,
            router,
            neighbour:     null,
            packet:        null,
            routingTables: snapshotRoutingTables(routingTables),
            updatedRoutes: [],
            rejectedPaths: []
        });
    }

    let lastRound = maxRounds;

    for (let round = 1; round <= maxRounds; round++) {
        let changed = false;

        for (const router of routers) {
            for (const neighbourEdge of graph[router] || []) {
                const neighbour = neighbourEdge.to;
                const returnEdge = (graph[neighbour] || []).find(e => e.to === router);
                if (!returnEdge) continue;
                const linkCost = returnEdge.weight;
                const packet = {};

                for (const dest of routers) {
                    const entry = routingTables[router][dest];
                    if (entry.cost === Infinity) continue;

                    packet[dest] = {
                        cost: entry.cost,
                        path: [...entry.path]
                    };
                }

                totalMessages++;

                steps.push({
                    type:          "advertise",
                    round,
                    router,
                    neighbour,
                    packet:        snapshotPacket(packet),
                    routingTables: snapshotRoutingTables(routingTables),
                    updatedRoutes: [],
                    rejectedPaths: []
                });

                steps.push({
                    type:          "receive",
                    round,
                    router:        neighbour,
                    neighbour:     router,
                    packet:        snapshotPacket(packet),
                    routingTables: snapshotRoutingTables(routingTables),
                    updatedRoutes: [],
                    rejectedPaths: []
                });

                const updatedRoutes = [];
                const rejectedPaths = [];

                for (const dest of routers) {
                    if (dest === neighbour) continue;

                    const advertisedEntry = packet[dest];

                    if (!advertisedEntry) continue;

                    const advertisedPath = advertisedEntry.path;
                    const advertisedCost = advertisedEntry.cost;

                    if (advertisedPath.includes(neighbour)) {
                        rejectedPaths.push({
                            destination: dest,
                            path:        [...advertisedPath],
                            reason:      "loop"
                        });
                        continue;
                    }
                    const candidatePath = [neighbour, ...advertisedPath];
                    const candidateCost = linkCost + advertisedCost;

                    const current = routingTables[neighbour][dest];

                    const strictlyBetter = candidateCost < current.cost;
                    const equalButShorter = (
                        candidateCost === current.cost &&
                        current.path.length > 0 &&
                        candidatePath.length < current.path.length
                    );

                    if (strictlyBetter || equalButShorter) {
                        const oldCost = current.cost;
                        const oldPath = [...current.path];

                        routingTables[neighbour][dest] = {
                            cost: candidateCost,
                            next: router,
                            path: candidatePath
                        };

                        updatedRoutes.push({
                            destination: dest,
                            oldCost,
                            oldPath,
                            newCost: candidateCost,
                            newPath: [...candidatePath],
                            nextHop: router
                        });

                        totalUpdates++;
                        changed = true;
                    }
                }

                if (rejectedPaths.length > 0) {
                    steps.push({
                        type:          "reject",
                        round,
                        router:        neighbour,
                        neighbour:     router,
                        packet:        snapshotPacket(packet),
                        routingTables: snapshotRoutingTables(routingTables),
                        updatedRoutes: [],
                        rejectedPaths
                    });
                }

                if (updatedRoutes.length > 0) {
                    steps.push({
                        type:          "update",
                        round,
                        router:        neighbour,
                        neighbour:     router,
                        packet:        snapshotPacket(packet),
                        routingTables: snapshotRoutingTables(routingTables),
                        updatedRoutes,
                        rejectedPaths: []
                    });
                }
            }
        }

        if (!changed) {
            converged = true;

            steps.push({
                type:          "converge",
                round,
                router:        null,
                neighbour:     null,
                packet:        null,
                routingTables: snapshotRoutingTables(routingTables),
                updatedRoutes: [],
                rejectedPaths: []
            });

            lastRound = round;
            break;
        }
    }

    if (!converged) {
        steps.push({
            type:          "no_convergence",
            round:         maxRounds,
            router:        null,
            neighbour:     null,
            packet:        null,
            routingTables: snapshotRoutingTables(routingTables),
            updatedRoutes: [],
            rejectedPaths: []
        });
    }

    return {
        routingTables,
        converged,
        steps,
        meta: {
            rounds:        lastRound,
            totalMessages,
            totalUpdates,
            converged
        }
    };
}