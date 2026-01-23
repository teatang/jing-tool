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
const nextPiece = ref<string>('T') // 下一个方块
const score = ref(0)
const lines = ref(0)
const level = ref(1)
const gameOver = ref(false)
const isPaused = ref(false)
const isPlaying = ref(false)
const highScore = ref(0)
const gameInterval = ref<number | null>(null)

// 预生成下一个方块
const generateNextPiece = (): string => {
  return SHAPES[Math.floor(Math.random() * SHAPES.length)]
}

// 计算幽灵方块位置
const getGhostY = (): number => {
  if (!currentPiece.value) return 0
  let ghostY = currentPiece.value.y
  while (!collision(0, ghostY - currentPiece.value.y + 1, currentPiece.value.rotation)) {
    ghostY++
  }
  return ghostY
}

// 初始化游戏板
const initBoard = (): void => {
  board.value = Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => '')
  )
}

// 生成新方块
const spawnPiece = (): void => {
  // 使用预生成的下一个方块
  const shape = nextPiece.value
  const matrix = TETROMINOES[shape as keyof typeof TETROMINOES]
  const pieceWidth = matrix[0].length
  currentPiece.value = {
    shape,
    x: Math.floor((BOARD_WIDTH - pieceWidth) / 2),
    y: 0,
    rotation: 0
  }

  // 生成新的下一个方块
  nextPiece.value = generateNextPiece()

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
      return false // 移动到底部后返回 false，停止循环
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
  // 先初始化下一个方块，再生成当前方块
  nextPiece.value = generateNextPiece()
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

// 是否为幽灵方块位置
const isGhostCell = (row: number, col: number): boolean => {
  if (!currentPiece.value || gameOver.value || isPaused.value) return false
  const ghostY = getGhostY()
  if (ghostY === currentPiece.value.y) return false // 已经在底部
  const matrix = getPieceMatrix(currentPiece.value.shape, currentPiece.value.rotation)
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c]) {
        const boardX = currentPiece.value.x + c
        const boardY = ghostY + r
        if (boardX === col && boardY === row) {
          // 确保不是实际方块位置
          if (!isPieceCell(row, col)) {
            return true
          }
        }
      }
    }
  }
  return false
}

// 获取幽灵方块颜色
const getGhostColor = (): string => {
  if (!currentPiece.value) return ''
  return COLORS[currentPiece.value.shape as keyof typeof COLORS] + '50' // 半透明
}

