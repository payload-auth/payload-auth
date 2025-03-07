import type { BetterAuthOptions } from "better-auth";
import { generateSchemaBuilderStage } from "./generate-schema-builder";

export const generateSchema = async (
  options: BetterAuthOptions
): Promise<string> => {
  return await generateSchemaBuilderStage({ options });
};
