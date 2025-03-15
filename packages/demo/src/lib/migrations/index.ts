import * as migration_20250315_004958_init from './20250315_004958_init';
import * as migration_20250315_010300_projects from './20250315_010300_projects';
import * as migration_20250315_023124_userName from './20250315_023124_userName';

export const migrations = [
  {
    up: migration_20250315_004958_init.up,
    down: migration_20250315_004958_init.down,
    name: '20250315_004958_init',
  },
  {
    up: migration_20250315_010300_projects.up,
    down: migration_20250315_010300_projects.down,
    name: '20250315_010300_projects',
  },
  {
    up: migration_20250315_023124_userName.up,
    down: migration_20250315_023124_userName.down,
    name: '20250315_023124_userName'
  },
];
