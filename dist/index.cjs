"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  PaddleGame: () => PaddleGame,
  SnakeGame: () => SnakeGame
});
module.exports = __toCommonJS(index_exports);

// src/core/overlay.ts
var Overlay = class {
  ctx;
  canvas;
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }
  show(message, subMessage) {
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
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  // New method to hide the overlay
  hide() {
    this.clear();
  }
  showStart(subMessage = "Press Enter or Space to Start") {
    this.show("Snake Game", subMessage);
  }
  showGameOver(score) {
    const msg = score !== void 0 ? `Score: ${score} | Press Enter or Space to Restart` : "Press Enter or Space to Restart";
    this.show("Game Over!", msg);
  }
  showPause() {
    this.show("Paused", "Press P to Resume");
  }
};

// src/games/snake/index.ts
var SnakeGame = class {
  constructor(container) {
    this.container = container;
    this.canvas = document.createElement("canvas");
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.overlay = new Overlay(this.canvas);
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
    this.handleInput = this.handleInput.bind(this);
    document.addEventListener("keydown", this.handleInput);
    this.resetState();
  }
  canvas;
  ctx;
  overlay;
  gridSize = 20;
  snake = [{ x: 5, y: 5 }];
  direction = { x: 1, y: 0 };
  food = { x: 10, y: 10 };
  intervalId = null;
  speed = 100;
  // 🔥 start speed (ms per move)
  minSpeed = 40;
  // 🔥 cap so it doesn’t get too fast
  isGameOver = false;
  isRunning = false;
  score = 0;
  resizeCanvas() {
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
  }
  resetState() {
    this.snake = [{ x: 5, y: 5 }];
    this.direction = { x: 1, y: 0 };
    this.score = 0;
    this.isGameOver = false;
    this.isRunning = false;
    this.speed = 100;
    this.spawnFood();
  }
  startLoop() {
    this.stop();
    this.intervalId = window.setInterval(() => this.update(), this.speed);
  }
  /** Private internal start logic */
  startGame() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.startLoop();
    this.overlay.hide();
  }
  /** Exposed method to satisfy Game interface */
  start() {
    this.startGame();
  }
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  destroy() {
    this.stop();
    document.removeEventListener("keydown", this.handleInput);
    this.container.removeChild(this.canvas);
  }
  handleInput(e) {
    if (!this.isRunning && (e.key === "Enter" || e.key === " ")) {
      this.startGame();
      return;
    }
    if (this.isGameOver && (e.key === "Enter" || e.key === " ")) {
      this.resetState();
      this.startGame();
      return;
    }
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
  gridCols() {
    return Math.floor(this.canvas.width / this.gridSize);
  }
  gridRows() {
    return Math.floor(this.canvas.height / this.gridSize);
  }
  update() {
    if (!this.isRunning || this.isGameOver) return;
    const cols = this.gridCols();
    const rows = this.gridRows();
    const head = {
      x: (this.snake[0].x + this.direction.x + cols) % cols,
      y: (this.snake[0].y + this.direction.y + rows) % rows
    };
    if (this.snake.some((p) => p.x === head.x && p.y === head.y)) {
      this.gameOver();
      return;
    }
    this.snake.unshift(head);
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score++;
      this.spawnFood();
      this.speed = Math.max(this.minSpeed, this.speed * 0.95);
      this.startLoop();
    } else {
      this.snake.pop();
    }
    this.draw();
  }
  spawnFood() {
    const cols = this.gridCols();
    const rows = this.gridRows();
    let newFood;
    do {
      newFood = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) };
    } while (this.snake.some((p) => p.x === newFood.x && p.y === newFood.y));
    this.food = newFood;
  }
  gameOver() {
    this.stop();
    this.isGameOver = true;
    this.isRunning = false;
    this.overlay.showGameOver(this.score);
  }
  render() {
    if (this.isRunning) {
      this.draw();
    } else if (this.isGameOver) {
      this.overlay.showGameOver(this.score);
    } else {
      this.overlay.showStart();
    }
    requestAnimationFrame(() => this.render());
  }
  draw() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "lime";
    for (const part of this.snake) {
      this.ctx.fillRect(
        part.x * this.gridSize,
        part.y * this.gridSize,
        this.gridSize - 2,
        this.gridSize - 2
      );
    }
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(
      this.food.x * this.gridSize,
      this.food.y * this.gridSize,
      this.gridSize - 2,
      this.gridSize - 2
    );
    this.ctx.fillStyle = "white";
    this.ctx.font = "16px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText(`Score: ${this.score}`, 10, 20);
  }
};

