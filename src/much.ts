
interface BaseShape<Type = any> {
  _id: Type,
}

abstract class GameObject<Shape extends BaseShape> {
  ['#data']: Shape

  constructor(data: Shape) {
    this['#data'] = data
  }

  get id() { return this['#data']._id }
}

// ----------------------------------------------------------------

const UNIVERSE_SEED = 0.47474747

type WeaponTypes = 'em' | 'thermal' | 'kinetic'
type ResistanceTypes = WeaponTypes
type ResourceTypes = 'H'

// Represents a game object which is owned by a player
interface OwnedGameObject<Type = any> {
  readonly owner: Type
}

// Represents a game object which is destructible
interface DestructibleGameObject {
  readonly grid?: GridLocation
  readonly room?: RoomLocation

  readonly hp: number
  readonly maxHp: number

  /**
   * Incur damage relative to the given power.
   * @param power The damage power
   * @returns The HP remaining
   */
  ['#damage'](power: number): number
}

// Represents a game object which can be attacked
interface AttackableGameObject extends DestructibleGameObject {
  /**
   * Game object is under attack.
   * Calculate relative damage power based on resistances.
   * @param type The weapon type
   * @param power The damage power
   * @returns The relative damage power
   */
  ['#underAttack'](type: WeaponTypes, power: number): number
}

// Represents a game object which can attack
interface CombatGameObject extends DestructibleGameObject, AttackableGameObject {
  /**
   * Attack another game object.
   * Calculate relative damage power based on distance.
   * @param target The target object to attack
   * @param type The weapon type
   * @param power The damage power
   * @returns The relative damage power
   */
  ['#attack'](target: GameObject<any> & AttackableGameObject, power: number, range: number): number
}

// Represents a game object which can extract resources from a target.
interface ExtractorGameObject {
  /**
   * Extract resources.
   * @returns The units of resource extracted
   */
  ['#extract'](target: GameObject<any> & ExtractableGameObject): number
}

interface ExtractableGameObject {
  /**
   * Extract resources.
   * @param amount The amount to extract
   * @returns The units of resource extracted
   */
  ['#extract'](amount: number): number
}

interface StationaryGameObject {
  readonly grid: GridLocation
  readonly room: RoomLocation
}

interface MobileGameObject {
  readonly grid?: GridLocation
  readonly room?: RoomLocation

  /**
   * Move to a location.
   * @param room The room location to move to
   * @param grid The grid location to move to
   * @returns The duration in seconds
   */
  ['#moveTo'](room: RoomLocation, grid?: GridLocation): number
}



interface UnitShape extends BaseShape<string> {
  owner: string,
  grid?: [x: number, y: number, z: number]
  room?: [x: number, y: number]
  resistances: Record<ResistanceTypes, number>,
  speed: number,
  ftl: number,
  hp: number
  maxHp: number
}

export class Unit extends GameObject<UnitShape> implements OwnedGameObject, DestructibleGameObject, AttackableGameObject, MobileGameObject, CombatGameObject {
  get grid() {
    const grid = this['#data'].grid
    return grid ? new GridLocation(grid) : undefined
  }

  get room() {
    const room = this['#data'].room
    return room ? new RoomLocation(room) : undefined
  }

  get owner() { return this['#data'].owner }
  get hp() { return this['#data'].hp }
  get maxHp() { return this['#data'].maxHp }
  get resistances() { return this['#data'].resistances }

  ['#damage'](power: number) {
    this['#data'].hp = Math.min(0, this.hp - power)
    return this.hp
  }

  ['#attack'](target: GameObject<any> & AttackableGameObject, power: number, range: number) {
    const distance = distance2D(this.room!.location, target.room!.location)
    return power * (1 - (distance / range))
  }

  ['#underAttack'](type: WeaponTypes, power: number) {
    const resist = this.resistances[type] ?? 0
    return power * (1 - resist)
  }

  ['#moveTo'](room: RoomLocation, grid?: GridLocation) {
    if (grid && !this.grid!.isEqualTo(grid)) {
      return distance3D(this.grid!.location, grid.location) / this['#data'].ftl
    } else {
      return distance2D(this.room!.location, room.location) / this['#data'].speed
    }
  }
}

interface ShipShape extends UnitShape {
  //
}

class Ship<Shape extends ShipShape = ShipShape> extends GameObject<Shape> {
  //
}




interface AsteroidShape extends BaseShape<string> {
  grid: [x: number, y: number, z: number]
  room: [x: number, y: number]
  type: ResourceTypes
  stability: number,
  remaining: number
}

export class Asteroid extends GameObject<AsteroidShape> implements StationaryGameObject, ExtractableGameObject {
  get grid() {
    return new GridLocation(this['#data'].grid)
  }

  get room() {
    return new RoomLocation(this['#data'].room)
  }

  get remaining() { return this['#data'].remaining }

