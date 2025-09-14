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
    this.spawnFood();
  }
  /** Private internal start logic */
  startGame() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.intervalId = window.setInterval(() => this.update(), 100);
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
  // This is the new, main render loop.
  // It handles the initial screen, game over screen, and in-game rendering.
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
export {
  SnakeGame
};
