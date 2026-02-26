// 游戏状态枚举
export enum GameState {
    IDLE = 'idle',
    PLAYING = 'playing',
    WON = 'won',
    FAILED = 'failed',
    FINISHED = 'finished'
}

// 方向枚举
export enum Direction {
    UP = 'up',
    DOWN = 'down',
    LEFT = 'left',
    RIGHT = 'right'
}

// 地图元素类型枚举
export enum TileType {
    EMPTY = 0,
    WALL = 1,
    TARGET = 2,
    BOX = 3,
    BOX_ON_TARGET = 4,
    PLAYER = 5,
    PLAYER_ON_TARGET = 6
}

// 关卡数据类型
export interface LevelData {
    name: string;
    map: number[][];
}

// 位置接口
export interface Position {
    x: number;
    y: number;
}

// 游戏状态快照接口（用于撤回功能）
export interface GameSnapshot {
    grid: number[][];
    playerPos: Position;
    moves: number;
}

// 推箱子游戏类
export class SokobanGame {
    private levelData: LevelData[];
    private currentLevel: number;
    private grid: number[][];
    private playerPos: Position;
    private moves: number;
    private history: GameSnapshot[];
    private state: GameState;
    private readonly maxHistoryLength: number = 100;

    constructor(levelData: LevelData[]) {
        this.levelData = levelData;
        this.currentLevel = 0;
        this.grid = [];
        this.playerPos = { x: 0, y: 0 };
        this.moves = 0;
        this.history = [];
        this.state = GameState.IDLE;

        this.loadLevel(this.currentLevel);
    }

    // 加载关卡
    public loadLevel(levelIndex: number): boolean {
        if (levelIndex < 0 || levelIndex >= this.levelData.length) {
            console.error(`Invalid level index: ${levelIndex}`);
            return false;
        }

        this.currentLevel = levelIndex;
        this.grid = JSON.parse(JSON.stringify(this.levelData[levelIndex].map));
        this.moves = 0;
        this.history = [];
        this.findPlayer();
        this.state = GameState.PLAYING;

        console.log(`Loaded level ${levelIndex + 1}: ${this.levelData[levelIndex].name}`);

        return true;
    }

