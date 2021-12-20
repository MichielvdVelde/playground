export interface BaseShape {
  _id: string
}

type Constructor<Shape extends BaseShape> = new (data: any) => GameObject<Shape>

type IntentContext<Payload = any> = {
  userId?: string
  payload: Payload
}

declare global {
  var Processor: {
    /**
     * Register an intent processor.
     * @param target The target game object
     * @param intent The intent name
     * @param processor The intent processor
     */
    register<Target extends Constructor<any>, Payload = any>(target: Target, intent: string, processor: (target: InstanceType<Target>, context: IntentContext<Payload>) => void): void
    
    /**
     * Schedule an intent for delayed execution.
     * @param target The target game object
     * @param intent The intent name
     * @param delay The delay in milliseconds
     * @param key The job key
     * @returns The job ID
     */
    schedule<Target extends Constructor<any>>(target: Target, intent: string, delay: number, key: string): Promise<string>
    
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
     * Find a game object by its ID.
     * @param target The target game object
     * @param id The target ID
     */
    findById<Target extends Constructor<any>>(target: Target, id: string): Promise<InstanceType<Target> | undefined>

    /**
     * Find the first matching game object.
     * @param target The target game object
     * @param query The search query
     */
    findOne<Target extends Constructor<any>>(target: Target, query: any): Promise<InstanceType<Target> | undefined>

    /**
     * Find objects by the given search query.
     * @param target The target(s)
     * @param query The search query
     */
    find<Target extends Constructor<any>>(target: Target | string | (Target | string)[], query: any): Promise<InstanceType<Target>[]>
  }
}

/**
 * Represents a base game object.
 * Game objects are persisted to the database.
 */
export abstract class GameObject<Shape extends BaseShape> {
  ['#data']: Shape

  constructor(data: Shape) {
    this['#data'] = data
  }

  get id() { return this['#data']._id }
}