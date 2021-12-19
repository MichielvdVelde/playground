/**
 * Calculate the distance between two points in 2D space.
 * @param a The first coordinate
 * @param b The second coordinate
 * @returns The distance
 */
export function distance2D(a: [x: number, y: number], b: [x: number, y: number]) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)
}

/**
 * Calculate the distance between two points  in 3D space.
 * @param a The first coordinate
 * @param b The second coordinate
 * @returns The distance
 */
export function distance3D(a: [x: number, y: number, z: number], b: [x: number, y: number, z: number]) {
  const x = b[0] - a[0]
  const y = b[1] - a[1]
  const z = b[2] - a[2]
  return Math.sqrt(x * x + y * y + z * z)
}