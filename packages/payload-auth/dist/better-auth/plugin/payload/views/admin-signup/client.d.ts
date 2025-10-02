import React from 'react';
import type { LoginMethod } from '@/better-auth/plugin/types';
import type { LoginWithUsernameOptions } from 'payload';
type AdminSignupClientProps = {
    adminInviteToken: string;
    userSlug: string;
    loginMethods: LoginMethod[];
    searchParams: {
        [key: string]: string | string[] | undefined;
    };
    loginWithUsername: false | LoginWithUsernameOptions;
    baseURL?: string;
    basePath?: string;
};
export declare const AdminSignupClient: React.FC<AdminSignupClientProps>;
export {};
//# sourceMappingURL=client.d.ts.map