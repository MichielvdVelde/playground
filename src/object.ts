export interface BaseShape<Type = any> {
  _id: Type
}

export abstract class GameObject<Shape extends BaseShape> {
  ['#data']: Shape

  constructor(data: Shape) {
    this['#data'] = data
  }

  get id() { return this['#data']._id }
}