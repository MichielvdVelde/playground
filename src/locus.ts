import { distance2D } from './util.js'

export class Locus {
  #pos: [x: number, y: number]
  #radius: number

  constructor(pos: [x: number, y: number], radius: number) {
    this.#pos = pos
    this.#radius = radius
  }

  get pos(): [x: number, y: number] {
    return this.#pos
  }

  get radius(): number {
    return this.#radius
  }

  set pos(pos: [x: number, y: number]) {
    this.#pos = pos
  }

  // Get all points inside the locus
  get points(): [x: number, y: number][] {
    // Brute-force find all points in a circle by tracing a square and running a distance method
    // on each coordinate. There probably is a better way to do this.
    const points: [x: number, y: number][] = []
    for (let x = this.#pos[0] - this.#radius; x <= this.#pos[0] + this.#radius; x++) {
      for (let y = this.#pos[1] - this.#radius; y <= this.#pos[1] + this.#radius; y++) {
        if (distance2D(this.#pos, [x, y]) <= this.#radius) {
          points.push([x, y])
        }
      }
    }
    return points
  }

  isInside(pos: [x: number, y: number]) {
    return distance2D(this.#pos, pos) <= this.#radius
  }
}