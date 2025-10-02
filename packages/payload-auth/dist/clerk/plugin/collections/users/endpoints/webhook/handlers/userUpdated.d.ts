import { Payload, User } from 'payload';
import { ClerkPluginOptions } from '../../../../../../types';
import type { UserJSON } from '@clerk/types';
interface UserUpdatedHandlerParams {
    data: any;
    payload: Payload;
    userSlug: string;
    mappingFunction: (clerkUser: Partial<UserJSON>) => Omit<User, 'id'>;
    options: ClerkPluginOptions;
}
export declare function handleUserUpdated({ data, payload, userSlug, mappingFunction, options }: UserUpdatedHandlerParams): Promise<void>;
export {};
//# sourceMappingURL=userUpdated.d.ts.map