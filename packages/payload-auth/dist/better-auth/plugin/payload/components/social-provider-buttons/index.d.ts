import type { LoginMethod } from '@/better-auth/plugin/types';
import React from 'react';
import './index.scss';
type AdminSocialProviderButtonsProps = {
    isSignup: boolean;
    loginMethods: LoginMethod[];
    setLoading: (loading: boolean) => void;
    redirectUrl?: string;
    newUserCallbackURL?: string;
    adminInviteToken?: string;
    baseURL?: string;
    basePath?: string;
};
export declare const AdminSocialProviderButtons: React.FC<AdminSocialProviderButtonsProps>;
export {};
//# sourceMappingURL=index.d.ts.map