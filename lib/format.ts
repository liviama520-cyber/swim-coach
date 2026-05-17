// Convert seconds to mm:ss.xx display
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return secs.toFixed(2)
  return `${mins}:${secs < 10 ? '0' : ''}${secs.toFixed(2)}`
}

// Parse "1:04.50" or "64.50" -> seconds
export function parseTime(input: string): number {
  const parts = input.trim().split(':')
  if (parts.length === 2) {
    return parseFloat(parts[0]) * 60 + parseFloat(parts[1])
  }
  return parseFloat(parts[0])
}

export function avg(nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0) / nums.length
}
