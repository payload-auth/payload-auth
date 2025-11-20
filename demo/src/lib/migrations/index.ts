import * as migration_20251120_225725_init from './20251120_225725_init';

export const migrations = [
  {
    up: migration_20251120_225725_init.up,
    down: migration_20251120_225725_init.down,
    name: '20251120_225725_init'
  },
];
