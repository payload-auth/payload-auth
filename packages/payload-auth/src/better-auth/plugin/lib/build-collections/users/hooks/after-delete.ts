import type { CollectionAfterDeleteHook } from "payload";

export const getAfterDeleteHook = ({
  accountsSlug,
  sessionsSlug,
  verificationsSlug,
}: {
  accountsSlug: string;
  sessionsSlug: string;
  verificationsSlug?: string;
}): CollectionAfterDeleteHook => {
  const hook: CollectionAfterDeleteHook = async ({
    doc,
    req,
  }) => {
    try {
      const { payload } = req;
      const userId = doc.id;

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

      // Delete verifications if collection exists
      if (verificationsSlug) {
        await payload.delete({
          collection: verificationsSlug,
          where: {
            value: {
              like: `"${userId}"`,
            },
          },
          req,
        });
      }

      return doc;
    } catch (error) {
      console.error("Error in user afterDelete hook:", error);
      return doc;
    }
  };

  return hook;
};
