import type { UserJSON } from '@clerk/backend';
import type { BasePayload, User } from 'payload';
import { ClerkPluginOptions } from '../../../../../../types';
interface UserCreatedHandlerParams {
    data: any;
    payload: BasePayload;
    userSlug: string;
    mappingFunction: (clerkUser: UserJSON) => Omit<User, 'id'>;
    options: ClerkPluginOptions;
}
export declare function handleUserCreated({ data, payload, userSlug, mappingFunction, options }: UserCreatedHandlerParams): Promise<void>;
export {};
//# sourceMappingURL=userCreated.d.ts.map