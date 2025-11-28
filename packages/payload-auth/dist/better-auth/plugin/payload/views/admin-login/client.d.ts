import type { LoginWithUsernameOptions } from 'payload';
import React from 'react';
import type { LoginMethod } from '@/better-auth/plugin/types';
type AdminLoginClientProps = {
    loginMethods: LoginMethod[];
    hasUsernamePlugin: boolean;
    hasPasskeyPlugin: boolean;
    prefillEmail?: string;
    prefillPassword?: string;
    prefillUsername?: string;
    searchParams: {
        [key: string]: string | string[] | undefined;
    };
    loginWithUsername: false | LoginWithUsernameOptions;
    baseURL?: string;
    basePath?: string;
};
export declare const AdminLoginClient: React.FC<AdminLoginClientProps>;
export {};
//# sourceMappingURL=client.d.ts.map