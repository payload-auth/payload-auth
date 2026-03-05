import * as migration_20260305_071436_init from './20260305_071436_init';
import * as migration_20260305_072846_removeEmialHarmony from './20260305_072846_removeEmialHarmony';

export const migrations = [
  {
    up: migration_20260305_071436_init.up,
    down: migration_20260305_071436_init.down,
    name: '20260305_071436_init',
  },
  {
    up: migration_20260305_072846_removeEmialHarmony.up,
    down: migration_20260305_072846_removeEmialHarmony.down,
    name: '20260305_072846_removeEmialHarmony'
  },
];
