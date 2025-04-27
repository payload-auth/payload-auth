import * as migration_20250427_195950_init from './20250427_195950_init';

export const migrations = [
  {
    up: migration_20250427_195950_init.up,
    down: migration_20250427_195950_init.down,
    name: '20250427_195950_init'
  },
];
