import fs from "node:fs/promises";
import path from "node:path";
import type { BetterAuthOptions } from "better-auth";
import { generateSchemaBuilderStage } from "./generate-schema-builder";
import { getPayloadSchema } from "./get-payload-schema";

export const generateSchema = async (
  BAoptions: BetterAuthOptions,
  options: { payload_dir_path: string } = {
    payload_dir_path: "./payload",
  }
): Promise<string> => {
  const { payload_dir_path } = options;
  const existing_schema_code: string = await getPayloadSchema(payload_dir_path);

  const new_schema_code = await generateSchemaBuilderStage({
    code: existing_schema_code,
    BAOptions: BAoptions,
  });

  const schemaPath = path.resolve(payload_dir_path, "schema.ts");
  await fs.writeFile(schemaPath, new_schema_code, "utf8");

  return new_schema_code;
};
