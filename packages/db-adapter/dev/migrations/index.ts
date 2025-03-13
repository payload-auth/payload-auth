import * as migration_20250312_054452_init from "./20250312_054452_init.js";
import * as migration_20250312_060050_init from "./20250312_060050_init.js";
import * as migration_20250312_060447_init from "./20250312_060447_init.js";

export const migrations = [
	{
		up: migration_20250312_054452_init.up,
		down: migration_20250312_054452_init.down,
		name: "20250312_054452_init",
	},
	{
		up: migration_20250312_060050_init.up,
		down: migration_20250312_060050_init.down,
		name: "20250312_060050_init",
	},
	{
		up: migration_20250312_060447_init.up,
		down: migration_20250312_060447_init.down,
		name: "20250312_060447_init",
	},
];
