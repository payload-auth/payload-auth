import {
  type CollectionBeforeDeleteHook,
  commitTransaction,
  initTransaction,
  killTransaction
} from "payload";
import { baModelKey } from "@/better-auth/plugin/constants";

export function getBeforeDeleteHook(): CollectionBeforeDeleteHook {
  const hook: CollectionBeforeDeleteHook = async ({ req, id }) => {
    const collections = req.payload.collections;

    /**
     * Resolves the slug for a model key, returning null if the collection
     * doesn't exist (e.g. optional plugin collections like passkeys, twoFactor).
     */
    function getSlugSafe(modelKey: string): string | null {
      const collection = Object.values(collections).find(
        (c) =>
          c.config?.custom?.betterAuthModelKey === modelKey ||
          c.config?.slug === modelKey
      );
      return collection?.config?.slug ?? null;
    }

    try {
      const { payload } = req;
      const userId = id;

      const shouldCommit = await initTransaction(req);

      // Core collections (always exist)
      const coreModels = [
        baModelKey.account,
        baModelKey.session
      ] as const;

      for (const modelKey of coreModels) {
        const slug = getSlugSafe(modelKey);
        if (slug) {
          await payload.delete({
            collection: slug,
            where: { user: { equals: userId } },
            req
          });
        }
      }

      // Verifications: use contains with JSON-quoted userId to avoid
      // substring collisions (e.g. userId "1" matching "10", "12", etc.)
      const verificationsSlug = getSlugSafe(baModelKey.verification);
      if (verificationsSlug) {
        await payload.delete({
          collection: verificationsSlug,
          where: { value: { contains: `"${userId}"` } },
          req
        });
      }

      // Optional plugin collections — only delete if the collection exists
      const optionalUserModels = [
        baModelKey.passkey,
        baModelKey.twoFactor,
        baModelKey.apikey,
        baModelKey.ssoProvider,
        baModelKey.oauthApplication,
        baModelKey.oauthAccessToken,
        baModelKey.oauthConsent
      ] as const;

      for (const modelKey of optionalUserModels) {
        const slug = getSlugSafe(modelKey);
        if (slug) {
          await payload.delete({
            collection: slug,
            where: { user: { equals: userId } },
            req
          });
        }
      }

      // Organization plugin: members and invitations reference user
      const membersSlug = getSlugSafe(baModelKey.member);
      if (membersSlug) {
        await payload.delete({
          collection: membersSlug,
          where: { user: { equals: userId } },
          req
        });
      }

      const invitationsSlug = getSlugSafe(baModelKey.invitation);
      if (invitationsSlug) {
        await payload.delete({
          collection: invitationsSlug,
          where: { inviter: { equals: userId } },
          req
        });
      }

      if (shouldCommit) {
        await commitTransaction(req);
      }

      return;
    } catch (error) {
      await killTransaction(req);
      console.error("Error in user beforeDelete hook:", error);
      return;
    }
  };

  return hook;
}
