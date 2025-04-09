import * as migration_20250407_025820_init from './20250407_025820_init';

export const migrations = [
  {
    up: migration_20250407_025820_init.up,
    down: migration_20250407_025820_init.down,
    name: '20250407_025820_init'
  },
];
