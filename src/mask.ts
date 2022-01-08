const Data = Symbol('data')
const PostTick = Symbol('postTick')

var Game: any

interface BaseShape {
  id: number,
  kind: string,
  pos: [x: number, y: number],
}

export class BoardObject<Shape extends BaseShape> {
  [Data]: Shape

  get id() { return this[Data].id }
  get kind() { return this[Data].kind }
  get pos() { return this[Data].pos }
}

export class Board {
  #objects: Record<number, BoardObject<any>> = {}

  getObjectsAtPosition(pos: [x: number, y: number]) {
    return Object.values(this.#objects).filter(object => object.pos[0] === pos[0] && object.pos[1] === pos[1])
  }
}

const acceptableKeys = ['id', 'kind', 'owner', 'hp']
const isAcceptable = (key: string) => acceptableKeys.includes(key)

function makeExploredObject(object: BoardObject<any>) {
  return Object.keys(object[Data]).filter(isAcceptable).reduce<Record<string, any>>((obj, key) => {
    obj[key] = object[Data][key]
    return obj
  }, {})
}

export class BoardMask {
  readonly board: Board
  #objects: Record<string, any> = {}
  #explored: [x: number, y: number, time: number, ids: number[]][] = []

  constructor(board: Board) {
    this.board = board
  }

  // Set for every tile which is visible during the active turn
  set explored(pos: [x: number, y: number]) {
    const info = this.#explored.find(explored => explored[0] === pos[0] && explored[1] === pos[1])
    if (info) {
      info[2] = Game.time
    } else {
      this.#explored.push([pos[0], pos[1], Game.time, []])
    }
  }

  isExplored(pos: [x: number, y: number]) {
    return this.#explored.find(explored => explored[0] === pos[0] && explored[1] === pos[1]) ? true : false
  }

  getTimeAtPosition(pos: [x: number, y: number]) {
    return this.#explored.find(explored => explored[0] === pos[0] && explored[1])?.[2]
  }

  getAgeAtPosition(pos: [x: number, y: number]) {
    const time = this.getTimeAtPosition(pos)
    return time ? Game.time - time : undefined
  }

  getObjectsAtPosition(pos: [x: number, y: number]) {
    return Object.values(this.#explored).filter(explored => explored[0] === pos[0] && explored[1] === pos[1]).map(explored => {
      return explored[3].map(id => this.#objects[id])
    })
  }

  [PostTick]() {
    this.#explored.filter(explored => explored[2] === Game.time).forEach(explored => {
      const objects = this.board.getObjectsAtPosition([explored[0], explored[1]]).map(object => {
        return makeExploredObject(object)
      })

      const objectIds = objects.map(o => o.id)
      if (objectIds.length) {
        // Remove the object id from a current location, if any
        this.#explored.forEach(e => {
          for (const objectId of objectIds) {
            if (e[3].includes(objectId)) {
              e[3].splice(e[3].indexOf(objectId), 1)
            }
          }
        })
      }

      explored[3] = objectIds
      objects.forEach(object => this.#objects[object.id] = object)
    })
  }
  
  toJSON() {
    return {
      explored: this.#explored,
      objects: this.#objects,
    }
  }

  toString() {
    return '[BoardMask]'
  }
}