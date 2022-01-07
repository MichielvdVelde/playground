type Desert = 'Desert'
type Tundra = 'Tundra'
type Prairie = 'Prairie'
type Forest = 'Forest'
type Swamp = 'Swamp'
type Jungle = 'Jungle'
type Water = 'Water'
type TerrainTypes = Desert | Tundra | Prairie | Forest | Swamp | Jungle | Water

type Food = 'F'
type Wood = 'W'
type Iron = 'Fe'
type Silicon = 'Si'
type Hydrogen = 'H'
type ResourceTypes = Food | Wood | Iron | Silicon | Hydrogen

const terrainToResource: Readonly<Record<TerrainTypes, ResourceTypes>> = {
  Desert: 'Si',
  Prairie: 'F',
  Water: 'F',
  Forest: 'W',
  Jungle: 'W',
  Tundra: 'Fe',
  Swamp: 'H',
}

var Game: any

const improvedTiles: Record<string, {
  owner: number,
  level: number,
  time: number,
  turnsToNextLevel?: number,
}> = {}

const kTurnsToNextLevel = 12
const kMaxLevel = 10
const kOutputPerLevel = 1

// Needs to be called on each turn for each tile that is being worked by the player.
export function setWorkedBy(x: number, y: number, player: number) {
  const pos = `${x}:${y}`
  const tile = improvedTiles[pos]
  improvedTiles[pos] = {
    owner: player,
    level: tile?.level ?? 1,
    time: Game.time,
    turnsToNextLevel: tile?.owner === player && tile.turnsToNextLevel
      ? tile.turnsToNextLevel
      : tile.level ?? 1 < kMaxLevel
        ? kTurnsToNextLevel
        : undefined as never
  }
}

export function postTurn() {
  // Upgrade tiles if necessary
  Object.values(improvedTiles).filter(tile => !!tile.turnsToNextLevel && tile.time === Game.time).forEach(tile => {
    tile.turnsToNextLevel!--
    if (tile.turnsToNextLevel === 0) {
      tile.level++

      if (tile.level < kMaxLevel) {
        tile.turnsToNextLevel = kTurnsToNextLevel
      } else {
        delete tile.turnsToNextLevel
      }
    }
  })
}

function getTerrainType(x: number, y: number): TerrainTypes {
  return 'Desert'
}

export function getResources() {
  const resources: Record<number, Partial<Record<ResourceTypes, number>>> = {}
  Object.entries(improvedTiles).filter(([, tile]) => !!tile.owner).forEach(([key, tile]) => {
    const [x, y] = key.split(':').map(coord => parseInt(coord))
    const terrainType = getTerrainType(x, y)
    const resourceForTile = terrainToResource[terrainType]
    if (resourceForTile) {
      if (!resources[tile.owner]) {
        resources[tile.owner] = {}
      }
      resources[tile.owner][resourceForTile] = (resources[tile.owner][resourceForTile] ?? 0) + (tile.level * kOutputPerLevel)
    }
  })
  return resources
}