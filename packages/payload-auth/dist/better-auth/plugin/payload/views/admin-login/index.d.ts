import React from 'react';
import { type AdminViewServerProps } from 'payload';
import type { BetterAuthPluginOptions } from '@/better-auth/plugin/types';
export declare const loginBaseClass = "login";
interface AdminLoginProps extends AdminViewServerProps {
    adminInvitationsSlug: string;
    pluginOptions: BetterAuthPluginOptions;
}
declare const AdminLogin: React.FC<AdminLoginProps>;
export default AdminLogin;
//# sourceMappingURL=index.d.ts.map