// 获取下一个方块预览颜色
const getNextPieceCellColor = (row: number, col: number): string => {
  const matrix = TETROMINOES[nextPiece.value as keyof typeof TETROMINOES]
  // 计算居中偏移
  const offsetX = Math.floor((4 - matrix[0].length) / 2)
  const offsetY = Math.floor((4 - matrix.length) / 2)
  const localRow = row - offsetY
  const localCol = col - offsetX
  if (
    localRow >= 0 &&
    localRow < matrix.length &&
    localCol >= 0 &&
    localCol < matrix[0].length &&
    matrix[localRow][localCol]
  ) {
    return COLORS[nextPiece.value as keyof typeof COLORS]
  }
  return ''
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
  <div class="tetris-container p-5 h-full box-border flex flex-col">
    <div class="flex justify-between items-center mb-5">
      <h2 class="m-0 text-xl text-gray-700 dark:text-gray-100">俄罗斯方块</h2>
      <div class="flex gap-2">
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

    <div class="flex-1 flex gap-6 justify-center items-start">
      <!-- 游戏面板 -->
      <div
        class="game-board relative flex flex-col bg-gray-900 border-2 border-gray-700 rounded-lg p-1"
      >
        <div v-for="row in BOARD_HEIGHT" :key="row" class="flex">
          <div
            v-for="col in BOARD_WIDTH"
            :key="col"
            class="w-[22px] h-[22px] border border-gray-700 bg-gray-800 transition-all duration-150"
            :class="{
              filled: getCellColor(row - 1, col - 1),
              preview: isPieceCell(row - 1, col - 1),
              ghost: isGhostCell(row - 1, col - 1)
            }"
            :style="
              getCellColor(row - 1, col - 1)
                ? { backgroundColor: getCellColor(row - 1, col - 1) }
                : isGhostCell(row - 1, col - 1)
                  ? { backgroundColor: getGhostColor() }
                  : {}
            "
          ></div>
        </div>

        <!-- 游戏遮罩 -->
        <div
          v-if="!isPlaying || gameOver"
          class="game-overlay absolute inset-0 bg-black/75 flex items-center justify-center rounded-lg"
        >
          <div v-if="gameOver" class="text-center text-white">
            <h3 class="text-2xl text-red-500 mb-3">游戏结束</h3>
            <p class="m-2 text-base">得分: {{ score }}</p>
            <el-button type="primary" class="mt-4" @click="startGame">再来一局</el-button>
          </div>
          <div v-else class="start-hint text-center text-white">
            <p class="my-1.5 text-sm">按 Enter 或点击开始</p>
            <p class="controls-hint text-xs text-gray-400 mt-3">
              ↑ 旋转 | ← → 移动 | ↓ 加速 | 空格 硬降 | P 暂停
            </p>
          </div>
        </div>
      </div>

      <!-- 右侧信息 - 双列布局 -->
      <div class="game-info flex gap-4 min-w-[360px]">
        <!-- 左侧列：分数信息 -->
        <div class="info-column flex-1 flex flex-col gap-2.5 max-w-[144px]">
          <el-card class="info-card bg-white dark:bg-gray-800 rounded-lg">
            <template #header>
              <div
                class="card-header flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                <el-icon><Medal /></el-icon>
                <span>最高分</span>
              </div>
            </template>
            <div class="info-value text-center text-2xl font-bold text-primary-500">
              {{ highScore }}
            </div>
          </el-card>

          <el-card class="info-card bg-white dark:bg-gray-800 rounded-lg">
            <template #header>
              <div
                class="card-header flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                <el-icon><Timer /></el-icon>
                <span>当前分数</span>
              </div>
            </template>
            <div class="info-value text-center text-2xl font-bold text-primary-500">
              {{ score }}
            </div>
          </el-card>

          <el-card class="info-card bg-white dark:bg-gray-800 rounded-lg">
            <template #header>
              <div
                class="card-header flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                <el-icon><Timer /></el-icon>
                <span>消除行数</span>
              </div>
            </template>
            <div class="info-value text-center text-2xl font-bold text-primary-500">
              {{ lines }}
            </div>
          </el-card>

          <el-card class="info-card bg-white dark:bg-gray-800 rounded-lg">
            <template #header>
              <div
                class="card-header flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                <el-icon><Timer /></el-icon>
                <span>等级</span>
              </div>
            </template>
            <div class="info-value text-center text-2xl font-bold text-primary-500">
              {{ level }}
            </div>
          </el-card>
        </div>

        <!-- 右侧列：预览和操作说明 -->
        <div class="info-column flex-1 flex flex-col gap-2.5 max-w-[180px]">
          <!-- 下一个方块预览 -->
          <el-card class="next-piece-card min-h-[140px] bg-white dark:bg-gray-800 rounded-lg">
            <template #header>
              <div
                class="card-header flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                下一个
              </div>
            </template>
            <div
              class="next-piece-preview flex flex-col items-center justify-center py-2 min-h-[88px]"
            >
              <div v-for="(_, rIndex) in 4" :key="rIndex" class="preview-row flex">
                <div
                  v-for="(__, cIndex) in 4"
                  :key="cIndex"
                  class="preview-cell w-[18px] h-[18px] border border-gray-600 dark:border-gray-500 rounded"
                  :style="{
                    backgroundColor: getNextPieceCellColor(rIndex, cIndex),
                    opacity: getNextPieceCellColor(rIndex, cIndex) ? 1 : 0
                  }"
                ></div>
              </div>
            </div>
          </el-card>

          <el-card class="controls-card bg-white dark:bg-gray-800 rounded-lg">
            <template #header>
              <div
                class="card-header flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                操作说明
              </div>
            </template>
            <div
              class="controls-list flex flex-col gap-2.5 text-xs text-gray-600 dark:text-gray-400"
            >
              <div class="control-item flex items-center gap-2">
                <span
                  class="key inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-medium"
                  >↑</span
                >
                旋转
              </div>
              <div class="control-item flex items-center gap-2">
                <span
                  class="key inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-medium"
                  >←</span
                >
                <span
                  class="key inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-medium"
                  >→</span
                >
                左右移动
              </div>
              <div class="control-item flex items-center gap-2">
                <span
                  class="key inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-medium"
                  >↓</span
                >
                加速下落
              </div>
              <div class="control-item flex items-center gap-2">
                <span
                  class="key inline-flex items-center justify-center min-w-14 h-[22px] px-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-medium"
                  >空格</span
                >
                硬降到底
              </div>
              <div class="control-item flex items-center gap-2">
                <span
                  class="key inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-medium"
                  >P</span
                >
                暂停
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* TailwindCSS already provides most styles, but we need some custom ones */

.filled {
  @apply border border-white/60 shadow-inner;
}

.preview {
  @apply opacity-85 shadow-inner;
}

.ghost {
  @apply border border-dashed border-white/60 shadow-inner;
}
</style>
