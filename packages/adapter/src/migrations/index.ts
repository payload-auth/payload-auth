import * as migration_20250309_093604_init from './20250309_093604_init';

export const migrations = [
  {
    up: migration_20250309_093604_init.up,
    down: migration_20250309_093604_init.down,
    name: '20250309_093604_init'
  },
];
