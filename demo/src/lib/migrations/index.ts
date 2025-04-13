import * as migration_20250407_025820_init from './20250407_025820_init';
import * as migration_20250413_061658_admin_invitations from './20250413_061658_admin_invitations';
import * as migration_20250413_064156_admin_invitations_index from './20250413_064156_admin_invitations_index';
import * as migration_20250413_084051_admin_invitations_url from './20250413_084051_admin_invitations_url';

export const migrations = [
  {
    up: migration_20250407_025820_init.up,
    down: migration_20250407_025820_init.down,
    name: '20250407_025820_init',
  },
  {
    up: migration_20250413_061658_admin_invitations.up,
    down: migration_20250413_061658_admin_invitations.down,
    name: '20250413_061658_admin_invitations',
  },
  {
    up: migration_20250413_064156_admin_invitations_index.up,
    down: migration_20250413_064156_admin_invitations_index.down,
    name: '20250413_064156_admin_invitations_index',
  },
  {
    up: migration_20250413_084051_admin_invitations_url.up,
    down: migration_20250413_084051_admin_invitations_url.down,
    name: '20250413_084051_admin_invitations_url'
  },
];
