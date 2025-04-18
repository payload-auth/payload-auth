import * as migration_20250322_201301_init from './20250322_201301_init'

export const migrations = [
  {
    up: migration_20250322_201301_init.up,
    down: migration_20250322_201301_init.down,
    name: '20250322_201301_init'
  }
]
