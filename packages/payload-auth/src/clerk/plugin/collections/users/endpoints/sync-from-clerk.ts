import { APIError, Endpoint } from "payload";
import { createClerkClient } from "@clerk/backend";
import type { User } from "@clerk/backend";
import { getPrimaryEmail } from "../../../../utils";

export interface SyncClerkUsersResponse {
  syncedUsers: number;
  success: boolean;
  message?: string;
  error?: string;
  count?: number;
  created?: number;
  updated?: number;
}

export const syncClerkUsersEndpoint = ({
  userCollectionSlug,
}: {
  userCollectionSlug: string;
}): Endpoint => {
  return {
    path: "/sync-from-clerk",
    method: "post",
    handler: async (req) => {
      try {
        const { payload } = req;
        const mappingFunction =
          payload.config.custom.clerkPlugin.clerkToPayloadMapping;

        if (!process.env.CLERK_SECRET_KEY) {
          throw new APIError("CLERK_SECRET_KEY is not defined", 400);
        }

        const clerkClient = createClerkClient({
          secretKey: process.env.CLERK_SECRET_KEY,
        });

        const totalUsers = await clerkClient.users.getCount();

        const limit = 100;
        const totalPages = Math.ceil(totalUsers / limit);
        let allUsers: User[] = [];

        for (let page = 0; page < totalPages; page++) {
          const offset = page * limit;
          const pageUsers = await fetch(`https://api.clerk.com/v1/users?limit=${limit}&offset=${offset}`, {
            headers: {
              Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
            },
          });

          const pageUsersData = await pageUsers.json();

          allUsers = [...allUsers, ...pageUsersData];

          console.log(
            `Fetched page ${page + 1}/${totalPages}, users: ${pageUsersData.length}`
          );
        }

        let created = 0;
        let updated = 0;

        for (const clerkUser of allUsers) {
          const payloadUserData = mappingFunction(clerkUser);

          const randomPassword = Array(3)
            .fill(0)
            .map(() => Math.random().toString(36).slice(2))
            .join("");

          let existingUser = await payload.find({
            collection: userCollectionSlug,
            where: { clerkId: { equals: clerkUser.id } },
          });

          if (
            !existingUser.docs.length &&
            clerkUser.emailAddresses &&
            clerkUser.emailAddresses.length > 0
          ) {
            const primaryEmail = getPrimaryEmail(clerkUser);

            if (primaryEmail) {
              existingUser = await payload.find({
                collection: userCollectionSlug,
                where: { email: { equals: primaryEmail } },
              });
            }
          }

          if (existingUser.docs.length > 0) {
            await payload.update({
              collection: userCollectionSlug,
              id: existingUser.docs[0].id,
              data: payloadUserData,
            });
            updated++;
          } else {
            await payload.create({
              collection: userCollectionSlug,
              data: {
                ...payloadUserData,
                password: randomPassword,
              },
            });
            created++;
          }
        }

        console.log(
          `Synced ${allUsers.length} users from Clerk. Created: ${created}, Updated: ${updated}`
        );

        const response: SyncClerkUsersResponse = {
          syncedUsers: allUsers.length,
          success: true,
          message: `Successfully synced ${allUsers.length} users from Clerk. Created: ${created}, Updated: ${updated}`,
          count: allUsers.length,
          created,
          updated,
        };

        return new Response(
          JSON.stringify(response),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      } catch (error) {
        console.error("Error syncing users from Clerk:", error);

        const errorResponse: SyncClerkUsersResponse = {
          syncedUsers: 0,
          success: false,
          error: error instanceof Error
            ? error.message
            : "Failed to sync users from Clerk",
        };

        throw new APIError(
          errorResponse.error || "Unknown error",
          500
        );
      }
    },
  };
};
