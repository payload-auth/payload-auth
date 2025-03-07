import * as migration_20250307_081044_admin from './20250307_081044_admin';
import * as migration_20250307_081801_token from './20250307_081801_token';

export const migrations = [
  {
    up: migration_20250307_081044_admin.up,
    down: migration_20250307_081044_admin.down,
    name: '20250307_081044_admin',
  },
  {
    up: migration_20250307_081801_token.up,
    down: migration_20250307_081801_token.down,
    name: '20250307_081801_token'
  },
];
