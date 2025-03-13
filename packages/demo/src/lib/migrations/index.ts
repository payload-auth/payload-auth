import * as migration_20250313_041925_init from './20250313_041925_init';

export const migrations = [
  {
    up: migration_20250313_041925_init.up,
    down: migration_20250313_041925_init.down,
    name: '20250313_041925_init'
  },
];
