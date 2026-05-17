import{ 
    Renderer
}
from './Renderer.js';

export class SimulationEngine {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize our helper classes
        this.renderer = new Renderer(this.ctx, this.canvas.width, this.canvas.height);
        
        this.nodes = [];
        this.edges = [];
        
        console.log("Canvas Engine & Renderer Initialized!");
    }

    renderTestEnvironment() {
        this.renderer.clear();
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.renderer.drawTestRouter(centerX, centerY, "R1");
    }
}