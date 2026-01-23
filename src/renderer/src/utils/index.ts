// String Tools
export {
  processBase64,
  processUrl,
  formatJson,
  type FormatJsonResult,
  formatHtml,
  minifyHtml,
  formatSql,
  minifySql,
  testRegex,
  type TestRegexResult,
  escapeHtml,
  SQL_KEYWORDS,
  SQL_MULTI_WORD_KEYWORDS,
  SQL_LINE_START_KEYWORDS
} from './stringTools'

// Tetris Core
export {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  SHAPES,
  TETROMINOES,
  type TetrominoShape,
  getPieceMatrix,
  collision,
  createEmptyBoard,
  clearLines,
  calculateDropDistance,
  generateRandomShape
} from './tetrisCore'
