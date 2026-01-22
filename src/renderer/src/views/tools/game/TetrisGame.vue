<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { Medal, Timer, Refresh, VideoPlay, VideoPause } from '@element-plus/icons-vue'

// 游戏配置
const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const TICK_INTERVAL = 500 // 毫秒

// 方块形状定义（I, O, T, S, Z, J, L）
const TETROMINOES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  O: [
    [1, 1],
    [1, 1]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0]
  ]
}

const SHAPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L']
const COLORS = {
  I: '#00f0f0',
  O: '#f0f000',
  T: '#a000f0',
  S: '#00f000',
  Z: '#f00000',
  J: '#0000f0',
  L: '#f0a000'
}

// 游戏状态
const board = ref<string[][]>([])
const currentPiece = ref<{ shape: string; x: number; y: number; rotation: number } | null>(null)
const score = ref(0)
const lines = ref(0)
const level = ref(1)
const gameOver = ref(false)
const isPaused = ref(false)
const isPlaying = ref(false)
const highScore = ref(0)
const gameInterval = ref<number | null>(null)

// 初始化游戏板
const initBoard = (): void => {
  board.value = Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => '')
  )
}

// 生成新方块
const spawnPiece = (): void => {
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)]
  const matrix = TETROMINOES[shape as keyof typeof TETROMINOES]
  const pieceWidth = matrix[0].length
  currentPiece.value = {
    shape,
    x: Math.floor((BOARD_WIDTH - pieceWidth) / 2),
    y: 0,
    rotation: 0
  }

  // 检查游戏是否结束（新方块无法放置在顶部）
  if (collision(0, 0, 0)) {
    gameOver.value = true
    isPlaying.value = false
    stopGame()
  }
}

// 获取方块当前形状矩阵
const getPieceMatrix = (shape: string, rotation: number): number[][] => {
  let matrix = TETROMINOES[shape as keyof typeof TETROMINOES]
  // 旋转矩阵
  for (let i = 0; i < rotation; i++) {
    matrix = matrix[0].map((_, index) => matrix.map((row) => row[index]).reverse())
  }
  return matrix
}

// 碰撞检测
const collision = (offsetX: number, offsetY: number, newRotation: number): boolean => {
  if (!currentPiece.value) return true
  const matrix = getPieceMatrix(currentPiece.value.shape, newRotation)
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col]) {
        const newX = currentPiece.value.x + col + offsetX
        const newY = currentPiece.value.y + row + offsetY
        if (
          newX < 0 ||
          newX >= BOARD_WIDTH ||
          newY >= BOARD_HEIGHT ||
          (newY >= 0 && board.value[newY][newX])
        ) {
          return true
        }
      }
    }
  }
  return false
}

// 锁定方块
const lockPiece = (): void => {
  if (!currentPiece.value) return
  const matrix = getPieceMatrix(currentPiece.value.shape, currentPiece.value.rotation)
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col]) {
        const y = currentPiece.value.y + row
        const x = currentPiece.value.x + col
        if (y >= 0) {
          board.value[y][x] = COLORS[currentPiece.value.shape as keyof typeof COLORS]
        }
      }
    }
  }
  clearLines()
  // 等待 Vue 更新 DOM 后再生成新方块
  nextTick(() => {
    currentPiece.value = null
    spawnPiece()
  })
}

// 消除满行
const clearLines = (): void => {
  let cleared = 0
  for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
    if (board.value[row].every((cell) => cell !== '')) {
      board.value.splice(row, 1)
      board.value.unshift(Array.from({ length: BOARD_WIDTH }, () => ''))
      cleared++
      row++
    }
  }
  if (cleared > 0) {
    lines.value += cleared
    score.value += [0, 100, 300, 500, 800][cleared] * level.value
    level.value = Math.floor(lines.value / 10) + 1
  }
}

// 移动方块
const move = (dx: number, dy: number): boolean => {
  if (!currentPiece.value || gameOver.value || isPaused.value) return false
  if (collision(dx, dy, currentPiece.value.rotation)) {
    if (dy > 0) {
      lockPiece()
      return true
    }
    return false
  }
  currentPiece.value.x += dx
  currentPiece.value.y += dy
  return true
}

