import type { CollectionAfterChangeHook } from "payload";
import { baModelKey } from "@/better-auth/plugin/constants";
import type { BetterAuthSchemas } from "@/better-auth/plugin/types";
import {
  getSchemaCollectionSlug,
  getSchemaFieldName
} from "../../utils/collection-schema";

export function getSyncPasswordToUserHook(
  resolvedSchemas: BetterAuthSchemas
): CollectionAfterChangeHook {
  const hook: CollectionAfterChangeHook = async ({
    doc,
    req,
    operation,
    context
  }) => {
    if (context?.syncAccountHook) return doc;

    if (operation !== "create" && operation !== "update") {
      return doc;
    }
    const userSlug = getSchemaCollectionSlug(resolvedSchemas, baModelKey.user);
    const accountSlug = getSchemaCollectionSlug(
      resolvedSchemas,
      baModelKey.account
    );
    const userField = getSchemaFieldName(
      resolvedSchemas,
      baModelKey.account,
      "userId"
    );

    if (!doc[userField]) {
      return doc;
    }

    const account = await req.payload.findByID({
      collection: accountSlug,
      id: doc.id,
      depth: 0,
      req,
      showHiddenFields: true
    });

    if (!account || !account.password) {
      return doc;
    }

    const [salt, hash] = account.password.split(":");

    if (!salt || !hash) {
      return doc;
    }

    const userId =
      typeof doc[userField] === "object" ? doc[userField]?.id : doc[userField];

    try {
      await req.payload.update({
        collection: userSlug,
        id: userId,
        data: {
          salt,
          hash
        },
        req,
        context: { syncPasswordToUser: true }
      });
    } catch (error) {
      console.error("Failed to sync password to user:", error);
    }

    return doc;
  };

  return hook as CollectionAfterChangeHook;
}
