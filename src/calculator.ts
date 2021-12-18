import { data } from './static.js'

interface BaseShape<Type = any> {
  _id: Type,
}

type WeaponTypes = 'em' | 'thermal' | 'kinetic'
type ResistTypes = WeaponTypes
export type ResourceTypes = 'H'

interface ShipDesign {
  hull: string,
  drive: string,
  reactor: string,
  slots: string[],
}

interface ShipPart extends BaseShape<string> {
  readonly name: string
  readonly description: string
  readonly baseConstructionTime: number
  readonly baseConstructionResources: Partial<Record<ResourceTypes, number>>,
  readonly baseMass: number
  readonly level: number
}

export interface Hull extends ShipPart {
  readonly hp: number
  readonly basePowerInput: number
  readonly baseResists: Partial<Record<ResistTypes, number>>,
  readonly slots: number
}

export interface Drive extends ShipPart {
  readonly basePowerInput: number
  readonly baseThrust: number
  readonly baseFTL: number
}

export interface Reactor extends ShipPart {
  readonly basePowerOutput: number
}

export type ShipSlot = Weapon | Carry | Enhancement

export interface Weapon extends ShipPart {
  type: WeaponTypes,
  power: number,
  baseFallOff: number,
  basePowerInput: number
  baseCooldown?: number,
}

export interface Carry extends ShipPart {
  resourceType?: ResourceTypes,
  baseCapacity: number,
  basePowerInput: number,
}

export interface Enhancement extends ShipPart {
  type: string,
  baseModifier: number,
  basePowerInput: number,
}




function c2e<Type>(str: string): Type {
  return data[str] as Type
}

function isEnhancement(obj: any): obj is Enhancement {
  return !!obj.type && !!obj.baseModifier
}

export function calculateBaseStats(design: ShipDesign) {
  const hull = c2e<Hull>(design.hull)
  const drive = c2e<Drive>(design.drive)
  const reactor = c2e<Reactor>(design.reactor)
  const slots = design.slots.map((slot => c2e<ShipSlot>(slot)))

  const baseHp = hull.hp
    * slots.filter(slot => isEnhancement(slot) && slot.type === 'hp')
      .reduce((count, slot) => count * (slot as Enhancement).baseModifier, 1)

  const baseMass = (hull.baseMass
    + drive.baseMass
    + reactor.baseMass
    + slots.map(slot => slot.baseMass).reduce((input, baseInput) => input + baseInput, 0))
    * slots.filter(slot => isEnhancement(slot) && slot.type === 'mass')
      .reduce((count, slot) => count * (slot as Enhancement).baseModifier, 1)

  const basePowerInput = (hull.basePowerInput
    + drive.basePowerInput
    + slots.map(slot => slot.basePowerInput).reduce((input, baseInput) => input + baseInput, 0))
    * slots.filter(slot => isEnhancement(slot) && slot.type === 'power:input')
      .reduce((count, slot) => count * (slot as Enhancement).baseModifier, 1)

  const basePowerOutput = reactor.basePowerOutput
    * slots.filter(slot => isEnhancement(slot) && slot.type === 'power:output')
      .reduce((count, slot) => count * (slot as Enhancement).baseModifier, 1)

  const baseResists = function () {
    const resists: Partial<Record<ResistTypes, number>> = {}

    // Is this necessary to avoid mutating `hull.baseResists`?
    Object.keys(hull.baseResists).forEach((resist) => {
      resists[resist as ResistTypes] = hull.baseResists[resist as ResistTypes]
    })

    slots.filter(slot => isEnhancement(slot) && slot.type.startsWith('resist:')).forEach(slot => {
      // Stupid type guard
      if (isEnhancement(slot)) {
        const type = slot.type.substring(slot.type.indexOf(':') + 1) as ResistTypes
        resists[type] = resists[type]! * slot.baseModifier
      }
    })

    return resists
  }()

  const baseConstructionTime = hull.baseConstructionTime
    + drive.baseConstructionTime
    + reactor.baseConstructionTime
    + slots.map(slot => slot.baseConstructionTime).reduce((time, baseTime) => time + baseTime, 0)

  const baseConstructionResources = function () {
    const resources: Partial<Record<ResourceTypes, number>> = {}

    Object.keys(hull.baseConstructionResources).forEach(resource => {
      resources[resource as ResourceTypes] = (resources[resource as ResourceTypes] ?? 0) + hull.baseConstructionResources[resource as ResourceTypes]!
    })

    Object.keys(drive.baseConstructionResources).forEach(resource => {
      resources[resource as ResourceTypes] = (resources[resource as ResourceTypes] ?? 0) + drive.baseConstructionResources[resource as ResourceTypes]!
    })

    Object.keys(reactor.baseConstructionResources).forEach(resource => {
      resources[resource as ResourceTypes] = (resources[resource as ResourceTypes] ?? 0) + reactor.baseConstructionResources[resource as ResourceTypes]!
    })

    slots.forEach(slot => {
      Object.keys(slot.baseConstructionResources).forEach(resource => {
        resources[resource as ResourceTypes] = (resources[resource as ResourceTypes] ?? 0) + slot.baseConstructionResources[resource as ResourceTypes]!
      })
    })

    return resources
  }()

  return {
    baseHp,
    baseMass,
    baseResists,
    basePowerInput,
    basePowerOutput,
    baseConstructionTime,
    baseConstructionResources,
  }
}