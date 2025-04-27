import * as migration_20250414_182321_init from './20250414_182321_init';
import * as migration_20250427_081526_schema from './20250427_081526_schema';

export const migrations = [
  {
    up: migration_20250414_182321_init.up,
    down: migration_20250414_182321_init.down,
    name: '20250414_182321_init',
  },
  {
    up: migration_20250427_081526_schema.up,
    down: migration_20250427_081526_schema.down,
    name: '20250427_081526_schema'
  },
];
