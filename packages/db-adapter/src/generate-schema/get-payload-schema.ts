import fs from "node:fs/promises";

export const getPayloadSchema = async (
	payload_dir_path: string,
): Promise<string> => {
	let files: string[];
	try {
		files = await fs.readdir(payload_dir_path);
	} catch (error: any) {
		if (error.code === "ENOENT") {
			throw new Error(
				`Payload directory not found at "${payload_dir_path}". Please run this CLI from the project root directory where the payload directory is located, otherwise specify a payload directory path in your payloadAdapter options, under schema_generation.payload_dir_path.`,
			);
		}
		console.error(error);
		throw new Error(
			`Failed to access payload directory at "${payload_dir_path}".`,
		);
	}

	if (!files.includes(`schema.ts`)) return "";
	try {
		const schema_code = await fs.readFile(
			`${payload_dir_path}/schema.ts`,
			"utf8",
		);
		return schema_code;
	} catch (error) {
		console.error(error);
		throw new Error(
			`PayloadAdapter: Failed to read schema.ts file from "${payload_dir_path}".`,
		);
	}
};