// src/games/paddle/index.ts
var PaddleGame = class {
  constructor(container) {
    this.container = container;
    this.canvas = document.createElement("canvas");
    container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext("2d");
    this.overlay = new Overlay(this.canvas);
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
    this.handleInput = this.handleInput.bind(this);
    document.addEventListener("keydown", this.handleInput);
    this.resetState();
    requestAnimationFrame(() => this.render());
  }
  canvas;
  ctx;
  overlay;
  paddle;
  ball;
  isRunning = false;
  isGameOver = false;
  score = 0;
  resizeCanvas() {
    this.canvas.width = this.container.clientWidth;
    this.canvas.height = this.container.clientHeight;
    this.resetState();
  }
  resetState() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const paddleWidth = w / 6;
    const paddleHeight = 15;
    this.paddle = {
      x: w / 2 - paddleWidth / 2,
      y: h - 30,
      width: paddleWidth,
      height: paddleHeight
    };
    this.ball = {
      x: w / 2,
      y: h / 2,
      dx: 4 * (Math.random() > 0.5 ? 1 : -1),
      dy: -4,
      size: 10
    };
    this.isRunning = false;
    this.isGameOver = false;
    this.score = 0;
  }
  startGame() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.overlay.hide();
  }
  start() {
    this.startGame();
  }
  stop() {
    this.isRunning = false;
  }
  destroy() {
    this.stop();
    document.removeEventListener("keydown", this.handleInput);
    this.container.removeChild(this.canvas);
  }
  handleInput(e) {
    if (!this.isRunning && (e.key === "Enter" || e.key === " ")) {
      this.startGame();
      return;
    }
    if (this.isGameOver && (e.key === "Enter" || e.key === " ")) {
      this.resetState();
      this.startGame();
      return;
    }
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
  update() {
    if (!this.isRunning || this.isGameOver) return;
    this.ball.x += this.ball.dx;
    this.ball.y += this.ball.dy;
    if (this.ball.x < 0 || this.ball.x > this.canvas.width - this.ball.size) {
      this.ball.dx *= -1;
    }
    if (this.ball.y < 0) {
      this.ball.dy *= -1;
    }
    if (this.ball.y + this.ball.size >= this.paddle.y && this.ball.x >= this.paddle.x && this.ball.x <= this.paddle.x + this.paddle.width) {
      this.ball.dy *= -1;
      this.score++;
      this.ball.dx *= 1.05;
      this.ball.dy *= 1.05;
    }
    if (this.ball.y > this.canvas.height) {
      this.gameOver();
    }
  }
  gameOver() {
    this.stop();
    this.isGameOver = true;
    this.overlay.showGameOver(this.score);
  }
  render() {
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
  draw() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "blue";
    this.ctx.fillRect(
      this.paddle.x,
      this.paddle.y,
      this.paddle.width,
      this.paddle.height
    );
    this.ctx.fillStyle = "red";
    this.ctx.fillRect(
      this.ball.x,
      this.ball.y,
      this.ball.size,
      this.ball.size
    );
    this.ctx.fillStyle = "white";
    this.ctx.font = "16px Arial";
    this.ctx.fillText(`Score: ${this.score}`, 10, 20);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PaddleGame,
  SnakeGame
});
