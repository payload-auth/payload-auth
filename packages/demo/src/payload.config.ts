import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { plugins } from "./payload/plugins";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const allowedOrigins = [process.env.NEXT_PUBLIC_SERVER_URL].filter(Boolean);

export default buildConfig({
  admin: {
    user: "users",
    importMap: {
      baseDir: path.resolve(dirname),
    },
    routes: {
      login: "/login-redirect",
      logout: "/logout-redirect",
      createFirstUser: "/create-admin-redirect",
    },
    components: {
      beforeLogin: [
        {
          path: "@/payload/components/login-redirect.tsx",
        },
      ],
      views: {
        login: {
          path: "/login",
          Component: "@/payload/views/login",
        },
        // logout: {
        //   path: "/logout",
        //   Component: "@/payload/views/logout.tsx",
        // },
      },
    },
  },
  collections: [],
  db: postgresAdapter({
    disableCreateDatabase: true,
    pool: {
      connectionString: process.env.DATABASE_URI,
    },
    push: false,
    migrationDir: path.resolve(dirname, "lib/migrations"),
  }),
  editor: lexicalEditor(),
  plugins,
  secret: process.env.PAYLOAD_SECRET || "test-secret_key",
  cors: allowedOrigins,
  csrf: allowedOrigins,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
});