// 旋转方块
const rotate = (): void => {
  if (!currentPiece.value || gameOver.value || isPaused.value) return
  const newRotation = (currentPiece.value.rotation + 1) % 4
  if (!collision(0, 0, newRotation)) {
    currentPiece.value.rotation = newRotation
  }
}

// 硬降（直接落到底）
const hardDrop = (): void => {
  while (move(0, 1)) {
    score.value += 2
  }
}

// 游戏主循环
const gameLoop = (): void => {
  if (!isPlaying.value || gameOver.value || isPaused.value) return
  move(0, 1)
}

// 开始游戏
const startGame = (): void => {
  initBoard()
  score.value = 0
  lines.value = 0
  level.value = 1
  gameOver.value = false
  isPaused.value = false
  isPlaying.value = true
  spawnPiece()
  if (gameInterval.value) clearInterval(gameInterval.value)
  gameInterval.value = window.setInterval(
    gameLoop,
    Math.max(100, TICK_INTERVAL - (level.value - 1) * 50)
  )
}

// 暂停/继续游戏
const togglePause = (): void => {
  if (!isPlaying.value) return
  isPaused.value = !isPaused.value
  if (isPaused.value) {
    if (gameInterval.value) clearInterval(gameInterval.value)
  } else {
    gameInterval.value = window.setInterval(
      gameLoop,
      Math.max(100, TICK_INTERVAL - (level.value - 1) * 50)
    )
  }
}

// 停止游戏
const stopGame = (): void => {
  if (gameInterval.value) clearInterval(gameInterval.value)
  gameInterval.value = null
  isPlaying.value = false
  if (score.value > highScore.value) {
    highScore.value = score.value
    localStorage.setItem('tetris-high-score', String(score.value))
  }
}

// 键盘控制
const handleKeydown = (e: KeyboardEvent): void => {
  if (!isPlaying.value) {
    if (e.key === 'Enter' || e.key === ' ') {
      startGame()
    }
    return
  }
  if (e.key === 'p' || e.key === 'P') {
    togglePause()
    return
  }
  if (isPaused.value) return

  switch (e.key) {
    case 'ArrowLeft':
      move(-1, 0)
      break
    case 'ArrowRight':
      move(1, 0)
      break
    case 'ArrowDown':
      move(0, 1)
      score.value += 1
      break
    case 'ArrowUp':
      rotate()
      break
    case ' ':
      e.preventDefault()
      hardDrop()
      break
    default:
      return
  }
  e.preventDefault()
}

// 获取方块在游戏板上的颜色
const getCellColor = (row: number, col: number): string => {
  // 先检查当前方块覆盖的位置
  if (currentPiece.value && !gameOver.value) {
    const matrix = getPieceMatrix(currentPiece.value.shape, currentPiece.value.rotation)
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          const boardX = currentPiece.value.x + c
          const boardY = currentPiece.value.y + r
          if (boardX === col && boardY === row) {
            return COLORS[currentPiece.value.shape as keyof typeof COLORS]
          }
        }
      }
    }
  }
  return board.value[row]?.[col] || ''
}

// 是否为方块位置（用于预览）
const isPieceCell = (row: number, col: number): boolean => {
  if (!currentPiece.value || gameOver.value) return false
  const matrix = getPieceMatrix(currentPiece.value.shape, currentPiece.value.rotation)
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c]) {
        const boardX = currentPiece.value.x + c
        const boardY = currentPiece.value.y + r
        if (boardX === col && boardY === row) {
          return true
        }
      }
    }
  }
  return false
}

