import * as migration_20250501_162752_init from './20250501_162752_init';

export const migrations = [
  {
    up: migration_20250501_162752_init.up,
    down: migration_20250501_162752_init.down,
    name: '20250501_162752_init'
  },
];
