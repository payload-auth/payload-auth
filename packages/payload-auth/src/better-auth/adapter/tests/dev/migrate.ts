import { getPayload } from './index'
import * as migration_20250423_232936_init from './migrations/20250423_232936_init'

async function migrate() {
  const payload = await getPayload()
  //   await payload.db.createMigration({
  //     file: 'init',
  //     payload,
  //     migrationName: 'init',
  //     forceAcceptWarning: true
  //   })
  //   await payload.db.migrate({
  //     migrations: [
  //       {
  //         up: migration_20250423_232936_init.up,
  //         down: migration_20250423_232936_init.down,
  //         name: '20250423_232936_init'
  //       }
  //     ]
  //   })
}

migrate()
  .then(() => {
    console.log('Migration successful')
  })
  .catch((error) => {
    console.error(error)
  })
