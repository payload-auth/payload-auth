import { ComponentType } from 'react';
import { SVGProps } from 'react';
export interface ProviderIconProps extends SVGProps<SVGSVGElement> {
    className?: string;
    variant?: 'default' | 'color';
}
export type ProviderIcon = ComponentType<ProviderIconProps>;
export declare const Icons: Record<string, ProviderIcon>;
//# sourceMappingURL=icons.d.ts.map