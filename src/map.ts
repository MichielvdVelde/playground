
export const kTileSize = 10

// Convert absolute coordinates into tile coordinates
export function toTile(x: number, y: number): readonly [x: number, y: number] {
  return [
    Math.round(x / kTileSize),
    Math.round(y / kTileSize),
  ]
}

// Convert tile coordinates into absolute coordinates
// Takes the center of the tile as its position
export function fromTile(x: number, y: number, offset = 0): readonly [x: number, y: number] {
  return [
    Math.round((x * kTileSize) + ((kTileSize / 2) + offset)),
    Math.round((y * kTileSize) + ((kTileSize / 2) + offset)),
  ]
}