import z from "zod";

export const envSchema = z.object({
  DATABASE_URI: z.string(),
  PAYLOAD_SECRET: z.string(),
  NEXT_PUBLIC_SERVER_URL: z.string(),
  CRON_SECRET: z.string(),
  PREVIEW_SECRET: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
