<script lang="ts">
    import { onMount, onDestroy, tick } from "svelte";
    import { SokobanGame, GameState, Direction } from "$lib/sokoban/game";
    import type { LevelData } from "$lib/sokoban/game";
    import { levels, totalLevels } from "$lib/sokoban/levels";
    import {
        getTileClass,
        getDirectionName,
        formatMoves,
        getProgress,
        getLevelStats,
        getMapSize,
    } from "$lib/sokoban/utils";
    import { TileType } from "$lib/sokoban/game";
    import Header from "@/views/header/Index.svelte";
    import Footer from "@/views/footer/Index.svelte";

    // 游戏实例
    let game: SokobanGame | null = null;
    let gameState: GameState = GameState.IDLE;
    let currentLevel: number = 0;
    let moves: number = 0;
    let showWinModal: boolean = false;
    let showHelp: boolean = false;

    // 用于强制重新渲染的版本号
    let renderVersion: number = 0;

    // 键盘事件处理函数
    function handleKeydown(event: KeyboardEvent): void {
        switch (event.key) {
            case "ArrowUp":
            case "w":
            case "W":
                event.preventDefault();
                handleMove(Direction.UP);
                break;
            case "ArrowDown":
            case "s":
            case "S":
                event.preventDefault();
                handleMove(Direction.DOWN);
                break;
            case "ArrowLeft":
            case "a":
            case "A":
                event.preventDefault();
                handleMove(Direction.LEFT);
                break;
            case "ArrowRight":
            case "d":
            case "D":
                event.preventDefault();
                handleMove(Direction.RIGHT);
                break;
            case "z":
            case "Z":
                if (event.ctrlKey) {
                    event.preventDefault();
                    handleUndo();
                }
                break;
            case "r":
            case "R":
                event.preventDefault();
                handleReset();
                break;
        }
    }

    // 初始化游戏
    onMount(() => {
        game = new SokobanGame(levels);

        // 初始加载第一关
        game.loadLevel(0);
        updateGameState();
        keydownHandler = handleKeydown;
        window.addEventListener("keydown", keydownHandler);

        return () => {
            if (keydownHandler) {
                window.removeEventListener("keydown", keydownHandler);
            }
        };
    });

    // 更新游戏状态
    function updateGameState(): void {
        if (!game) {
            console.warn("Game is null in updateGameState");
            return;
        }

        gameState = game.getState();
        currentLevel = game.getCurrentLevel();
        moves = game.getMoves();
        canUndo = game.canUndo();

        // 检查是否获胜
        checkWinCondition();
    }

    // 检查获胜条件
    function checkWinCondition(): void {
        if (game && game.getState() === GameState.WON) {
            // 延迟一小会儿弹出，让玩家看清最后一跳
            setTimeout(() => {
                showWinModal = true;
                playSound("win");
                // 必须同步底层状态
                gameState = GameState.FINISHED;
            }, 300);
        }
        if (!game || gameState !== GameState.PLAYING) return;

        const grid = game.getGrid();
        let hasUnfinishedBox = false;

        // 严谨校验：遍历整个网格
        for (const row of grid) {
            for (const cell of row) {
                // 如果网格中还存在普通的 BOX（不在目标点上的箱子），则未完成
                // 或者根据你的枚举逻辑，如果还存在普通的 TARGET（上面没有箱子），也可能未完成
                if (cell === TileType.BOX) {
                    hasUnfinishedBox = true;
                    break;
                }
            }
            if (hasUnfinishedBox) break;
        }

        // 如果没有“裸露”的箱子了，说明所有箱子都在目标点上（变成了 BOX_ON_TARGET）
        if (!hasUnfinishedBox && moves > 0) {
            // 延迟一小会儿弹出，让玩家看清最后一跳
            setTimeout(() => {
                showWinModal = true;
                playSound("win");
                // 必须同步底层状态
                gameState = GameState.FINISHED;
            }, 300);
        }
    }

    // 移动玩家
    function handleMove(direction: Direction): void {
        if (!game || showWinModal) return; // 如果胜利弹窗开着，禁止移动

        // 1. 执行移动
        const success = game.move(direction);

        if (success) {
            // 2. 播放音效
            playSound("move");

            // 3. 先更新数据（这会触发 gridData 的响应式刷新）
            updateGameState();

            // 4. 强制重绘，确保 UI 反应最快
            forceRerender();
        }
    }

    // 撤回
    function handleUndo(): void {
        if (!game) return;

        if (game.canUndo()) {
            const success = game.undo();
            if (success) {
                updateGameState();
                // ✅ 关键：撤销后也必须调用 forceRerender 刷新网格
                forceRerender();
                playSound("undo");
            }
        } else {
            console.warn("无法撤销：没有历史记录");
        }
    }

    // 重置关卡
    function handleReset(): void {
        if (!game) {
            console.warn("Game is not initialized");
            return;
        }

        game.reset();
        updateGameState();
        playSound("reset");
    }

    // 开始游戏
    function handleStart(): void {
        if (!game) {
            return;
        }
        game.loadLevel(0);

        tick().then(() => {
            updateGameState();
            // 强制重新渲染
            forceRerender();
        });

        playSound("start");
    }

    // 上一关
    function handlePrevLevel(): void {
        if (!game) {
            return;
        }

        const currentLvl = game.getCurrentLevel();

        if (currentLvl > 0) {
            game.loadLevel(currentLvl - 1);
            tick().then(() => {
                updateGameState();
                // 强制重新渲染
                forceRerender();
            });
        } else {
        }
    }

    // 下一关
    function handleNextLevel(): void {
        if (!game) {
            return;
        }
        const currentLvl = game.getCurrentLevel();
        if (currentLvl < levels.length - 1) {
            game.loadLevel(currentLvl + 1);
            tick().then(() => {
                updateGameState();
                // 强制重新渲染
                forceRerender();
            });
        } else {
        }
    }

    // 重玩第一关
    function handleRestartFromFirst(): void {
        if (!game) {
            return;
        }
        game.loadLevel(0);
        tick().then(() => {
            updateGameState();
            showWinModal = false;
            // 强制重新渲染
            forceRerender();
        });
    }

    // 继续游戏（胜利后）
    function handleContinue(): void {
        if (!game) return;

        const nextLvl = game.getCurrentLevel() + 1;

        if (nextLvl < levels.length) {
            game.loadLevel(nextLvl);
            showWinModal = false; // 关闭弹窗

            tick().then(() => {
                updateGameState();
                forceRerender();
            });
        } else {
            // 全部通关
            alert("恭喜通关全部关卡！");
            handleRestartFromFirst();
        }
    }

    // 强制重新渲染
    function forceRerender(): void {
        renderVersion++;
    }

    // 播放音效
    function playSound(
        type: "move" | "undo" | "reset" | "start" | "win",
    ): void {
        try {
            const AudioContextClass =
                window.AudioContext ||
                (
                    window as typeof window & {
                        webkitAudioContext: typeof AudioContext;
                    }
                ).webkitAudioContext;
            if (!AudioContextClass) return;

            const ctx = new AudioContextClass();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            const configs: Record<
                string,
                { freq: number; dur: number; type: OscillatorType }
            > = {
                move: { freq: 200, dur: 0.05, type: "sine" },
                undo: { freq: 150, dur: 0.05, type: "sine" },
                reset: { freq: 100, dur: 0.1, type: "square" },
                start: { freq: 440, dur: 0.15, type: "sine" },
                win: { freq: 523.25, dur: 0.3, type: "triangle" },
            };

            const config = configs[type];
            osc.type = config.type;
            osc.frequency.value = config.freq;
            gain.gain.value = 0.05;

            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + config.dur);

            setTimeout(() => ctx.close(), config.dur * 1000 + 100);
        } catch (e) {
            console.debug("Audio playback skipped:", e);
        }
    }

    // 监听键盘事件
    let keydownHandler: ((event: KeyboardEvent) => void) | null = null;

    // 获取关卡统计信息
    $: levelStats = game
        ? getLevelStats(game.getGrid())
        : { boxes: 0, targets: 0, playerCount: 0 };

    // 获取地图尺寸
    $: mapSize = game ? getMapSize(game.getGrid()) : { width: 0, height: 0 };

    // 检查游戏是否正在播放
    $: isPlaying = game ? game.getState() === GameState.PLAYING : false;

    // 检查是否可以撤回
    $: canUndo = game ? game.canUndo() : false;

    // ✅ 结合 renderVersion 确保每次操作（移动、撤回、重置）都能强制触发数组引用更新
    $: gridData = ((v) => {
        return game ? [...game.getGrid().map((row) => [...row])] : [];
    })(renderVersion);