onMounted(() => {
  const saved = localStorage.getItem('tetris-high-score')
  if (saved) highScore.value = parseInt(saved)
  initBoard()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  stopGame()
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="tetris-container">
    <div class="game-header">
      <h2>俄罗斯方块</h2>
      <div class="game-controls">
        <el-button v-if="!isPlaying" type="primary" :icon="VideoPlay" @click="startGame">
          开始游戏
        </el-button>
        <el-button
          v-else
          type="warning"
          :icon="isPaused ? VideoPlay : VideoPause"
          @click="togglePause"
        >
          {{ isPaused ? '继续' : '暂停' }}
        </el-button>
        <el-button :icon="Refresh" @click="startGame">重新开始</el-button>
      </div>
    </div>

    <div class="game-content">
      <!-- 游戏面板 -->
      <div class="game-board">
        <div v-for="row in BOARD_HEIGHT" :key="row" class="board-row">
          <div
            v-for="col in BOARD_WIDTH"
            :key="col"
            class="board-cell"
            :class="{
              filled: getCellColor(row - 1, col - 1),
              preview: isPieceCell(row - 1, col - 1)
            }"
            :style="
              getCellColor(row - 1, col - 1)
                ? { backgroundColor: getCellColor(row - 1, col - 1) }
                : {}
            "
          ></div>
        </div>

        <!-- 游戏遮罩 -->
        <div v-if="!isPlaying || gameOver" class="game-overlay">
          <div v-if="gameOver" class="game-over">
            <h3>游戏结束</h3>
            <p>得分: {{ score }}</p>
            <el-button type="primary" @click="startGame">再来一局</el-button>
          </div>
          <div v-else class="start-hint">
            <p>按 Enter 或点击开始</p>
            <p class="controls-hint">↑ 旋转 | ← → 移动 | ↓ 加速 | 空格 硬降 | P 暂停</p>
          </div>
        </div>
      </div>

      <!-- 右侧信息 -->
      <div class="game-info">
        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <el-icon><Medal /></el-icon>
              <span>最高分</span>
            </div>
          </template>
          <div class="info-value">{{ highScore }}</div>
        </el-card>

        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <el-icon><Timer /></el-icon>
              <span>当前分数</span>
            </div>
          </template>
          <div class="info-value">{{ score }}</div>
        </el-card>

        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <el-icon><Timer /></el-icon>
              <span>消除行数</span>
            </div>
          </template>
          <div class="info-value">{{ lines }}</div>
        </el-card>

        <el-card class="info-card">
          <template #header>
            <div class="card-header">
              <el-icon><Timer /></el-icon>
              <span>等级</span>
            </div>
          </template>
          <div class="info-value">{{ level }}</div>
        </el-card>

        <el-card class="info-card controls-card">
          <template #header>
            <div class="card-header">操作说明</div>
          </template>
          <div class="controls-list">
            <div class="control-item"><span class="key">↑</span> 旋转</div>
            <div class="control-item">
              <span class="key">←</span><span class="key">→</span> 左右移动
            </div>
            <div class="control-item"><span class="key">↓</span> 加速下落</div>
            <div class="control-item"><span class="key">空格</span> 硬降到底</div>
            <div class="control-item"><span class="key">P</span> 暂停</div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tetris-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.game-header h2 {
  margin: 0;
  font-size: 24px;
}

.game-controls {
  display: flex;
  gap: 10px;
}

.game-content {
  display: flex;
  gap: 30px;
  flex: 1;
}

.game-board {
  position: relative;
  display: flex;
  flex-direction: column;
  background: #1a1a2e;
  border: 3px solid #333;
  border-radius: 4px;
  padding: 2px;
}

.board-row {
  display: flex;
}

.board-cell {
  width: 28px;
  height: 28px;
  border: 1px solid #2a2a4a;
  background: #0f0f1a;
}

.board-cell.filled,
.board-cell[class*='filled'] {
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: inset 0 0 4px rgba(255, 255, 255, 0.2);
}

.board-cell.preview {
  opacity: 0.8;
  box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.3);
}

.game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
}

.game-over {
  text-align: center;
  color: #fff;
}

.game-over h3 {
  font-size: 28px;
  color: #f56c6c;
  margin-bottom: 10px;
}

.start-hint {
  text-align: center;
  color: #fff;
}

.start-hint p {
  margin: 5px 0;
}

.controls-hint {
  font-size: 12px;
  color: #888;
}

.game-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 200px;
}

.info-card {
  background: var(--el-bg-color);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.info-value {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  color: var(--el-color-primary);
}

.controls-card .el-card__body {
  padding: 10px 15px;
}

.controls-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
</style>
