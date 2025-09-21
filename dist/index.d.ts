interface Game {
    start(): void;
    stop?(): void;
}

declare class SnakeGame implements Game {
    private container;
    private canvas;
    private ctx;
    private overlay;
    private gridSize;
    private snake;
    private direction;
    private food;
    private intervalId;
    private speed;
    private minSpeed;
    private isGameOver;
    private isRunning;
    private score;
    constructor(container: HTMLElement);
    private resizeCanvas;
    private resetState;
    private startLoop;
    /** Private internal start logic */
    private startGame;
    /** Exposed method to satisfy Game interface */
    start(): void;
    stop(): void;
    destroy(): void;
    private handleInput;
    private gridCols;
    private gridRows;
    private update;
    private spawnFood;
    private gameOver;
    render(): void;
    private draw;
}

declare class PaddleGame implements Game {
    private container;
    private canvas;
    private ctx;
    private overlay;
    private paddle;
    private ball;
    private isRunning;
    private isGameOver;
    private score;
    constructor(container: HTMLElement);
    private resizeCanvas;
    private resetState;
    private startGame;
    start(): void;
    stop(): void;
    destroy(): void;
    private handleInput;
    private update;
    private gameOver;
    private render;
    private draw;
}

export { PaddleGame, SnakeGame };
