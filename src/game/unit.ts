import type { BaseShape } from '../object'
import { GameObject } from '../object.js'
import { RoomLocation } from './room.js'
import { Position } from './position.js'
import { distance3D, distance2D } from './math.js'

// move to another file
export type WeaponTypes = 'em' | 'thermal' | 'kinetic'

interface UnitShape extends BaseShape {
  hp: number
  maxHp: number
  room?: [x: number, y: number, z: number]
  pos?: [x: number, y: number]
}

// move to another file
export interface OwnableGameObject extends GameObject<any> {
  readonly owner?: string
}

export interface OwnedGameObject extends GameObject<any> {
  readonly owner: string
}

export interface ColonyGameObject extends GameObject<any> {
  readonly colonyId: string
}

export interface MobileGameObject extends GameObject<any> {
  readonly room?: RoomLocation
  readonly pos?: Position

  /**
   * Move to a new position and optionally another room.
   * @param pos The destination position
   * @param room The destination room
   * @returns The travel time in seconds
   */
  ['#moveTo'](pos: Position, room?: RoomLocation): number
}

export interface DestructibleGameObject {
  readonly room?: RoomLocation
  readonly pos?: Position

  readonly hp: number
  readonly maxHp: number

  /**
   * Incur damage.
   * @param power The damage power
   * @returns The new HP number
   */
  ['#damage'](power: number): number
}

export  interface AttackableGameObject extends DestructibleGameObject {
  readonly hp: number
  readonly maxHp: number

  /**
   * Object is under attack.
   * @param type The weapon type
   * @param power The damage power
   * @returns The relative damage power
   */
  ['#underAttack'](type: WeaponTypes, power: number): number
}

export interface CombatGameObject extends AttackableGameObject {
  /**
   * Attack another game object.
   * @param target The target game object
   * @param weapon The weapon type
   * @param power The damage power
   * @param range The weapon range
   * @returns The relative damage power
   */
  ['#attack'](target: GameObject<any> & AttackableGameObject, weapon: WeaponTypes, power: number, range: number): number
}

/**
 * Represents a basic unit.
 */
export class Unit<Shape extends UnitShape> extends GameObject<Shape> implements MobileGameObject, AttackableGameObject, CombatGameObject {
  get room() {
    return this['#data'].room ? new RoomLocation(this['#data'].room) : undefined
  }

  get pos() {
    return this['#data'].pos ? new Position(this['#data'].pos) : undefined
  }

  get hp() { return this['#data'].hp }
  get maxHp() { return this['#data'].maxHp }

  ['#moveTo'](pos: Position, room?: RoomLocation) {
    if (room && !this.room!.isEqualTo(room)) {
      // Move between rooms
      const distance = distance3D(this.room!.location, room.location)
      // TODO
    } else {
      // Move within room
      const distance = distance2D(this.pos!.location, pos.location)
      // TODO
    }
    return 6
  }

  ['#damage'](power: number) {
    const newHp = Math.max(0, this.hp - power)
    this['#data'].hp = newHp
    return newHp
  }

  ['#underAttack'](type: WeaponTypes, power: number) {
    return 6
  }

  ['#attack'](target: GameObject<any> & AttackableGameObject, weapon: WeaponTypes, power: number, range: number) {
    return 6
  }
}

interface HeroUnitShape extends UnitShape {
  level: number
  xp: number
  xpToNextLevel: number
}

/**
 * Represents a hero-unit.
 */
export class HeroUnit extends Unit<HeroUnitShape> {
  ['#addXp'](xp: number) {
    while(true) {
      if (xp > this['#data'].xpToNextLevel) {
        this['#data'].level++
        this['#data'].xp = 0
        xp -= this['#data'].xpToNextLevel
        this['#data'].xpToNextLevel = 1000 * this['#data'].level
      } else {
        this['#data'].xpToNextLevel += xp
        break
      }
    }
  }

  ['#areaAttack'](type: WeaponTypes, power: number, range: number) {
    // locate all targets in range
    // attack them
  }
}