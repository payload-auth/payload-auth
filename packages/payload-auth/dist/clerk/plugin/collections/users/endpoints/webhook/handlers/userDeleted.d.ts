import { Payload } from 'payload';
import { ClerkPluginOptions } from '../../../../../../types';
interface UserDeletedHandlerParams {
    data: any;
    payload: Payload;
    userSlug: string;
    options: ClerkPluginOptions;
}
export declare function handleUserDeleted({ data, payload, userSlug, options }: UserDeletedHandlerParams): Promise<void>;
export {};
//# sourceMappingURL=userDeleted.d.ts.map