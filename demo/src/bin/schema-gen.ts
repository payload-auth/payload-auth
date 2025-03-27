import { generateSchema } from "@payload-auth/better-auth-db-adapter";
import { betterAuthOptions } from "@/lib/auth/options";

await generateSchema(betterAuthOptions, {
  outputDir: "./src/payload/schema",
})
  .then(() => {
    console.log("Schema generated successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error generating schema", err);
    process.exit(1);
  });
