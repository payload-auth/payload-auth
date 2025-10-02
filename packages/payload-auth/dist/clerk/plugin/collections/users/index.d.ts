import { type CollectionConfig } from 'payload';
import type { ClerkPluginOptions } from '../../../types';
export interface WithClerkUsersCollectionOptions {
    collection?: Partial<CollectionConfig>;
    options: ClerkPluginOptions;
    apiBasePath?: string;
    adminBasePath?: string;
}
export declare function withClerkUsersCollection({ collection, options, apiBasePath, adminBasePath }: WithClerkUsersCollectionOptions): CollectionConfig;
//# sourceMappingURL=index.d.ts.map