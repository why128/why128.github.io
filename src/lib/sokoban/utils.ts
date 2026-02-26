import { TileType } from './game';

// 瓦片类型到 CSS 类的映射结果
export type TileClass = '' | 'wall' | 'target' | 'box' | 'box-on-target' | 'player' | 'player-on-target';

// 瓦片类型到 CSS 类的映射
export function getTileClass(tile: number): TileClass {
    const classMap: Record<number, TileClass> = {
        [TileType.EMPTY]: '',
        [TileType.WALL]: 'wall',
        [TileType.TARGET]: 'target',
        [TileType.BOX]: 'box',
        [TileType.BOX_ON_TARGET]: 'box-on-target',
        [TileType.PLAYER]: 'player',
        [TileType.PLAYER_ON_TARGET]: 'player-on-target'
    };

    return classMap[tile] || '';
}

// 瓦片类型到显示字符的映射（用于调试）
export function getTileChar(tile: number): string {
    const charMap: Record<number, string> = {
        [TileType.EMPTY]: ' ',
        [TileType.WALL]: '█',
        [TileType.TARGET]: '·',
        [TileType.BOX]: '□',
        [TileType.BOX_ON_TARGET]: '■',
        [TileType.PLAYER]: '♂',
        [TileType.PLAYER_ON_TARGET]: '★'
    };

    return charMap[tile] || '?';
}

// 方向到中文名称的映射
export function getDirectionName(direction: string): string {
    const nameMap: Record<string, string> = {
        'up': '上',
        'down': '下',
        'left': '左',
        'right': '右'
    };

    return nameMap[direction] || direction;
}

// 格式化移动次数
export function formatMoves(moves: number): string {
    return moves.toString().padStart(3, '0');
}

// 获取关卡进度
export function getProgress(currentLevel: number, totalLevels: number): string {
    const progress = (currentLevel + 1) / totalLevels * 100;
    return progress.toFixed(0);
}

// 验证关卡数据
export function validateLevel(level: unknown): level is { name: string; map: number[][] } {
    if (typeof level !== 'object' || level === null) {
        return false;
    }

    const levelObj = level as Record<string, unknown>;

    if (typeof levelObj.name !== 'string') {
        return false;
    }

    if (!Array.isArray(levelObj.map)) {
        return false;
    }

    for (const row of levelObj.map) {
        if (!Array.isArray(row)) {
            return false;
        }
        for (const cell of row) {
            if (typeof cell !== 'number' || cell < 0 || cell > 6) {
                return false;
            }
        }
    }

    return true;
}

// 计算地图尺寸
export function getMapSize(map: number[][]): { width: number; height: number } {
    const height = map.length;
    const width = map.length > 0 ? Math.max(...map.map(row => row.length)) : 0;

    return { width, height };
}

// 统计关卡信息
export function getLevelStats(map: number[][]): {
    boxes: number;
    targets: number;
    playerCount: number;
} {
    let boxes = 0;
    let targets = 0;
    let playerCount = 0;

    for (const row of map) {
        for (const cell of row) {
            switch (cell) {
                case TileType.BOX:
                case TileType.BOX_ON_TARGET:
                    boxes++;
                    break;
                case TileType.TARGET:
                case TileType.BOX_ON_TARGET:
                case TileType.PLAYER_ON_TARGET:
                    targets++;
                    break;
                case TileType.PLAYER:
                case TileType.PLAYER_ON_TARGET:
                    playerCount++;
                    break;
            }
        }
    }

    return { boxes, targets, playerCount };
}