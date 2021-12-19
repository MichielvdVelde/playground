import { distance3D } from './math.js'

export class RoomLocation {
  /**
   * Type guard to check if the provided argument is an instance of `RoomLocation`.
   */
  static is(obj: any): obj is RoomLocation {
    return obj instanceof RoomLocation
  }

  #location: [x: number, y: number, z: number]
  constructor(location: [x: number, y: number, z: number]) {
    this.#location = location
  }

  get location(): [x: number, y: number, z: number] {
    return [...this.#location]
  }

  isEqualTo(x: number, y: number, z: number): boolean
  isEqualTo(location: RoomLocation): boolean
  isEqualTo(xOrLocation: RoomLocation | number, y?: number, z?: number): boolean {
    if (RoomLocation.is(xOrLocation)) {
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
  distanceTo(location: RoomLocation): number
  distanceTo(xOrLocation: RoomLocation | number, y?: number, z?: number): number {
    if (RoomLocation.is(xOrLocation)) {
      return distance3D(this.#location, xOrLocation.location)
    } else {
      return distance3D(this.#location, [xOrLocation, y!, z!])
    }
  }

  inRangeTo(x: number, y: number, z: number, range: number): boolean
  inRangeTo(location: RoomLocation, range: number): boolean
  inRangeTo(xOrLocation: RoomLocation | number, yOrRange: number, z?: number, range?: number): boolean {
    if (RoomLocation.is(xOrLocation)) {
      return this.distanceTo(xOrLocation) < yOrRange
    } else {
      return this.distanceTo(xOrLocation, yOrRange, z!) < range!
    }
  }
}