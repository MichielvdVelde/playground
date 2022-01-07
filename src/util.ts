export function distance2D(a: [x: number, y: number], b: [x: number, y: number]) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)
}