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
    private isGameOver;
    private isRunning;
    private score;
    constructor(container: HTMLElement);
    private resizeCanvas;
    private resetState;
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

export { SnakeGame };
