import { distance2D } from './util.js'

type Titanium = 'Ti'
type Uranium = 'U'
type Thorium = 'Th'
type Cobalt = 'Co'
type ResourceTypes = Titanium | Uranium | Thorium | Cobalt

export const resourceTypes = ['Ti', 'U', 'Th', 'Co'] as readonly [Titanium, Uranium, Thorium, Cobalt]

const random = (max: number) => Math.round(Math.random() * max)

export function generateResourceMap(mapSize: number, locationsPerResource: number) {
  const locations = new Map<ResourceTypes, [x: number, y: number][]>()

  function isTooClose(source: [x: number, y: number], min: number) {
    return [...locations.values()]
      .some(locs => locs.some(loc => distance2D(source, loc) < min))
  }

  function genPos(distanceFromBorder: number, distanceFromOthers: number): [x: number, y: number] {
    const x = random(mapSize)
    const y = random(mapSize)

    if (x < distanceFromBorder || y < distanceFromBorder || x > mapSize - distanceFromBorder || y > mapSize - distanceFromBorder) {
      return genPos(distanceFromBorder, distanceFromOthers)
    } else if (isTooClose([x, y], distanceFromOthers)) {
      return genPos(distanceFromBorder, distanceFromOthers)
    }
    return [x, y]
  }

  for (const resource of resourceTypes) {
    for (let i = 0; i < locationsPerResource; i++) {
      const pos = genPos(mapSize / 10, mapSize / 5)
      if (locations.has(resource)) {
        locations.get(resource)!.push(pos)
      } else {
        locations.set(resource, [pos])
      }
    }
  }

  return locations
}