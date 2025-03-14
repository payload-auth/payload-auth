import fs from "node:fs/promises";

export const getPayloadSchema = async (
	payloadDirPath: string,
): Promise<string> => {
	let files: string[];
	try {
		files = await fs.readdir(payloadDirPath);
	} catch (error: any) {
		if (error.code === "ENOENT") {
			throw new Error(
				`Payload directory not found at "${payloadDirPath}". Please run this CLI from the project root directory where the payload directory is located, otherwise specify a payload directory path in your payloadAdapter options, under schema_generation.payload_dir_path.`,
			);
		}
		console.error(error);
		throw new Error(
			`Failed to access payload directory at "${payloadDirPath}".`,
		);
	}

	if (!files.includes(`schema.ts`)) return "";
	try {
		const schemaCode = await fs.readFile(`${payloadDirPath}/schema.ts`, "utf8");
		return schemaCode;
	} catch (error) {
		console.error(error);
		throw new Error(
			`PayloadAdapter: Failed to read schema.ts file from "${payloadDirPath}".`,
		);
	}
};
