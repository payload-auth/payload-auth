import React from 'react';
import type { AdminViewServerProps } from 'payload';
import type { BetterAuthPluginOptions } from '@/better-auth/plugin/types';
type ForgotPasswordProps = AdminViewServerProps & {
    pluginOptions: BetterAuthPluginOptions;
};
declare const ForgotPassword: React.FC<ForgotPasswordProps>;
export default ForgotPassword;
//# sourceMappingURL=index.d.ts.map