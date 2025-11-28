import { BetterAuthPluginOptions } from '@/better-auth/plugin/types';
import { type Endpoint } from 'payload';
type InviteEndpointProps = {
    roles: {
        label: string;
        value: string;
    }[];
    pluginOptions: BetterAuthPluginOptions;
};
export declare const getGenerateInviteUrlEndpoint: ({ roles, pluginOptions }: InviteEndpointProps) => Endpoint;
export {};
//# sourceMappingURL=generate-invite-url.d.ts.map