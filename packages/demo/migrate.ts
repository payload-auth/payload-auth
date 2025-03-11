import getPayload from "./src/lib/getPayload";

async function migrate() {
  const payload = await getPayload();
  await payload.db.createMigration({
    file: "./migrations",
    payload,
    migrationName: "init",
    forceAcceptWarning: true,
  });
  //   await payload.db.migrate()
}

migrate()
  .then(() => {
    console.log("Migration successful");
  })
  .catch((error) => {
    console.error(error);
  });
