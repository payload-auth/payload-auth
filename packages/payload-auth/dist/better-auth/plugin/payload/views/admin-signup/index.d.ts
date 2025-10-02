import React from 'react';
import type { AdminViewServerProps } from 'payload';
import type { BetterAuthPluginOptions } from '../../../types';
interface AdminSignupProps extends AdminViewServerProps {
    adminInvitationsSlug: string;
    pluginOptions: BetterAuthPluginOptions;
}
declare const AdminSignup: React.FC<AdminSignupProps>;
export default AdminSignup;
//# sourceMappingURL=index.d.ts.map