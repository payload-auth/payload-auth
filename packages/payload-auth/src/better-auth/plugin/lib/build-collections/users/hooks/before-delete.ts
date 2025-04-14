import type { CollectionBeforeDeleteHook } from "payload";

export const getBeforeDeleteHook = ({
  accountsSlug,
  sessionsSlug,
  verificationsSlug,
}: {
  accountsSlug: string;
  sessionsSlug: string;
  verificationsSlug: string;
}): CollectionBeforeDeleteHook => {
  const hook: CollectionBeforeDeleteHook = async ({ req, id }) => {
    try {
      const { payload } = req;
      const userId = id;

      // Delete accounts
      await payload.delete({
        collection: accountsSlug,
        where: {
          user: {
            equals: userId,
          },
        },
        req,
      });

      // Delete sessions
      await payload.delete({
        collection: sessionsSlug,
        where: {
          user: {
            equals: userId,
          },
        },
        req,
      });

      // Delete any verifications
      await payload.delete({
        collection: verificationsSlug,
        where: {
          value: {
            like: `"${userId}"`,
          },
        },
        req,
      });

      return;
    } catch (error) {
      console.error("Error in user afterDelete hook:", error);
      return;
    }
  };

  return hook;
};
