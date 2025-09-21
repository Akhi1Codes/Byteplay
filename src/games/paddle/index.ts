import { Game } from "../../core/types";
import { Overlay } from "../../core/overlay";

type Paddle = { x: number; y: number; width: number; height: number };
type Ball = { x: number; y: number; dx: number; dy: number; size: number };

export class PaddleGame implements Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private overlay: Overlay;

  private paddle!: Paddle;
  private ball!: Ball;

  private isRunning = false;
  private isGameOver = false;
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

    // Start the render loop (runs continuously)
    requestAnimationFrame(() => this.render());
  }

  private resizeCanvas(): void {
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
    this.resetState();
  }

  private resetState(): void {
    const w = this.canvas.width;
    const h = this.canvas.height;

    const paddleWidth = w / 6;
    const paddleHeight = 15;

    this.paddle = {
      x: w / 2 - paddleWidth / 2,
      y: h - 30,
      width: paddleWidth,
      height: paddleHeight,
    };

    this.ball = {
      x: w / 2,
      y: h / 2,
      dx: 4 * (Math.random() > 0.5 ? 1 : -1),
      dy: -4,
      size: 10,
    };

    this.isRunning = false;
    this.isGameOver = false;
    this.score = 0;
  }

  private startGame(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.overlay.hide();
  }

  public start(): void {
    this.startGame();
  }

  public stop(): void {
    this.isRunning = false;
  }

  public destroy(): void {
    this.stop();
    document.removeEventListener("keydown", this.handleInput);
    this.container.removeChild(this.canvas);
  }

  private handleInput(e: KeyboardEvent): void {
    // start game
    if (!this.isRunning && (e.key === "Enter" || e.key === " ")) {
      this.startGame();
      return;
    }

    // restart after game over
    if (this.isGameOver && (e.key === "Enter" || e.key === " ")) {
      this.resetState();
      this.startGame();
      return;
    }

    // move paddle
    const step = 20;
    if (e.key === "ArrowLeft") {
      this.paddle.x = Math.max(0, this.paddle.x - step);
    }
    if (e.key === "ArrowRight") {
      this.paddle.x = Math.min(
        this.canvas.width - this.paddle.width,
        this.paddle.x + step
      );
    }
  }

  private update(): void {
    if (!this.isRunning || this.isGameOver) return;

    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;

    // bounce walls
    if (this.ball.x < 0 || this.ball.x > this.canvas.width - this.ball.size) {
      this.ball.dx *= -1;
    }
    if (this.ball.y < 0) {
      this.ball.dy *= -1;
    }

    // paddle collision
    if (
      this.ball.y + this.ball.size >= this.paddle.y &&
      this.ball.x >= this.paddle.x &&
      this.ball.x <= this.paddle.x + this.paddle.width
    ) {
      this.ball.dy *= -1;
      this.score++;

      // 🔥 speed up slightly each time paddle is hit
      this.ball.dx *= 1.05;
      this.ball.dy *= 1.05;
    }

    // game over if ball falls
    if (this.ball.y > this.canvas.height) {
      this.gameOver();
    }
  }

  private gameOver(): void {
    this.stop();
    this.isGameOver = true;
    this.overlay.showGameOver(this.score);
  }

  private render(): void {
    if (this.isRunning) {
      this.update();
      this.draw();
    } else if (this.isGameOver) {
      this.overlay.showGameOver(this.score);
    } else {
      this.overlay.showStart();
    }

    requestAnimationFrame(() => this.render());
  }

  private draw(): void {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // paddle
    this.ctx.fillStyle = "blue";
    this.ctx.fillRect(
      this.paddle.x,
      this.paddle.y,
      this.paddle.width,
      this.paddle.height
    );

    // ball
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(
      this.ball.x,
      this.ball.y,
      this.ball.size,
      this.ball.size
    );

    // score
    this.ctx.fillStyle = "white";
    this.ctx.font = "16px Arial";
    this.ctx.fillText(`Score: ${this.score}`, 10, 20);
  }
}
