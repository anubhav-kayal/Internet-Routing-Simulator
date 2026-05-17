export class Renderer {
    constructor(ctx, canvasWidth, canvasHeight) {
        this.ctx = ctx;
        this.width = canvasWidth;
        this.height = canvasHeight;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    drawTestRouter(x, y, label) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2); // 20px radius
        this.ctx.fillStyle = '#007BFF'; // Standard blue
        this.ctx.fill();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#0056b3';
        this.ctx.stroke();

        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(label, x, y);
    }
}