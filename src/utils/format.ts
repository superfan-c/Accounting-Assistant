/** 元 → 分 */
export function yuanToFen(yuan: number): number {
  return Math.round(yuan * 100)
}

/** 分 → 元（数字） */
export function fenToYuan(fen: number): number {
  return fen / 100
}

/** 分 → 元（展示字符串，保留两位小数） */
export function formatYuan(fen: number): string {
  return fenToYuan(fen).toFixed(2)
}

export function genId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