</script>

<Header />
<div class="main sokoban-container">
    <div class="container">
        <!-- 游戏标题 -->
        <div class="game-header">
            <h1>🎮 推箱子游戏</h1>
            <p class="subtitle">将箱子推到目标点上即可过关</p>
        </div>

        <!-- 游戏信息栏 -->
        <div class="game-info">
            <div class="info-item">
                <span class="label">关卡:</span>
                <span class="value">{currentLevel + 1} / {totalLevels}</span>
            </div>
            <div class="info-item">
                <span class="label">步数:</span>
                <span class="value">{formatMoves(moves)}</span>
            </div>
            <div class="info-item progress-bar">
                <div
                    class="progress"
                    style="width: {getProgress(currentLevel, totalLevels)}%"
                ></div>
            </div>
        </div>

        <!-- 游戏控制按钮 -->
        <div class="control-buttons">
            <button class="btn btn-start" on:click={handleStart}>
                ▶️ 开始游戏
            </button>
            <button
                class="btn btn-undo"
                on:click={handleUndo}
                disabled={!canUndo}
            >
                ↩️ 撤回
            </button>
            <button
                class="btn btn-reset"
                on:click={handleReset}
                disabled={!isPlaying}
            >
                🔄 重置
            </button>
            <button
                class="btn btn-help"
                on:click={() => (showHelp = !showHelp)}
            >
                ❓ 帮助
            </button>
        </div>

        <!-- 帮助信息 -->
        {#if showHelp}
            <div class="help-panel">
                <h3>🎯 游戏说明</h3>
                <ul>
                    <li>
                        🎮 使用 <strong>方向键</strong> 或 <strong>WASD</strong>
                        控制角色移动
                    </li>
                    <li>
                        📦 将箱子 <strong>推</strong> 到目标点（绿色圆点）上
                    </li>
                    <li>⚠️ 箱子只能推，不能拉</li>
                    <li>
                        ↩️ 按 <strong>Ctrl+Z</strong> 或点击撤回按钮可以撤销操作
                    </li>
                    <li>
                        🔄 按 <strong>R</strong> 键或点击重置按钮重新开始当前关卡
                    </li>
                </ul>
                <h3>🎨 图例</h3>
                <div class="legend">
                    <span class="legend-item"
                        ><span class="legend-icon player"></span> 玩家</span
                    >
                    <span class="legend-item"
                        ><span class="legend-icon box"></span> 箱子</span
                    >
                    <span class="legend-item"
                        ><span class="legend-icon target"></span> 目标点</span
                    >
                    <span class="legend-item"
                        ><span class="legend-icon box-on-target"></span> 完成</span
                    >
                    <span class="legend-item"
                        ><span class="legend-icon wall"></span> 墙壁</span
                    >
                </div>
            </div>
        {/if}

        <!-- 游戏棋盘 -->
        <div class="game-board">
            <div class="grid">
                <!-- ✅ 正确的 each 语法：(index) 作为 key -->
                {#each gridData as row, y (y)}
                    <div class="row">
                        {#each row as tile, x (x)}
                            <div
                                class="cell {getTileClass(tile)}"
                                class:wall={tile === TileType.WALL}
                            >
                                {#if tile === TileType.WALL}
                                    <span class="wall-pattern">█</span>
                                {:else if tile === TileType.TARGET}
                                    <span class="target-marker">●</span>
                                {:else if tile === TileType.BOX}
                                    <span class="box-icon">📦</span>
                                {:else if tile === TileType.BOX_ON_TARGET}
                                    <span class="box-on-target-icon">✅</span>
                                {:else if tile === TileType.PLAYER}
                                    <span class="player-icon">😊</span>
                                {:else if tile === TileType.PLAYER_ON_TARGET}
                                    <span class="player-on-target-icon">🎉</span
                                    >
                                {/if}
                            </div>
                        {/each}
                    </div>
                {/each}
            </div>
        </div>

        <!-- 移动控制按钮（触屏友好） -->
        <div class="mobile-controls">
            <div class="control-row">
                <button
                    class="control-btn"
                    on:click={() => handleMove(Direction.UP)}
                >
                    ⬆️
                </button>
            </div>
            <div class="control-row">
                <button
                    class="control-btn"
                    on:click={() => handleMove(Direction.LEFT)}
                >
                    ⬅️
                </button>
                <button
                    class="control-btn"
                    on:click={handleUndo}
                    disabled={!canUndo}
                >
                    ↩️
                </button>
                <button
                    class="control-btn"
                    on:click={() => handleMove(Direction.RIGHT)}
                >
                    ➡️
                </button>
            </div>
            <div class="control-row">
                <button
                    class="control-btn"
                    on:click={() => handleMove(Direction.DOWN)}
                >
                    ⬇️
                </button>
            </div>
        </div>

        <!-- 关卡导航 -->
        <div class="level-navigation">
            <button
                class="btn btn-level"
                on:click={handlePrevLevel}
                disabled={currentLevel <= 0 || !isPlaying}
            >
                ⬅️ 上一关
            </button>
            <span class="level-indicator">第 {currentLevel + 1} 关</span>
            <button
                class="btn btn-level"
                on:click={handleNextLevel}
                disabled={currentLevel >= levels.length - 1 || !isPlaying}
            >
                下一关 ➡️
            </button>
        </div>
    </div>
</div>

<!-- 胜利弹窗 -->
{#if showWinModal}
    <div class="modal-overlay" on:click={() => (showWinModal = false)}>
        <div class="modal-content" on:click={(e) => e.stopPropagation()}>
            <div class="modal-header">
                <h2>🎉 恭喜过关！</h2>
            </div>
            <div class="modal-body">
                <p>
                    你用了 <strong>{moves}</strong> 步完成了第 {currentLevel +
                        1} 关！
                </p>
                <p class="modal-subtitle">准备好挑战下一关了吗？</p>
            </div>
            <div class="modal-footer">
                <button
                    class="btn btn-restart"
                    on:click={handleRestartFromFirst}
                >
                    🏠 返回第一关
                </button>
                <button class="btn btn-next" on:click={handleContinue}>
                    {currentLevel < levels.length - 1
                        ? "➡️ 下一关"
                        : "🎮 重新开始"}
                </button>
            </div>
        </div>
    </div>
{/if}

<Footer />

<style>
    .sokoban-container {
        min-height: calc(100vh - 200px);
        background: linear-gradient(
            135deg,
            #1a1a2e 0%,
            #16213e 50%,
            #0f3460 100%
        );
        padding: 20px;
    }

    .game-header {
        text-align: center;
        margin-bottom: 20px;
    }

    .game-header h1 {
        color: #e94560;
        font-size: 2.5rem;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        margin: 0;
    }

    .subtitle {
        color: #a0a0a0;
        font-size: 1.1rem;
        margin-top: 10px;
    }

    .game-info {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 30px;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }

    .info-item {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #fff;
        font-size: 1.1rem;
    }

    .info-item .label {
        color: #a0a0a0;
    }

    .info-item .value {
        color: #e94560;
        font-weight: bold;
        font-size: 1.3rem;
    }

    .progress-bar {
        width: 200px;
        height: 20px;
        background: #2a2a4a;
        border-radius: 10px;
        overflow: hidden;
    }

    .progress {
        height: 100%;
        background: linear-gradient(90deg, #e94560, #ff6b6b);
        border-radius: 10px;
        transition: width 0.3s ease;
    }

    .control-buttons {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }

    .btn {
        padding: 12px 24px;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    .btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }

    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .btn-start {
        background: linear-gradient(135deg, #00b894, #00cec9);
        color: white;
    }

    .btn-undo {
        background: linear-gradient(135deg, #6c5ce7, #a29bfe);
        color: white;
    }

    .btn-reset {
        background: linear-gradient(135deg, #fdcb6e, #f39c12);
        color: #333;
    }

    .btn-help {
        background: linear-gradient(135deg, #74b9ff, #0984e3);
        color: white;
    }

    .help-panel {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
        color: #fff;
    }

    .help-panel h3 {
        color: #e94560;
        margin-top: 0;
    }

    .help-panel ul {
        list-style: none;
        padding: 0;
    }

    .help-panel li {
        margin-bottom: 10px;
        padding-left: 20px;
        position: relative;
    }

    .help-panel li::before {
        content: "•";
        color: #e94560;
        position: absolute;
        left: 0;
    }

    .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        margin-top: 15px;
    }

    .legend-item {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .legend-icon {
        width: 24px;
        height: 24px;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
    }

    .legend-icon.wall {
        background: #2a2a4a;
    }

    .legend-icon.target {
        background: #00b894;
    }

    .legend-icon.box {
        background: #e17055;
    }

    .legend-icon.box-on-target {
        background: #00b894;
    }

    .legend-icon.player {
        background: #74b9ff;
    }

    .game-board {
        display: flex;
        justify-content: center;
        margin-bottom: 20px;
    }

    .grid {
        display: inline-block;
        background: #1a1a2e;
        padding: 10px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }

    .row {
        display: flex;
    }

    .cell {
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        border-radius: 4px;
        transition: all 0.2s ease;
    }

    .cell.wall {
        background: linear-gradient(135deg, #2a2a4a, #1a1a2e);
        box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.5);
    }

    .cell:not(.wall) {
        background: #0f3460;
    }

    .cell.target {
        background: #0f3460;
    }

    .target-marker {
        color: #00b894;
        font-size: 16px;
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0%,
        100% {
            opacity: 0.5;
            transform: scale(0.8);
        }
        50% {
            opacity: 1;
            transform: scale(1.2);
        }
    }

    .box-icon,
    .box-on-target-icon {
        font-size: 28px;
    }

    .box-on-target-icon {
        filter: drop-shadow(0 0 5px #00b894);
    }

    .player-icon,
    .player-on-target-icon {
        font-size: 32px;
    }

    .player-on-target-icon {
        filter: drop-shadow(0 0 5px #00b894);
    }

    .mobile-controls {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        margin-bottom: 20px;
    }

    .control-row {
        display: flex;
        gap: 10px;
    }

    .control-btn {
        width: 60px;
        height: 60px;
        border: none;
        border-radius: 12px;
        background: linear-gradient(135deg, #2a2a4a, #1a1a2e);
        color: #fff;
        font-size: 24px;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    }

    .control-btn:hover:not(:disabled) {
        transform: scale(1.1);
    }

    .control-btn:active:not(:disabled) {
        transform: scale(0.95);
    }

    .control-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .level-navigation {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
    }

    .btn-level {
        background: linear-gradient(135deg, #6c5ce7, #a29bfe);
        color: white;
    }

    .level-indicator {
        color: #fff;
        font-size: 1.2rem;
        font-weight: bold;
    }

    /* 模态框样式 */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .modal-content {
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        border-radius: 20px;
        padding: 30px;
        max-width: 400px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
        from {
            transform: translateY(-50px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }

    .modal-header h2 {
        color: #e94560;
        margin: 0 0 20px 0;
        font-size: 1.8rem;
    }

    .modal-body p {
        color: #fff;
        font-size: 1.1rem;
        margin: 10px 0;
    }

    .modal-subtitle {
        color: #a0a0a0 !important;
        font-size: 0.9rem !important;
    }

    .modal-footer {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-top: 25px;
    }

    .btn-restart {
        background: linear-gradient(135deg, #fdcb6e, #f39c12);
        color: #333;
    }

    .btn-next {
        background: linear-gradient(135deg, #00b894, #00cec9);
        color: white;
    }

    /* 响应式设计 */
    @media (max-width: 600px) {
        .game-header h1 {
            font-size: 1.8rem;
        }

        .cell {
            width: 40px;
            height: 40px;
            font-size: 20px;
        }

        .control-btn {
            width: 50px;
            height: 50px;
            font-size: 20px;
        }

        .btn {
            padding: 10px 18px;
            font-size: 0.9rem;
        }
    }
</style>
