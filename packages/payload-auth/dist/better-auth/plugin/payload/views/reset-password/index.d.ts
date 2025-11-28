import React from 'react';
import type { AdminViewServerProps } from 'payload';
import type { BetterAuthPluginOptions } from '@/better-auth/plugin/types';
type ResetPasswordProps = AdminViewServerProps & {
    pluginOptions: BetterAuthPluginOptions;
};
declare const ResetPassword: React.FC<ResetPasswordProps>;
export default ResetPassword;
//# sourceMappingURL=index.d.ts.map