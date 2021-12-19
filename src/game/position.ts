import { distance2D } from './math.js'

export class Position {
  /**
   * Type guard to check if the provided argument is an instance of `Position`.
   */
  static is(obj: any): obj is Position {
    return obj instanceof Position
  }

  #location: [x: number, y: number]
  constructor(location: [x: number, y: number]) {
    this.#location = location
  }

  get location(): [x: number, y: number] {
    return [...this.#location]
  }

  isEqualTo(x: number, y: number): boolean
  isEqualTo(location: Position): boolean
  isEqualTo(xOrLocation: Position | number, y?: number): boolean {
    if (Position.is(xOrLocation)) {
      return xOrLocation.location[0] === this.#location[0]
        && xOrLocation.location[1] === this.#location[1]
    } else {
      return xOrLocation === this.#location[0]
        && y === this.#location[1]
    }
  }

  distanceTo(x: number, y: number): number
  distanceTo(location: Position): number
  distanceTo(xOrLocation: Position | number, y?: number): number {
    if (Position.is(xOrLocation)) {
      return distance2D(this.#location, xOrLocation.location)
    } else {
      return distance2D(this.#location, [xOrLocation, y!])
    }
  }

  inRangeTo(x: number, y: number, range: number): boolean
  inRangeTo(location: Position, range: number): boolean
  inRangeTo(xOrLocation: Position | number, yOrRange: number, range?: number): boolean {
    if (Position.is(xOrLocation)) {
      return this.distanceTo(xOrLocation) < yOrRange
    } else {
      return this.distanceTo(xOrLocation, yOrRange) < range!
    }
  }
}