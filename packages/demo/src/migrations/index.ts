import * as migration_20250311_012905_init from './20250311_012905_init';

export const migrations = [
  {
    up: migration_20250311_012905_init.up,
    down: migration_20250311_012905_init.down,
    name: '20250311_012905_init'
  },
];
