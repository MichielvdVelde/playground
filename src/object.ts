export interface BaseShape {
  _id: string
}

type Constructor<T extends BaseShape> = new (...args: any[]) => GameObject<T>

declare global {
  var Processor: {
    /**
     * Register an intent processor.
     * @param target The target game object
     * @param intent The intent name
     * @param processor The intent processor
     */
    register<Target extends Constructor<any>>(target: Target, intent: string, processor: (target: InstanceType<Target>) => void): void
    
    /**
     * Schedule an intent for delayed execution.
     * @param target The target game object
     * @param intent The intent name
     * @param delay The delay in milliseconds
     * @returns The job ID
     */
    schedule<Target extends Constructor<any>>(target: Target, intent: string, delay: number): Promise<string>
    
    /**
     * Execute an intent.
     * @param target The target game object
     * @param intent The intent name
     */
    execute<Target extends Constructor<any>>(target: Target, intent: string): Promise<void>

    /**
     * Abort a scheduled intent.
     * @param id The job ID
     */
    abort(id: string): Promise<void>
  }
  
  var Game: {
    /**
     * Register a game object.
     * @param target The target game object
     * @param name The object name
     */
    register<Target extends Constructor<any>>(target: Target, name?: string): void

    /**
     * Find objects by the given search query.
     * @param target The target(s)
     * @param query The search query
     */
    find<T extends Constructor<any>>(target: (T | T[]) | string | string[], query: any): Promise<InstanceType<T>[]>
  }
}

export abstract class GameObject<Shape extends BaseShape> {
  ['#data']: Shape

  constructor(data: Shape) {
    this['#data'] = data
  }

  get id() { return this['#data']._id }
}