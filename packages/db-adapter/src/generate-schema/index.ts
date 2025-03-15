import fs from "node:fs/promises";
import path from "node:path";
import type { BetterAuthOptions } from "better-auth";
import { generateSchemaBuilderStage } from "./generate-schema-builder.js";
import { getPayloadSchema } from "./get-payload-schema.js";

export const generateSchema = async (
  BAoptions: BetterAuthOptions,
  options: { outputDir: string } = {
    outputDir: "./generated",
  }
): Promise<string> => {
  const { outputDir } = options;
  const existing_schema_code: string = await getPayloadSchema(outputDir);

  const new_schema_code = await generateSchemaBuilderStage({
    code: existing_schema_code,
    BAOptions: BAoptions,
  });

  const schemaPath = path.resolve(outputDir, "schema.ts");
  await fs.writeFile(schemaPath, new_schema_code, "utf8");

  return new_schema_code;
};
