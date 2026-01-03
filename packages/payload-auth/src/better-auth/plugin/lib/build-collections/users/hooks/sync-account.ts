import type { CollectionAfterChangeHook } from "payload";
import { BETTER_AUTH_CONTEXT_KEY } from "@/better-auth/adapter";
import { baModelKey } from "@/better-auth/plugin/constants";
import {
  getCollectionByModelKey,
  getCollectionFieldNameByFieldKey
} from "@/better-auth/plugin/helpers/get-collection";

export function getSyncAccountHook(): CollectionAfterChangeHook {
  const hook: CollectionAfterChangeHook = async ({
    doc,
    req,
    operation,
    context
  }) => {
    if (context?.syncPasswordToUser) return doc;

    if (operation !== "create" && operation !== "update") return doc;

    const collections = req.payload.collections;
    const userCollection = getCollectionByModelKey(
      collections,
      baModelKey.user
    );
    const accountCollection = getCollectionByModelKey(
      collections,
      baModelKey.account
    );

    const userIdFieldName = getCollectionFieldNameByFieldKey(
      accountCollection,
      baModelKey.account,
      "userId"
    );
    const accountIdFieldName = getCollectionFieldNameByFieldKey(
      accountCollection,
      baModelKey.account,
      "accountId"
    );
    const providerIdFieldName = getCollectionFieldNameByFieldKey(
      accountCollection,
      baModelKey.account,
      "providerId"
    );
    const passwordFieldName = getCollectionFieldNameByFieldKey(
      accountCollection,
      baModelKey.account,
      "password"
    );

    const user = await req.payload.findByID({
      collection: userCollection.slug,
      id: doc.id,
      depth: 0,
      req,
      showHiddenFields: true
    });

    if (!user || !user.hash || !user.salt) return doc;

    const passwordValue = `${user.salt}:${user.hash}`;

    if (operation === "create" && !(BETTER_AUTH_CONTEXT_KEY in context)) {
      try {
        await req.payload.create({
          collection: accountCollection.slug,
          data: {
            [userIdFieldName]: doc.id,
            [accountIdFieldName]: doc.id.toString(),
            [providerIdFieldName]: "credential",
            [passwordFieldName]: passwordValue
          },
          context: { syncAccountHook: true },
          req
        });
      } catch (error) {
        console.error("Failed to create account for user:", error);
      }
    }

    if (operation === "update") {
      try {
        const accounts = await req.payload.find({
          collection: accountCollection.slug,
          where: {
            and: [
              { [userIdFieldName]: { equals: doc.id } },
              { [providerIdFieldName]: { equals: "credential" } }
            ]
          },
          req,
          depth: 0,
          context: { syncAccountHook: true }
        });

        const account = accounts.docs.at(0);
        if (account) {
          await req.payload.update({
            collection: accountCollection.slug,
            id: account.id,
            data: {
              [passwordFieldName]: passwordValue
            },
            req,
            context: { syncAccountHook: true }
          });
        }
      } catch (error) {
        console.error("Failed to sync hash/salt to account:", error);
      }
    }

    return doc;
  };

  return hook as CollectionAfterChangeHook;
}
