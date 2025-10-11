import * as migration_20250501_162752_init from './20250501_162752_init';
import * as migration_20251010_192449_bav3update from './20251010_192449_bav3update';
import * as migration_20251011_022137_sessionActiveOrg from './20251011_022137_sessionActiveOrg';

export const migrations = [
  {
    up: migration_20250501_162752_init.up,
    down: migration_20250501_162752_init.down,
    name: '20250501_162752_init',
  },
  {
    up: migration_20251010_192449_bav3update.up,
    down: migration_20251010_192449_bav3update.down,
    name: '20251010_192449_bav3update',
  },
  {
    up: migration_20251011_022137_sessionActiveOrg.up,
    down: migration_20251011_022137_sessionActiveOrg.down,
    name: '20251011_022137_sessionActiveOrg'
  },
];