    // 找到玩家位置
    private findPlayer(): void {
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                if (this.isPlayer(this.grid[y][x])) {
                    this.playerPos = { x, y };
                    return;
                }
            }
        }
        console.warn('Player not found in level map');
    }

    // 检查是否是玩家
    private isPlayer(tile: number): boolean {
        return tile === TileType.PLAYER || tile === TileType.PLAYER_ON_TARGET;
    }

    // 检查是否是箱子
    private isBox(tile: number): boolean {
        return tile === TileType.BOX || tile === TileType.BOX_ON_TARGET;
    }

    // 检查是否是目标点
    private isTarget(tile: number): boolean {
        return tile === TileType.TARGET ||
            tile === TileType.BOX_ON_TARGET ||
            tile === TileType.PLAYER_ON_TARGET;
    }

    // 检查位置是否有效
    private isValidPosition(x: number, y: number): boolean {
        return y >= 0 &&
            y < this.grid.length &&
            x >= 0 &&
            x < this.grid[y].length;
    }

    // 移动玩家
    public move(direction: Direction): boolean {
        // console.log(`Moving player in direction: ${direction}`);
        console.log(`Current game state: ${this.state}`);
        if (this.state !== GameState.PLAYING) {
            console.warn('Cannot move: game is not in playing state');
            return false;
        }

        const delta = this.getDirectionDelta(direction);
        const newX = this.playerPos.x + delta.x;
        const newY = this.playerPos.y + delta.y;
        const nextX = newX + delta.x;
        const nextY = newY + delta.y;

        // 检查边界
        if (!this.isValidPosition(newX, newY)) {
            return false;
        }

        const currentTile = this.grid[newY][newX];
        const nextTile = this.isValidPosition(nextX, nextY)
            ? this.grid[nextY][nextX]
            : null;

        // 保存当前状态用于撤回
        this.saveState();

        // 计算新瓦片值
        let newCurrentTile: number = currentTile;
        let newNextTile: number | null = nextTile;

        if (this.isBox(currentTile)) {
            // 推箱子
            if (nextTile === null || nextTile === TileType.WALL || this.isBox(nextTile)) {
                // 不能推动
                this.history.pop(); // 撤销保存的状态
                return false;
            }

            // 移动箱子
            newNextTile = this.isTarget(nextTile) ? TileType.BOX_ON_TARGET : TileType.BOX;
            newCurrentTile = this.isTarget(currentTile) ? TileType.TARGET : TileType.EMPTY;
        } else if (currentTile === TileType.WALL) {
            return false;
        }

        // 更新玩家原位置
        this.updatePlayerPosition(newCurrentTile);

        // 更新新位置
        this.grid[newY][newX] = this.isTarget(newCurrentTile)
            ? TileType.PLAYER_ON_TARGET
            : TileType.PLAYER;

        // 更新箱子位置
        if (newNextTile !== null) {
            this.grid[nextY][nextX] = newNextTile;
        }

        this.playerPos = { x: newX, y: newY };
        this.moves++;

        // 检查是否获胜
        if (this.checkWin()) {
            this.state = GameState.WON;
            console.log(`Level ${this.currentLevel + 1} completed in ${this.moves} moves!`);
        }

        return true;
    }

    // 获取方向移动增量
    private getDirectionDelta(direction: Direction): Position {
        switch (direction) {
            case Direction.UP:
                return { x: 0, y: -1 };
            case Direction.DOWN:
                return { x: 0, y: 1 };
            case Direction.LEFT:
                return { x: -1, y: 0 };
            case Direction.RIGHT:
                return { x: 1, y: 0 };
            default:
                return { x: 0, y: 0 };
        }
    }

    // 更新玩家位置
    private updatePlayerPosition(newCurrentTile: number): void {
        if (this.isTarget(this.grid[this.playerPos.y][this.playerPos.x])) {
            this.grid[this.playerPos.y][this.playerPos.x] = TileType.TARGET;
        } else {
            this.grid[this.playerPos.y][this.playerPos.x] = TileType.EMPTY;
        }
    }

    // 保存状态
    private saveState(): void {
        const snapshot: GameSnapshot = {
            grid: JSON.parse(JSON.stringify(this.grid)),
            playerPos: { ...this.playerPos },
            moves: this.moves
        };

        this.history.push(snapshot);

        // 限制历史记录数量，防止内存溢出
        if (this.history.length > this.maxHistoryLength) {
            this.history.shift();
        }
    }

    // 撤回
    public undo(): boolean {
        if (this.history.length === 0 || this.state !== GameState.PLAYING) {
            console.warn('Cannot undo: no history or game not in playing state');
            return false;
        }

        const state = this.history.pop();
        if (state) {
            this.grid = state.grid;
            this.playerPos = state.playerPos;
            this.moves = state.moves;
            return true;
        }

        return false;
    }

    // 检查是否获胜
    private checkWin(): boolean {
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                if (this.grid[y][x] === TileType.TARGET ||
                    this.grid[y][x] === TileType.PLAYER_ON_TARGET) {
                    // 还有未覆盖的目标点
                    return false;
                }
            }
        }
        return true;
    }

    // 重置当前关卡
    public reset(): void {
        this.loadLevel(this.currentLevel);
    }

    // 获取提示
    public getHint(): string {
        // 简单的提示：找到最近的未覆盖目标点
        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                if (this.grid[y][x] === TileType.TARGET) {
                    return `将箱子推到位置 (${x + 1}, ${y + 1})`;
                }
            }
        }
        return '没有找到目标点';
    }

    // Getter 方法
    public getCurrentLevel(): number {
        return this.currentLevel;
    }

    public getTotalLevels(): number {
        return this.levelData.length;
    }

    public getMoves(): number {
        return this.moves;
    }

    public getState(): GameState {
        return this.state;
    }

    public getGrid(): number[][] {
        return this.grid;
    }

    public getPlayerPos(): Position {
        return { ...this.playerPos };
    }

    public canUndo(): boolean {
        return this.history.length > 0 && this.state === GameState.PLAYING;
    }

    public isPlaying(): boolean {
        return this.state === GameState.PLAYING;
    }

    public hasWon(): boolean {
        return this.state === GameState.WON;
    }
}