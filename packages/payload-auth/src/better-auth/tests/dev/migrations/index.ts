import * as migration_20260305_071436_init from './20260305_071436_init';
import * as migration_20260305_072846_removeEmialHarmony from './20260305_072846_removeEmialHarmony';
import * as migration_20260322_212925_init from './20260322_212925_init';
import * as migration_20260729_172137 from './20260729_172137';
import * as migration_20260729_173904_ba_1_6_schema_updates from './20260729_173904_ba_1_6_schema_updates';
import * as migration_20261030_005216_ba_1_7_schema_updates from './20261030_005216_ba_1_7_schema_updates';

export const migrations = [
  {
    up: migration_20260305_071436_init.up,
    down: migration_20260305_071436_init.down,
    name: '20260305_071436_init',
  },
  {
    up: migration_20260305_072846_removeEmialHarmony.up,
    down: migration_20260305_072846_removeEmialHarmony.down,
    name: '20260305_072846_removeEmialHarmony',
  },
  {
    up: migration_20260322_212925_init.up,
    down: migration_20260322_212925_init.down,
    name: '20260322_212925_init',
  },
  {
    up: migration_20260729_172137.up,
    down: migration_20260729_172137.down,
    name: '20260729_172137',
  },
  {
    up: migration_20260729_173904_ba_1_6_schema_updates.up,
    down: migration_20260729_173904_ba_1_6_schema_updates.down,
    name: '20260729_173904_ba_1_6_schema_updates',
  },
  {
    up: migration_20261030_005216_ba_1_7_schema_updates.up,
    down: migration_20261030_005216_ba_1_7_schema_updates.down,
    name: '20261030_005216_ba_1_7_schema_updates'
  },
];
