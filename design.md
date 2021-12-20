## Units

### Design

- Hull: determines base HP
- Drive: determines base thrust and base FTL speed
- Reactor: determines base power output
- Slots: determine abilities

#### Slots

- Weapon: can fire a limited-range weapon of a particular damage type and power
  - Capital weapons can have area-of-effect weapons
    - And can/should have a cooldown period
  - Should weapon power drop if the ship is damaged (proportional to HP loss)?
- Carry: can carry any kind or a particular kind of resource
  - Capacity/store is counted over all Carry slots
- Enhancement: enhances one base stat by either a flat rate or multiplier
- Repair: can repair itself and/or nearby friendly units
  - Has a max range
    - HP repaired drops off with distance
- [Extract: can extract any kind or a particular kind of resource from
  extractable objects]

### Stance

The unit/fleet stance determines what they do when other units arrive on-grid.

Only units which have at least one weapon can have a stance. Only fleets with at
least one unit with at least one weapon can have a stance.

Some structures (e.g. the orbital weapons platforms) also have a stance.

- Hold Fire: don't fire under any circumstances
- Fire when Fired Upon; self-explanatory
- Fire-at-Will; fire on any unit which is not an ally

### Attack Types

Only fleets can be given these commands. [Multiple fleets can be given the same
command and can be timed to arrive at the same time for maximum effect.]

- Raid: steal (some of) the enemy's resources
  - Fleet needs to have ships which can carry resources
  - Fleet has to drop off the resources at a player colony
    - Player can choose which colony (default is closest)
- Annihilate: destroy the enemy stronghold
- Hit And Run: do damage and run
  - Player can choose targets (e.g. shipyards, weapons platforms, extractors)
  - Fleet has to regroup at a player colony
    - Player can choose which colony (default is closest)
- Conquer: take over the enemy's colony

### Capital Ships

Capital Ships have an additional level which influences their base stats.
Capital Ships gain experience points for battles where they aren't destroyed.
Capital Ships can fit area-of-effect weapons.

[Capital Ships can improve the stats of other units in the same fleet.]

## Structures

### Extractor

Extracts one kind of resource. Base cycle duration is 90 minutes.

Output is determined by extractor location (noise field) and time (noise field).
The colony needs to have sufficient capacity to store the output, otherwise
(part of) the yield is lost and the extractor doesn't auto-cycle.

### Silo

Holds resources.

### Refinery

Refines ores into usable minerals.

### Shipyard

Can spawn non-capital hulls.

### Orbital Weapons Platform

Stationary defensive weapon.

### Planetary Shield Grid

Boosts colony HP.

### Capital Shipyard

Can build only capital-type hulls.

### Trade Hub

Allows the player to barter resources.

### Research Center

Conducts research. A player needs at least one Research Center to conduct
research. If the last Research Center is destroyed research is paused. Building
multiple Centers increases research speed (distance is not a factor).

### Hypergate

Allows units to travel twice as fast between colonies with a Hypergate.
[Friendly units can also make use of the player's Hypergates if they allow it.]

## Research

Each research topic has three levels. Each research topic can have zero, one, or
more rerequisite topics and levels.

```ts
async function x(name: string, id: string) {
  const Target = objectsMap.get(name);
  const data = await Store
    .db(Target.dbName)
    .collection<any>(Target.collectionName ?? "objects")
    .findById(id);
  return new Target(data);
}
```
