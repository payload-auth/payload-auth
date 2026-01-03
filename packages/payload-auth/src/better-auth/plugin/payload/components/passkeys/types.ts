import type { UIFieldServerProps } from "payload";
import type { Passkey } from "@/better-auth/generated-types";
import type {
  BuiltBetterAuthSchema,
  PayloadAuthOptions
} from "@/better-auth/types";

export type PasskeyWithId = Passkey & { id: string; createdAt: Date };

export interface PasskeysServerComponentProps extends UIFieldServerProps {
  schema: BuiltBetterAuthSchema;
  passkeySlug: string;
  passkeyUserIdFieldName: string;
  pluginOptions: PayloadAuthOptions;
}

export interface PasskeysClientComponentProps {
  initialPasskeys: PasskeyWithId[];
  documentId: string | number;
  currentUserId: string | number;
  passkeySlug: string;
  passkeyUserIdFieldName: string;
  baseURL?: string;
  basePath?: string;
}
