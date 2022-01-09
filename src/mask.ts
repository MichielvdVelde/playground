const Data = Symbol('data')
const PostTurn = Symbol('postTurn')

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

type AnyBoardObject = BoardObject<any>

export class Board {
  #objects: Record<number, AnyBoardObject> = {}

  getObjectsAtPosition(pos: [x: number, y: number]) {
    return Object.values(this.#objects).filter(object => object.pos[0] === pos[0] && object.pos[1] === pos[1])
  }

  getObjectById<Type extends AnyBoardObject>(id: number): Type | undefined {
    return this.#objects[id] as Type | undefined
  }
}

const acceptableKeys = ['id', 'kind', 'owner', 'hp']
const isAcceptable = (key: string) => acceptableKeys.includes(key)

function makeExploredObject(object: AnyBoardObject) {
  return Object.keys(object[Data]).filter(isAcceptable).reduce<Record<string, any>>((obj, key) => {
    obj[key] = object[Data][key]
    return obj
  }, {})
}

export class BoardMask {
  readonly board: Board
  #objects: Record<string, any> = {}
  #explored: Record<number, Record<number, [time: number, ids: number[]]>> = []

  constructor(board: Board) {
    this.board = board
  }

  // Set for every tile which is visible during the active turn
  explored(pos: [x: number, y: number]) {
    const info = this.#explored[pos[0]]?.[pos[1]]
    if (info) {
      info[0] = Game.time
    } else {
      if (!this.#explored[pos[0]]) {
        this.#explored[pos[0]] = {}
      }
      this.#explored[pos[0]][pos[1]] = [Game.time, []]
    }
  }

  isExplored(pos: [x: number, y: number]) {
    return !!this.#explored[pos[0]]?.[pos[1]]
  }

  getInfoAtPosition(pos: [x: number, y: number]) {
    return this.#explored[pos[0]]?.[pos[1]]
  }

  getTimeAtPosition(pos: [x: number, y: number]) {
    return this.getInfoAtPosition(pos)?.[0]
  }

  getAgeAtPosition(pos: [x: number, y: number]) {
    const time = this.getTimeAtPosition(pos)
    return time ? Game.time - time : undefined
  }

  getObjectsAtPosition(pos: [x: number, y: number]) {
    return this.#explored[pos[0]]?.[pos[1]]?.[1]?.map(id => this.#objects[id])
  }

  [PostTurn]() {
    for (const [x, array] of Object.entries(this.#explored)) {
      for (const [y, info] of Object.entries(array)) {
        if (info[0] !== Game.time) {
          continue
        }
        const objects = this.board.getObjectsAtPosition([x as never, y as never]).map(object => makeExploredObject(object))
        const objectIds = objects.map(o => o.id)
        if (objectIds.length) {
          this.#removeObjectIds(objectIds)
        }

        info[1] = objectIds
        objects.forEach(object => this.#objects[object.id] = object)
      }
    }
  }

  #removeObjectIds(objectIds: number[]) {
    for (const array of Object.values(this.#explored)) {
      for (const info of Object.values(array)) {
        if (info[1].length) {
          for (const objectId of objectIds) {
            if (info[1].includes(objectId)) {
              info[1].splice(info[1].indexOf(objectId), 1)
            }
          }
        }
      }
    }
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