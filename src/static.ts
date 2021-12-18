export const data: Record<string, any> = {
  hull1: {
    name: 'Hull I',
    description: 'This is a hull.',
    baseConstructionTime: 300,
    baseConstructionResources: {
      H: 100
    },
    baseMass: 1000000,
    level: 1,
    hp: 1000,
    basePowerInput: 50000,
    baseResists: {
      em: 0,
      thermal: 0,
      kinetic: 0.5,
    }
  },
  drive1: {
    name: 'Drive I',
    description: '',
    baseConstructionTime: 190,
    baseConstructionResources: {
      H: 50
    },
    baseMass: 56000,
    level: 1,
    basePowerInput: 25000,
    baseThrust: 50000,
    baseFTL: 25,
  },
  reactor1: {
    name: 'Reactor I',
    description: '',
    baseConstructionTime: 120,
    baseConstructionResources: {
      H: 500,
    },
    baseMass: 24500,
    level: 1,
    basePowerOutput: 500000,
  }
}