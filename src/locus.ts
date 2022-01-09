import { distance2D } from './util.js'

export class Locus {
  // Combine multile loci and return all points inside all loci
  static combine(...loci: Locus[]): [x: number, y: number][] {
    const combined: [x: number, y: number][] = []
    const has = (pos: [x: number, y: number]) => combined.some(c => pos[0] === c[0] && pos[1] === c[1])
    for (const locus of loci) {
      for (const point of locus.points) {
        if (!has(point)) {
          combined.push(point)
        }
      }
    }
    return combined
  }

  #pos: [x: number, y: number]
  #radius: number
  #points: [x: number, y: number][]

  constructor(pos: [x: number, y: number], radius: number) {
    this.#pos = pos
    this.#radius = radius
    this.#points = this.#calcPoints()
  }

  get pos(): [x: number, y: number] {
    return this.#pos
  }

  get radius(): number {
    return this.#radius
  }

  set pos(pos: [x: number, y: number]) {
    if (this.#pos[0] !== pos[0] || this.#pos[1] !== pos[1]) {
      this.#pos = pos
      this.#points = this.#calcPoints()
    }
  }

  set radius(radius: number) {
    if (this.#radius !== radius) {
      this.#radius = radius
      this.#points = this.#calcPoints()
    }
  }

  // Get all points inside the locus
  get points(): [x: number, y: number][] {
    return this.#points
  }

  isInside(pos: [x: number, y: number]) {
    return distance2D(this.#pos, pos) <= this.#radius
  }

  // Calculate all points inside the locus
  #calcPoints(): [x: number, y: number][] {
    // Brute-force find all points in a circle by tracing a square and running a distance method on each coordinate.
    const points: [x: number, y: number][] = []
    for (let x = this.#pos[0] - this.#radius; x <= this.#pos[0] + this.#radius; x++) {
      for (let y = this.#pos[1] - this.#radius; y <= this.#pos[1] + this.#radius; y++) {
        if (this.isInside([x, y])) {
          points.push([x, y])
        }
      }
    }
    return points
  }
}