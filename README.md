![ieeecs-template-header](https://github.com/user-attachments/assets/c3c40c85-51a2-4a5e-82a4-c32a0223e336)

<h1 align="center">Internet Routing Simulator</h1>

<h4 align="center">An interactive tool to visualize and understand network routing algorithms in real time.</h4>

---

## Overview

Modern networking concepts like routing algorithms are often abstract and difficult to visualize.

This project provides an **interactive simulation platform** where users can:

- Build custom network topologies  
- Simulate packet transmission  
- Visualize routing decisions step-by-step  

The goal is to bridge the gap between theory and practical understanding of how the internet routes data.

---

## Architecture Overview

The system is designed as a modular simulation engine with a visual frontend.

### Core Components

- **Frontend (React + Canvas)**  
  Handles UI, network creation, and real-time visualization  

- **Simulation Engine**  
  Implements routing algorithms and packet traversal logic  

- **Backend (Node.js)**  
  Manages configurations and API handling  

### Data Flow

1. User creates a network (graph)  
2. Graph is stored in application state  
3. User selects routing algorithm  
4. Simulation engine computes path  
5. Frontend animates packet traversal step-by-step  

### External Integrations

- None (fully self-contained)

---

## Tech Stack

| Layer        | Technology Used              |
|-------------|-----------------------------|
| Frontend    | React, HTML Canvas          |
| Backend     | Node.js                     |
| Database    | Not Required / Optional     |
| DevOps      | Docker                      |
| Other Tools | Graph Algorithms            |

---

## Project Structure

```bash
src/
├── components/       # UI components
├── canvas/           # Graph rendering & animations
├── algorithms/       # Routing algorithms
├── simulation/       # Packet simulation logic
├── services/         # API/state management
├── utils/            # Helper functions
├── routes/           # Backend routes
└── main.js           # Entry point
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd internet-routing-simulator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
```

Refer to `.env.example` for more details.

### 4. Run the Project

```bash
npm run dev
```

---

## Docker Setup

### Build Image

```bash
docker build -t internet-routing-simulator .
```

### Run Container

```bash
docker run -p 5000:5000 internet-routing-simulator
```

---

## Git Hooks Setup

```bash
git config core.hooksPath .hooks
```

This enables:
- Commit message validation  
- Blocking direct pushes to `main`  

---

## Environment Variables

| Variable Name | Description |
|--------------|------------|
| PORT         | Application port |
| API_KEY      | Optional third-party integrations |
| DATABASE_URL | Optional database connection |

---

## Features

### 1. Network Creation System
- Create routers (nodes)
- Connect routers via edges
- Assign weights (latency/cost)
- Dynamic and editable graph

### 2. Packet Simulation
- Select source and destination
- Visualize packet traversal
- Step-by-step animation

### 3. Routing Algorithms

#### Shortest Path
- Dijkstra’s Algorithm  
- Bellman-Ford Algorithm  

#### Routing Protocols
- Distance Vector Routing  
- Link State Routing  

### 4. Visualization
- Animated packet movement  
- Highlight active path  
- Real-time updates  

### 5. Advanced Simulation
- Packet loss simulation  
- Network congestion modeling  
- Latency visualization  

### 6. Algorithm Comparison Mode
- Compare multiple algorithms  
- Analyze path length, time, efficiency  
- Side-by-side visualization  

---

## Algorithms

- Graph Traversal  
- Dijkstra’s Algorithm  
- Bellman-Ford Algorithm  
- Distance Vector Routing  
- Link State Routing  

---

## Deployment

- Platform: Docker / Cloud (AWS, Vercel, etc.)

### Build Steps

```bash
npm install
npm run build
```

### Production Considerations

- Optimize rendering performance  
- Handle large graphs efficiently  
- Enable caching  

---

## Testing

```bash
npm test
```

---

## Non-Functional Considerations

- Smooth real-time animations  
- Efficient handling of large networks  
- Modular architecture  
- Intuitive UI/UX  

---

## Future Enhancements

- Support for protocols like OSPF and BGP  
- Live network data integration  
- Multi-user simulations  
- Performance benchmarking dashboard  

---

## Project Status

- 🟢 In Development  