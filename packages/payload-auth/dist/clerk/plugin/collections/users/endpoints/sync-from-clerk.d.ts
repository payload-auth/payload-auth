import { Endpoint } from 'payload';
export interface SyncClerkUsersResponse {
    syncedUsers: number;
    success: boolean;
    message?: string;
    error?: string;
    count?: number;
    created?: number;
    updated?: number;
}
export declare const syncClerkUsersEndpoint: ({ userCollectionSlug }: {
    userCollectionSlug: string;
}) => Endpoint;
//# sourceMappingURL=sync-from-clerk.d.ts.map