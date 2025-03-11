import { getPayload } from "./dev";

async function migrate() {
	const payload = await getPayload();
	await payload.db.createMigration({
		file: "init",
		payload,
		migrationName: "init",
		forceAcceptWarning: true,
	});
	await payload.db.migrate();
}

migrate()
	.then(() => {
		console.log("Migration successful");
	})
	.catch((error) => {
		console.error(error);
	});