  ['#extract'](amount: number) {
    const [x1, y1, z1] = this['#data'].grid
    const roomSeed = noise3D(UNIVERSE_SEED)(x1, y1, z1)
    const [x2, y2] = this['#data'].room
    const locationModifier = noise2D(roomSeed)(x2, y2)
    const actualAmount = Math.min(this['#data'].remaining, Math.abs((amount * this['#data'].stability) * locationModifier))
    this['#data'].remaining -= actualAmount
    return actualAmount
  }
}


























function noise2D(seed: number): (x: number, y: number) => number {
  return (x, y) => 6
}

function noise3D(seed: number): (x: number, y: number, z: number) => number {
  return (x, y, z) => 78
}








/**
 * Calculate the distance between two points in 2D space.
 * @param a The first coordinate
 * @param b The second coordinate
 * @returns The distance
 */
function distance2D(a: [x: number, y: number], b: [x: number, y: number]) {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)
}

/**
 * Calculate the distance between two points  in 3D space.
 * @param a The first coordinate
 * @param b The second coordinate
 * @returns The distance
 */
function distance3D(a: [x: number, y: number, z: number], b: [x: number, y: number, z: number]) {
  const x = b[0] - a[0]
  const y = b[1] - a[1]
  const z = b[2] - a[2]
  return Math.sqrt(x * x + y * y + z * z)
}




export class GridLocation {
  /**
   * Type guard to check if the provided argument is an instance of `GridLocation`.
   */
  static is(obj: any): obj is GridLocation {
    return obj instanceof GridLocation
  }

  #location: [x: number, y: number, z: number]
  constructor(location: [x: number, y: number, z: number]) {
    this.#location = location
  }

  get location(): [x: number, y: number, z: number] {
    return [...this.#location]
  }

  isEqualTo(x: number, y: number, z: number): boolean
  isEqualTo(location: GridLocation): boolean
  isEqualTo(xOrLocation: GridLocation | number, y?: number, z?: number): boolean {
    if (GridLocation.is(xOrLocation)) {
      return xOrLocation.location[0] === this.#location[0]
        && xOrLocation.location[1] === this.#location[1]
        && xOrLocation.location[2] === this.#location[2]
    } else {
      return xOrLocation === this.#location[0]
        && y === this.#location[1]
        && z === this.#location[2]
    }
  }

  distanceTo(x: number, y: number, z: number): number
  distanceTo(location: GridLocation): number
  distanceTo(xOrLocation: GridLocation | number, y?: number, z?: number): number {
    if (GridLocation.is(xOrLocation)) {
      return distance3D(this.#location, xOrLocation.location)
    } else {
      return distance3D(this.#location, [xOrLocation, y!, z!])
    }
  }

  inRangeTo(x: number, y: number, z: number, range: number): boolean
  inRangeTo(location: GridLocation, range: number): boolean
  inRangeTo(xOrLocation: GridLocation | number, yOrRange: number, z?: number, range?: number): boolean {
    if (GridLocation.is(xOrLocation)) {
      return this.distanceTo(xOrLocation) < yOrRange
    } else {
      return this.distanceTo(xOrLocation, yOrRange, z!) < range!
    }
  }
}

export class RoomLocation {
  /**
   * Type guard to check if the provided argument is an instance of `RoomLocation`.
   */
  static is(obj: any): obj is RoomLocation {
    return obj instanceof RoomLocation
  }

  #location: [x: number, y: number]
  constructor(location: [x: number, y: number]) {
    this.#location = location
  }

  get location(): [x: number, y: number] {
    return [...this.#location]
  }

  isEqualTo(x: number, y: number): boolean
  isEqualTo(location: RoomLocation): boolean
  isEqualTo(xOrLocation: RoomLocation | number, y?: number): boolean {
    if (RoomLocation.is(xOrLocation)) {
      return xOrLocation.location[0] === this.#location[0]
        && xOrLocation.location[1] === this.#location[1]
    } else {
      return xOrLocation === this.#location[0]
        && y === this.#location[1]
    }
  }

  distanceTo(x: number, y: number): number
  distanceTo(location: RoomLocation): number
  distanceTo(xOrLocation: RoomLocation | number, y?: number): number {
    if (RoomLocation.is(xOrLocation)) {
      return distance2D(this.#location, xOrLocation.location)
    } else {
      return distance2D(this.#location, [xOrLocation, y!])
    }
  }

  inRangeTo(x: number, y: number, range: number): boolean
  inRangeTo(location: RoomLocation, range: number): boolean
  inRangeTo(xOrLocation: RoomLocation | number, yOrRange: number, range?: number): boolean {
    if (RoomLocation.is(xOrLocation)) {
      return this.distanceTo(xOrLocation) < yOrRange
    } else {
      return this.distanceTo(xOrLocation, yOrRange) < range!
    }
  }
}