import * as migration_20250414_182321_init from './20250414_182321_init'

export const migrations = [
  {
    up: migration_20250414_182321_init.up,
    down: migration_20250414_182321_init.down,
    name: '20250414_182321_init'
  }
]
