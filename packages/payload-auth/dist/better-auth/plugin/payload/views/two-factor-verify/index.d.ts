import type { AdminViewServerProps } from 'payload';
import React from 'react';
import { BetterAuthPluginOptions } from '@/better-auth/plugin/types';
interface TwoFactorVerifyProps extends AdminViewServerProps {
    pluginOptions: BetterAuthPluginOptions;
    verificationsSlug: string;
}
declare const TwoFactorVerify: React.FC<TwoFactorVerifyProps>;
export default TwoFactorVerify;
//# sourceMappingURL=index.d.ts.map