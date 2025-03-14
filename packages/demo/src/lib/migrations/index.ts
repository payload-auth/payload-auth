import * as migration_20250314_041852_init from './20250314_041852_init';

export const migrations = [
  {
    up: migration_20250314_041852_init.up,
    down: migration_20250314_041852_init.down,
    name: '20250314_041852_init'
  },
];
