import z from "zod";

export const envSchema = z.object({
  NEXT_PUBLIC_BASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production"]),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
