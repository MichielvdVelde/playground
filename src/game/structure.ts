import type { BaseShape } from '../object'
import type { AttackableGameObject, ColonyGameObject, DestructibleGameObject, OwnedGameObject, WeaponTypes } from './unit'
import { GameObject } from '../object.js'
import { RoomLocation } from './room.js'
import { Position } from './position.js'

interface StructureShape extends BaseShape {
  owner: string
}

/**
 * Represents a generic structure.
 */
export abstract class Structure<Shape extends StructureShape> extends GameObject<Shape> implements OwnedGameObject {
  get owner() { return this['#data'].owner }
}

interface RoomStructureShape extends StructureShape {
  room: [x: number, y: number, z: number]
  pos: [x: number, y: number]
  hp: number
  maxHp: number
}

/**
 * Represents a structure placed in a room.
 */
export abstract class RoomStructure<Shape extends RoomStructureShape> extends GameObject<Shape> implements AttackableGameObject, DestructibleGameObject {
  get room() {
    return new RoomLocation(this['#data'].room)
  }

  get pos() {
    return new Position(this['#data'].pos)
  }

  get hp() { return this['#data'].hp }
  get maxHp() { return this['#data'].maxHp }

  ['#damage'](power: number) {
    const newHp = Math.max(0, this.hp - power)
    this['#data'].hp = newHp
    return newHp
  }

  ['#underAttack'](type: WeaponTypes, power: number) {
    return 6
  }
}

interface SurfaceStructureShape extends StructureShape {
  colonyId: string,
  pos: [x: number, y: number]
}

/**
 * Represents a structure placed on the surface of a colony.
 */
export abstract class SurfaceStructure<Shape extends SurfaceStructureShape> extends GameObject<Shape> implements ColonyGameObject {
  get colonyId(): string { return this['#data'].colonyId }
  get position() { return this['#data'].pos }
}