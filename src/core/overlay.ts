export class Overlay {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
  }

  show(message: string, subMessage?: string): void {
    this.clear();
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "white";
    this.ctx.font = "28px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2 - 20);

    if (subMessage) {
      this.ctx.font = "20px Arial";
      this.ctx.fillText(subMessage, this.canvas.width / 2, this.canvas.height / 2 + 20);
    }
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // New method to hide the overlay
  hide(): void {
    this.clear();
  }

  showStart(subMessage: string = "Press Enter or Space to Start"): void {
    this.show("Snake Game", subMessage);
  }

  showGameOver(score?: number): void {
    const msg = score !== undefined ? `Score: ${score} | Press Enter or Space to Restart` : "Press Enter or Space to Restart";
    this.show("Game Over!", msg);
  }

  showPause(): void {
    this.show("Paused", "Press P to Resume");
  }
}