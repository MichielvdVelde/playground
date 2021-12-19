import type { BaseShape } from '../object'
import type { AttackableGameObject, DestructibleGameObject, WeaponTypes } from './unit'
import { GameObject } from '../object.js'
import { RoomLocation } from './room.js'
import { Position } from './position.js'

interface StructureShape extends BaseShape<string> {}

export abstract class Structure<Shape extends StructureShape> extends GameObject<Shape> {
  //
}

interface RoomStructureShape extends StructureShape {
  room: [x: number, y: number, z: number]
  pos: [x: number, y: number]
  hp: number
  maxHp: number
}

export abstract class RoomStructure<Shape extends RoomStructureShape> extends GameObject<Shape> implements AttackableGameObject, DestructibleGameObject {
  get room() {
    return this['#data'].room ? new RoomLocation(this['#data'].room) : undefined
  }

  get pos() {
    return this['#data'].pos ? new Position(this['#data'].pos) : undefined
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
  pos: [x: number, y: number]
}

export abstract class SurfaceStructure<Shape extends SurfaceStructureShape> extends GameObject<Shape> {
  get position() { return this['#data'].pos }
}