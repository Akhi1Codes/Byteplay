import { Game } from "../../core/types";
import { Overlay } from "../../core/overlay";

type Position = { x: number; y: number };

export class SnakeGame implements Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private overlay: Overlay;
  private gridSize = 20;

  private snake: Position[] = [{ x: 5, y: 5 }];
  private direction: Position = { x: 1, y: 0 };
  private food: Position = { x: 10, y: 10 };

  private intervalId: number | null = null;
  private isGameOver = false;
  private isRunning = false;
  private score = 0;

  constructor(private container: HTMLElement) {
    this.canvas = document.createElement("canvas");
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d")!;
    this.overlay = new Overlay(this.canvas);

    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());

    this.handleInput = this.handleInput.bind(this);
    document.addEventListener("keydown", this.handleInput);

    this.resetState();
  }

  private resizeCanvas(): void {
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
  }

  private resetState(): void {
    this.snake = [{ x: 5, y: 5 }];
    this.direction = { x: 1, y: 0 };
    this.score = 0;
    this.isGameOver = false;
    this.isRunning = false;
    this.spawnFood();
  }

  /** Private internal start logic */
  private startGame(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.intervalId = window.setInterval(() => this.update(), 100);
    this.overlay.hide();
  }

  /** Exposed method to satisfy Game interface */
  public start(): void {
    this.startGame();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  destroy(): void {
    this.stop();
    document.removeEventListener("keydown", this.handleInput);
    this.container.removeChild(this.canvas);
  }

  private handleInput(e: KeyboardEvent): void {
    // Start game from overlay
    if (!this.isRunning && (e.key === "Enter" || e.key === " ")) {
      this.startGame();
      return;
    }

    // Restart after game over
    if (this.isGameOver && (e.key === "Enter" || e.key === " ")) {
      this.resetState();
      this.startGame();
      return;
    }

    // Movement controls (no reversing)
    switch (e.key) {
      case "ArrowUp":
        if (this.direction.y === 0) this.direction = { x: 0, y: -1 };
        break;
      case "ArrowDown":
        if (this.direction.y === 0) this.direction = { x: 0, y: 1 };
        break;
      case "ArrowLeft":
        if (this.direction.x === 0) this.direction = { x: -1, y: 0 };
        break;
      case "ArrowRight":
        if (this.direction.x === 0) this.direction = { x: 1, y: 0 };
        break;
    }
  }

  private gridCols(): number {
    return Math.floor(this.canvas.width / this.gridSize);
  }

  private gridRows(): number {
    return Math.floor(this.canvas.height / this.gridSize);
  }

  private update(): void {
    if (!this.isRunning || this.isGameOver) return;

    const cols = this.gridCols();
    const rows = this.gridRows();

    const head: Position = {
      x: (this.snake[0].x + this.direction.x + cols) % cols,
      y: (this.snake[0].y + this.direction.y + rows) % rows,
    };

    // Collision with tail
    if (this.snake.some((p) => p.x === head.x && p.y === head.y)) {
      this.gameOver();
      return;
    }

    this.snake.unshift(head);

    if (head.x === this.food.x && head.y === this.food.y) {
      this.score++;
      this.spawnFood();
    } else {
      this.snake.pop();
    }

    this.draw();
  }

  private spawnFood(): void {
    const cols = this.gridCols();
    const rows = this.gridRows();
    let newFood: Position;
    do {
      newFood = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
    } while (this.snake.some((p) => p.x === newFood.x && p.y === newFood.y));
    this.food = newFood;
  }

  private gameOver(): void {
    this.stop();
    this.isGameOver = true;
    this.isRunning = false;
    this.overlay.showGameOver(this.score);
  }

  // This is the new, main render loop.
  // It handles the initial screen, game over screen, and in-game rendering.
  public render(): void {
    if (this.isRunning) {
      this.draw();
    } else if (this.isGameOver) {
      this.overlay.showGameOver(this.score);
    } else {
      // Show start overlay when not running and not game over
      this.overlay.showStart();
    }
    
    requestAnimationFrame(() => this.render());
  }

  private draw(): void {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw snake
    this.ctx.fillStyle = "lime";
    for (const part of this.snake) {
      this.ctx.fillRect(
        part.x * this.gridSize,
        part.y * this.gridSize,
        this.gridSize - 2,
        this.gridSize - 2
      );
    }

    // Draw food
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(
      this.food.x * this.gridSize,
      this.food.y * this.gridSize,
      this.gridSize - 2,
      this.gridSize - 2
    );

    // Draw score
    this.ctx.fillStyle = "white";
    this.ctx.font = "16px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText(`Score: ${this.score}`, 10, 20);
  }
}