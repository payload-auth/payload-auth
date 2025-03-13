import fs from "node:fs/promises";
import path from "node:path";
import type { BetterAuthOptions } from "better-auth";
import { generateSchemaBuilderStage } from "./generate-schema-builder";
import { getPayloadSchema } from "./get-payload-schema";

export const generateSchema = async (
	BAoptions: BetterAuthOptions,
	options: { output_dir: string } = {
		output_dir: "./generated",
	},
): Promise<string> => {
	const { output_dir } = options;
	const existing_schema_code: string = await getPayloadSchema(output_dir);

	const new_schema_code = await generateSchemaBuilderStage({
		code: existing_schema_code,
		BAOptions: BAoptions,
	});

	const schemaPath = path.resolve(output_dir, "schema.ts");
	await fs.writeFile(schemaPath, new_schema_code, "utf8");

	return new_schema_code;
};
